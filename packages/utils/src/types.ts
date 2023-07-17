import type webpack from 'webpack'
import type { EntryFileType, EntryPriority, EntryType } from './constants'
import type { ModuleGraph } from './moduleGraph'

/**
 * entry 来源
 *   direct: 代表是 entryBuiler 主动添加
 *   dep: 代表是通过依赖分析添加
 */
export type EntryReferType = 'direct' | 'dep'

type EntryFullPath = string

/**
 * 分包配置
 */
interface ISubPackageConfig {
  root: string
  pages: string[]
  // 独立分包
  independent?: boolean
}

/**
 * Entry 条目信息
 */
export interface EntryItem {
  /*
   * 完整的 entry 名称含后缀
   */
  fullEntryName: string
  /**
   * entry 名称 无后缀
   * 这里 和给 webpack 使用的 entry 还有些区别, webpack 只有 js 文件无后缀
   */
  entryName: string
  /**
   * fullEntryName 对应的文件夹地址
   */
  entryDir: string
  /**
   * entry 引用来源
   */
  entryReferType: EntryReferType
  /**
   * entry 类型
   */
  entryType: EntryType
  /**
   * entry 文件类型
   */
  entryFileType: EntryFileType
  /**
   * 相对于 srcPath 的路径, 可能包含条件后缀
   * 仅做记录
   */
  relativePath: string
  /**
   * 完整路径
   */
  fullPath: string
  /**
   * 后缀名称
   */
  extname: string
  /**
   * 筛选优先级
   */
  priority: EntryPriority
}

export type EntrySources = Map<EntryFullPath, {
  source: webpack.sources.RawSource,
  saveToMemFile?: string
}>

/**
 * EntryBuilder 辅助函数
 */
export interface EntryBuilderHelpers {
  /**
   * 所有的 entry 信息
   * 这里的 EntryName 除 js 文件之外均包含后缀名
   * EntryItem 中的 entryName 是不包含后缀名的 entry 相对路径
   */
  entries: Map<string, EntryItem>

  /**
   * 全局 app 名称
   */
  globalAppName?: string

  /**
   * 全局脚本文件
   */
  globalScriptFilePath?: string

  /**
   * 全局样式文件
   */
  globalStyleFilePath?: string

  /**
   * 全局配置文件
   */
  globalConfigFilePath?: string

  /**
   * 用于记录 transfer 和 default 编译模式中 script 的文件内容
   */
  replaceEntrySources: EntrySources

  /**
   * 用于生成 json 文件
   */
  additionalEntrySources: EntrySources

  /**
   * 用到的 npm 包
   * key 为 包名
   * value 为 包地址
   */
  usedNpmPackages: Map<string, string>

  /**
   * 独立分包配置
   */
  independentSubpackages: Map<string, ISubPackageConfig>

  /**
   * app 入口 json 文件
   */
  appJson?: Record<string, any>

  /**
   * subpackage 入口 json 文件
   */
  subpackageJson?: Record<string, any>

  /**
   * plugin 入口 json 文件
   */
  pluginJson?: Record<string, any>

  /**
   * 模块依赖图, 用于 bundle 分析 和 分组
   */
  moduleGraph: ModuleGraph

  /**
   * 后缀名映射
   */
  extMap: Record<string, string>

  /**
   * 基于路径获取 entry
   * @param filePath - 文件完整路径
   */
  getEntryByFilePath(filePath: string): EntryItem | undefined

  /**
   * 获取 源 entry 和 目标 entry 的相对路径
   * @param sourceEntry - 源 entry
   * @param targetEntry - 目标 entry
   * @param withExt - 是否携带后缀名
   */
  getRelativePathFor(
    sourceEntry: EntryItem,
    targetEntry: EntryItem,
    withExt?: boolean
  ): string

  /**
   * 获取引用路径对应的真实路径
   * @param sourcePath - 源文件路径
   * @param referencePath - 引用文件路径
   * @param withExt - 是否携带后缀名
   */
  getRealReferencePath(
    sourcePath: string,
    referencePath: string,
    withExt?: boolean
  ): string | undefined

  /**
   * 获取引用文件的完整路径
   * @param sourcePath - 源文件
   * @param referencePath - 引用路径
   */
  getFullPathOfReferenceFile(
    sourcePath: string,
    referencePath: string
  ): string | undefined

  /**
   * 设置 entry 源码用于替换或额外输出
   * @param entryName - entry 名称
   * @param content - entry 内容
   * @param aim - 目标, 可选值为 replace 或 additional
   * @param saveToMemFile - 需要输出为内存文件路径，aim 为 additional 时，如未提供 saveToMemFile, 则会基于 entryName 自动生成
   */
  setEntrySource(
    entryName: string,
    content: string,
    aim: 'replace' | 'additional',
    saveToMemFile?: string
  ): void

  /**
   * 获取 完整的 entry 名称
   * @param filePath - 文件完整路径
   * @returns
   */
  getFullEntryName(filePath: string): string | undefined

  /**
   * 通过文件地址获取使用的自定义组件名称数组
   * @param filePath - 文件地址
   * @returns 当前路径对应的 entry 可能使用到的自定义组件名称(包含全局组件)
   */
  getUsingComponentNames(filePath: string): string[]

  /**
   * 获取全局组件相对于当前引用文件的相对路径
   * @param sourceEntry - 引用全局组件的 entry
   * @param globalComponentName - 全局组件的名称
   * @returns 全局组件之于当前文件的相对路径
   */
  getGlobalComponentRelativePath(
    sourceEntry: EntryItem,
    globalComponentName: string
  ): string | undefined

  /**
   * 判断是否是 entry 文件
   * @param filePath - 文件地址
   */
  isEntryFile(filePath: string): boolean

  /**
   * 基于引用的名称添加相关的 entries
   * @param referencePath - 不包含后缀的引用路径, 如 ./components/index
   * @param entryType - 代表当前页面组件被谁引用
   * @param parentEntry - 父级别 entry, 即引用当前文件的文件
   * @param fileType - 文件类型
   * @param groupName - 文件所在组
   * @param entryReferType - 引用类型, 用于标识直接引用或间接引用, 默认为 `direct`
   * @param customEntryName - 自定义 entry 名称, 不带后缀名, 如 `pages/my/usercenter`
   * @param rootDirs - 文件检索根目录, 可选, 默认为 srcPaths
   * @param preferRelative - 是否倾向于按照相对目录解析组件
   */
  tryAddEntriesFromPageOrComponent(
    referencePath: string,
    entryType: EntryType,
    parentEntry: EntryItem,
    fileType?: EntryFileType,
    groupName?: string,
    entryReferType?: EntryReferType,
    customEntryName?: string,
    rootDirs?: string[],
    preferRelative?: boolean
  ): Promise<void | EntryItem>

  /**
   * 添加页面 entries
   * @param pages - 页面数组, 支持数组或对象, 对象可用于指定自定义 entry 名称
   * @param parentEntry - 父级 entry
   * @param group - 分组名称
   * @param rootDirs - 文件检索根目录, 可选, 默认为 srcPaths
   */
  addPageEntries(
    pages: string[] | Record<string, string>,
    parentEntry: EntryItem,
    groupName?: string,
    rootDirs?: string[]
  ): Promise<void>

  /**
   * 添加组件 entries
   * @param components - 组件对象
   * @param parentEntry - 上一级 EntryItem
   * @param rootDirs - 文件检索根目录, 可选, 默认为 srcPaths
   * @param preferRelative - 是否倾向于按照相对目录解析组件
   */
  addComponentEntries(
    components: Record<string, string>,
    parentEntry: EntryItem,
    rootDirs?: string[],
    preferRelative?: boolean
  ): Promise<void>

  /**
   * 替换文件后缀为期望的后缀，用于解决源代码后缀和目标产物文件后缀不同的情况
   * @param filePath - 原始文件路径
   * @returns 替换过后缀的文件路径
   */
  replaceExtAsExpected(filePath: string): string

  /**
   * 通过 glob 的方式构建 entry
   * * @param globPattern - 模式
   */
  buildByGlob(globPattern?: string): Promise<void>
}

export type Changeable<T> = {
  -readonly [k in keyof T]: T[k]
}
