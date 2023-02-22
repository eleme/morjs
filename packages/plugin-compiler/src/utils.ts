import {
  asArray,
  json5 as JSON5,
  jsoncParser as JSONC,
  logger,
  mor,
  Runner,
  typescript as ts,
  UniversalifiedInputFileSystem
} from '@morjs/utils'
import crypto from 'crypto'
import path from 'path'
import {
  AllFileTypes,
  CHILD_COMPILER_RUNNER,
  CompilerUserConfig,
  NODE_MODULE_REGEXP
} from './constants'

type FILE_TYPES = (typeof AllFileTypes)[number]

/**
 * 提供用户自定义 tsconfig 支持
 * 允许外部获取 ts 配置文件地址
 */
let TS_CONFIG_FILE: string | undefined

/**
 * 获取用户 cwd 下的 tsconifg 文件地址
 */
export function getTsConfigFile(): string | undefined {
  if (TS_CONFIG_FILE) return TS_CONFIG_FILE

  TS_CONFIG_FILE = ts.findConfigFile(mor.config.cwd, ts.sys.fileExists)

  return TS_CONFIG_FILE
}

/**
 * 保存
 */
let USER_COMPILER_OPTIONS: ts.CompilerOptions | undefined

/**
 * 获取 ts 配置的 compilerOptions
 * @returns ts 配置的 compilerOptions
 */
export function loadUserTsCompilerOptions(): ts.CompilerOptions {
  if (USER_COMPILER_OPTIONS) return USER_COMPILER_OPTIONS

  const tsConfigFile = getTsConfigFile()

  if (tsConfigFile) {
    let error
    try {
      const tsConfig = ts.readConfigFile(tsConfigFile, ts.sys.readFile)
      if (tsConfig?.error) {
        error = tsConfig.error
      } else {
        USER_COMPILER_OPTIONS = tsConfig?.config?.compilerOptions || {}
      }
    } catch (err) {
      error = err
    }
    if (error) logger.warn(`读取用户 tsconfig.json 失败: ${error}`)
  }

  return USER_COMPILER_OPTIONS || {}
}

// 文件名后缀转换为 glob pattern
export function extsToGlobPatterns(exts: string[] | readonly string[]): string {
  if (!exts || exts.length === 0) return ''
  if (exts.length === 1) return `*${exts[0]}`
  return `*.{${exts.map((ext: string) => ext.slice(1)).join(',')}}`
}

/**
 * 获取不包含后缀名的文件路径
 * @param filePath - 文件路径
 * @returns 不包含后缀名的文件路径
 */
export function pathWithoutExtname(filePath: string): string {
  const extname = path.extname(filePath)

  // 如果后缀名不存在，或者不是有效的后缀名(AllFileTypes 中声明的) 则不处理
  if (!extname) return filePath
  if (!AllFileTypes.includes(extname as FILE_TYPES)) return filePath

  // 避免 ./ 在后续操作中丢失
  const prefix = filePath.startsWith('./')
    ? './'
    : filePath.startsWith('.\\')
    ? '.\\'
    : ''

  return (
    prefix + path.join(path.dirname(filePath), path.basename(filePath, extname))
  )
}

/**
 * 读取类 JSON 文件
 * 支持 json、 jsonc、json5 三种格式
 * @param fs - fs 实例
 * @param filePath - 类 json 文件
 * @returns json 文件内容
 */
export async function readJsonLike(
  fs: UniversalifiedInputFileSystem,
  filePath: string
): Promise<any> {
  const fileContent = (await fs.readFile(filePath)).toString('utf-8')
  return parseJsonLike(fileContent, path.extname(filePath))
}

/**
 * 解析类 JSON 内容
 * 支持 json、 jsonc、json5 三种格式
 * @param content - 文件内容
 * @param extname - 后缀名
 * @returns JSON 对象
 */
export function parseJsonLike(content: string, extname: string): any {
  switch (extname) {
    case '.json':
      return JSON.parse(content)
    case '.jsonc':
      return JSONC.parse(content)
    case '.json5':
      return JSON5.parse(content)
    default:
      throw new Error(`不支持的 JSON 文件格式: ${extname}`)
  }
}

/**
 * 获取相对于 srcPaths 的路径
 *  - 优先匹配 包含 srcPath 的相对路径
 *  - 如果没有包含的，则使用第一个 srcPath 计算 相对路径
 * @param filePath - 文件完整路径
 * @param srcPaths - 自定义 srcPaths 目录
 * @param showWarning - 是否显示告警信息
 * @returns 相对路径
 */
export function getRelativePathToSrcPaths(
  filePath: string,
  srcPaths: string[],
  showWarning = true
): string {
  const roots = srcPaths?.length ? srcPaths : []

  for (const srcPath of roots) {
    if (filePath.startsWith(srcPath)) {
      return path.relative(srcPath, filePath)
    }
  }

  // 如果上面的逻辑未命中, 则代表某处引用的文件超出了源代码之外, 这里提示警告
  // 并约束该文件路径, 防止发生对源代码的意外修改
  // 例 ../../abc/index.js => pdir/pdir/abc/index.js
  // pdir 代表 parent directory 父级目录
  let relativePath = path.relative(roots[0], filePath)

  if (relativePath.startsWith('..')) {
    relativePath = relativePath.replace(/\.\./g, 'pdir')
  }

  if (showWarning) {
    logger.warnOnce(
      `引用的文件: ${filePath} 不在约定的源码目录中\n` +
        `路径优化为: ${relativePath} \n` +
        `其中: pdir 代表 parent direcotry, 用于替换 .. 路径`
    )
  }

  return relativePath
}

/**
 * 判断是否需要插件处理文件，用于 loader 中的逻辑判断
 * 1. 非 node_modules 文件总是处理
 * 2. node_modules 文件基于逻辑判断是否处理
 * @param filePath - 文件路径
 * @param processNodeModules - 强制处理
 * @param byDefault - 默认操作, 默认为 false
 */
export function shouldProcessFileByPlugins(
  filePath: string,
  processNodeModules: CompilerUserConfig['processNodeModules'],
  byDefault = false
) {
  if (processNodeModules === true) return true

  if (NODE_MODULE_REGEXP.test(filePath)) {
    if (processNodeModules === false) return false

    if (processNodeModules != null) {
      // 如果配置了 include 或 exclude 逐一校验
      // exclude 优先级高于 include
      const exclude = asArray(processNodeModules.exclude || [])
      const include = asArray(processNodeModules.include || [])

      if (
        exclude.length &&
        exclude.reduce((res, e) => e.test(filePath) || res, false)
      ) {
        return false
      }

      if (include.length) {
        if (include.some((e) => (e.test(filePath) ? true : undefined)))
          return true
      }
      // include 未配置, 则默认为 true
      else {
        return true
      }
    }

    return byDefault
  }

  // 普通文件固定返回 true
  return true
}

/**
 * 判断当前 runner 是否为 编译子 runner
 * @param runner - Runner 实例
 * @returns `true` or `false`
 */
export function isChildCompilerRunner(runner: Runner) {
  return !!runner.context.get(CHILD_COMPILER_RUNNER)
}

/**
 * 基于用户配置生成缓存文件 hash
 * @param userConfig - 用户配置
 * @param prefixKeys - 缓存 key 前缀
 * @returns 生成的 cache hash
 */
export function generateCacheFileHash(
  userConfig: Record<string, any>,
  prefixKeys: string[] = []
) {
  // 这里综合考虑可能会影响到 webpack 缓存以及 entries 缓存的情况
  const hash = crypto
    .createHash('md5')
    .update(
      JSON.stringify({
        minimize: userConfig.minimize,
        jsMinimizer: userConfig.jsMinimizer,
        jsMinimizerOptions: userConfig.jsMinimizerOptions,
        cssMinimizer: userConfig.cssMinimizer,
        cssMinimizerOptions: userConfig.cssMinimizerOptions,
        xmlMinimizer: userConfig.xmlMinimizer,
        xmlMinimizerOptions: userConfig.xmlMinimizerOptions,
        externals: String(userConfig.externals).valueOf(),
        shared: userConfig.shared,
        consumes: userConfig.consumes,
        srcPath: userConfig.srcPath,
        srcPaths: userConfig.srcPaths,
        ignore: userConfig.ignore,
        compilerOptions: userConfig.compilerOptions,
        conditionalCompile: userConfig.conditionalCompile,
        define: userConfig.define,
        alias: userConfig.alias,
        processPlaceholderComponents: userConfig.processPlaceholderComponents,
        modules: asArray(userConfig.modules || []).filter(
          (m) => m?.mode === 'compile'
        ),
        customEntries: userConfig.customEntries
      })
    )
    .digest('hex')

  const configName = (userConfig.name || '').replace(/[^a-zA-Z0-9-_]/g, '_')
  return prefixKeys
    .concat([
      configName,
      userConfig.compileType,
      userConfig.target,
      userConfig.compileMode,
      hash
    ])
    .join('-')
}
