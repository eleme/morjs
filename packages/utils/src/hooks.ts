import type {
  AcceptedPlugin as PostCssAcceptedPlugin,
  Helpers as PostcssHelpers,
  Plugin as PostCssPlugin,
  Root as PostcssRoot
} from 'postcss'
import { Node as PosthtmlNode } from 'posthtml'
import {
  isHookRegistered,
  registerHook,
  RunnerHookFactories,
  RunnerHooks,
  tapable as t
} from 'takin'
import type { CustomTransformers } from 'typescript'
import { default as ts } from 'typescript'
import type webpack from 'webpack'
import type { EntryFileType, EntryType } from './constants'
import { ModuleGroup } from './moduleGraph'
import type { EntryBuilderHelpers, EntryItem } from './types'
import type { WebpackWrapper } from './webpack'

type LoaderContext = webpack.LoaderContext<any>

/**
 * 自定义 visitor
 * @param node - ts 节点
 * @param context - ts 转换上下文
 * @returns 节点转换结果
 */
export type TSCustomVisitor = (
  node: ts.Node,
  context: ts.TransformationContext
) => ts.VisitResult<ts.Node>

/**
 * 生成 ts 的 transformer 插件
 * 提供 visitor 作为参数
 * 遍历所有 Node 节点
 * @param visitor - 自定义节点 visitor
 */
export function tsTransformerFactory(
  visitor?: TSCustomVisitor
): ts.TransformerFactory<ts.SourceFile> {
  if (!visitor) return

  return (ctx) => (sourceFile) => {
    /**
     * 遍历当前 node 以及所有的 child
     */
    function visitAllNode(node: ts.Node): ts.VisitResult<ts.Node> {
      if (node == null) return node

      const result = visitor(node, ctx)

      if (result == null) return result

      if (Array.isArray(result)) {
        return result.map(function (item) {
          if (item == null) return item
          return ts.visitEachChild(item, (child) => visitAllNode(child), ctx)
        })
      } else {
        return ts.visitEachChild(result, (child) => visitAllNode(child), ctx)
      }
    }

    return ts.visitNode(sourceFile, (root) => visitAllNode(root))
  }
}

/**
 * 自定义 css 处理器
 */
export type cssCustomProcessor = (
  /**
   * postcss Root 对象
   */
  root: PostcssRoot,
  /**
   * postcss Helpers 对象
   */
  helpers: PostcssHelpers
) => void

/**
 *
 * @param name - css 处理器作为 postcss 插件的名称
 * @param processor - 自定义 css 处理器
 * @returns postcss 插件
 */
export function cssProcessorFactory(
  name: string,
  processor: cssCustomProcessor
): PostCssPlugin {
  return {
    postcssPlugin: name,
    async Once(root, helpers) {
      return await processor(root, helpers)
    }
  }
}

/**
 * 文件解析插件选项
 * 文件解析的插件运行环境均为 loader
 */
export interface FileParserOptions {
  /**
   * 当前用户配置
   */
  userConfig: Record<string, any>
  /**
   * 运行当前插件的 loader 上下文
   */
  loaderContext?: LoaderContext
  /**
   * 文件信息
   */
  fileInfo: {
    /**
     * 文件完整路径
     */
    path: string
    /**
     * 文件内容
     */
    content: string
    /**
     * 文件后缀
     */
    extname: string

    /* 仅 entry 会有以下信息 */

    /**
     * entry 输出路径, 文件相对于输出目录的路径, 包含后缀名
     */
    entryName?: string
    /**
     * entry 类型, 参见 EntryType
     */
    entryType?: EntryType
    /**
     * entry 文件类型, 参见 EntryFileType
     */
    entryFileType?: EntryFileType
  }
}

export type ComposeModuleScriptCommand =
  | string
  | {
      /**
       * 命令
       */
      command?: string
      /**
       * 命令执行时的环境变量
       */
      env?: Record<string, string>
      /**
       * 命令执行选项
       */
      options?: Record<string, any>
    }

/**
 * Compose 模块状态
 */
export enum ComposeModuleStates {
  /**
   * 模块初始化
   */
  initial,
  /**
   * 模块下载完成
   */
  downloaded,
  /**
   * 模块前置脚本已执行
   */
  beforeScriptsExecuted,
  /**
   * 模块配置已载入
   */
  configLoaded,
  /**
   * 模块拷贝或编译完成
   */
  copiedOrCompiled,
  /**
   * 模块后置脚本已执行
   */
  afterScriptsExecuted,
  /**
   * 模块已集成
   */
  composed
}

/**
 * 模块信息
 */
export type ComposeModuleInfo = {
  /**
   * 模块名称
   */
  name: string
  /**
   * 模块类型
   *   host: 宿主
   *   plugin: 小程序插件
   *   subpackage: 小程序分包
   *   main: 小程序主包
   */
  type: 'host' | 'plugin' | 'subpackage' | 'main'
  /**
   * 集成模式
   * - compose: 通过 compose 方式集成在宿主小程序中, 通过拷贝的方式复制到产物目录
   * - compile: 通过 compile 方式集成在宿主小程序中, 需要通过 mor 编译流程
   */
  mode: 'compose' | 'compile'
  /**
   * 下载的模块根目录地址, 位于临时目录内
   */
  root: string
  /**
   * 下载的模块根目录地址, 位于临时目录内
   * 实际地址为 root + hash
   */
  source: string
  /**
   * 配置 hash, 基于配置生成
   */
  hash: string
  /**
   * 目标输出信息
   */
  output: {
    /**
     * 产物原始目录, 默认为 dist
     */
    from: string
    /**
     * 拷贝文件规则 默认为 `**\/*`
     */
    include?: string[]
    /**
     * 拷贝文件排除规则, 默认为空
     */
    exclude?: string[]
    /**
     * 产物目标目录
     *   - host 产物目录即为 outputPath, 如果编译类型为 插件 则为 outputPath/miniprogram
     *   - plugin 产物目录为 outputPath/plugin
     *   - subpackage 产物目录为 outputPath/{subpackage.root}
     */
    to?: string
  }
  /**
   * 模块状态
   */
  state: ComposeModuleStates

  /**
   * 下载配置
   */
  download: {
    type: string
    options: Record<string, any>
  }

  /**
   * 模块配置信息, 不同类型的模块会读取不同的文件
   * 文件读取位置:
   * - host: app.json
   * - main: subpackage.json
   * - subpackage: subpackage.json
   * - plugin: plugin.json
   */
  config?: Record<string, any>

  /**
   * 自定义脚本
   */
  scripts?: {
    /**
     * 前置脚本, 执行时机为模块下载之后
     */
    before?: ComposeModuleScriptCommand[]
    /**
     * 环境变量, 用于执行 before 或 after 脚本时添加到 process.env
     */
    env?: Record<string, string>
    /**
     * 后置脚本: 执行时机为模块复制或编译完成之后
     */
    after?: ComposeModuleScriptCommand[]
    /**
     * 集成后脚本: 执行时机为模块已完成集成之后
     * 该脚本执行结果和状态不会被缓存, 即每次集成完成均会执行
     */
    composed?: ComposeModuleScriptCommand[]
    /**
     * 命令执行选项
     */
    options?: Record<string, any>
  }
}

/**
 * 扩展 takin.RunnerHooks 中的 hook
 */
declare module 'takin' {
  interface RunnerHooks {
    /**
     * Compose Hook: 模块下载完成之后执行
     */
    moduleDownloaded: t.AsyncSeriesHook<ComposeModuleInfo>

    /**
     * Compose Hook: 模块前置脚本完成之后执行
     */
    moduleBeforeScriptsExecuted: t.AsyncSeriesHook<ComposeModuleInfo>

    /**
     * Compose Hook: 模块复制或编译完成之后执行
     */
    moduleCopiedOrCompiled: t.AsyncSeriesHook<ComposeModuleInfo>

    /**
     * Compose Hook: 模块配置载入完成后执行, 并存储在 module.config 中
     * - host: 载入 app.json
     * - main: 载入 subpackage.json
     * - subpackage: 载入 subpackage.json
     * - plugin: 载入 plugin.json
     */
    moduleConfigLoaded: t.AsyncSeriesHook<ComposeModuleInfo>

    /**
     * Compose Hook: 模块前置脚本完成之后执行
     */
    moduleAfterScriptsExecuted: t.AsyncSeriesHook<ComposeModuleInfo>

    /**
     * Compose Hook: 模块完成集成之后执行
     */
    moduleComposed: t.AsyncSeriesHook<ComposeModuleInfo>

    /**
     * Compose Hook: 模块集成失败后尝试修复
     */
    moduleFailedAttempt: t.AsyncSeriesHook<
      [
        ComposeModuleInfo,
        Error & { attemptNumber: number; retriesLeft: number }
      ]
    >

    /**
     * Compile Hook: 用于获取 webpackWrapper
     */
    webpackWrapper: t.SyncHook<WebpackWrapper>

    /**
     * Compile Hook: 用于获取 webpack compiler
     */
    compiler: t.SyncHook<[webpack.Compiler]>

    /**
     * Compile Hook: 用于获取 entryBuilder
     */
    entryBuilder: t.AsyncParallelHook<EntryBuilderHelpers>

    /**
     * Compile Hook: 用于判断是否要处理页面或组件
     */
    shouldAddPageOrComponent: t.SyncBailHook<
      [
        string,
        {
          entryType?: EntryType
          entryFileType?: EntryFileType
          parentEntry?: EntryItem
          groupName?: string
        }
      ],
      boolean
    >

    /**
     * Compile Hook: 添加 entry 时触发, 可用于修改 entry 相关信息
     */
    addEntry: t.SyncWaterfallHook<[{ name: string; entry: EntryItem }]>

    /**
     * Compile Hook: 解析所有 entries 文件之后, 生成 entries 之前执行
     */
    beforeBuildEntries: t.AsyncParallelHook<EntryBuilderHelpers>

    /**
     * Compile Hook: 用于获取并修改构建出来的 entries
     */
    afterBuildEntries: t.AsyncSeriesWaterfallHook<
      [webpack.EntryObject, EntryBuilderHelpers]
    >

    /**
     * Compile Hook: config(json) 文件解析 hook
     */
    configParser: t.AsyncSeriesWaterfallHook<
      [Record<string, any>, FileParserOptions]
    >

    /**
     * Compile Hook: script(js/ts) 文件解析 hook
     */
    scriptParser: t.SyncWaterfallHook<[CustomTransformers, FileParserOptions]>

    /**
     * Compile Hook: template(*xml) 文件解析 hook
     */
    templateParser: t.AsyncSeriesWaterfallHook<
      [PosthtmlNode, FileParserOptions]
    >

    /**
     * Compile Hook: style(*css) 文件解析 hook
     */
    styleParser: t.AsyncSeriesWaterfallHook<
      [PostCssAcceptedPlugin[], FileParserOptions]
    >

    /**
     * Compile Hook: sjs(wxs/sjs) 文件解析 hook
     */
    sjsParser: t.SyncWaterfallHook<[CustomTransformers, FileParserOptions]>

    /**
     * Compile Hook: 文件预处理器 hook
     */
    preprocessorParser: t.AsyncSeriesWaterfallHook<
      [string, Record<string, any>, FileParserOptions]
    >

    /**
     * Compile Hook: 文件后置处理器 hook
     */
    postprocessorParser: t.AsyncSeriesWaterfallHook<[string, FileParserOptions]>

    /**
     * Compile Hook: 生成初始化文件 hook，可以在这个阶段修改初始化文件的内容
     */
    generateInitFiles: t.SyncWaterfallHook<[string, ModuleGroup]>
  }
}

/**
 * 自定义 hook
 */
const CUSTOM_HOOKS: RunnerHookFactories = {
  moduleDownloaded() {
    return new t.AsyncSeriesHook(['composeModuleInfo'])
  },
  moduleBeforeScriptsExecuted() {
    return new t.AsyncSeriesHook(['composeModuleInfo'])
  },
  moduleCopiedOrCompiled() {
    return new t.AsyncSeriesHook(['composeModuleInfo'])
  },
  moduleAfterScriptsExecuted() {
    return new t.AsyncSeriesHook(['composeModuleInfo'])
  },
  moduleConfigLoaded() {
    return new t.AsyncSeriesHook(['composeModuleInfo'])
  },
  moduleComposed() {
    return new t.AsyncSeriesHook(['composeModuleInfo'])
  },
  moduleFailedAttempt() {
    return new t.AsyncSeriesHook(['composeModuleInfo', 'error'])
  },
  webpackWrapper() {
    return new t.SyncHook(['webpackWrapper'])
  },
  compiler() {
    return new t.SyncHook(['compiler'])
  },
  entryBuilder() {
    return new t.AsyncSeriesHook(['entryBuilder'])
  },
  shouldAddPageOrComponent() {
    return new t.SyncBailHook(['pageOrComponentName', 'contextInfo'])
  },
  addEntry() {
    return new t.SyncWaterfallHook(['entryInfo'])
  },
  beforeBuildEntries() {
    return new t.AsyncSeriesHook(['entryBuilder'])
  },
  afterBuildEntries() {
    return new t.AsyncSeriesWaterfallHook(['entries', 'entryBuilder'])
  },
  configParser() {
    return new t.AsyncSeriesWaterfallHook(['config', 'options'])
  },
  scriptParser() {
    return new t.SyncWaterfallHook(['customTransformers', 'options'])
  },
  templateParser() {
    return new t.AsyncSeriesWaterfallHook(['tree', 'options'])
  },
  styleParser() {
    return new t.AsyncSeriesWaterfallHook(['postcssPlugins', 'options'])
  },
  sjsParser() {
    return new t.SyncWaterfallHook(['customTransformers', 'options'])
  },
  preprocessorParser() {
    return new t.AsyncSeriesWaterfallHook([
      'fileContent',
      'conditionalCompileContext',
      'options'
    ])
  },
  postprocessorParser() {
    return new t.AsyncSeriesWaterfallHook(['fileContent', 'options'])
  },
  generateInitFiles() {
    return new t.SyncWaterfallHook(['fileContent', 'moduleGroup'])
  }
}

// 注册自定义 hook
// 避免同名 hook 多次注册
for (const name in CUSTOM_HOOKS) {
  const hookName = name as unknown as keyof RunnerHooks
  // 避免同名 hook 工厂函数多次注册引起报错
  if (!isHookRegistered(hookName)) {
    registerHook(hookName, CUSTOM_HOOKS[hookName])
  }
}
