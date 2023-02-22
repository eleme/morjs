import {
  CompileModuleKind,
  CompileModuleKindType,
  CompileScriptTarget,
  CompileScriptTargetType,
  EntryFileType,
  EntryType,
  esbuild,
  FileParserOptions,
  isCommonJsModule,
  logger,
  typescript as ts
} from '@morjs/utils'
import { getComposedCompilerPlugins } from '../compilerPlugins'
import { CompileModes, CompileTypes } from '../constants'
import { loadUserTsCompilerOptions } from '../utils'

/**
 * ts / js 转换输出结果
 */
interface ITransformOutput {
  code: string
  sourceMap?: string
}

interface SourceMap {
  version: number
  sources: string[]
  mappings: string
  file?: string
  sourceRoot?: string
  sourcesContent?: string[]
  names?: string[]
}

type FileType = EntryFileType.script | EntryFileType.sjs

// 编译配置
interface ICompileOption {
  autoCorrectModuleKind?: boolean
  moduleKind: CompileModuleKindType
  importHelpers: boolean
  compileTarget: CompileScriptTargetType
  declaration?: boolean
  esModuleInterop?: boolean
  allowSyntheticDefaultImports?: boolean
}

/**
 * 生成 webpack 需要的 sourceMap
 * @param sourceMap 代码映射文本
 * @param code 转换后的代码
 * @param filePath 文件路径
 * @param sourceCode 源代码
 * @param remainingRequest webpack 剩余的 request
 * @returns 生成后的 代码 和 sourceMap
 */
export function generateSourceMap(
  sourceMap: string | undefined,
  code: string,
  filePath: string,
  sourceCode: string,
  remainingRequest: string
): {
  code: string
  sourceMap?: SourceMap
} {
  if (!sourceMap || !code) {
    return { code, sourceMap: undefined }
  }

  let parsedSourceMap: SourceMap
  try {
    parsedSourceMap = JSON.parse(sourceMap)
  } catch (error) {
    logger.warn('sourceMap 解析失败 \n' + `文件路径: ${filePath}`)
  }

  return {
    code: code.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, ''),
    sourceMap: parsedSourceMap
      ? Object.assign(parsedSourceMap, {
          sources: [remainingRequest],
          file: filePath,
          sourcesContent: [sourceCode]
        })
      : undefined
  }
}

/**
 * 判断是否有 transformers
 * @param transformers 自定义 transformers
 */
function hasTransformers(transformers?: ts.CustomTransformers): boolean {
  if (!transformers) return false
  if (transformers.before.length) return true
  if (transformers.after.length) return true
  if (transformers.afterDeclarations.length) return true
  return false
}

/**
 * 使用 ts.transpileModule 来编译 ts 或 js 文件
 * ```
 * 使用限制
 * 参见: https://www.typescriptlang.org/tsconfig#isolatedModules
 *
 * 由于是使用了单文件编译的方式，所以在编译的时候无法获悉文件的完整上下文
 * 这种情况下一些 ts 的运行时特性会无法被正确的编译, 如:
 *
 * 在文件 A 中声明了
 *   export interface Page {}
 * 在文件 B 中引用该 interface
 *   import { Page } from './B'
 *   Page({})
 * 由于 Page 本身为小程序的全局函数, 导致 ts 编译时由于缺少上下文而将 Page 作为 A 文件中
 * 导出的函数使用, 从而导致运行报错
 *
 * isolatedModules 选项并不能解决该问题，只是针对一些会导致单文件编译的写法做了一些提示
 *
 * 使用方需要从写法上来规避该问题的产生
 * ```
 * @param filePath 文件路径
 * @param fileContent 文件内容
 * @param compileMode 编译模式
 * @param compilerOptions ts 编译选项
 * @param transformers 自定义 transformers
 * @returns 编译后的文件内容
 */
function tsTransform(
  filePath: string,
  fileContent: string,
  compileMode: string,
  compilerOptions: ICompileOption,
  transformers?: ts.CustomTransformers
): ITransformOutput {
  const userTsCompilerOptions = loadUserTsCompilerOptions() || {}
  // 组装 ts 编译配置
  const tsCompilerOptions = {
    ...userTsCompilerOptions,
    importHelpers: compilerOptions.importHelpers,
    noImplicitUseStrict: true,
    allowJs: true,
    module: ts.ModuleKind[compilerOptions.moduleKind],
    target: ts.ScriptTarget[compilerOptions.compileTarget],
    rootDir: undefined
  }

  // bundle 模式下调整 sourceMap 行为
  if (compileMode === CompileModes.bundle) {
    // inlineSourceMap 选项为 true 会导致无法从接口获取 sourceMapText
    // 所以这里关闭该选项
    tsCompilerOptions.inlineSourceMap = false

    // 只要用户打开了 inlineSourceMap 或 sourceMap 均认为 sourceMap 为 true
    tsCompilerOptions.sourceMap =
      userTsCompilerOptions?.inlineSourceMap || userTsCompilerOptions?.sourceMap
  }

  if (compilerOptions.esModuleInterop != null) {
    tsCompilerOptions.esModuleInterop = compilerOptions.esModuleInterop
  } else if (tsCompilerOptions.esModuleInterop == null) {
    // 默认开启 esModuleInterop
    tsCompilerOptions.esModuleInterop = true
  }

  if (compilerOptions.allowSyntheticDefaultImports != null) {
    tsCompilerOptions.allowSyntheticDefaultImports =
      compilerOptions.allowSyntheticDefaultImports
  }

  const { outputText, sourceMapText } = ts.transpileModule(fileContent, {
    compilerOptions: tsCompilerOptions,
    transformers,
    fileName: filePath
  })

  return { code: outputText, sourceMap: sourceMapText }
}

/**
 * 使用 esbuild 编译 ts 或 js 文件
 * 仅在 bundle 模式下使用
 * @param filePath - 文件地址
 * @param fileContent - 文件内容
 * @param compileMode - 编译模式
 * @param compilerOptions - 编译选项
 * @returns 编译后的文件内容
 */
async function esbuildTransform(
  filePath: string,
  fileContent: string,
  compileMode: string,
  compilerOptions: ICompileOption,
  isBundleMode: boolean
): Promise<ITransformOutput> {
  const userTsCompilerOptions = loadUserTsCompilerOptions() || {}

  const tsConfig = {
    compilerOptions: {
      ...userTsCompilerOptions,
      noImplicitUseStrict: true,
      importHelpers: compilerOptions.importHelpers,
      module: compilerOptions.moduleKind,
      target: compilerOptions.compileTarget || CompileScriptTarget.ES5
    }
  }

  let sourcemap: boolean | 'inline' | 'external' | 'both'

  if (compileMode === CompileModes.bundle) {
    // 用户是否开启了 sourceMap
    // bundle 模式下无论用户启用的是 inline 还是 external 均视为 external
    if (
      userTsCompilerOptions?.inlineSourceMap ||
      userTsCompilerOptions?.sourceMap
    ) {
      sourcemap = 'external'
    }
  } else {
    if (userTsCompilerOptions?.inlineSourceMap) {
      sourcemap = 'inline'
    } else if (userTsCompilerOptions?.sourceMap) {
      sourcemap = 'external'
    }
  }

  // 是否将源码加入 sourceMap
  const sourcesContent = userTsCompilerOptions?.inlineSources

  const esbuildOptions: esbuild.TransformOptions = {
    loader: 'ts',
    target: tsConfig.compilerOptions.target || 'es6',
    tsconfigRaw: JSON.stringify(tsConfig),
    sourcefile: filePath,
    sourcemap,
    sourcesContent
  }

  // 非 bundle 模式下转换格式
  // NOTE: 格式转换会引入 esbuild 运行时, 同时将 cjs 转换为 esm 可能会导致两层 default
  if (!isBundleMode) {
    esbuildOptions.format =
      tsConfig.compilerOptions.module === CompileModuleKind.CommonJS
        ? 'cjs'
        : 'esm'
  }

  const { code, map: sourceMap } = await esbuild.transform(
    fileContent,
    esbuildOptions
  )

  return { code, sourceMap: sourceMap ? sourceMap : undefined }
}

/**
 * 支持 ts 和 esbuild 两种编译方式
 * 1. 如果没有插件的情况下, 自动使用 esbuild 以构建速度为主
 * 2. 如果有外部插件 或 需求输出 declaration 则使用 ts 编译
 * @param fileContent 文件内容
 * @param fileType 文件类型，如 script 或 sjs
 * @param options 文件解析选项
 * @param transformers 自定义 ts transformers
 * @returns 编译后文件内容 outputText 和 sourceMapText
 */
export async function scriptTransformer(
  fileContent: string,
  fileType: FileType,
  options: FileParserOptions,
  transformers?: ts.CustomTransformers
): Promise<ITransformOutput> {
  const { userConfig, fileInfo } = options
  const composedPlugins = getComposedCompilerPlugins()

  let moduleKind: ICompileOption['moduleKind'] =
    userConfig.compilerOptions.module
  let importHelpers = userConfig.compilerOptions.importHelpers === true
  let compileTarget: ICompileOption['compileTarget'] =
    userConfig.compilerOptions.target
  let declaration = userConfig.compilerOptions.declaration === true
  const esModuleInterop: ICompileOption['esModuleInterop'] =
    userConfig.compilerOptions.esModuleInterop
  const allowSyntheticDefaultImports: ICompileOption['allowSyntheticDefaultImports'] =
    userConfig.compilerOptions.allowSyntheticDefaultImports
  const autoCorrectModuleKind: ICompileOption['autoCorrectModuleKind'] =
    userConfig.compilerOptions.autoCorrectModuleKind

  // sjs 限制
  if (fileType === EntryFileType.sjs) {
    // sjs 需要强制为 目标 module 类型
    moduleKind = composedPlugins.compileModuleKind[userConfig.target]
    importHelpers = false
    // sjs 文件类型的编译优先按照 compileSjsTarget 中指定的 target
    // 如果未指定则以 compileScriptTarget 配置为准
    compileTarget =
      composedPlugins?.compileSjsTarget?.[userConfig.target] ||
      composedPlugins.compileScriptTarget[userConfig.target]
    declaration = false
  }
  // 其他限制
  else {
    // 插件模式下，强制 pluginJson.main 文件为 commonjs 输出
    // 这样可以确保小程序引用插件的 requirePlugin 可以被正确的调用
    if (
      userConfig.compileType === CompileTypes.plugin &&
      fileInfo?.entryType === EntryType.plugin &&
      fileInfo?.entryFileType === EntryFileType.script
    ) {
      moduleKind = CompileModuleKind.CommonJS
    }
  }

  // 当 importHelpers 为 true 且 module 不为 commonjs 时
  // 需要额外判断文件是否为 commonjs
  // 原因为: typescript 引入 importHelpers 的时候会根据 设定的 module 来决定
  // 是用 esm 还是 commonjs 语法
  // 可能会导致 esm 和 commonjs 混用而引起编译问题
  if (
    importHelpers === true &&
    moduleKind !== CompileModuleKind.CommonJS &&
    autoCorrectModuleKind !== false
  ) {
    if (
      await isCommonJsModule(
        fileContent,
        moduleKind,
        true,
        options?.fileInfo?.path
      )
    ) {
      logger.debug(
        '文件: ',
        options?.fileInfo?.path,
        '模块类型被重置为',
        CompileModuleKind.CommonJS,
        ', 原模块类型:',
        moduleKind
      )
      // 重写 moduleKind 为 commonjs
      moduleKind = CompileModuleKind.CommonJS
    }
  }

  const compilerOptions: ICompileOption = {
    moduleKind,
    importHelpers,
    compileTarget,
    declaration,
    esModuleInterop,
    allowSyntheticDefaultImports
  }

  const compileMode = options.userConfig.compileMode

  // 判断是否使用 typescript
  const useTS =
    // 由于 esbuild 会有一些比较主观的编译优化
    // 如 export default { a: 1 } 会被编译为
    // var b = { a: 1 }; export { b as default }
    // 导致支付宝小程序无法正确识别语法
    // 所以这里 sjs 统一使用 ts 进行编译
    fileType === EntryFileType.sjs ||
    hasTransformers(transformers) ||
    compilerOptions.declaration ||
    compileTarget === CompileScriptTarget.ES5 ||
    // 非 bundle 模式下只用 typescript
    // 原因为 esbuild 似乎会引入不完整的语法支持
    // 原则: 稳定性大于快!
    compileMode !== CompileModes.bundle

  const result = useTS
    ? tsTransform(
        fileInfo.path,
        fileContent,
        compileMode,
        compilerOptions,
        transformers
      )
    : await esbuildTransform(
        fileInfo.path,
        fileContent,
        compileMode,
        compilerOptions,
        compileMode === CompileModes.bundle
      )

  return result
}
