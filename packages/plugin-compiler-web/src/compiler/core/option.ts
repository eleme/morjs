import crypto from 'crypto'
import path from 'path'
import { loadableComponents } from './axml2/generate/index'

// // 未来扩展功能
// export interface FutureOptions{
//   enableAttrbuteSpread?: boolean; // 启用属性扩展功能
//   enableModel?:boolean;//是否启用数据双向绑定编译
// }

function md5(seed: string) {
  return crypto.createHash('md5').update(seed).digest('hex')
}

export interface AppConfig {
  usingComponents: object
  styleScope?: boolean // 是否启用样式隔离
}

export interface ComponentConfig {
  component?: boolean
  usingComponents?: object
  styleScope?: boolean // 是否启用样式隔离
}

export interface CompilerPlugin {
  [props: string]: any[]
}

export interface BuildOptions {
  config: ComponentConfig
  appConfig: AppConfig
  hasAppConfig?: boolean // 是否配置了app.json 文件
  appConfigPath?: string // app.json 的路径
  isAtomicMode?: boolean // 是否输出组件
  name: string //文件名称，不包含后缀
  resourcePath: string //資源文件路徑,
  rootPath: string //工程根目录
  /**
   * 全局组件名称的配置关系
   */
  globalComponentsConfig?: object
  /**
   * react 扩展组件
   */
  externalComponents?: object
  /**
   * rpx 方案的 root value。默认是32。也就是 16*2
   */
  rpxRootValue?: number
  platform: string // 平台 小写。默认 h5
  usePx?: { ratio?: number } // 样式文件使用px
  unitTest?: boolean //是否单元测试的编译
  componentCompiler?: boolean // 组件编译针对mor组件
  compilerPlugins?: CompilerPlugin
  syntax?: object // postcss syntax
  styleScope?: boolean // 配置开启样式隔离

  /* 以下为 mor 扩展字段, 用于简化编译流程 */
  styleFilePath?: string
  templateFilePath?: string
  scriptFilePath?: string
  configFilePath?: string
  /**
   * 全局样式文件路径
   */
  appStyleFilePath?: string
  /**
   * 条件编译后缀
   */
  conditionalCompileFileExt?: string[]
}

/**
 * 获取标签的全局名称
 * @param tagName
 * @param options
 */
export function globalComponentName(tagName: string, options: BuildOptions) {
  if (
    options.globalComponentsConfig &&
    tagName in options.globalComponentsConfig
  ) {
    collectLoadableComponents(tagName)
    return options.globalComponentsConfig[tagName]
  }
  return undefined
}

/**
 * 收集按需加载的组件
 * @param tagName
 */

function collectLoadableComponents(tagName) {
  // page无需按需加载
  if (tagName === 'page') return
  if (loadableComponents && !loadableComponents.includes(tagName)) {
    loadableComponents.push(tagName)
  }
}

/**
 * 是否全局标签
 * @param tagName
 * @param options
 */
export function isGlobalComponent(tagName: string, options: BuildOptions) {
  return !!globalComponentName(tagName, options)
}

// 生成隨機字符串
export function randomHash(options: BuildOptions) {
  // 根据文件路径添加hash码。基本上只要路径不变，那么每次生成的hash 码都一样
  let _randomHash = md5(
    options.resourcePath
      .replace(path.extname(options.resourcePath), '')
      .replace(options.rootPath, '')
  ) // 生成随机的18位字符串
  // 防止出现数字开头
  if (
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(
      _randomHash[0]
    ) >= 0
  ) {
    _randomHash = `_${_randomHash}`
  }
  return _randomHash
}
