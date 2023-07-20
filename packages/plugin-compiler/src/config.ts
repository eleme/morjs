import type {
  CssMinimizerPlugin as CssMinimizerPluginType,
  HtmlMinimizerPlugin as HtmlMinimizerPluginType,
  TerserPlugin as TerserPluginType
} from '@morjs/utils'
import {
  asArray,
  CompileModuleKind,
  CompileTypes,
  Config,
  CopyWebpackPlugin,
  fsExtra as fs,
  lodash as _,
  Logger,
  logger,
  MOR_RUNTIME_FILE,
  resolveDependency,
  Runner,
  slash,
  SourceTypes,
  UserConfig,
  webpack,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import { inspect } from 'util'
import type { BundleAnalyzerPlugin as BundleAnalyzerPluginType } from 'webpack-bundle-analyzer'
import {
  getComposedCompilerPlugins,
  PluginConfigFileTypes,
  Targets
} from './compilerPlugins'
import {
  AllConfigFileTypes,
  AssetFileExtPattern,
  CompileModes,
  CompilerCliConfig,
  CompilerUserConfig,
  CompileTypeDescriptions,
  CSSMinimizerTypes,
  CustomLoaderOptions,
  DEFAULT_CHUNK_LOADING_GLOBAL,
  DEFAULT_SRC_PATH,
  DevTools,
  GlobalObjectTransformTypes,
  JSMinimizerTypes,
  JSON_REGEXP,
  LESS_REGEXP,
  Modes,
  MOR_RUNTIME_NPMS,
  NODE_MODULES,
  NODE_MODULE_REGEXP,
  SASS_REGEXP,
  SCRIPT_REGEXP,
  SJS_REGEXP,
  STYLE_REGEXP,
  TEMPLATE_REGEXP,
  TS_REGEXP
} from './constants'
import type { EntryBuilder } from './entries'
import ResolverPlugin from './plugins/resolverPlugin'
import {
  generateCacheFileHash,
  getTsConfigFile,
  isChildCompilerRunner,
  loadUserTsCompilerOptions,
  shouldProcessFileByPlugins
} from './utils'

// 当前 npm 所包含的 node_modules 目录
const CURRENT_NODE_MODULES = path.resolve(__dirname, '../node_modules')

// 内置 loaders
export const LOADERS = {
  preprocess: path.join(__dirname, './loaders/preprocessLoader'),
  postprocess: path.join(__dirname, './loaders/postprocessLoader'),
  config: path.join(__dirname, './loaders/configLoader'),
  script: path.join(__dirname, './loaders/scriptLoader'),
  sjs: path.join(__dirname, './loaders/sjsLoader'),
  template: path.join(__dirname, './loaders/templateLoader'),
  style: path.join(__dirname, './loaders/styleLoader'),
  native: path.join(__dirname, './loaders/nativeLoader')
}

// 基于命令行修改用户配置
// 已支持的命令行参数和用户配置名称基本上是一一对应的
// 可直接覆盖，小部分需特殊处理
export function modifyUserConfig(
  config: Config,
  userConfig: UserConfig,
  commandOptions: Record<string, any> = {}
): UserConfig {
  if (
    userConfig.compileMode === 'default' ||
    userConfig.compileMode === 'transfer'
  ) {
    logger.warnOnce(
      `\`default\` 和 \`transfer\` 编译模式(compileMode) 已被合并为 transform 模式!`
    )
    userConfig.compileMode = CompileModes.transform
  }

  // 设置非空默认值, 基于命令行参数
  function overwriteUserConfigBy(name: string): void {
    if (commandOptions[name] != null) {
      if (
        userConfig[name] != null &&
        userConfig[name] !== commandOptions[name]
      ) {
        logger.warn(
          `用户配置 ${name}: ${inspect(
            userConfig[name]
          )}, 被命令行参数 --${_.kebabCase(name)} 的值 ${inspect(
            commandOptions[name]
          )} 覆盖.`,
          {
            color: true
          }
        )
      }
      userConfig[name] = commandOptions[name]
    }
  }

  // 遍历需要覆盖 userConfig 的配置
  for (const optionName in CompilerCliConfig) {
    const option = CompilerCliConfig[optionName]
    if (option.overwriteUserConfig === true) {
      if (
        !option.ignoreCliValue ||
        option.ignoreCliValue(commandOptions[optionName]) === false
      ) {
        overwriteUserConfigBy(optionName)
      }
    }
  }

  // --production 为 true 的情况下，将 mode 设置为 'production'
  // 同时将 minimize 设置为 true
  if (commandOptions.production === true) {
    userConfig.mode = 'production'
    if (userConfig.minimize == null) userConfig.minimize = true
    logger.debug(
      `--production 开启, 将以 mode = '${userConfig.mode}' 和 ` +
        `minimize = ${userConfig.minimize} 运行 compile`
    )
  }

  // 生产模式下自动开启压缩
  if (userConfig.mode === 'production' && userConfig.minimize == null) {
    userConfig.minimize = true
  }

  // 仅当指定 --analyze 或 环境变量 ANALYZE=1 时, 开启 analyzer 配置
  if (commandOptions.analyze || config.env.isTruthy('ANALYZE')) {
    userConfig.analyzer = userConfig.analyzer ? userConfig.analyzer : true
    // 如果命令行有透传 analyze 配置进来, 则覆盖用户配置
    if (commandOptions.analyze !== true) {
      if (userConfig.analyzer === true) {
        userConfig.analyzer = commandOptions.analyze
      } else {
        Object.assign(userConfig.analyzer, commandOptions.analyze)
      }
    }

    // 开启 analyzer 的情况下 强制 module 类型为 commonjs
    userConfig.compilerOptions = userConfig.compilerOptions ?? {}
    userConfig.compilerOptions.module = CompileModuleKind.CommonJS
  } else {
    userConfig.analyzer = false
  }

  return userConfig
}

/**
 * 应用用户配置默认值
 * @param config - takin config 实例
 * @param userConfig - 用户配置
 */
export function applyDefaults(
  config: Config,
  userConfig: CompilerUserConfig & { name?: string }
): void {
  const {
    target = Targets[0],
    mode = Modes.development,
    sourceType = SourceTypes.wechat,
    compileMode = CompileModes.bundle
  } = userConfig

  const composedPlugins = getComposedCompilerPlugins()
  // 设置默认的 globalObject
  userConfig.globalObject =
    userConfig.globalObject ?? composedPlugins.globalObject[target]

  // 设置输出目录
  userConfig.outputPath = path.resolve(
    config.cwd,
    userConfig.outputPath ?? composedPlugins.defaultOutputDir[target]
  )

  // 配置最终产物目录
  userConfig.finalOutputPath = userConfig.outputPath

  // 设置并覆盖 srcPath, 转换为 绝对路径
  userConfig.srcPath = path.resolve(
    config.cwd,
    userConfig.srcPath ?? DEFAULT_SRC_PATH
  )
  // 多目录支持
  userConfig.srcPaths = asArray(userConfig.srcPaths).map((srcPath) => {
    return path.resolve(config.cwd, srcPath)
  })
  // 合并 srcPath 到 srcPaths 中
  if (!userConfig.srcPaths.includes(userConfig.srcPath)) {
    userConfig.srcPaths.unshift(userConfig.srcPath)
  }

  // 检查输出目录有效性
  // 不允许和 srcPaths 重叠，以及不允许和约定的功能目录重叠
  if (userConfig.srcPaths.includes(userConfig.outputPath)) {
    throw new Error(
      `产物目录 outputPath 配置错误，不允许和源码目录 srcPath 或 srcPaths 相同！`
    )
  }
  if (
    userConfig.outputPath === config.getTempDir() ||
    userConfig.outputPath === path.resolve(config.cwd, 'mock')
  ) {
    throw new Error(
      `产物目录 outputPath 配置错误，不允许配置为 ${path.relative(
        config.cwd,
        config.getTempDir()
      )} 或 mock，该目录为 ${config.name} 预留功能目录！`
    )
  }

  // 设置默认条件编译的文件后缀
  userConfig.conditionalCompile = userConfig.conditionalCompile ?? {}
  userConfig.conditionalCompile.fileExt = asArray(
    userConfig.conditionalCompile.fileExt ??
      composedPlugins.defaultConditionalFileExt[target]
  )

  // 多配置情况下, 检查其他配置中的 conditionalCompile.context 中所涉及到的变量
  // 并追加到当前 userConfig.conditionalCompile.context 中作为 undefined 值
  // 主要目的是方便使用方在不同的配置中使用不同的值, 且能够完整多个值的使用, 避免因为
  // 值不存在而发出警告
  const context = userConfig.conditionalCompile.context || {}
  for (const conf of asArray(config.userConfig)) {
    for (const propName in conf?.conditionalCompile?.context || {}) {
      // 如果当前 context 中已存在 propName 则跳过
      if (Object.hasOwnProperty.call(context, propName)) continue
      // 设置为空值, 方便代码纬度的条件编译判断使用
      context[propName] = void 0
    }
  }
  // 添加一些默认的 context
  //  1. name
  //  2. production
  //  3. [name]
  //  4. target
  //  5. [target]
  userConfig.conditionalCompile.context = {
    name: userConfig.name,
    // 生产环境配置为 true 非生产配置为 undefined
    // 确保不论是使用 #if 还是 #ifdef 行为是一致的
    production: userConfig.mode === 'production' ? true : void 0,
    [userConfig.name]: true,
    target: userConfig.target,
    [userConfig.target]: true,
    ...context
  }

  // 处理忽略的规则
  const ignore: string[] = asArray(userConfig.ignore ?? [])

  // 默认忽略的文件
  const baseIgnorePatterns = [
    '**/node_modules/**',
    // 忽略 mor 配置文件
    ...config.supportConfigNames.map((name) => `**/${name}.*`),
    '**/.git/**',
    '**/.svn/**',
    '**/.node/**',
    // 忽略 .d.ts 文件
    '**/*.d.ts',
    // 忽略当前工程中的临时文件夹
    slash(path.join(config.getTempDir(), '**'))
  ]

  // 将默认输出目录添加到 忽略清单 中
  const defaultOutputDirIgnorePatterns: string[] = []
  Object.values(composedPlugins.defaultOutputDir).forEach((d) => {
    defaultOutputDirIgnorePatterns.push(slash(path.join(config.cwd, d)))
    defaultOutputDirIgnorePatterns.push(slash(path.join(config.cwd, d, '**')))
  })

  // 自动合并多配置下的 outputDir 和 文件纬度条件编译 到 ignore 中
  const outputDirIgnorePatterns: string[] = []
  const allConditionalFileExts = new Set<string>()
  const rawUserConfigs = asArray(config.userConfig) as CompilerUserConfig[]
  for (const conf of rawUserConfigs) {
    if (conf?.outputPath) {
      const outputPath = path.resolve(config.cwd, conf.outputPath)
      outputDirIgnorePatterns.push(slash(outputPath))
      outputDirIgnorePatterns.push(slash(path.join(outputPath, '**')))
    }

    // 搜集其他文件条件编译的配置
    if (conf?.conditionalCompile?.fileExt) {
      asArray(conf?.conditionalCompile?.fileExt).forEach((ext) =>
        allConditionalFileExts.add(ext)
      )
    }
  }

  // 忽略非当前编译目标的条件编译相关文件
  Object.values(composedPlugins.defaultConditionalFileExt).forEach((v) =>
    allConditionalFileExts.add(v)
  )
  const conditionalFileExtIgnorePatterns: string[] = []
  const currentFileExts = asArray(userConfig.conditionalCompile.fileExt)
  allConditionalFileExts.forEach((ext) => {
    if (!currentFileExts.includes(ext)) {
      conditionalFileExtIgnorePatterns.push(`**/*${ext}.*`)
    }
  })

  // 合并所有 ignore 规则
  userConfig.ignore = [
    ...baseIgnorePatterns,
    ...defaultOutputDirIgnorePatterns,
    ...outputDirIgnorePatterns,
    ...conditionalFileExtIgnorePatterns,
    ...ignore
  ]

  // 设置默认 编译 module 类型
  userConfig.compilerOptions = userConfig.compilerOptions ?? {}

  if (!userConfig.compilerOptions.module) {
    if (compileMode === CompileModes.bundle) {
      // bundle 模式下优先使用 ESNext 的方式进行编译
      // 便于 webpack 应用 treeShaking 以及针对 文件之间的循环引用 做兜底
      // 参见: https://github.com/webpack/webpack/blob/main/examples/side-effects/README.md
      userConfig.compilerOptions.module = CompileModuleKind.ESNext
      if (
        CompileModuleKind.ESNext !== composedPlugins.compileModuleKind[target]
      ) {
        // 这里标记下 originalCompilerModule 供部分需要使用原始模块类型的插件使用
        if (userConfig['originalCompilerModule']) {
          logger.warnOnce(
            '发现 userConfig.originalCompilerModule 值不为空, ' +
              '该属性被用于标记原始编译的模块类型, 请更换'
          )
        }
        userConfig['originalCompilerModule'] =
          composedPlugins.compileModuleKind[target]
        logger.debug('bundle 模式下优先使用 ESNext 的方式进行编译')
      }
    } else {
      userConfig.compilerOptions.module =
        composedPlugins.compileModuleKind[target]
    }
  }

  // 设置默认 编译 target 类型
  userConfig.compilerOptions.target =
    userConfig.compilerOptions.target ??
    composedPlugins.compileScriptTarget[target]

  // 判断是否需要开启 importHelpers
  if (userConfig.compilerOptions.importHelpers !== false) {
    try {
      // 这里不直接获取 tslib/package.json 的原因是 node 15 以上会有一个恼人的警告
      // 由于 tslib 中 package.json 的 exports 配置导致
      const tslibPath = require.resolve('tslib')
      if (tslibPath) {
        const match = tslibPath.match(/node_modules(?:\/|\\).+(?:\/|\\)(.+)$/)
        let tslibPackageJSONPath: string
        if (typeof match?.[1] === 'string') {
          tslibPackageJSONPath =
            tslibPath.slice(0, tslibPath.length - match[1].length) +
            'package.json'
        } else {
          tslibPackageJSONPath = tslibPath.replace('tslib.js', 'package.json')
        }

        const tslibVersion =
          fs.readJSONSync(tslibPackageJSONPath)?.['version'] || ''

        const majorVersion = tslibVersion.split('.')?.[0]
        // Mor 使用 typescript 需要安装 tslib@2， 给出警告
        if (majorVersion !== '2') {
          if (userConfig.compilerOptions.importHelpers) {
            logger.warnOnce(
              `当前安装的 tslib 版本为 \`${tslibVersion}\`\n` +
                '需要的版本为 tslib@2 , 已自动关闭 `importHelpers` 选项'
            )
          }
          // 关闭 importHelpers
          userConfig.compilerOptions.importHelpers = false
        } else {
          userConfig.compilerOptions.importHelpers = true
        }
      }
    } catch (error) {
      logger.debug(`尝试定位 tslib 失败，原因：`, error)
      // 未找到 tslib
      if (userConfig.compilerOptions.importHelpers) {
        logger.warnOnce(
          '开启选项 compilerOptions.importHelpers 需要安装 tslib@2 依赖\n' +
            '已自动关闭 `importHelpers` 选项, 请安装 tslib@2 之后重试'
        )
      }

      userConfig.compilerOptions.importHelpers = false
    }
  }

  // 设置缓存开关, 默认非生产环境开启
  if (userConfig.cache == null) {
    if (mode !== Modes.production) {
      userConfig.cache = config.env.isFalsy('CACHE') ? false : true
    } else {
      if (config.env.isTruthy('CACHE')) userConfig.cache = true
    }
  }

  // 设置运行时自动注入默认值
  if (userConfig.autoInjectRuntime !== false) {
    userConfig.autoInjectRuntime =
      userConfig.autoInjectRuntime === true ||
      userConfig.autoInjectRuntime == null
        ? {}
        : userConfig.autoInjectRuntime

    // 转端编译时 默认均为开启, 且 api 的策略为 enhanced
    if (sourceType !== target) {
      userConfig.autoInjectRuntime.app =
        userConfig.autoInjectRuntime.app ?? true
      userConfig.autoInjectRuntime.page =
        userConfig.autoInjectRuntime.page ?? true
      userConfig.autoInjectRuntime.component =
        userConfig.autoInjectRuntime.component ?? true
      userConfig.autoInjectRuntime.api =
        userConfig.autoInjectRuntime.api === true
          ? GlobalObjectTransformTypes.enhanced
          : userConfig.autoInjectRuntime.api ??
            GlobalObjectTransformTypes.enhanced
      if (sourceType !== SourceTypes.alipay) {
        userConfig.autoInjectRuntime.behavior =
          userConfig.autoInjectRuntime.behavior ?? true
      }
      if (sourceType === SourceTypes.alipay) {
        userConfig.autoInjectRuntime.mixin =
          userConfig.autoInjectRuntime.mixin ?? true
      }
    }
  }

  // 设置默认的拷贝配置
  userConfig.copy = asArray(userConfig.copy ?? [])

  // 配置默认的 processPlaceholderComponents
  // compileType 为 miniprogram 或 plugin 时默认为 true
  // compileType 为 subpackage 时 默认为 false
  if (userConfig.processPlaceholderComponents == null) {
    if (
      userConfig.compileType === 'miniprogram' ||
      userConfig.compileType === 'plugin'
    ) {
      userConfig.processPlaceholderComponents = true
    } else if (
      userConfig.compileType === 'subpackage' ||
      userConfig.compileType === 'component'
    ) {
      userConfig.processPlaceholderComponents = false
    }
  }

  // 处理 customEntries 将文件转换为绝对路径
  // 如果用户配置文件存在，则基于配置文件所在目录进行转换
  // 如果用户配置文件不存在，则基于项目当前工作区进行转换
  userConfig.customEntries = userConfig.customEntries || {}
  const entryBaseDir = config.userConfigFilePath
    ? path.dirname(config.userConfigFilePath)
    : config.cwd
  _.forEach(userConfig.customEntries, (filePath, entryName) => {
    function convertToAbsFilePath(p: string) {
      return path.isAbsolute(p) ? p : path.resolve(entryBaseDir, p)
    }
    // 不处理自定义 pages 或 components
    if (entryName === 'pages' || entryName === 'components') {
      userConfig.customEntries[entryName] = _.map(
        filePath as string[],
        convertToAbsFilePath
      )
      return
    }

    if (typeof filePath !== 'string') {
      logger.warnOnce(
        `配置 customEntries.${entryName} 不是一个有效的字符串，请检查`
      )
      return
    }

    userConfig.customEntries[entryName] = convertToAbsFilePath(filePath)
  })
}

/**
 * 生成 ChunkLoadingGlobal 字符串
 * 防止多项目合并之后 原有的 mor_modules 冲突
 * @returns 生成的字符串
 */
export function generateChunkLoadingGlobal(
  runner: Runner,
  userConfig: CompilerUserConfig
): string {
  const segments: string[] = [DEFAULT_CHUNK_LOADING_GLOBAL]
  const globalNameSuffix = userConfig.globalNameSuffix

  if (userConfig.compileType !== CompileTypes.miniprogram) {
    // s: 代表分包; p: 代表插件; c: 代表组件
    const appType =
      userConfig.compileType === CompileTypes.subpackage
        ? 's'
        : userConfig.compileType === CompileTypes.plugin
        ? 'p'
        : 'c'
    segments.push(appType)

    // 未定义 globalNameSuffix 时尝试以 package.json 的 name 作为区分，避免冲突
    if (!globalNameSuffix) {
      // 使用项目的包名作为
      const pkgName = ((runner.config.pkg?.name || '') as string)
        .toLowerCase()
        .replace(/[/@ -]/g, '_')

      segments.push(pkgName)
    }
  }

  // 追加全局文件名称后缀，用于避免 chunk loading global 重复
  if (globalNameSuffix) segments.push(globalNameSuffix)

  // 针对组件添加其版本号，用于避免不同版本的组件冲突
  if (userConfig.compileType === CompileTypes.component) {
    const pkgVersion = ((runner.config.pkg?.version || '') as string).replace(
      /[.-]/g,
      '_'
    )
    segments.push(pkgVersion)
  }

  return segments.join('_')
}

/**
 * 基于 用户配置 完成对 webpack 的配置
 */
export async function buildWebpackConfig(
  config: Config,
  userConfig: CompilerUserConfig & { name?: string } = {},
  webpackWrapper: WebpackWrapper,
  entryBuilder: EntryBuilder,
  runner: Runner
): Promise<void> {
  const composedPlugins = getComposedCompilerPlugins()

  const chain = webpackWrapper.chain
  const {
    mode,
    name,
    target,
    autoClean,
    sourceType,
    finalOutputPath,
    outputPath,
    srcPaths,
    compileMode,
    compileType,
    compilerOptions,
    processNodeModules,
    globalNameSuffix
  } = userConfig
  const targetDescription = composedPlugins.targetDescription[target]
  // 显示源码目录和输出目录
  const srcDirs: string[] = []
  srcPaths.forEach(function (src) {
    let srcDir = path.relative(config.cwd, src)
    if (srcDir.startsWith('..')) {
      // 输出目录在 cwd 之外
      srcDir = src
    }
    srcDirs.push(srcDir === '' ? '.' : srcDir)
  })

  let outputDir = path.relative(config.cwd, outputPath)
  if (outputDir.startsWith('..')) {
    // 输出目录在 cwd 之外
    outputDir = outputPath
  }

  let finalOutputDir = path.relative(config.cwd, finalOutputPath)
  if (finalOutputDir.startsWith('..')) {
    // 输出目录在 cwd 之外
    finalOutputDir = finalOutputPath
  }

  let compileInfo =
    `准备配置中, 即将开始编译 👇\n` +
    (name ? `配置名称: ${name} \n` : '') +
    `编译目标: ${targetDescription} \n` +
    `编译环境: ${mode} \n` +
    `编译类型: ${CompileTypeDescriptions[compileType]} \n` +
    `编译模式: ${compileMode} \n` +
    `源码类型: ${sourceType} \n` +
    `源码目录: ${srcDirs.join(', ')} \n`

  // 如果两者不同, 代表编译插件中修改了 outputPath 用于存储中间产物
  // 这里增加提示信息
  if (outputPath !== finalOutputPath) {
    compileInfo = compileInfo + `编译产物: ${outputDir} \n`
  }

  compileInfo = compileInfo + `输出目录: ${finalOutputDir}`

  if (!isChildCompilerRunner(runner)) {
    logger.info(compileInfo)
  }

  const nodeModulesInSrcPaths = srcPaths.map((p) => {
    return path.resolve(p, 'node_modules')
  })

  // 名称透传给 webpack
  chain.name(name)

  /* 基础设置 */
  chain.target('web')

  // devtool 设置
  let devtool: string | boolean | undefined
  if (userConfig.devtool === true) {
    // 这里区分下 生产环境和开发环境
    // 未明确指定的情况下 生产环境使用 'nosources-source-map'
    // 开发环境使用 'cheap-module-source-map'

    devtool =
      userConfig.mode === 'production'
        ? DevTools['nosources-source-map']
        : DevTools['cheap-module-source-map']
  } else if (userConfig.devtool === false) {
    devtool = false
  } else if (typeof userConfig.devtool === 'string') {
    devtool = userConfig.devtool
  } else if (userConfig.devtool == null) {
    // 如果未设置, 则开发环境默认开启 'cheap-module-source-map'
    // 生产环境关闭
    if (userConfig.mode === 'production') {
      devtool = false
    } else {
      devtool = DevTools['cheap-module-source-map']
    }
  }
  // 当 devtool 存在 且 包含 eval 且 target 不是 web 的时候, 提示小程序不支持 eval
  if (
    typeof devtool === 'string' &&
    devtool.includes('eval') &&
    target !== 'web'
  ) {
    logger.warnOnce(
      `发现 devtool 使用了 小程序不支持 eval 方式: ${devtool}, 可能会引起小程序报错`
    )
  }
  chain.merge({ devtool: devtool })

  chain.mode(userConfig.mode)
  // 设置 全局变量
  chain.output.globalObject(userConfig.globalObject)
  // 设置产物目录
  chain.output.path(outputPath)
  // 设置 chunk loading global
  chain.output.chunkLoadingGlobal(
    generateChunkLoadingGlobal(runner, userConfig)
  )
  // 设置 context, 影响静态文件输出时的相对目录
  chain.context(srcPaths[0])
  // 自动清理产物目录
  if (autoClean) chain.output.clean(autoClean)
  // 设置 publicPath
  chain.output.publicPath('')

  // 输出 webpack 运行时代码的 environment 设置
  chain.output.environment({
    // The environment supports arrow functions ('() => { ... }').
    arrowFunction: false,
    // The environment supports BigInt as literal (123n).
    bigIntLiteral: false,
    // The environment supports const and let for variable declarations.
    const: false,
    // The environment supports destructuring ('{ a, b } = obj').
    destructuring: false,
    // The environment supports an async import() function to import EcmaScript modules.
    dynamicImport: false,
    // The environment supports 'for of' iteration ('for (const x of array) { ... }').
    forOf: false,
    // The environment supports ECMAScript Module syntax to import ECMAScript modules (import ... from '...').
    module: false
  })

  // 需要开启 library 类型支持
  // 插件的 main 文件需要使用
  chain.output.enabledLibraryTypes(['commonjs', 'commonjs2', 'commonjs-module'])

  // 非 web 构建, 关闭 asyncChunks
  if (target !== 'web') {
    chain.output.asyncChunks(false)
  }

  // 是否开启 watch
  chain.watch(userConfig.watch)
  // 设置 watch 忽略文件夹
  chain.watchOptions({
    ignored: userConfig.ignore,
    aggregateTimeout: 200
  })

  /* 路径解析相关 */
  // 支持解析所有文件类型，以及支持条件编译的 特殊后缀
  // 条件编译后缀优先级高于普通后缀
  const conditionalFileExt = userConfig.conditionalCompile.fileExt
  const {
    scriptWithConditionalExts,
    configWithConditionalExts,
    templateWithConditionalExts,
    styleWithConditionalExts,
    sjsWithConditionalExts
  } = entryBuilder.chooseSupportExts(target, conditionalFileExt)
  chain.resolve.extensions.merge([
    ...scriptWithConditionalExts,
    ...configWithConditionalExts,
    ...templateWithConditionalExts,
    ...styleWithConditionalExts,
    ...sjsWithConditionalExts
  ])
  // 配置后缀映射
  PluginConfigFileTypes.forEach((ext) => {
    chain.resolve.extensionAlias.set(ext, [...AllConfigFileTypes])
  })

  // 配置 node_modules mainFields 解析支持
  const mainFields = composedPlugins.resolveMainFields[target] || []
  // 开启处理 node_modules 代表能够支持直接将 node_modules 组件库中的源码组件
  // 编译为目标平台的组件，需要拓展组件库的解析目录支持，追加源码平台的 mainFields
  if (processNodeModules) {
    ;(composedPlugins.resolveMainFields[sourceType] || []).forEach(
      (field: string) => {
        if (!mainFields.includes(field)) mainFields.push(field)
      }
    )
    // 这里需要确保 main 和 module 优先级最低，避免出现 main 和 module 都存在的情况下
    // 解析出错的情况
    mainFields.sort(function (a, b) {
      if (a === 'main' || a === 'module') return 1
      if (b === 'main' || b === 'module') return -1
      return 0
    })
  }
  chain.resolve.mainFields.merge(mainFields)

  // 开启 symlinks 确保相同文件不会因为是 symlink 而被重复打包
  chain.resolve.symlinks(true)
  // 添加 npm 解析目录
  // 优先添加 srcPaths 下的 node_modules
  // 再添加 cwd 目录下的 node_modules
  // 最后兜底使用 @morjs/api 所在的 node_modules
  chain.resolve.modules
    .add('node_modules')
    .merge(nodeModulesInSrcPaths)
    .add(path.resolve(config.cwd, 'node_modules'))
    .add(CURRENT_NODE_MODULES)
    .end()
  let fallbackNodeModule: string
  for (const apiPackage of MOR_RUNTIME_NPMS.api) {
    if (fallbackNodeModule) break
    try {
      fallbackNodeModule = require
        .resolve(apiPackage)
        .split(path.normalize(`/${apiPackage}/`))[0]
      if (fallbackNodeModule.endsWith(NODE_MODULES)) {
        chain.resolve.modules.add(fallbackNodeModule).end()
      }
    } catch (err) {}
  }

  chain.resolve
    .plugin('MorResolverPlugin')
    .use(ResolverPlugin, [
      {
        srcPaths: srcPaths,
        defaultNpmMiniProgramDist:
          composedPlugins.defaultNpmMiniProgramDist[target]
      }
    ])
    .end()
  // 这里默认关闭 preferRelative
  // 可能会导致 同名文件优先取用 相对目录导致错误
  chain.resolve.preferRelative(false)

  // 配置别名
  if (userConfig.alias) {
    chain.resolve.alias.merge(userConfig.alias)
  }

  // 配置 define 变量支持
  if (userConfig.define) {
    const defines: Record<string, any> = {}
    Object.keys(userConfig.define).forEach((key) => {
      defines[key] = JSON.stringify(userConfig.define[key])
    })
    chain.plugin('webpack-define-plugin').use(webpack.DefinePlugin, [defines])
  }

  // 关闭 global 模拟, 如果不关闭 webpack 会替换 global 和 self 为 全局对象
  // 可能会导致基于 global 判断的业务代码错误
  // 仅小程序编译目标下适用
  chain.node.merge({ global: false })
  // webpack 5 默认不提供 node core modules 的 polyfill
  // 这里提供针对这块儿的部分兼容
  chain.resolve.fallback.merge({
    assert: require.resolve('assert'),
    buffer: require.resolve('buffer'),
    console: false,
    constants: false,
    crypto: false,
    domain: false,
    events: require.resolve('events'),
    http: false,
    https: false,
    os: false,
    path: false,
    punycode: require.resolve('punycode'),
    process: false,
    querystring: false,
    stream: false,
    string_decoder: require.resolve('string_decoder'),
    sys: require.resolve('util'),
    timers: false,
    tty: false,
    url: require.resolve('url'),
    util: require.resolve('util'),
    vm: false,
    zlib: false
  })

  // 扩展 loader 的解析地址
  // 优先使用当前 npm 包的依赖
  chain.resolveLoader.modules
    .add(CURRENT_NODE_MODULES)
    .merge(nodeModulesInSrcPaths)
    .add(path.resolve(config.cwd, 'node_modules'))
    // 为了避免找不到 loader 这里将 node require 的查询目录扩展进来
    .merge(require.resolve.paths(''))
    .end()

  /* 优化相关 */
  // 默认打开 tree-shaking
  chain.optimization.sideEffects(true)
  chain.optimization.usedExports(true)

  // 生产模式下，开启 moduleIds 的 hashed 方式，减少包大小
  chain.optimization.moduleIds(
    userConfig.mode === 'production' ? 'hashed' : 'named'
  )
  // 不清理空文件
  chain.optimization.removeEmptyChunks(false)

  // 压缩配置
  if (userConfig.minimize) {
    chain.optimization.minimize(userConfig.minimize)

    /**
     * 应用 js minimizer
     */
    if (userConfig.jsMinimizer !== false) {
      const TerserPlugin: typeof TerserPluginType = require(resolveDependency(
        'terser-webpack-plugin'
      ))
      const minimizerTarget = (compilerOptions.target || 'ES5').toLowerCase()

      userConfig.jsMinimizer =
        userConfig.jsMinimizer === true || !userConfig.jsMinimizer
          ? // target 为 es5 时 若用户未指定 jsMinimizer 则默认使用 terser
            // 以获得更好的兼容性
            minimizerTarget === 'es5'
            ? JSMinimizerTypes.terser
            : JSMinimizerTypes.esbuild
          : userConfig.jsMinimizer
      const jsMinimizerName = `jsMinimizer-${userConfig.jsMinimizer}`
      const jsMinifyConfig: Record<string, any> = {
        test: new RegExp(`\\${composedPlugins.fileType[target].script}$`),
        extractComments: false
      }

      const jsMinimizerOptions = userConfig.jsMinimizerOptions || {}

      // 参见: https://github.com/terser/terser#minify-options
      const ecma = minimizerTarget.replace('es', '')

      switch (userConfig.jsMinimizer) {
        case JSMinimizerTypes.esbuild:
          // 输出 esbuild 使用限制
          if (minimizerTarget === 'es5') {
            logger.warnOnce(
              'esbuild 对 ES5 的支持有限, 如有编译报错或运行时相关问题, \n' +
                `可以尝试配置 \`jsMinimizer\` 为 \`terser\` 或 \`swc\``
            )
          }
          jsMinifyConfig.minify = TerserPlugin.esbuildMinify
          jsMinifyConfig.terserOptions = {
            legalComments: 'none',
            target: [minimizerTarget],
            ...jsMinimizerOptions
          }
          break
        case JSMinimizerTypes.swc:
          jsMinifyConfig.minify = TerserPlugin.swcMinify
          jsMinifyConfig.terserOptions = { ecma, ...jsMinimizerOptions }
          break
        case JSMinimizerTypes.terser:
          jsMinifyConfig.terserOptions = { ecma, ...jsMinimizerOptions }
          break
      }
      chain.optimization
        .minimizer(jsMinimizerName)
        .use(TerserPlugin, [jsMinifyConfig])
    }

    /**
     * 应用 css minimizer
     */
    if (userConfig.cssMinimizer !== false) {
      const CssMinimizerPlugin: typeof CssMinimizerPluginType = require(resolveDependency(
        'css-minimizer-webpack-plugin'
      ))
      userConfig.cssMinimizer =
        userConfig.cssMinimizer === true || !userConfig.cssMinimizer
          ? CSSMinimizerTypes.esbuild
          : userConfig.cssMinimizer
      const cssMinimizerName = `cssMinimizer-${userConfig.cssMinimizer}`
      const cssMinifyConfig: Record<string, any> = {
        test: new RegExp(
          `(\\${composedPlugins.fileType[target].style}|\\.css)$`
        )
      }

      const cssMinimizerOptions = userConfig.cssMinimizerOptions || {}

      switch (userConfig.cssMinimizer?.toLowerCase?.()) {
        case CSSMinimizerTypes.esbuild:
          cssMinifyConfig.minify = CssMinimizerPlugin.esbuildMinify
          // 这里指定 safari10 是为了避免 esbuild 使用新特性导致的过度压缩
          cssMinifyConfig.minimizerOptions = {
            target: ['safari10'],
            ...cssMinimizerOptions
          }
          break
        case CSSMinimizerTypes.csso:
          cssMinifyConfig.minify = CssMinimizerPlugin.cssoMinify
          cssMinifyConfig.minimizerOptions = cssMinimizerOptions
          break
        case CSSMinimizerTypes.cleancss:
          cssMinifyConfig.minify = CssMinimizerPlugin.cleanCssMinify
          cssMinifyConfig.minimizerOptions = cssMinimizerOptions
          break
        case CSSMinimizerTypes.cssnano:
          cssMinifyConfig.minify = CssMinimizerPlugin.cssnanoMinify
          cssMinifyConfig.minimizerOptions = cssMinimizerOptions
          break
        case CSSMinimizerTypes.parcelcss:
          cssMinifyConfig.minify = CssMinimizerPlugin.parcelCssMinify
          // 这里指定 safari10 是为了避免 parcelCss 使用新特性导致的过度压缩
          cssMinifyConfig.minimizerOptions = {
            targets: { ios_saf: 10 },
            ...cssMinimizerOptions
          }
          break
      }
      chain.optimization
        .minimizer(cssMinimizerName)
        .use(CssMinimizerPlugin, [cssMinifyConfig])
    }

    /**
     * 应用 html minimizer
     */
    if (userConfig.xmlMinimizer !== false) {
      const HtmlMinimizerPlugin: typeof HtmlMinimizerPluginType = require(resolveDependency(
        'html-minimizer-webpack-plugin'
      ))
      const xmlMinimizerName = 'xmlMinimizer'
      const sjsTagName = composedPlugins.sjsTagName[target]
      const xmlMinifyConfig: Record<string, any> = {
        test: new RegExp(`\\${composedPlugins.fileType[target].template}$`),
        minimizerOptions: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          caseSensitive: true,
          minifyCSS: false,
          // 避免属性值中出现单引号或双引号被 escape 的问题
          preventAttributesEscaping: true,
          removeComments: true,
          keepClosingSlash: true,
          removeAttributeQuotes: false,
          removeEmptyElements: false,
          ignoreCustomFragments: [
            /<%[\s\S]*?%>/,
            /<\?[\s\S]*?\?>/,
            // 忽略 wxs、qs 和 sjs 等标签的处理
            new RegExp(`<${sjsTagName}[\\s\\S]*?<\\/${sjsTagName}>`),
            // 忽略 {{ }} 中间内容的处理
            /{{[\s\S]*?}}/
          ],
          ...(userConfig.xmlMinimizerOptions || {})
        }
      }
      chain.optimization
        .minimizer(xmlMinimizerName)
        .use(HtmlMinimizerPlugin, [xmlMinifyConfig])
    }
  }

  // 预先尝试载入用户 tsconfig 文件配置
  loadUserTsCompilerOptions()

  // bundle 模式下 设置缓存
  if (compileMode === CompileModes.bundle && userConfig.cache === true) {
    if (!isChildCompilerRunner(runner)) {
      logger.info('已开启缓存, 可通过 --no-cache 关闭')
    }

    const buildDependencies = [
      // This makes all dependencies of this file - build dependencies
      __filename
      // By default webpack and loaders are build dependencies
    ]

    // 如果 tsconfig 文件存在, 列为构建依赖文件
    const tsConfigFile = getTsConfigFile()
    if (tsConfigFile) {
      buildDependencies.push(tsConfigFile)
    }

    // 如果用户配置文件存在, 列为构建依赖文件
    if (config.userConfigFilePath) {
      buildDependencies.push(config.userConfigFilePath)
    }

    const cacheDirectory = config.getCachedFilePath(
      path.join('webpack', generateCacheFileHash(userConfig))
    )

    chain
      .cache({
        type: 'filesystem',
        store: 'pack',
        cacheDirectory,
        buildDependencies: {
          config: buildDependencies
        }
      })
      .end()

    chain.snapshot({
      // node_modules 及 .mor 中的临时文件通常都不修改
      // 这里标记为 managedPaths 以便于 webpack 缓存
      managedPaths: srcPaths
        .map((s: string) => path.join(s, NODE_MODULES))
        .concat([
          path.join(runner.getCwd(), NODE_MODULES),
          runner.config.getTempDir()
        ]),
      // 标记 /node_modules/_xxx@xx@ 等包含版本号的路径为不可变路径
      // 避免 snapshot 额外消耗或引起不必要的 bug
      immutablePaths: [/(\/|\\)node_modules(\/|\\)\_@?.+@[a-zA-Z0-9.]+@/]
    })
  }

  // 以下内容仅在 bundle 下生效
  if (compileMode === CompileModes.bundle) {
    // 运行时代码文件 name.r
    chain.optimization.runtimeChunk({
      name: MOR_RUNTIME_FILE(globalNameSuffix)
    })
  } else {
    chain.target(false)
    chain.output.iife(false)
    chain.output.chunkFormat('module')
  }

  /* 模块解析规则相关 */
  // 自定义 loader 的通用配置
  const commonOptions: CustomLoaderOptions = {
    userConfig,
    entryBuilder,
    runner
  }

  // 资源生成配置
  // 借助 entries 生成的数据确保文件名称正确
  const generatorOptions = {
    filename: (data: { module?: webpack.NormalModule }) => {
      const resource = data?.module?.resource
      const rawRequest = data?.module?.rawRequest
      // 这里需要查找两次
      // 第一次查找 resource 文件, 但可能出现例外，如 文件是从软链获取到的
      // 这种情况下可能 entryRecords 中记录的文件路径和最终 webpack 拿到的路径不是同一个
      // 比如 entryRecords 中记录的是包含软链的地址, 而 webpack 中拿到的是实际地址
      // 所以第二次兜底使用原始请求的路径来查找一次
      if (entryBuilder.entryRecords.has(resource)) {
        return entryBuilder.entryRecords.get(resource)
      } else if (entryBuilder.entryRecords.has(rawRequest)) {
        return entryBuilder.entryRecords.get(rawRequest)
      } else {
        return ['file']
      }
    }
  }

  // NOTE: 考虑合并 less sa|css acss 等的 loader, 统一放在 styleLoader 中处理
  // less 支持
  // prettier-ignore
  chain.module
    .rule('less')
      .test(LESS_REGEXP)
      .type('asset/resource').generator(generatorOptions)
      .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
      .use('style').loader(LOADERS.style).options(commonOptions).end()
      // less 4 和 less 3 相比有一个 break change
      // less 4 math 选项默认是 parens-division，也就是说只有放在 () 里面的除法才会被执行
      // 而 less 3 是 always
      // 之所以这么修改的原因是为了解决这个 issue: https://github.com/less/less.js/issues/1880
      // 简而言之就是为了规避 less 和 css 本身语法的冲突，调整了 默认的 less math 配置
      // 如果有用户遇到类似问题, 可以通过 webpackChain 修改 mor 的 less 配置来调整行为
      .use('less').loader(resolveDependency('less-loader')).end()
      .use('preprocess')
        .loader(LOADERS.preprocess)
        .options(commonOptions)
        .end()

  // sass/scss 支持
  // prettier-ignore
  chain.module
    .rule('sass')
      .test(SASS_REGEXP)
      .type('asset/resource').generator(generatorOptions)
      .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
      .use('style').loader(LOADERS.style).options(commonOptions).end()
      .use('sass').loader(resolveDependency('sass-loader')).options({
        // 这里需要强制 sass 的 outputStyle 为 expanded 否则 sass-loader 会根据 mode
        // 自动压缩 css, 压缩的事情交给  css-minimizer
        sassOptions: { outputStyle: "expanded" }
      }).end()
      .use('preprocess')
        .loader(LOADERS.preprocess)
        .options(commonOptions)
        .end()

  // acss/wxss 支持
  // prettier-ignore
  chain.module
    .rule('style')
      .test(STYLE_REGEXP)
      .type('asset/resource').generator(generatorOptions)
      .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
      .use('style').loader(LOADERS.style).options(commonOptions).end()
      .use('preprocess')
        .loader(LOADERS.preprocess)
        .options(commonOptions)
        .end()

  // js 支持
  // prettier-ignore
  chain.module
    .rule('script-js')
      .test(SCRIPT_REGEXP)
      .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
      .use('script').loader(LOADERS.script).options(commonOptions).end()
      .use('preprocess')
        .loader(LOADERS.preprocess)
        .options(commonOptions)
        .end()
  // ts 支持, 和 js 的区别在于 允许引用 node_modules 中的 ts 文件
  // prettier-ignore
  chain.module
    .rule('script-ts')
      .test(TS_REGEXP)
      .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
      .use('script').loader(LOADERS.script).options(commonOptions).end()
      .use('preprocess')
        .loader(LOADERS.preprocess)
        .options(commonOptions)
        .end()

  // json 支持
  // prettier-ignore
  chain.module
    .rule('config')
      // 这里需要标记为 json 类型, 否则 webpack 无法正常解析 json5 或 jsonc
      .type('json')
      .test(JSON_REGEXP)
      .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
      .use('config').loader(LOADERS.config).options(commonOptions).end()
      .use('preprocess')
        .loader(LOADERS.preprocess)
        .options(commonOptions)
        .end()

  const singleTags = composedPlugins['templateSingleTagNames'][target] || []
  const closingSingleTag =
    composedPlugins['templateSingleTagClosingType']?.[target]
  // 查询是否有编译插件自定义模版渲染函数，如果有的话优先使用自定义的 render
  const customTemplateRender = composedPlugins['customTemplateRender']?.[target]
  // wxml/axml 支持
  // prettier-ignore
  chain.module
    .rule('template')
      .test(TEMPLATE_REGEXP)
      .type('asset/resource').generator(generatorOptions)
      .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
      .use('template').loader(LOADERS.template).options({
        ...commonOptions, singleTags, closingSingleTag, customTemplateRender
      }).end()
      .use('preprocess')
        .loader(LOADERS.preprocess)
        .options(commonOptions)
        .end()

  // wxs/sjs 支持
  // prettier-ignore
  chain.module
    .rule('sjs')
      .test(SJS_REGEXP)
      .type('asset/resource').generator(generatorOptions)
      .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
      .use('sjs').loader(LOADERS.sjs).options(commonOptions).end()
      .use('preprocess')
        .loader(LOADERS.preprocess)
        .options(commonOptions)
        .end()

  // 原生文件支持
  // 这里的原生文件主要指: 微信和支付宝小程序之外的 样式和模版文件
  if (target !== SourceTypes.alipay && target !== SourceTypes.wechat) {
    const fileType = composedPlugins.fileType[target]
    // 拼接正则
    const NATIVE_REGEXP = new RegExp(
      `\\.(${[fileType.template, fileType.style]
        .map((e) => e.slice(1))
        .join('|')})$`
    )
    // prettier-ignore
    chain.module
      .rule('native')
        .test(NATIVE_REGEXP)
        .type('asset/resource').generator(generatorOptions)
        .use('postprocess').loader(LOADERS.postprocess).options(commonOptions).end()
        .use('native').loader(LOADERS.native).options({
          ...commonOptions, singleTags, closingSingleTag
        }).end()
        .use('preprocess')
          .loader(LOADERS.preprocess)
          .options(commonOptions)
          .end()
  }

  function shouldProcessNodeModules(filePath: string): boolean {
    return shouldProcessFileByPlugins(filePath, userConfig.processNodeModules)
  }

  // 是否处理 node_modules 中的组件库
  if (userConfig.processNodeModules) {
    logger.info('已开启 node_modules 组件处理')
    if (userConfig.processNodeModules !== true) {
      chain.module.rule('less').include.add(shouldProcessNodeModules).end()
      chain.module.rule('sass').include.add(shouldProcessNodeModules).end()
      chain.module.rule('script-js').include.add(shouldProcessNodeModules).end()
    }
  } else {
    chain.module.rule('less').exclude.add(NODE_MODULE_REGEXP).end()
    chain.module.rule('sass').exclude.add(NODE_MODULE_REGEXP).end()
    chain.module.rule('script-js').exclude.add(NODE_MODULE_REGEXP).end()
  }

  /* 外部资源配置 */
  if (userConfig.externals) {
    chain.externals(userConfig.externals)
    chain.externalsType(
      userConfig.compilerOptions.module === 'CommonJS'
        ? 'commonjs'
        : 'commonjs2'
    )
  }

  /* 资源文件拷贝 */
  // 过滤掉一些项目目录，生成 patterns
  // 如果不提前过滤掉一些文件夹，类似于 node_modules 这种庞大的目录可能导致 OOM
  const { ignore, copy } = userConfig
  const defaultCopyPattern = `**/${AssetFileExtPattern}`

  // 转换以及限制路径
  function resolvePath(basePath: string, targetPath: string): string {
    return path.isAbsolute(targetPath)
      ? slash(path.join(basePath, targetPath))
      : slash(path.resolve(basePath, targetPath))
  }

  const basePattern = {
    globOptions: {
      dot: true,
      ignore
    },
    // 自动为 outputPath 追加 / 以帮助 copyWebpackPlugin 自动判断为 文件夹
    // 否则类似于 1.0.0 这种结尾的路径会被判断为文件而导致报错
    // 参见: https://github.com/webpack-contrib/copy-webpack-plugin#totype
    to: slash(path.join(outputPath, '/')),
    noErrorOnMissing: true
  }

  const patterns = srcPaths.reduce((patterns, srcPath) => {
    // 添加默认的拷贝配置
    patterns.push({
      ...basePattern,
      context: srcPath,
      from: slash(path.resolve(srcPath, defaultCopyPattern))
    })

    return patterns
  }, [])

  // 追加用户 copy 配置
  asArray(copy).forEach((item) => {
    if (typeof item === 'string') {
      patterns.push({
        ...basePattern,
        context: runner.getCwd(),
        from: resolvePath(runner.getCwd(), item)
      })
    } else if (typeof item === 'object') {
      if (!item.from || typeof item.from !== 'string') return
      const pattern = {
        ...basePattern,
        context: runner.getCwd(),
        from: resolvePath(runner.getCwd(), item.from)
      }
      if (item.to && typeof item.to === 'string') {
        pattern.to = resolvePath(outputPath, item.to)
      }

      patterns.push(pattern)
    }
  })

  const copyConfig = { patterns }

  chain.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [copyConfig]).end()

  // 开启 bundle analyzer
  if (userConfig.analyzer) {
    const BundleAnalyzerPlugin: typeof BundleAnalyzerPluginType =
      require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    chain
      .plugin('BundleAnalyzerPlugin')
      .use(
        class extends BundleAnalyzerPlugin {
          logger: Logger
          constructor(...args: any[]) {
            super(...args)
            // 覆盖日志, 已提供统一的日志格式
            this.logger = logger
          }
        },
        [userConfig.analyzer === true ? {} : userConfig.analyzer]
      )
      .end()
  }
}
