/**
 * 载入所有编译插件
 * 供后续使用
 */
import * as alipayCompiler from '@morjs/plugin-compiler-alipay'
import * as baiduCompiler from '@morjs/plugin-compiler-baidu'
import * as bytedanceCompiler from '@morjs/plugin-compiler-bytedance'
import * as dingdingCompiler from '@morjs/plugin-compiler-dingding'
import * as kuaishouCompiler from '@morjs/plugin-compiler-kuaishou'
import * as qqCompiler from '@morjs/plugin-compiler-qq'
import * as taobaoCompiler from '@morjs/plugin-compiler-taobao'
import * as webCompiler from '@morjs/plugin-compiler-web'
import * as wechatCompiler from '@morjs/plugin-compiler-wechat'
import {
  CompileModuleKindType,
  CompileScriptTargetType,
  FileParserOptions,
  Plugin,
  posthtml,
  Runner
} from '@morjs/utils'

/**
 * 默认支持的 插件列表
 */
const DEFAULT_ALL_PLUGINS = [
  alipayCompiler,
  wechatCompiler,
  baiduCompiler,
  bytedanceCompiler,
  qqCompiler,
  taobaoCompiler,
  dingdingCompiler,
  kuaishouCompiler,
  webCompiler
] as const

/**
 * 模版指令(属性)映射
 */
export type CompilerTemplateDirectives = {
  if: string
  elseIf: string
  else: string
  for: string
  forItem: string
  forIndex: string
  key: string
}

/**
 * 模版节点和属性自定义处理
 */
export type CompilerTemplateProcessor = {
  /**
   * 进入 node 时调用
   */
  onNode?: (
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ) => void

  /**
   * 离开 node 时调用
   */
  onNodeExit?: (
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ) => void

  /**
   * 进入 nodeAttr 时调用
   */
  onNodeAttr?: (
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ) => void

  /**
   * 离开 nodeAttr 时调用
   */
  onNodeAttrExit?: (
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ) => void
}

interface PluginForCompiler extends Plugin {
  enforce?: 'pre' | 'post'
  name: string
  new (): Plugin
  apply: (runner: Runner) => void
}

/**
 * 运行时代码地址
 * 文件引用后通过约定的调用执行运行时
 */
export interface CompilerRuntimeConfig {
  /**
   * 接口运行时支持
   * 通过 initApis(mor) 初始化
   */
  api?: string
  /**
   * App 运行时支持
   * 通过 initApp 初始化
   */
  app?: string
  /**
   * Page 运行时支持
   * 通过 initPage 初始化
   */
  page?: string
  /**
   * Component 运行时支持
   * 通过 initComponent 进行初始化
   */
  component?: string
  /**
   * Behavior 运行时支持
   * 通过 initBehavior 进行初始化
   */
  behavior?: string
  /**
   * Mixin 运行时支持
   * 通过 initMixin 进行初始化
   */
  mixin?: string
}

/**
 * 编译插件
 */
export interface CompilerPlugin {
  /**
   * 编译目标
   */
  target: string
  /**
   * 编译目标描述
   */
  targetDescription: string
  /**
   * 支持的文件类型
   */
  fileType: {
    /**
     * 模版文件类型
     */
    template: string
    /**
     * 样式文件类型
     */
    style: string
    /**
     * 脚本文件类型
     */
    script: string
    /**
     * 配置文件类型
     */
    config: string
    /**
     * sjs/qs/wxs 等文件类型
     */
    sjs: string
  }
  /**
   * 编译模块类型, 用于配置 ts 编译后的 模块规范, 如 CommonJS 或 ESNext
   */
  compileModuleKind: CompileModuleKindType
  /**
   * TS / JS 文件编译输出目标
   */
  compileScriptTarget: CompileScriptTargetType
  /**
   * Sjs 文件编译输出目标, 如未设置则以 compileScriptTarget 为准
   */
  compileSjsTarget?: CompileScriptTargetType
  /**
   * 全局对象, 如 wx/my 等
   */
  globalObject: string
  /**
   * npm main 解析字段
   */
  resolveMainFields: string[]
  /**
   * 默认 npm 小程序多端产物目录
   */
  defaultNpmMiniProgramDist?: string
  /**
   * 默认文件纬度条件编译后缀
   */
  defaultConditionalFileExt: string
  /**
   * 默认输出文件夹
   */
  defaultOutputDir: string
  /**
   * 项目配置文件
   */
  projectConfigFiles: string[]
  /**
   * 是否支持全局组件
   */
  supportGlobalComponents: boolean
  /**
   * 模版 自闭合标签列表
   */
  templateSingleTagNames: string[]
  /**
   * 模版 自闭合标签闭合方式: tag / slash / default
   */
  templateSingleTagClosingType?: '' | 'slash' | 'tag'
  /**
   * sjs 类型文件的 标签名称
   */
  sjsTagName: string
  /**
   * sjs 标签 src 属性名称
   */
  sjsSrcAttrName: string
  /**
   * sjs 标签 导出 module 属性名称
   */
  sjsModuleAttrName: string
  /**
   * sjs 标签是否支持 内嵌脚本内容
   */
  isSupportSjsContent: boolean
  /**
   * 模版指令(属性)映射
   */
  templateDirectives: CompilerTemplateDirectives
  /**
   * 模版节点和属性自定义处理
   */
  templateProcessor: CompilerTemplateProcessor
  /**
   * 自定义模版的渲染生成函数(即自定义 posthtml render)
   */
  customTemplateRender?: (tree?, options?) => string

  /**
   * 获取运行时相关的文件地址
   */
  getRuntimeFiles?: (
    sourceType: string,
    target: string
  ) => CompilerRuntimeConfig
  /**
   * 自定义插件
   */
  Plugin?: PluginForCompiler
  /**
   * 标记 某个 target 和当前前插件类似
   * 主要用于编译插件的能力共享和继承
   */
  addSimilarTarget?: (target: string) => void
}

export const Targets = [
  alipayCompiler.target,
  wechatCompiler.target,
  baiduCompiler.target,
  bytedanceCompiler.target,
  qqCompiler.target,
  taobaoCompiler.target,
  dingdingCompiler.target,
  webCompiler.target
] as const

// 插件中支持的所有文件类型
export const PluginTemplateFileTypes = Array.from(
  new Set(DEFAULT_ALL_PLUGINS.map((p) => p.fileType.template))
)
export const PluginStyleFileTypes = Array.from(
  new Set(DEFAULT_ALL_PLUGINS.map((p) => p.fileType.style))
)
export const PluginConfigFileTypes = Array.from(
  new Set(DEFAULT_ALL_PLUGINS.map((p) => p.fileType.config))
)
export const PluginScriptFileTypes = Array.from(
  new Set(DEFAULT_ALL_PLUGINS.map((p) => p.fileType.script))
)
export const PluginSjsFileTypes = Array.from(
  new Set(DEFAULT_ALL_PLUGINS.map((p) => p.fileType.sjs))
)

type ComposedCompilerPluginResult = {
  [P in keyof CompilerPlugin]: {
    [target: string]: CompilerPlugin[P]
  }
}

const PLUGIN_PROPS = [
  'target',
  'targetDescription',
  'fileType',
  'compileModuleKind',
  'compileScriptTarget',
  'compileSjsTarget',
  'globalObject',
  'resolveMainFields',
  'defaultNpmMiniProgramDist',
  'defaultConditionalFileExt',
  'defaultOutputDir',
  'projectConfigFiles',
  'supportGlobalComponents',
  'templateSingleTagNames',
  'templateSingleTagClosingType',
  'sjsTagName',
  'sjsSrcAttrName',
  'sjsModuleAttrName',
  'isSupportSjsContent',
  'templateDirectives',
  'templateProcessor',
  'customTemplateRender',
  'getRuntimeFiles',
  'Plugin'
]

// 插件集合
let ComposedPlugins: ComposedCompilerPluginResult
// 支持的 插件列表
let AllPlugins: CompilerPlugin[]
// 支持的 targets
let AllTargets: string[]

/**
 * 获取 ComposedPlugins
 */
export function getComposedCompilerPlugins(): ComposedCompilerPluginResult {
  return ComposedPlugins
}

/**
 * 加载所有的插件, 并按照 ComposedCompilerPluginResult 的方式组装
 * 允许外部更新 ComposedPlugins
 */
export function setCompilerPlugins(
  plugins: CompilerPlugin[] | readonly CompilerPlugin[]
) {
  const result = {} as ComposedCompilerPluginResult
  const targets: string[] = []

  for (const plugin of plugins) {
    targets.push(plugin.target)

    for (const prop of PLUGIN_PROPS) {
      result[prop] = result[prop] || {}
      result[prop][plugin['target']] = plugin[prop]
    }
  }

  // 保存插件清单
  AllPlugins = [].concat(plugins)

  // 保存 targets
  AllTargets = targets

  // 更新
  ComposedPlugins = result
}

/**
 * 返回所有支持的 编译目标
 */
export function getAllCompilerTargets(): string[] {
  return AllTargets
}

/**
 * 获取所有支持的插件清单
 */
export function getAllCompilerPlugins(): CompilerPlugin[] {
  return AllPlugins
}

/**
 * 根据 target 获取匹配的编译插件
 * @param target - 目标平台
 * @returns 匹配的编译插件
 */
export function getCompilerPluginByTarget(
  target: string
): CompilerPlugin | undefined {
  for (const plugin of AllPlugins) {
    if (plugin.target === target) return plugin
  }
}

// 初始化
if (!ComposedPlugins) setCompilerPlugins(DEFAULT_ALL_PLUGINS)
