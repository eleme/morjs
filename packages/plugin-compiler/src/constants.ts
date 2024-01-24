import type { WebCompilerUserConfig } from '@morjs/plugin-compiler-web'
import {
  CompileModuleKind,
  CompileScriptTarget,
  CompileTypes,
  EntryBuilderHelpers,
  objectEnum,
  Runner,
  slash,
  SourceTypes,
  validKeysMessage,
  webpack,
  zod as z
} from '@morjs/utils'
import path from 'path'
import {
  getAllCompilerTargets,
  PluginConfigFileTypes,
  PluginScriptFileTypes,
  PluginSjsFileTypes,
  PluginStyleFileTypes,
  PluginTemplateFileTypes,
  Targets
} from './compilerPlugins'
import { extsToGlobPatterns } from './utils'

export const COMPILE_COMMAND_NAME = 'compile'

/**
 * mor 子 runner 判断标识符，用于独立分包编译
 */
export const CHILD_COMPILER_RUNNER = 'MOR_CHILD_RUNNER_COMPILER_FLAG'

/**
 * 独立分包 context key 名称
 */
export const INDEPENDENT_SUBPACAKGE_JSON = 'independentSubpackageJson'

/**
 * 运行时源码类型标记
 */
export const RUNTIME_SOURCE_TYPES = {
  alipay: 'a',
  wechat: 'w'
} as const

/**
 * mor 核心运行时基础库
 * 兼容旧的基础库
 */
export const MOR_RUNTIME_NPMS = {
  api: ['@morjs/api', '@ali/openmor-api'],
  core: ['@morjs/core', '@ali/openmor-core']
}

/**
 * 生成 mor 运行时正则
 * 1. 用于实现转端运行时自动注入的检测
 * 2. 用于确保 API 转端处理时，跳过 MorJS 内部的代码
 * 注意: 这个正则必须包含两个捕获(即两对小括号), 第二个捕获字符串用于逻辑判断
 * 参见: plugins/runtimeInjectPlugin.ts 中的代码
 */
function generateMorRuntimeRegexp() {
  const rootDir = slash(path.resolve(__dirname, '..'))
  let packages = MOR_RUNTIME_NPMS.api
    .concat(MOR_RUNTIME_NPMS.core)
    .concat('@morjs/runtime-base')

  // 代表为仓库代码
  if (rootDir.endsWith('packages/plugin-compiler')) {
    packages = packages.concat([
      rootDir.replace(/\//g, '\\/').replace(/plugin-compiler$/, 'core'),
      rootDir.replace(/\//g, '\\/').replace(/plugin-compiler$/, 'api'),
      rootDir.replace(/\//g, '\\/').replace(/plugin-compiler$/, 'runtime-base')
    ])
  }

  return new RegExp(
    `(${packages.join('|')})\/(?:lib|esm)\/(app|page|component|api|env).js$`
  )
}

/**
 * mor 运行时正则匹配
 */
export const MOR_RUNTIME_PACKAGE_REGEXP = generateMorRuntimeRegexp()

// 非 js/ts 文件会统一使用一个 entry 来囊括
export const NON_SCRIPT_ENTRIES_FILENAME = 'mor_non_script_entries'

// 默认的 jsonpFunction
export const DEFAULT_CHUNK_LOADING_GLOBAL = 'mor_modules'

export const NODE_MODULES = 'node_modules'

// 额外支持的样式文件
export const ExtraStyleFileTypes = [
  // less 支持
  '.less',

  // sass 支持
  '.scss',
  '.sass'
] as const

// 额外支持的脚本文件
export const ExtraScriptTypes = [
  '.mjs',
  // ts 支持
  '.ts',
  '.mts'
] as const

// 额外支持的配置文件
export const ExtraConfigTypes = [
  // jsonc 支持
  '.jsonc',
  '.json5'
] as const

// 支持的各类文件类型, 以小程序本身文件为主
export const AllTemplateFileTypes = [...PluginTemplateFileTypes]
export const AllStyleFileTypes = [
  ...PluginStyleFileTypes,
  ...ExtraStyleFileTypes
]
export const AllConfigFileTypes = [
  ...PluginConfigFileTypes,
  ...ExtraConfigTypes
]
export const AllScriptFileTypes = [
  ...PluginScriptFileTypes,
  ...ExtraScriptTypes
]
export const AllSjsFileTypes = [...PluginSjsFileTypes]
export const AllFileTypes = [
  ...AllScriptFileTypes,
  ...AllConfigFileTypes,
  ...AllTemplateFileTypes,
  ...AllStyleFileTypes,
  ...AllSjsFileTypes
]

// 支持的拷贝的资源文件类型
export const AssetFileTypes = [
  '.jpg',
  '.jpeg',
  '.png',
  '.svg',
  '.bmp',
  '.ico',
  '.gif',
  '.webp',
  '.otf',
  '.ttf',
  '.woff',
  '.woff2',
  '.eot',
  '.cer',
  '.ogg',
  '.aac',
  '.mp4',
  '.wav',
  '.mp3',
  '.m4a',
  '.silk',
  '.wasm',
  '.br',
  '.cert'
] as const
// 资源文件 glob pattern
export const AssetFileExtPattern = extsToGlobPatterns(AssetFileTypes)

// 一些 正则
export const LESS_REGEXP = /\.less$/
export const SASS_REGEXP = /\.s(a|c)ss$/
export const TS_REGEXP = /\.m?ts$/
export const SCRIPT_REGEXP = /\.m?js$/
export const TEMPLATE_REGEXP = /\.(wx|ax)ml$/
export const SJS_REGEXP = /\.(sjs|wxs)$/
export const STYLE_REGEXP = /\.(wx|ac)ss$/
export const JSON_REGEXP = /\.json(c|5)?$/
export const NODE_MODULE_REGEXP = /[\\/]node_modules[\\/]/

// 自定义 loader options
export interface CustomLoaderOptions {
  userConfig: CompilerUserConfig
  entryBuilder: EntryBuilderHelpers
  runner: Runner
  // loader 缺省处理 node_modules 配置
  // 仅在用户未配置 userConfig.processNodeModules 时生效
  processNodeModules?: boolean
}

/**
 * 编译模式
 * - bundle: 打包编译模式, 会处理 npm 包并将代码按照特定逻辑进行打包, 产物中无 node_modules
 * - transform: 转换编译模式, 仅转换和编译源码，不处理 npm 组件和依赖（由 default 和 transfer 合并而来）
 * - NOTE: transfer 和 default 模式已合并为 transform, 出于兼容性考虑这里依然替用配置支持
 */
export const CompileModes = objectEnum([
  'bundle',
  'transform',
  'transfer',
  'default'
])

/**
 * 入口配置文件类型
 * - app.json: 小程序入口配置文件
 * - plugin.json: 小程序插件入口配置文件
 * - subpackage.json: 小程序分包入口配置文件
 */
export const RootEntryConfigFiles = objectEnum([
  'app.json',
  'plugin.json',
  'subpackage.json'
])

/**
 * 编译类型描述
 */
export const CompileTypeDescriptions = {
  miniprogram: '小程序',
  plugin: '插件',
  subpackage: '分包',
  component: '组件'
} as const

/**
 * 构建模式, 和 webpack 一致
 */
export const Modes = objectEnum(['production', 'development', 'none'])

/**
 * devtools 和 webpack 一致
 * 参见: https://webpack.js.org/configuration/devtool/
 */
export const DevTools = objectEnum([
  'eval',
  'eval-cheap-source-map',
  'eval-cheap-module-source-map',
  'eval-source-map',
  'cheap-source-map',
  'cheap-module-source-map',
  'source-map',
  'inline-cheap-source-map',
  'inline-cheap-module-source-map',
  'inline-source-map',
  'eval-nosources-cheap-source-map',
  'eval-nosources-cheap-module-source-map',
  'eval-nosources-source-map',
  'inline-nosources-cheap-source-map',
  'inline-nosources-cheap-module-source-map',
  'inline-nosources-source-map',
  'nosources-cheap-source-map',
  'nosources-cheap-module-source-map',
  'nosources-source-map',
  'hidden-nosources-cheap-source-map',
  'hidden-nosources-cheap-module-source-map',
  'hidden-nosources-source-map',
  'hidden-cheap-source-map',
  'hidden-cheap-module-source-map',
  'hidden-source-map'
])

/**
 * 全局对象替换方式
 * - `enhanced` 增强方式: wx => mor 并追加 mor import, mor 中包含 api 的抹平
 * - `lite` 轻量级的方式: wx => my, 替换所有 globalObject
 * - `minimal` 最小替换: wx.abc() => my.abc(), 仅替换函数调用
 */
export const GlobalObjectTransformTypes = objectEnum([
  'enhanced',
  'lite',
  'minimal'
])

// 依赖分析相关
const AnalyzerModes = objectEnum(['server', 'static', 'json', 'disabled'])
const AnalyzerDefaultSizes = objectEnum(['stat', 'parsed', 'gzip'])
const AnalyzerLogLevel = objectEnum(['info', 'warn', 'error', 'silent'])

// JS 压缩选项
export const JSMinimizerTypes = objectEnum(['terser', 'esbuild', 'swc'])

// CSS 压缩选项
export const CSSMinimizerTypes = objectEnum([
  'esbuild',
  'csso',
  'cssnano',
  'cleancss',
  'parcelcss'
])

// CSS 压缩特性
export const CompressCssStrategies = objectEnum(['lite'])

// 幽灵依赖检测模式
export const PhantomDependencyMode = objectEnum(['warn', 'error'])

/**
 * 编译命令行及用户配置条目
 */
type ICliConfigItem = {
  // 命令行配置
  cliOption?: string
  // 字段中文名称
  name: string
  // 基于配置使用命令行参数覆盖 userConfig
  overwriteUserConfig?: boolean | string
  // 是否忽略 命令行参数值 的判断函数
  ignoreCliValue?: (v: any) => boolean
  // 字段额外解释
  desc?: string
  // 字段可选值描述
  valuesDesc?: string | (() => string)
  // 字段默认值
  default?: string | boolean | string[] | number
  // 嵌套字段
  children?: ICliConfig
}

type ICliConfig = {
  [k: string]: ICliConfigItem
}

export const DEFAULT_SRC_PATH = './src'

// 编译配置
export const CompilerCliConfig: ICliConfig = {
  /**
   * 源码类型；
   * 默认可不配置, JS 文件会自动基于 .wxml 或 .axml 的后缀名来判断是哪个平台的页面或组件
   * 如果一个文件夹下面同时出现了这两种文件, 需要手动指定该类型来帮助判断
   */
  sourceType: {
    cliOption: '--source-type <sourceType>',
    name: '源码类型',
    overwriteUserConfig: true,
    desc: '用于判断小程序页面或组件使用了哪种 DSL',
    valuesDesc() {
      return validKeysMessage(SourceTypes)
    }
  },

  /**
   * 编译目标
   * alipay: 支付宝小程序
   * wechat: 微信小程序
   * baidu: 百度小程序
   * qq: QQ 小程序
   * bytedance: 字节小程序
   * web: Web 应用
   */
  target: {
    cliOption: '-t, --target <target>',
    name: `编译目标`,
    overwriteUserConfig: true,
    desc: '将当前的工程编译为目标小程序工程',
    valuesDesc() {
      return validKeysMessage(getAllCompilerTargets())
    }
  },

  /**
   * 编译模式, 默认为 bundle
   * 另外支持 transform 模式
   */
  compileMode: {
    cliOption: '--compile-mode <compileMode>',
    name: '编译模式',
    overwriteUserConfig: true,
    desc: '将当前工程以指定的编译模式编译, 编译模式差异参见官方文档',
    valuesDesc() {
      return validKeysMessage(CompileModes)
    }
  },

  /**
   * 编译的形态, 支持 miniprogram, plugin, subpackage, 默认为 miniprogram
   * 不同形态的入口文件不一样
   *   miniprogram: app.json
   *   plugin: plugin.json
   *   subpackage: subpackage.json
   */
  compileType: {
    cliOption: '--compile-type <compileType>',
    name: '编译形态',
    overwriteUserConfig: true,
    desc: '将当前工程编译为指定形态',
    valuesDesc() {
      return validKeysMessage(CompileTypes)
    }
  },

  // 关闭 devtool
  noDevtool: {
    cliOption: '--no-devtool',
    overwriteUserConfig: true,
    name: '关闭 devtool'
  },

  devtool: {
    cliOption: '-d, --devtool [devtool]',
    name: '开发工具',
    overwriteUserConfig: true,
    desc: '控制是否生成, 以及如何生成 source map, 参见 https://webpack.js.org/configuration/devtool',
    default: null
  },

  // 是否开启压缩, mode 为 production 时, 自动为 true, 默认为 false
  minimize: {
    cliOption: '--minimize',
    name: '是否开启压缩',
    overwriteUserConfig: true,
    desc: '--production 状态下会自动开启 (默认: false)'
  },

  // 关闭 JS 压缩
  noJsMinimizer: {
    cliOption: '--no-js-minimizer',
    name: '关闭 JS 压缩'
  },

  // JS 压缩器
  jsMinimizer: {
    cliOption: '--js-minimizer [minimizer]',
    name: 'JS 代码压缩器',
    overwriteUserConfig: true,
    default: null,
    valuesDesc() {
      return validKeysMessage(JSMinimizerTypes)
    }
  },

  // 关闭 CSS 压缩
  noCssMinimizer: {
    cliOption: '--no-css-minimizer',
    name: '关闭 CSS 压缩'
  },

  // CSS 压缩器
  cssMinimizer: {
    cliOption: '--css-minimizer [minimizer]',
    name: 'CSS 代码压缩器, 默认为 esbuild',
    overwriteUserConfig: true,
    default: null,
    valuesDesc() {
      return validKeysMessage(CSSMinimizerTypes)
    }
  },

  // 关闭 XML 压缩
  noXmlMinimizer: {
    cliOption: '--no-xml-minimizer',
    name: '关闭 XML 压缩'
  },

  // XML 压缩器
  xmlMinimizer: {
    cliOption: '--xml-minimizer',
    name: 'XML 代码压缩器, 目前仅支持 html-terser',
    overwriteUserConfig: true,
    default: null
  },

  // 和 webpack mode 意义保持一致
  mode: {
    cliOption: '--mode <mode>',
    name: '开发模式',
    overwriteUserConfig: true,
    desc: '设置开发模式',
    valuesDesc() {
      return validKeysMessage(Modes)
    }
  },

  // 是否开启生产模式
  production: {
    cliOption: '--production',
    name: '是否开启生产模式',
    desc: '等同于 --mode production'
  },

  // 是否自动清空输出目录
  autoClean: {
    cliOption: '--auto-clean',
    name: '是否自动清空输出目录',
    overwriteUserConfig: true,
    desc: '(默认: false)'
  },

  // 是否开启 watch 模式
  watch: {
    cliOption: '-w, --watch',
    name: '是否开启监听模式',
    overwriteUserConfig: true,
    desc: '(默认: false)'
  },

  // 源代码根目录
  srcPath: {
    cliOption: '-s, --src-path <dir>',
    name: '源代码根目录, 默认为 src',
    overwriteUserConfig: true
  },

  // 编译产物输出目录
  // 不同的 target 会有默认的输出目录
  outputPath: {
    cliOption: '-o, --output-path <dir>',
    name: '编译产物输出目录',
    overwriteUserConfig: true,
    desc: '不同的 target 会有默认的输出目录, 如 dist/wechat'
  },

  // 忽略文件或目录
  ignore: {
    cliOption: '--ignore <fileOrDir>',
    name: '忽略文件或目录',
    overwriteUserConfig: true,
    desc: '各个配置中的 outputPath 会被自动添加到忽略目录'
  },

  // 是否关闭缓存
  noCache: {
    cliOption: '--no-cache',
    name: '是否关闭缓存'
  },

  // 是否开启缓存
  cache: {
    cliOption: '--cache',
    name: '是否开启缓存',
    overwriteUserConfig: true,
    desc: 'mode = development 下默认开启, mode = production 状态下默认关闭',
    default: null
  },

  // 是否开启缓存
  processNodeModules: {
    cliOption: '--process-node-modules',
    overwriteUserConfig: true,
    name: '是否自动处理 node_modules 中的多端组件库',
    desc: '默认情况为 false, 开启后会自动处理 node_modules 中的文件的转端'
  },

  // 全局对象
  globalObject: {
    cliOption: '--global-object <name>',
    name: '全局对象配置',
    overwriteUserConfig: true,
    desc: '不同的 target 会有默认的全局对象, 通常情况下无需设置'
  },

  // 是否自动注入 runtime
  autoInjectRuntime: {
    name: '是否自动注入 mor 运行时',
    children: {
      app: {
        name: 'App 运行时注入, 编译时替换 App({}) 为 mor 的运行时',
        desc: '跨端编译时, 默认为: true'
      },
      page: {
        name: 'Page 运行时注入, 编译时替换 Page({}) 为 mor 的运行时',
        desc: '跨端编译时, 默认为: true'
      },
      component: {
        name: 'Component 运行时注入, 编译时替换 Component({}) 为 mor 的运行时',
        desc: '跨端编译时, 默认为: true'
      },
      behavior: {
        name: 'Behavior 运行时注入, 编译时替换 Behavior({}) 为 mor 的运行时',
        desc: '跨端编译且源码类型非支付宝小程序时, 默认为: true'
      },
      mixin: {
        name: 'Mixin 运行时注入, 编译时替换 Mixin({}) 为 mor 的运行时',
        desc: '跨端编译且源码类型为支付宝小程序时, 默认为: true'
      },
      api: {
        name: 'API 运行时注入, 全局对象替换方式',
        valuesDesc() {
          return validKeysMessage(GlobalObjectTransformTypes) + '或 false'
        }
      }
    }
  },

  // 是否开启幽灵依赖检查
  phantomDependency: {
    name: '是否开启幽灵依赖检查',
    children: {
      mode: {
        name: '开启幽灵依赖检查的模式',
        desc: '不同模式下幽灵依赖检查的程度不同'
      },
      exclude: {
        name: '不作为幽灵依赖的 npm 包',
        desc: '开启幽灵依赖检查时，不被认为是幽灵依赖的 npm 包'
      }
    }
  },

  // 模拟 app.x 文件
  mockAppEntry: {
    name: '模拟 app.x 的文件配置',
    desc:
      '需要结合 compileType 使用, 默认情况下 均为 app, ' +
      '`plugin` 编译条件下, 优先使用 mor.plugin.app, ' +
      '`subpackage` 编译条件下, 优先使用 mor.subpackage.app'
  },

  // ts 编译配置, 和 tsconfig 中的含义一致
  // 剩余 tsconfig 的配置子集
  compilerOptions: {
    name: 'ts 编译配置',
    children: {
      declaration: {
        name: '是否生成 declaration (.d.ts) 文件',
        desc: '仅 compileMode 为 default 情况下支持'
      },

      importHelpers: {
        name: '是否引入 tslib',
        desc: '需要添加 tslib 后才能生效'
      },

      module: {
        name: '模块输出类型',
        desc: '不同的小程序会有不同的默认值',
        valuesDesc() {
          return validKeysMessage(CompileModuleKind)
        }
      },

      target: {
        name: '输出的 ES 版本',
        desc: '不同的小程序会有不同的默认值',
        valuesDesc() {
          return validKeysMessage(CompileScriptTarget)
        }
      },

      esModuleInterop: {
        name: '是否开启 ES 模块互操作性'
      },

      allowSyntheticDefaultImports: {
        name: '是否允许合成默认导入'
      }
    }
  },

  // 条件编译配置
  conditionalCompile: {
    name: '条件编译配置',
    children: {
      context: {
        name: '代码纬度条件编译的上下文'
      },
      fileExt: {
        name: '文件纬度条件编译的后缀设置',
        desc: '不同的 target 有一套默认的配置'
      }
    }
  },

  // 开启 bundle analyze
  // 选项和 webpack-bundle-analyzer 选项一一对应
  analyzer: {
    name: '是否开启 bundle analyzer',
    cliOption: '--analyze',
    children: {
      analyzerMode: {
        name: '依赖分析模式'
      },
      analyzerHost: {
        name: '依赖分析 HTTP 服务域名',
        desc: '仅在 analyzerMode 为 server 时生效'
      },
      analyzerPort: {
        name: '依赖分析 HTTP 服务端口号',
        desc: '仅在 analyzerMode 为 server 时生效'
      },
      reportFilename: {
        name: '生成报告文件的名称',
        desc: '仅在 analyzerMode 为 static 时生效'
      },
      reportTitle: {
        name: '生成报告文件的标题',
        desc: '仅在 analyzerMode 为 static 时生效'
      },
      defaultSizes: {
        name: '分析报告中展示模块大小的定义方式'
      },
      openAnalyzer: {
        name: '是否在浏览器中打开'
      },
      generateStatsFile: {
        name: '是否生成 stats 文件'
      },
      statsFilename: {
        name: 'stats 文件名称'
      },
      // 参见: https://webpack.js.org/configuration/stats/
      statsOptions: {
        name: 'stats 生成内容选项'
      },
      excludeAssets: {
        name: '排除 assets 配置'
      },
      logLevel: {
        name: '日志级别'
      }
    }
  },

  // 实验特性
  experiments: {
    name: '实验特性',
    children: {
      // 自动裁剪 ts 和 babel 冗余的辅助函数功能
      autoTrimRuntimeHelpers: {
        name: '自动裁剪 ts 和 babel 冗余的辅助函数',
        desc: '开启后需要项目中手动添加 tslib 和 @babel/runtime 的依赖'
      },

      // CSS 类名压缩功能
      compressCssClassName: {
        name: 'CSS 类名压缩功能',
        children: {
          strategy: {
            name: '压缩策略',
            desc:
              '目前仅支持 轻量级(lite), lite 模式下, 会跳过 app.acss ' +
              '和 包含 {{}} 的 axml 以及对应的 acss 文件',
            valuesDesc() {
              return validKeysMessage(CompressCssStrategies)
            }
          },

          // 压缩后的前缀, 默认为 ''
          prefix: {
            name: '压缩后的 class 前缀'
          },

          surfix: {
            name: '压缩后的 class 后缀'
          },

          include: {
            name: '文件过滤包含规则'
          },

          exclude: {
            name: '文件过滤排除规则'
          },

          // 一组不需要重命名的 class 名称, 可以将不需要重命名的 class 放在这里
          except: {
            name: '不需要重命名的 class 名称',
            desc: '可以将不需要重命名的 class 放在这里'
          },

          // 用于生成随机类名的字母库, 默认为:
          // _abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
          alphabet: {
            name: '用于生成随机类名的字母库'
          },

          customAttributeNames: {
            name: '自定义属性名称',
            desc:
              '用于指定一些自定义的 class 名称, 比如 innerClass 等, ' +
              '配置的自定义 class 属性会被当做 class 同样被处理'
          },

          // 类名过滤, 支持配置自定义函数, 返回 true 代表可以重命名, false 代表不可以重命名
          // (className: string, filePath: string) => boolean
          classNameFilter: {
            name: '自定义类名过滤方法',
            desc: '支持配置自定义函数, 返回 true 代表可以重命名, false 代表不可以重命名'
          },

          // 处理完成回调, 可获取 类名映射
          // (classNameMappings: Map<string, string>) => void
          success: {
            name: '处理完成回调',
            desc: '可用于获取类名映射的结果'
          }
        }
      }
    }
  }
}

const compressCssClassNameSchema = z
  .object({
    strategy: z
      .nativeEnum(CompressCssStrategies)
      .optional()
      .default(CompressCssStrategies.lite),
    prefix: z.string().optional().default(''),
    surfix: z.string().optional().default(''),
    include: z.array(z.instanceof(RegExp)).optional().default([]),
    exclude: z.array(z.instanceof(RegExp)).optional().default([]),
    except: z.array(z.string()).optional().default([]),
    alphabet: z
      .string()
      .optional()
      .default(
        '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      ),
    customAttributeNames: z.array(z.string()).optional().default([]),
    classNameFilter: z
      .function()
      .args(z.string(), z.string())
      .returns(z.boolean())
      .optional(),
    success: z
      .function()
      .args(z.map(z.string(), z.string()))
      .returns(z.void())
      .optional()
  })
  .optional()
  .or(z.boolean().optional())
  .default(false)

export type CompressCssClassNameSchema = z.infer<
  typeof compressCssClassNameSchema
>

// bundle 依赖分析 schema
const analyzerExcludeAssetsSchema = z
  .string()
  .or(z.instanceof(RegExp).optional())
  .or(z.function().args(z.string()).returns(z.boolean()))
const analyzerSchema = z
  .object({
    analyzerMode: z.nativeEnum(AnalyzerModes).default(AnalyzerModes.server),
    analyzerHost: z.string().default('127.0.0.1'),
    analyzerPort: z
      .string()
      .regex(/^[0-9]+$/)
      .transform((v) => parseInt(v))
      .or(z.number())
      .or(z.nativeEnum(objectEnum(['auto'])))
      .default(8888),
    reportFilename: z.string().default('report.html'),
    reportTitle: z
      .string()
      .optional()
      .or(z.function().returns(z.string()).optional()),
    defaultSizes: z
      .nativeEnum(AnalyzerDefaultSizes)
      .optional()
      .default(AnalyzerDefaultSizes.parsed),
    openAnalyzer: z.boolean().optional().default(true),
    generateStatsFile: z.boolean().optional().default(false),
    statsFilename: z.string().default('stats.json'),
    statsOptions: z.any().optional(),
    excludeAssets: z
      .array(analyzerExcludeAssetsSchema)
      .or(analyzerExcludeAssetsSchema)
      .optional(),
    logLevel: z
      .nativeEnum(AnalyzerLogLevel)
      .optional()
      .default(AnalyzerLogLevel.info)
  })
  .or(z.boolean())
  .optional()

// 自定义用户配置, 和 CompilerCliConfig 基本上是一一对应的, 个别仅用于命令行的除外
export const CompilerUserConfigSchema = z.object({
  sourceType: z.nativeEnum(SourceTypes).default(SourceTypes.wechat),
  target: z.nativeEnum(objectEnum(Targets)).default(Targets[0]),
  compileMode: z.nativeEnum(CompileModes).default(CompileModes.bundle),
  compileType: z.nativeEnum(CompileTypes).default(CompileTypes.miniprogram),
  devtool: z.nativeEnum(DevTools).optional().or(z.boolean().optional()),
  minimize: z.boolean().optional(),
  jsMinimizer: z.nativeEnum(JSMinimizerTypes).or(z.boolean()).default(true),
  jsMinimizerOptions: z.record(z.any()).optional(),
  cssMinimizer: z
    .nativeEnum(CSSMinimizerTypes)
    .or(z.boolean())
    .default(CSSMinimizerTypes.esbuild),
  cssMinimizerOptions: z.record(z.any()).optional(),
  xmlMinimizer: z.boolean().optional(),
  xmlMinimizerOptions: z.record(z.any()).optional(),
  mode: z.nativeEnum(Modes).default(Modes.development),
  srcPath: z.string().default('./src'),
  srcPaths: z.array(z.string()).optional(),
  outputPath: z.string().optional(),
  autoClean: z.boolean().optional().default(false),
  watch: z.boolean().optional().default(false),
  ignore: z.array(z.string()).default([]),
  cache: z.boolean().optional(),
  globalObject: z.string().optional(),
  /**
   * 用于配置全局文件的后缀，避免冲突，以及 globalChunkLoading 的后缀添加
   */
  globalNameSuffix: z.string().optional(),
  /**
   * 自定义 entries
   * 1. 用于自定义 app.json / subpackage.json / plugin.json 等入口文件
   * 2. 用于配置 额外需要生成的入口文件，如某个期望在 bundle 后依然能保持正确的路径的文件
   * 3. bundle 模式下，无引用关系，但需要额外需要编译的 页面（pages） 或 组件（components）
   */
  customEntries: z
    .object({
      'app.json': z.string().optional(),
      'subpackage.json': z.string().optional(),
      'plugin.json': z.string().optional(),
      'component.json': z.string().optional(),
      pages: z.array(z.string()).optional(),
      components: z.array(z.string()).optional()
    })
    .passthrough()
    .optional(),
  autoInjectRuntime: z
    .object({
      app: z.boolean().optional(),
      page: z.boolean().optional(),
      component: z.boolean().optional(),
      behavior: z.boolean().optional(),
      mixin: z.boolean().optional(),
      api: z.boolean().optional().or(z.nativeEnum(GlobalObjectTransformTypes))
    })
    .or(z.boolean())
    .default(true),
  phantomDependency: z
    .object({
      mode: z
        .nativeEnum(PhantomDependencyMode)
        .default(PhantomDependencyMode.warn),
      exclude: z.array(z.string()).optional()
    })
    .or(z.boolean())
    .default(false),
  compilerOptions: z
    .object({
      /**
       * 用于自动矫正 commonjs 和 esm 混用的情况
       * 仅当 module 不是 commonjs 且 importHelpers 开启时生效
       * 原因为: typescript 引入 importHelpers 的时候会根据 设定的 module 来决定
       * 是用 esm 还是 commonjs 语法
       * 可能会导致 esm 和 commonjs 混用而引起编译问题
       */
      autoCorrectModuleKind: z.boolean().optional(),
      declaration: z.boolean().optional().default(false),
      importHelpers: z.boolean().optional(),
      module: z.nativeEnum(CompileModuleKind).optional(),
      target: z.nativeEnum(CompileScriptTarget).optional(),
      esModuleInterop: z.boolean().optional(),
      allowSyntheticDefaultImports: z.boolean().optional()
    })
    .optional()
    .default({}),
  conditionalCompile: z
    .object({
      context: z.record(z.any()).optional().default({}),
      fileExt: z.string().or(z.array(z.string())).optional()
    })
    .optional()
    .default({}),
  mockAppEntry: z.string().optional(),
  experiments: z
    .object({
      autoTrimRuntimeHelpers: z.boolean().default(false).optional(),
      compressCssClassName: compressCssClassNameSchema
    })
    .optional(),
  analyzer: analyzerSchema,
  /**
   * 支持文件拷贝
   * 支持 ['file1', 'file2'] 或 [{ from: 'abc/2', to: 'cde/2' }]
   * 其中 from 是相对于 srcPath 或 srcPaths 的路径
   *     to 是相对于 outputPath 的路径
   */
  copy: z
    .array(z.string().or(z.object({ from: z.string(), to: z.string() })))
    .optional(),
  // 是否处理 node_modules 中的组件, 缺省状态下, 会基于不同的 target 自动选择是否处理
  processNodeModules: z
    .boolean()
    .or(
      z.object({
        include: z
          .instanceof(RegExp)
          .or(z.array(z.instanceof(RegExp)))
          .default([]),
        exclude: z
          .instanceof(RegExp)
          .or(z.array(z.instanceof(RegExp)))
          .default([])
      })
    )
    .optional(),
  /**
   * 配置代码中的变量
   * 目前仅 bundle 模式下生效
   */
  define: z.record(z.any()).default({}),
  /**
   * 配置别名
   */
  alias: z.record(z.any()).default({}),
  /**
   * 是否处理 componentPlaceholder 中的组件
   * compileType 为 miniprogram 或 plugin 时默认为 true
   * compileType 为 subpackage 或 component 时默认为 false
   */
  processPlaceholderComponents: z.boolean().optional(),

  /**
   * 是否处理组件入参函数
   */
  processComponentsPropsFunction: z.boolean().optional().default(false),

  /**
   * 配置可以共享的 node_modules 模块, 通常用于主子分包分仓库管理集成的场景
   */
  shared: z.array(z.string().or(z.record(z.string()))).default([]),

  /**
   * 配置需要消费的 node_modules 模块, 通常用于主子分包分仓库管理集成的场景
   */
  consumes: z.array(z.string().or(z.record(z.string()))).default([]),

  /**
   * 是否生成 mor.p.js 文件，用于更新集成时 app.json 内容
   */
  generateAppJSONScript: z.boolean().default(true)
})

export type CompilerUserConfig = z.infer<typeof CompilerUserConfigSchema> & {
  /**
   * webpack 的 externals 配置, 直接透传给 webpack
   * externalType 会根据 target 设置不同的默认值，也可以业务手动指定（web 场景下经常需要指定为 window）
   */
  externals?: webpack.Configuration['externals']
  externalsType?: webpack.Configuration['externalsType']
} & WebCompilerUserConfig & {
    /**
     * @internal 仅供插件内部使用, 请勿直接配置
     * 最终产物目录, 通常情况下和 outputPath 一致,
     * 仅在内部场景下使用, 用于标识最终产物目录,
     * 应用默认值时会自动被 outputPath 覆盖, 如无必要请勿修改
     */
    finalOutputPath?: string
  }
