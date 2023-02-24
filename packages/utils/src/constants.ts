import { objectEnum, ObjectValues, takin } from 'takin'

export const CLI_NAME = 'mor'

/**
 * 初始化 mor 实例
 */
export const mor = takin(CLI_NAME)

/**
 * 命令执行超时时间: 30 分钟
 */
export const COMMAND_TIMEOUT = 1800000 // 30 * 60 * 1000

/**
 * 额外重试次数
 */
export const RETRY_TIMES = 1

/**
 * 源码类型, 目前仅支持 微信或支付宝
 */
export const SourceTypes = objectEnum(['wechat', 'alipay'])

/**
 * TS 编译类型, 属于 ModuleKind 的子集
 * 由于小程序的特殊性, 删除了不兼容的部分
 */
export const CompileModuleKind = objectEnum([
  'CommonJS',
  'ES2015',
  'ES2020',
  'ESNext'
])
export type CompileModuleKindType = ObjectValues<typeof CompileModuleKind>

/**
 * TS 编译输出目标, 属于 ScriptTarget 的子集
 * 由于小程序的特殊性, 删除了不兼容的部分
 */
export const CompileScriptTarget = objectEnum([
  'ES5',
  'ES2015',
  'ES2016',
  'ES2017',
  'ES2018',
  'ES2019',
  'ES2020',
  'ES2021',
  'ESNext',
  'Latest'
])
export type CompileScriptTargetType = ObjectValues<typeof CompileScriptTarget>

/**
 * 编译类型
 * - miniprogram: 以小程序的方式编译或集成
 * - plugin: 以插件的方式编译或集成
 * - subpackage: 以插件的方式编译或集成
 */
export const CompileTypes = objectEnum(['miniprogram', 'plugin', 'subpackage'])

/**
 * Entry 文件类型
 */
export enum EntryFileType {
  /**
   * 脚本文件类型 js/ts 等
   */
  script = 'script',
  /**
   * 模版文件类型 *xml
   */
  template = 'template',
  /**
   * 样式文件类型
   */
  style = 'style',
  /**
   * 配置文件类型 json
   */
  config = 'config',
  /**
   * wxs 或 sjs
   */
  sjs = 'sjs'
}

/**
 * Entry 分类
 */
export enum EntryType {
  /**
   * 小程序全局文件类型 代表 app.x
   */
  app = 'app',
  /**
   * 插件全局文件类型 代表 plugin.main 和 plugin.json
   */
  plugin = 'plugin',
  /**
   * 分包全局文件类型  代表 subpackage.json
   */
  subpackage = 'subpackage',
  /**
   * 页面类型
   */
  page = 'page',
  /**
   * 组件类型
   */
  component = 'component',
  /**
   * npm 组件类型
   */
  npmComponent = 'npmComponent',
  /**
   * 插件 组件类型
   */
  pluginComponent = 'pluginComponent',
  /**
   * 项目 配置文件, 如 project.config.json
   */
  project = 'project',
  /**
   * sitemap 配置文件
   */
  sitemap = 'sitemap',
  /**
   * theme 配置文件
   */
  theme = 'theme',
  /**
   * preload 配置文件
   */
  preload = 'preload',
  /**
   * ext 配置文件(第三方代开发的配置文件: ext.json)
   */
  ext = 'ext',
  /**
   * 自定义类型，通过 customEntries 配置传入
   */
  custom = 'custom',
  /**
   * 未知类型, 非以上类型的 entry, 均视为 unknown
   */
  unknown = 'unknown'
}

/**
 * Entry 文件优先级:
 *  - 条件编译文件 20, 基础值为 20, 配置多个条件编译后缀时, 位置越靠前的后缀优先级越高, 步进为 5
 *  - native 文件 15
 *  - 微信 DSL 文件 10, 如 wxss 或 wxml 或 wxs 文件
 *  - 支付宝 DSL 文件 5, 如 acss 或 axml 或 sjs 文件
 *  - 普通文件 0, 如 js 或 ts 或 json 文件
 */
export enum EntryPriority {
  Conditional = 20,
  Native = 15,
  Wechat = 10,
  Alipay = 5,
  Normal = 0
}

/**
 * 全局文件 name.g
 */
export const MOR_GLOBAL_FILE = function () {
  return mor.name + '.' + 'g'
}

/**
 * 运行时文件 name.r
 */
export const MOR_RUNTIME_FILE = function () {
  return mor.name + '.' + 'r'
}

/**
 * 初始化文件 name.i
 */
export const MOR_INIT_FILE = function () {
  return mor.name + '.' + 'i'
}

/**
 * vendors 文件 name.v, 用于存放 node_modules 代码
 */
export const MOR_VENDOR_FILE = function () {
  return mor.name + '.' + 'v'
}

/**
 * 通用脚本文件 name.c 用于存放 公共 js 代码
 */
export const MOR_COMMON_FILE = function () {
  return mor.name + '.' + 'c'
}

/**
 * 模拟入口文件 name.a 用于存放 插件或分包的模拟 app 入口代码
 */
export const MOR_APP_FILE = function () {
  return mor.name + '.' + 'a'
}

/**
 * 辅助文件 name.h 用于存放一些辅助方法, 如 mor.h.sjs
 */
export const MOR_HELPER_FILE = function () {
  return mor.name + '.' + 'h'
}

/**
 * 共享文件 name.s 用于存放一些共享 node_modules 引用, 如 mor.s.js
 */
export const MOR_SHARED_FILE = function () {
  return mor.name + '.' + 's'
}

/**
 * app.json 的 js 文件, 主要用于集成研发场景下对 app.json 的引用做替换
 */
export const MOR_COMPOSED_APP_FILE = function () {
  return mor.name + '.' + 'p'
}
