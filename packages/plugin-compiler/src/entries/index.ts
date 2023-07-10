import {
  asArray,
  CompileTypes,
  Config,
  EntryBuilderHelpers,
  EntryFileType,
  EntryItem,
  EntryPriority,
  EntryReferType,
  EntryType,
  expandExtsWithConditionalExt,
  fsExtra,
  glob,
  lodash as _,
  logger,
  MAIN_GROUP_NAME,
  micromatch,
  ModuleGraph,
  ModuleGroup,
  MOR_APP_FILE,
  ObjectValues,
  Runner,
  RunnerContext,
  slash,
  SourceTypes,
  tsTransformerFactory,
  typescript as ts,
  UniversalifiedInputFileSystem,
  webpack,
  WebpackWrapper,
  EntrySources
} from '@morjs/utils'
import type _fs from 'fs'
import path from 'path'
import { CompilerPlugin, getComposedCompilerPlugins } from '../compilerPlugins'
import {
  AllConfigFileTypes,
  AllScriptFileTypes,
  AllSjsFileTypes,
  AllStyleFileTypes,
  AllTemplateFileTypes,
  CompileModes,
  CompilerUserConfig,
  ExtraStyleFileTypes,
  INDEPENDENT_SUBPACAKGE_JSON,
  NODE_MODULES,
  NON_SCRIPT_ENTRIES_FILENAME,
  RootEntryConfigFiles
} from '../constants'
import { preprocess } from '../preprocessors/codePreprocessor'
import { scriptTransformer } from '../transformers/scriptTransformer'
import { templateTransformer } from '../transformers/templateTransformer'
import {
  IAppConfig,
  IPluginConfig,
  ISubPackageConfig,
  IUsingComponentConfig
} from '../types'
import {
  extsToGlobPatterns,
  generateCacheFileHash,
  getRelativePathToSrcPaths,
  isChildCompilerRunner,
  parseJsonLike,
  pathWithoutExtname,
  shouldProcessFileByPlugins
} from '../utils'

type FS = typeof _fs

// 读取 当前 npm package.json
// 主要目的是是用版本号作为 cacheKey 的一部分
let PKG_JSON: { version?: string }

// EntryBuilder 缓存文件
const ENTRY_BUILD_CACHE_FILE = 'mor.entrybuilder.json'
// EntryBuilder 缓存过期时间, 7天
const EXPIRE_TIME = 7 * 24 * 3600 * 1000

// 条件后缀的属性名称类型
type ConditionalExtsPropName = keyof {
  [key in EntryFileType as `${key}WithConditionalExts`]: 0
}

/**
 * 普通后缀的属性名称类型
 */
type ExtsPropName = keyof {
  [key in EntryFileType as `${key}Exts`]: 0
}

/**
 * 支持后缀的配置
 */
type SupportExts = {
  [key in ConditionalExtsPropName | ExtsPropName]: string[]
}

/**
 * package.json 简易类型
 */
interface ProjectJSON {
  name: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

// 类型别名
type EntryName = string
type EntryNameWithoutExt = string
type EntryFullPath = string
type CompileType = ObjectValues<typeof CompileTypes>
type CompileMode = ObjectValues<typeof CompileModes>

// 文件状态描述
type FileStatDesc = 'unchanged' | 'changed' | 'deleted' | 'new'

const isPlainObject = _.isPlainObject

// 后缀名 => EntryFileType 转换
// 有限集合
const EXT_TO_ENTRY_FILE_TYPE_MAP: Map<string, EntryFileType> = new Map()

// 默认的 node_modules 存储位置
const NPM_MODULE_DIR = 'npm_components'

/**
 * 生成编译需要的 entry files
 * 页面或组件中的每个文件均为单独的 entry
 */
export class EntryBuilder implements SupportExts, EntryBuilderHelpers {
  /**
   * 支持的文件类型
   */
  templateExts: string[]
  configExts: string[]
  styleExts: string[]
  sjsExts: string[]
  scriptExts: string[]

  /**
   * 支持的文件类型, 含条件编译的文件后缀
   */
  templateWithConditionalExts: string[]
  configWithConditionalExts: string[]
  styleWithConditionalExts: string[]
  sjsWithConditionalExts: string[]
  scriptWithConditionalExts: string[]

  /**
   * 用于 default 模式下的 glob 操作
   */
  globPatterns: string

  /**
   * 所有的 entry 信息
   * 这里的 EntryName 除 js 文件之外均包含后缀名
   * EntryItem 中的 entryName 是不包含后缀名的 entry 相对路径
   */
  entries: Map<EntryName, EntryItem>
  /**
   * 用于记录文件完整路径和 entry 名称
   */
  entryRecords: Map<EntryFullPath, EntryName>

  /**
   * 文件及引用映射
   * Record 的 key 为 引用路径, value 为 实际文件的完整路径
   * 实际使用的时候 可以通过完整路径获取生成后的路径
   */
  referencesMap: Map<EntryFullPath, Record<string, EntryFullPath>>

  /**
   * 自定义组件映射关系
   * 用于记录每个 entry 使用的 自定义组件名称
   * 在后续的模版解析和处理中用于识别 template 的自定义组件标签
   */
  usingComponentsMap: Map<EntryNameWithoutExt, string[]>

  /**
   * 记录文件修改时间和原始大小
   */
  fileStats: Map<
    EntryFullPath,
    { mtimeMs: number | bigint; size: number | bigint }
  >

  /**
   * 用于记录 transform 编译模式中 script 的文件内容
   */
  replaceEntrySources: EntrySources

  /**
   * 用于生成 json 文件
   */
  additionalEntrySources: EntrySources

  /**
   * 条件编译后缀
   */
  conditionalFileExts: string[]

  /**
   * 条件编译后缀规则，用于生成 RegExp
   */
  conditionalFileExtsPattern: string

  /**
   * 条件编译后缀正则
   */
  conditionalFileExtsRegExp: RegExp

  /**
   * 源代码目录
   */
  srcPaths: string[]

  /**
   * 后缀名映射
   */
  extMap: Record<string, string>

  /**
   * 支付宝小程序文件类型
   */
  alipayFileTypes: CompilerPlugin['fileType']
  /**
   * 微信小程序文件类型
   */
  wechatFileTypes: CompilerPlugin['fileType']
  /**
   * 目标文件类型
   */
  targetFileTypes: CompilerPlugin['fileType']

  /**
   * app 入口 json 文件
   */
  appJson?: IAppConfig
  /**
   * subpackage 入口 json 文件
   */
  subpackageJson?: ISubPackageConfig
  /**
   * plugin 入口 json 文件
   */
  pluginJson?: IPluginConfig

  /**
   * 独立分包配置
   */
  independentSubpackages: Map<string, ISubPackageConfig>

  /**
   * 全局脚本文件
   */
  globalScriptFilePath?: string

  /**
   * 全局 app 名称
   */
  globalAppName?: string

  /**
   * 全局样式文件
   */
  globalStyleFilePath?: string

  /**
   * 全局配置文件
   */
  globalConfigFilePath?: string

  /**
   * 项目名称
   */
  projectName?: string

  /**
   * 模块依赖图, 用于 bundle 分析 和 分组
   */
  moduleGraph: ModuleGraph

  /**
   * npm 组件的文件和包名映射
   */
  pathAndPackageNames: Map<string, string>

  /**
   * 用到的 npm 包
   * key 为 包名
   * value 为 包地址
   */
  usedNpmPackages: Map<string, string>

  /**
   * 针对当前 target
   * npm 包应当取用的 mainField 值
   */
  npmMainFields: Map<string, string>

  /**
   * template 引用标签名称
   */
  templateImportTagNames: string[]
  /**
   * template 引用正则
   */
  tempalteImportTagRegExp: RegExp

  /**
   * 初始化标记, 用于确保 lazyInitialize 只执行一次
   */
  private initialized = false

  private fs: UniversalifiedInputFileSystem

  constructor(
    public config: Config,
    public userConfig: CompilerUserConfig,
    public webpackWrapper: WebpackWrapper,
    public context: RunnerContext,
    public runner: Runner
  ) {
    this.fs = webpackWrapper.fs
    this.initialize()
  }

  private initialize() {
    this.entries = new Map()
    this.entryRecords = new Map()
    this.replaceEntrySources = new Map()
    this.additionalEntrySources = new Map()
    this.moduleGraph = new ModuleGraph()
    this.pathAndPackageNames = new Map()
    this.usedNpmPackages = new Map()
    this.npmMainFields = new Map()
    this.fileStats = new Map()
    this.independentSubpackages = new Map()
    this.referencesMap = new Map()
    this.usingComponentsMap = new Map()
  }

  /**
   * 为每个配置生成独立文件夹, 避免发生冲突
   */
  private getEntryCacheFileName() {
    return path.join(
      'entries',
      generateCacheFileHash(this.userConfig),
      ENTRY_BUILD_CACHE_FILE
    )
  }

  /**
   * 尝试将 entryBuilder 保存至缓存
   * 保存前检查已有缓存是否已过期
   */
  async trySaveToCache() {
    this.runner.logger.time('EntryBuilder.trySaveToCache')
    function serializeMap<T, U>(
      map: Map<T, U>,
      parser?: (v: U) => string | Record<string, string>
    ): [T, U | string | Record<string, string>][] {
      const array: [T, U | string | Record<string, string>][] = []
      map.forEach(function (value, key) {
        array.push([key, parser ? parser(value) : value])
      })
      return array
    }

    // 获取 cache
    const cache = {
      entries: serializeMap(this.entries),
      entryRecords: serializeMap(this.entryRecords),
      pathAndPackageNames: serializeMap(this.pathAndPackageNames),
      usedNpmPackages: serializeMap(this.usedNpmPackages),
      npmMainFields: serializeMap(this.npmMainFields),
      fileStats: serializeMap(this.fileStats),
      independentSubpackages: serializeMap(this.independentSubpackages),
      referencesMap: serializeMap(this.referencesMap),
      usingComponentsMap: serializeMap(this.usingComponentsMap),
      replaceEntrySources: serializeMap(
        this.replaceEntrySources,
        (v) => {
          return {
            source: v.source.source() as string,
            saveToMemFile: v.saveToMemFile
          }
        }
      ),
      additionalEntrySources: serializeMap(
        this.additionalEntrySources,
        (v) => {
          return {
            source: v.source.source() as string,
            saveToMemFile: v.saveToMemFile
          }
        }
      ),
      moduleGraph: this.moduleGraph.toJSON()
    }

    try {
      const cacheStr = await this.runner.config.loadCachedFile(
        this.getEntryCacheFileName()
      )

      let allCache: Record<string, any>
      try {
        allCache = JSON.parse(cacheStr)
      } catch (error) {
        allCache = {}
      }

      const now = Date.now()

      // 检查已有缓存的有效性, 并删除无效缓存
      for (const cacheKey of Object.keys(allCache)) {
        let invalid = false
        if (!allCache[cacheKey]) invalid = true
        if (!allCache[cacheKey].modifiedAt) invalid = true
        if (now - allCache[cacheKey].modifiedAt > EXPIRE_TIME) invalid = true
        if (invalid) delete allCache[cacheKey]
      }

      allCache[this.getCacheKey()] = {
        cache: cache,
        modifiedAt: Date.now()
      }

      await this.runner.config.writeToCacheDir(
        this.getEntryCacheFileName(),
        JSON.stringify(allCache)
      )

      allCache = null
    } catch (error) {
      this.runner.logger.debug(
        `尝试保存 entryBuilder 到缓存失败: ${error} ${error.stack}`
      )
    }

    this.runner.logger.timeEnd('EntryBuilder.trySaveToCache')
  }

  /**
   * 获取 缓存 key
   * 支持 通过 runner.context 传递 entryCacheKey
   */
  getCacheKey() {
    const { compileMode, compileType, sourceType, target, name, mode } = this
      .userConfig as CompilerUserConfig & { name: string }
    const entryCacheKey = this.runner.context.get('entryCacheKey') || 'default'
    if (!PKG_JSON) {
      PKG_JSON = fsExtra.readJSONSync(
        path.join(__dirname, '../../package.json')
      )
    }

    const { version: pkgVersion } = PKG_JSON || {}

    return [
      name,
      target,
      mode,
      compileMode,
      compileType,
      sourceType,
      pkgVersion,
      entryCacheKey
    ].join(':')
  }

  /**
   * 尝试从缓存中构建 EntryBuilder 以加快分析速度
   */
  async tryRestoreFromCache() {
    this.runner.logger.time('EntryBuilder.tryRestoreFromCache')
    try {
      const cacheStr = await this.runner.config.loadCachedFile(
        this.getEntryCacheFileName()
      )
      if (!cacheStr) return
      const cacheData = JSON.parse(cacheStr)?.[this.getCacheKey()]
      if (!cacheData) return
      if (!cacheData.cache) return
      if (!cacheData.modifiedAt) return
      // 7 天过期
      if (Date.now() - cacheData.modifiedAt > EXPIRE_TIME) return

      const cache = cacheData.cache

      // 确保以下属性和值均存在
      const checkResult = [
        'entries',
        'entryRecords',
        'pathAndPackageNames',
        'usedNpmPackages',
        'npmMainFields',
        'fileStats',
        'independentSubpackages',
        'referencesMap',
        'usingComponentsMap',
        'replaceEntrySources',
        'additionalEntrySources',
        'moduleGraph'
      ].reduce((result, item) => {
        return result && cache[item]
      }, true)

      if (!checkResult) return // 恢复数据
      ;[
        'entries',
        'entryRecords',
        'pathAndPackageNames',
        'usedNpmPackages',
        'npmMainFields',
        'fileStats',
        'independentSubpackages',
        'referencesMap',
        'usingComponentsMap'
      ].forEach((item) => {
        this[item] = new Map(cache[item])
      })

      cache['replaceEntrySources'].forEach(([name, e]) => {
        this.setEntrySource(
          name as string,
          typeof e === 'string' ? e : e.source as string,
          'replace',
          e.saveToMemFile
        )
      })

      cache['additionalEntrySources'].forEach(([name, e]) => {
        this.setEntrySource(
          name as string,
          typeof e === 'string' ? e : e.source as string,
          'additional',
          e.saveToMemFile
        )
      })

      this.moduleGraph = ModuleGraph.restore(cache['moduleGraph'])

      // 缓存恢复之后需要检查文件有效性
      for await (const [filePath] of this.entryRecords) {
        const fileStat = await this.fetchFileStatDesc(filePath)
        if (fileStat === 'changed' || fileStat === 'new') {
          this.moduleGraph.invalidate(filePath)
        } else if (fileStat === 'deleted') {
          this.deleteAllFileInfos(filePath)
          this.moduleGraph.invalidate(filePath)
        }
      }
    } catch (error) {
      this.runner.logger.debug(
        `从缓存中恢复 entryBuilder 失败: ${error} ${error.stack}`
      )
      this.initialize()
    }
    this.runner.logger.timeEnd('EntryBuilder.tryRestoreFromCache')
  }

  /**
   * 获取引用路径对应的真实路径
   * @param sourcePath - 源文件路径
   * @param referencePath - 引用文件路径
   * @param withExt - 是否携带后缀名, 默认为 false
   * @returns 返回 posix 类型的引用路径
   */
  getRealReferencePath(
    sourcePath: string,
    referencePath: string,
    withExt = false
  ): string | undefined {
    const realPath = this.getFullPathOfReferenceFile(sourcePath, referencePath)

    if (!realPath) return

    const referenceEntry = this.getEntryByFilePath(realPath)
    if (!referenceEntry) return

    const sourceEntry = this.getEntryByFilePath(sourcePath)

    // 非 bundle 模式下 不处理 npm 组件的路径替换
    if (this.userConfig.compileMode !== CompileModes.bundle) {
      if (
        sourceEntry.entryType === EntryType.npmComponent ||
        referenceEntry.entryType === EntryType.npmComponent
      ) {
        return
      }
    }

    return this.getRelativePathFor(sourceEntry, referenceEntry, withExt)
  }

  /**
   * 获取引用文件的真实路径
   * @param sourcePath - 源文件
   * @param referencePath - 引用路径
   */
  getFullPathOfReferenceFile(
    sourcePath: string,
    referencePath: string
  ): string | undefined {
    const referenceMap = this.referencesMap.get(sourcePath) || {}
    return referenceMap[referencePath]
  }

  /**
   * 获取 源 entry 和 目标 entry 的相对路径
   * @param sourceEntry - 源 entry
   * @param targetEntry - 目标 entry
   * @param withExt - 是否携带后缀名
   * @returns 返回 posix 类型的相对路径
   */
  getRelativePathFor(
    sourceEntry: EntryItem,
    targetEntry: EntryItem,
    withExt = false
  ): string {
    const relativePath = path.relative(
      sourceEntry.entryDir,
      withExt ? targetEntry.fullEntryName : targetEntry.entryName
    )

    return slash(
      relativePath.startsWith('.') ? relativePath : './' + relativePath
    )
  }

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
  ) {
    let targetSources: EntrySources
    if (aim === 'replace') targetSources = this.replaceEntrySources
    if (aim === 'additional') targetSources = this.additionalEntrySources
    if (!targetSources) {
      logger.error(
        `添加 entrySource 失败: ${entryName}\n` +
          `原因: 错误的 entrySource 目标: ${aim}, ` +
          '仅允许 `replace` 和 `additional`'
      )
      return
    }

    let entrySource = targetSources.get(entryName)
    // 如果代码未变化, 则什么都不做
    // 原因为: webpack 会针对 source 对象进行缓存和内容校验
    //        source 对象如果变了那么不论是否内容有变化都会输出文件
    if (
      entrySource?.source?.source?.() === content &&
      entrySource?.saveToMemFile === saveToMemFile
    ) {
      return
    }

    // 否则 替换为新的 source
    entrySource = {
      source: new webpack.sources.RawSource(content),
      saveToMemFile: saveToMemFile
    }
    targetSources.set(entryName, entrySource)

    // 将 entry 的内容保存为 saveToMemFile 所指向的地址
    // 用途：MorJS 编译过程中，可能会产生一些额外的文件，这些文件在后续的编译中可能会被消费
    // 而写入到 mem 文件系统中，可以被正常获取到，且不会影响用户真实的文件
    let fileName = saveToMemFile ? saveToMemFile : ''
    if (!fileName && aim === 'additional') {
      fileName = path.join(
        this.srcPaths[0],

        // entry 可能为组件库中的文件，需要还原为替换之前的路径
        entryName.replace(new RegExp(NPM_MODULE_DIR, 'gi'), NODE_MODULES)
      )
    }
    if (fileName) {
      this.fs.mem.mkdirpSync(path.dirname(fileName))
      this.fs.mem.writeFileSync(fileName, content)
    }
  }

  /**
   * 初始化, Entry 会在比较早的时间进行实例化
   * 如果初始化太早, 则 userConfig 中的配置不是最终配置
   * 目前 entryBuilder 首次初始化的时机为 build 的时候
   */
  private async lazyInitialize() {
    // 确保只初始化一次
    if (this.initialized) return
    this.initialized = true

    this.runner.logger.time('EntryBuilder.lazyInitialize')

    const {
      target,
      srcPaths,
      conditionalCompile: { fileExt }
    } = this.userConfig
    this.conditionalFileExts = asArray(fileExt)
    this.conditionalFileExtsPattern = `\\.(${this.conditionalFileExts
      .map((e) => e.slice(1))
      .join('|')})`
    this.conditionalFileExtsRegExp = new RegExp(
      this.conditionalFileExtsPattern,
      'i'
    )
    this.srcPaths = srcPaths

    // 设置相关 SupportExts 支持到 entryBuilder 中
    Object.assign(
      this,
      this.chooseSupportExts(target, this.conditionalFileExts)
    )

    const composedPlugins = getComposedCompilerPlugins()

    this.targetFileTypes = composedPlugins.fileType[target]
    this.alipayFileTypes = composedPlugins.fileType[SourceTypes.alipay]
    this.wechatFileTypes = composedPlugins.fileType[SourceTypes.wechat]

    // 后缀映射
    this.extMap = {}
    this.templateExts.forEach(
      (ext) => (this.extMap[ext] = this.targetFileTypes.template)
    )
    this.styleExts.forEach(
      (ext) => (this.extMap[ext] = this.targetFileTypes.style)
    )
    this.sjsExts.forEach((ext) => (this.extMap[ext] = this.targetFileTypes.sjs))
    // JS 需要特殊处理
    this.scriptExts.forEach((ext) => (this.extMap[ext] = ''))
    this.configExts.forEach(
      (ext) => (this.extMap[ext] = this.targetFileTypes.config)
    )

    // 组装 glob patterns
    this.globPatterns = extsToGlobPatterns([
      ...this.templateExts,
      ...this.styleExts,
      ...this.sjsExts,
      ...this.scriptExts,
      ...this.configExts
    ])

    // 载入项目名称
    const possiblePaths = new Set<string>()
    this.srcPaths.forEach((p) => possiblePaths.add(p))
    possiblePaths.add(this.config.cwd)
    const { fileExists, readJson } = this.fs
    for await (const p of possiblePaths) {
      const packageJsonPath = path.resolve(p, 'package.json')
      if (await fileExists(packageJsonPath)) {
        const packageJson = (await readJson(packageJsonPath)) as ProjectJSON
        // 所有非 数字或英文或_或- 的字符都会被替换为下划线
        if (packageJson.name) {
          this.projectName = packageJson.name
            .toLowerCase()
            .replace(/([^a-zA-Z0-9_-])/g, function () {
              return '_'
            })
          break
        }
      }
    }

    this.runner.logger.timeEnd('EntryBuilder.lazyInitialize')

    // 开启缓存
    if (this.userConfig.cache === true) {
      await this.tryRestoreFromCache()
    }
  }

  /**
   * 解析需要支持的 exts
   * NOTE: 后缀顺序需要按照 EntryPriority 中定义的顺序来
   * @param target - 编译目标
   * @param conditionalExts - 条件后缀
   */
  chooseSupportExts(
    target: string,
    conditionalExts: string | string[]
  ): SupportExts {
    const composedPlugins = getComposedCompilerPlugins()
    const wechatFileTypes = composedPlugins.fileType[SourceTypes.wechat]
    const alipayFileTypes = composedPlugins.fileType[SourceTypes.alipay]
    const targetFileTypes = composedPlugins.fileType[target]

    const templateExts = [wechatFileTypes.template, alipayFileTypes.template]
    const styleExts = [
      wechatFileTypes.style,
      alipayFileTypes.style,
      ...ExtraStyleFileTypes
    ]
    const sjsExts = [wechatFileTypes.sjs, alipayFileTypes.sjs]
    const scriptExts = [...AllScriptFileTypes]
    const configExts = [...AllConfigFileTypes]
    const templateImportTagNames = [
      'import',
      'include',
      composedPlugins.sjsTagName[SourceTypes.wechat],
      composedPlugins.sjsTagName[SourceTypes.alipay]
    ]

    // 非微信或支付宝 DSL 增加对应平台原生 template, style, sjs 支持
    if (target !== SourceTypes.alipay && target !== SourceTypes.wechat) {
      styleExts.unshift(targetFileTypes.style)
      templateExts.unshift(targetFileTypes.template)
      if (!sjsExts.includes(targetFileTypes.sjs)) {
        sjsExts.unshift(targetFileTypes.sjs)
      }
      if (
        !templateImportTagNames.includes(composedPlugins.sjsTagName[target])
      ) {
        templateImportTagNames.unshift(composedPlugins.sjsTagName[target])
      }
    }

    this.templateImportTagNames = templateImportTagNames
    this.tempalteImportTagRegExp = new RegExp(
      `<(${templateImportTagNames.join('|')})`,
      'i'
    )

    // 不同类型可能的后缀, 含条件编译后缀
    // 条件编译的后缀优先于普通后缀
    const templateWithConditionalExts = expandExtsWithConditionalExt(
      templateExts,
      conditionalExts
    )
    const configWithConditionalExts = expandExtsWithConditionalExt(
      configExts,
      conditionalExts
    )
    const styleWithConditionalExts = expandExtsWithConditionalExt(
      styleExts,
      conditionalExts
    )
    const sjsWithConditionalExts = expandExtsWithConditionalExt(
      sjsExts,
      conditionalExts
    )
    const scriptWithConditionalExts = expandExtsWithConditionalExt(
      scriptExts,
      conditionalExts
    )

    return {
      templateExts,
      styleExts,
      sjsExts,
      scriptExts,
      configExts,
      templateWithConditionalExts,
      configWithConditionalExts,
      styleWithConditionalExts,
      sjsWithConditionalExts,
      scriptWithConditionalExts
    }
  }

  /**
   * 构建 entry, 同时处理文件维度的条件编译
   * bundle 和 transform 编译模式是通过
   * app.json / subpackage.json / plugin.json 等入口来构建 entry
   * 区别是 bundle 会将 npm 组件文件拷贝至 outputPath/npm_components 中
   * 而 transform 不强制 入口文件存在，入口文件存在时会从入口文件分析依赖树
   * 入口文件不存在时，则通过 glob 的方式来获取所有文件
   */
  async build(): Promise<webpack.EntryObject> {
    this.runner.logger.time('EntryBuilder.build')

    // 在这里初始化, 只初始化一次
    await this.lazyInitialize()

    // 每次构建前均需要清理无用的 entry
    this.invalidateModifiedOrDeletedFiles()

    if (!isChildCompilerRunner(this.runner)) logger.info('依赖分析中 ...')

    const { compileMode, compileType } = this.userConfig

    // 小程序分析
    await this.buildByCompileType(compileType, compileMode)

    if (compileMode === CompileModes.transform) {
      // transform 模式下完成一次 glob 所有文件，确保不会有遗漏
      // 比如组件库编译等
      await this.buildByGlob()
    }

    // 清除无用的文件信息
    if (compileMode === 'bundle') this.clearUnusedEntries()

    // 执行 beforeBuildEntries hook
    this.runner.logger.time('Hooks.beforeBuildEntries')
    await this.runner.hooks.beforeBuildEntries.promise(this)
    this.runner.logger.timeEnd('Hooks.beforeBuildEntries')

    // 构建 webpack 需要的 entry
    const entries = {} as webpack.EntryObject

    // nonScriptFiles 通过 config.js 中的 generatorOptions 配置
    // 来确保最终生成的文件名称是正确的
    const nonScriptFiles: string[] = []

    if (this.entries.size) {
      for (const [entryName, item] of this.entries) {
        // transform 模式下不输出 node_modules 中的组件
        if (
          compileMode === CompileModes.transform &&
          item.entryType === EntryType.npmComponent
        ) {
          continue
        }

        // 仅返回 entryReferType 为 direct 的 entry
        // 原因: entryReferType 为 dep 的 entry 由 依赖分析自动获得, 交给 webpack 管理
        if (item.entryReferType === 'direct') {
          if (item.entryFileType === EntryFileType.script) {
            // 针对 插件 或 自定义脚本文件 对外暴露的文件允许 export
            if (
              item.entryType === EntryType.plugin ||
              item.entryType === EntryType.custom
            ) {
              entries[entryName] = {
                import: item.fullPath,
                library: {
                  type: 'commonjs2'
                }
              }
            } else {
              entries[entryName] = item.fullPath
            }
          } else {
            nonScriptFiles.push(item.fullPath)
          }
        }
      }
    }

    // 所有非 js entry 统一处理
    if (nonScriptFiles.length) {
      entries[NON_SCRIPT_ENTRIES_FILENAME] = nonScriptFiles
    }

    if (!isChildCompilerRunner(this.runner)) {
      logger.info(
        `依赖分析完成: ${this.runner.logger.timeEnd('EntryBuilder.build')}`
      )
    }

    // 执行 afterBuildEntries hook
    this.runner.logger.time('Hooks.afterBuildEntries')
    const finalEntries = await this.runner.hooks.afterBuildEntries.promise(
      entries,
      this
    )
    this.runner.logger.timeEnd('Hooks.afterBuildEntries')

    return finalEntries
  }

  /**
   * 清理无用的 entries
   * 基于 moduleGraph 来应用变更
   */
  private clearUnusedEntries() {
    this.moduleGraph.clearAllInvalidModules()
    this.moduleGraph.getDiffFiles({
      onDelete: (filePath) => {
        this.deleteAllFileInfos(filePath)
      }
    })
  }

  /**
   * watch 状态下 每次触发 build 前需要基于 modifiedFiles 和 removedFiles 清理 entry
   * NOTE: 后面可以考虑基于性能优化 将 modifiedFiles 中的 dir 进行处理
   */
  private invalidateModifiedOrDeletedFiles() {
    const { compiler, watching } = this.webpackWrapper
    if (!watching) return

    const { removedFiles, modifiedFiles } = compiler

    if (modifiedFiles?.size) {
      logger.debug(
        ['修改文件:'].concat(Array.from(modifiedFiles)).join('\n=> ')
      )

      modifiedFiles.forEach((filePath) => {
        this.moduleGraph.invalidate(filePath)
      })
    }

    if (removedFiles?.size) {
      logger.debug(['删除文件:'].concat(Array.from(removedFiles)).join('\n=> '))

      // 如果存在被删除或修改的文件覆盖已有的 glob
      removedFiles.forEach((filePath) => {
        this.deleteAllFileInfos(filePath)
        this.moduleGraph.invalidate(filePath)
      })
    }
  }

  /**
   * 删除和文件相关的所有信息
   * @param filePath - 文件路径
   */
  private deleteAllFileInfos(filePath: string) {
    const entryName = this.entryRecords.get(filePath)
    this.fileStats.delete(filePath)
    this.entryRecords.delete(filePath)
    this.pathAndPackageNames.delete(filePath)
    this.referencesMap.delete(filePath)
    if (entryName) {
      const entryNameWithoutExt = this.entries.get(entryName)?.entryName
      this.usingComponentsMap.delete(entryNameWithoutExt)
      this.entries.delete(entryName)
      this.replaceEntrySources.delete(entryName)
      this.additionalEntrySources.delete(entryName)
    }
    if (this.globalScriptFilePath === filePath) {
      this.globalScriptFilePath = undefined
    }
    if (this.globalStyleFilePath === filePath) {
      this.globalStyleFilePath = undefined
    }
  }

  /**
   * 通过文件地址获取使用的自定义组件名称数组
   * @param filePath - 文件地址
   * @returns 当前路径对应的 entry 可能使用到的自定义组件名称(包含全局组件)
   */
  getUsingComponentNames(filePath: string): string[] {
    const entry = this.getEntryByFilePath(filePath)
    if (!entry) return []
    const globalComponentNames = this.usingComponentsMap.get('app') || []
    const currentComponentNames =
      this.usingComponentsMap.get(entry.entryName) || []
    return globalComponentNames.concat(currentComponentNames)
  }

  /**
   * 获取全局组件相对于当前引用文件的相对路径
   * @param sourceEntry - 引用全局组件的 entry
   * @param globalComponentName - 全局组件的名称
   * @returns 全局组件之于当前文件的相对路径
   */
  getGlobalComponentRelativePath(
    sourceEntry: EntryItem,
    globalComponentName: string
  ): string | undefined {
    // 无全局配置, 直接返回
    if (!this.globalConfigFilePath) return
    const referencePath = this.appJson?.usingComponents?.[globalComponentName]
    if (!referencePath) return
    const referenceFullPath = this.getFullPathOfReferenceFile(
      this.globalConfigFilePath,
      referencePath
    )
    if (!referenceFullPath) return
    const referenceEntry = this.getEntryByFilePath(referenceFullPath)
    if (!referenceEntry) return

    return this.getRelativePathFor(sourceEntry, referenceEntry)
  }

  /**
   * 获取 完整的 entry 名称
   * @param filePath - 文件完整路径
   * @returns 完整的 entry 名称(含后缀名)
   */
  getFullEntryName(filePath: string): string | undefined {
    return this.getEntryByFilePath(filePath)?.fullEntryName
  }

  /**
   * 基于路径获取 entry
   * @param filePath - 文件完整路径
   */
  getEntryByFilePath(filePath: string): EntryItem | undefined {
    const entryName = this.entryRecords.get(filePath)
    if (!entryName) return
    return this.entries.get(entryName)
  }

  /**
   * 判断是否是 entry 文件
   * @param filePath - 文件地址
   */
  isEntryFile(filePath: string): boolean {
    return !!this.getEntryByFilePath(filePath)
  }

  /**
   * 提供 extname => entryFileType 转换
   * @param extname - 文件后缀
   */
  private extToEntryFileType(extname: string) {
    let entryFileType = EXT_TO_ENTRY_FILE_TYPE_MAP.get(extname)

    if (entryFileType) return entryFileType

    if (
      AllConfigFileTypes.includes(
        extname as (typeof AllConfigFileTypes)[number]
      )
    ) {
      entryFileType = EntryFileType.config
    }
    if (
      AllScriptFileTypes.includes(
        extname as (typeof AllScriptFileTypes)[number]
      )
    ) {
      entryFileType = EntryFileType.script
    }
    if (AllSjsFileTypes.includes(extname as (typeof AllSjsFileTypes)[number])) {
      entryFileType = EntryFileType.sjs
    }
    if (
      AllTemplateFileTypes.includes(
        extname as (typeof AllTemplateFileTypes)[number]
      )
    ) {
      entryFileType = EntryFileType.template
    }
    if (
      AllStyleFileTypes.includes(extname as (typeof AllStyleFileTypes)[number])
    ) {
      entryFileType = EntryFileType.style
    }

    if (!entryFileType) throw new Error(`未知的文件类型: ${extname}`)

    EXT_TO_ENTRY_FILE_TYPE_MAP.set(extname, entryFileType)

    return entryFileType
  }

  /**
   * 读取并使用条件编译预处理类 JSON 文件
   * 支持 json、 jsonc、json5 三种格式
   * @param filePath - 类 json 文件
   * @returns json 文件内容
   */
  private async readAndPreprocessJsonLikeFile(filePath: string): Promise<any> {
    let fileContent = (await this.fs.readFile(filePath)).toString('utf-8')
    const conditionalCompileContext =
      this.userConfig?.conditionalCompile?.context
    const extname = path.extname(filePath)
    const shouldFileBePreprocessed =
      extname === '.jsonc' || extname === '.json5'
    const matchConditionCompileTag = /#(ifndef|ifdef|if)/.test(
      fileContent || ''
    )
    if (
      shouldFileBePreprocessed &&
      conditionalCompileContext &&
      matchConditionCompileTag
    ) {
      fileContent = preprocess(
        fileContent,
        conditionalCompileContext,
        extname,
        filePath
      )
    }
    return parseJsonLike(fileContent, extname)
  }

  /**
   * 保存文件最新的修改时间和大小
   * 注意: 该方法为异步方法, 非实时更新
   * @param filePath - 文件路径
   */
  private setOrUpdateFileStat(filePath: string) {
    this.fs.stat(filePath, (err, stat) => {
      if (err) return
      this.fileStats.set(filePath, {
        mtimeMs: stat.mtimeMs,
        size: stat.size
      })
    })
  }

  /**
   * 获取文件状态
   * @param filePath - 文件路径
   * @return 文件状态
   */
  private async fetchFileStatDesc(filePath: string): Promise<FileStatDesc> {
    const prev = this.fileStats.get(filePath)

    let current: Parameters<Parameters<WebpackWrapper['fs']['stat']>[1]>[1]

    // 先判断文件是否还在
    try {
      current = await this.fs.stat(filePath)
    } catch (error) {
      // 如果文件未拿到 stat 代表文件不存在了
      // 直接返回 false
      return 'deleted'
    }

    // 如果文件存在且之前无记录标记为新
    if (!prev) return 'new'

    // 判断文件是否变化
    if (
      current.size !== prev.size ||
      current.mtimeMs !== prev.mtimeMs ||
      current.mtimeMs === 0
    ) {
      return 'changed'
    } else {
      return 'unchanged'
    }
  }

  /**
   * 判断是否需要继续分析当前文件的依赖
   * @param filePath - 文件路径
   */
  private async shouldAnalyzeFileDepenencies(
    filePath: string
  ): Promise<boolean> {
    const isFileInvalid =
      this.moduleGraph.isInvalid(filePath) ||
      (await this.fetchFileStatDesc(filePath)) !== 'unchanged'

    // 更新文件信息
    this.setOrUpdateFileStat(filePath)
    return isFileInvalid
  }

  /**
   * 基于分包优化调整 npm 中组件的路径
   */
  private alterEntryForSubpackageOptimize(
    prevEntryName: EntryName,
    filePath: string,
    entry: EntryItem,
    group: ModuleGroup
  ): EntryItem {
    if (
      this.userConfig.compileType === CompileTypes.miniprogram &&
      entry.entryType === EntryType.npmComponent
    ) {
      // 修改 entryName
      const newEntryName = path.join(
        group.name,
        NPM_MODULE_DIR,
        // 截取 npm_modules 后面的路径部分
        prevEntryName.slice(
          prevEntryName.indexOf(NPM_MODULE_DIR) + NPM_MODULE_DIR.length
        )
      )

      // 更新 entry 信息
      if (prevEntryName !== newEntryName) {
        this.renameEntry(prevEntryName, newEntryName, filePath, entry)
      }

      // 需要对该 npm 组件的依赖文件进行一次处理, 以确保依赖的分组及 entry 路径也是正确的
      const module = this.moduleGraph.getModuleByFilePath(filePath)
      module.dependencies.forEach((dep) => {
        if (dep.groups.has(group)) return

        dep.linkGroup(group)
        const depPrevEntryName = this.entryRecords.get(dep.filePath)
        const depEntry = this.entries.get(depPrevEntryName)

        if (depPrevEntryName && depEntry) {
          this.alterEntryForSubpackageOptimize(
            depPrevEntryName,
            dep.filePath,
            depEntry,
            group
          )
        }
      })
    }

    return entry
  }

  /**
   * 获取相对于 srcPaths 的路径
   *  - 优先匹配 包含 srcPath 的相对路径
   *  - 如果没有包含的，则使用第一个 srcPath 计算 相对路径
   * @param filePath - 文件完整路径
   * @param srcPaths - 自定义 srcPaths 目录
   * @returns 相对路径
   */
  getRelativePathToSrcPaths(filePath: string, srcPaths?: string[]): string {
    const roots = srcPaths?.length ? srcPaths : this.srcPaths
    return getRelativePathToSrcPaths(filePath, roots, true)
  }

  /**
   * 重命名 entry
   * @param prevEntryName - 旧的 entry 名称
   * @param newEntryName - 新的 entry 名称
   * @param filePath - 完整文件路径
   * @param entry - entry 对象
   */
  private renameEntry(
    prevEntryName: string,
    newEntryName: string,
    filePath: string,
    entry: EntryItem
  ) {
    if (prevEntryName === newEntryName) return entry

    // 确保路径计算正确
    entry.fullEntryName = entry.fullEntryName.replace(
      prevEntryName,
      newEntryName
    )
    entry.entryName = pathWithoutExtname(entry.fullEntryName)
    entry.entryDir = path.dirname(entry.fullEntryName)
    entry.relativePath = entry.relativePath.replace(prevEntryName, newEntryName)

    // 修改 entry 相关信息
    this.entryRecords.set(filePath, newEntryName)
    this.entries.set(newEntryName, entry)
    this.entries.delete(prevEntryName)
    const usingComponents = this.usingComponentsMap.get(prevEntryName)
    if (usingComponents) {
      this.usingComponentsMap.set(newEntryName, usingComponents)
      this.usingComponentsMap.delete(prevEntryName)
    }
    const additionalEntrySource = this.additionalEntrySources.get(prevEntryName)
    if (additionalEntrySource) {
      this.additionalEntrySources.set(newEntryName, additionalEntrySource)
      this.additionalEntrySources.delete(prevEntryName)
    }
    const replaceEntrySource = this.replaceEntrySources.get(prevEntryName)
    if (replaceEntrySource) {
      this.replaceEntrySources.set(newEntryName, replaceEntrySource)
      this.replaceEntrySources.delete(prevEntryName)
    }

    return entry
  }

  /**
   * 过滤并添加到 entries 中, 实现文件条件编译
   * @param filePath - 文件完整路径
   * @param entryType - Entry 类型
   * @param entryReferType - 引用来源类型
   * @param parentEntry - 父级 entry
   * @param groupName - 所在组
   * @param customEntryName - 自定义 entry 名称, 不带后缀名, 如 pages/my/usercenter
   * @param srcPaths - 自定义 srcPaths 目录
   */
  addToEntry(
    filePath: string,
    entryType?: EntryType,
    entryReferType?: EntryReferType,
    parentEntry?: EntryItem,
    groupName?: string,
    customEntryName?: EntryName,
    srcPaths?: string[]
  ): EntryItem | undefined {
    // 更新依赖关系
    this.moduleGraph.addDependencyFor(
      parentEntry?.fullPath,
      filePath,
      groupName
    )
    let group = this.moduleGraph.getGroup(filePath)

    // 当主包某个组件被分包引用时, 需要校准 groupName
    // 避免主包中的文件被分组到 分包中
    // 特征: 分包中的文件必然路径是以分包名称开头的
    // 不符合条件的文件需要追加 mainGroup
    if (
      parentEntry &&
      entryType === EntryType.component &&
      group !== this.moduleGraph.mainGroup
    ) {
      if (
        !this.getRelativePathToSrcPaths(filePath, srcPaths).startsWith(
          group.name
        )
      ) {
        this.moduleGraph
          .getModuleByFilePath(filePath)
          .linkGroup(this.moduleGraph.mainGroup)
        group = this.moduleGraph.mainGroup
      }
    }

    // 原始后缀名
    const extname = path.extname(filePath)

    // 获取转换后的后缀名
    const realExtname = this.extMap[extname]

    // 如果已包含同名 entry, 则跳过并直接返回
    const prevEntryName = this.entryRecords.get(filePath)
    const prevEntry = this.entries.get(prevEntryName)

    // 当自定义 entry 名称存在，且和之前的 entry 名称不一致，则以传入的自定义名称为准
    if (
      customEntryName &&
      prevEntry?.entryName &&
      prevEntry.entryName !== customEntryName
    ) {
      return this.renameEntry(
        prevEntryName,
        customEntryName + realExtname,
        filePath,
        prevEntry
      )
    }
    // 当一个 npm 组件依赖多次被不同的 parent 添加
    // 则需要动态调整分组，如果不需要调整分组，则会直接返回
    else if (prevEntryName && prevEntry) {
      return this.alterEntryForSubpackageOptimize(
        prevEntryName,
        filePath,
        prevEntry,
        group
      )
    }

    // 相对路径的获取 需要区分 npm 和 普通文件
    let relativePath: string
    if (entryType === EntryType.npmComponent) {
      const i = filePath.indexOf(NODE_MODULES)
      // 检查是否真的为 npm 组件
      if (i === -1) {
        const error = new Error(
          `文件 ${filePath} 被错误的当做了 NPM 组件文件, 请检查逻辑`
        )
        logger.error(error.message, { error })
        return
      }
      // 第一 node_modules 转换为对应分包根目录下的 npm_components
      // xxx/node_modules/xxx/abc => npm_components/xxx/abc
      relativePath = path.join(
        group.name,
        NPM_MODULE_DIR,
        filePath.slice(i + NODE_MODULES.length)
      )
      // 替换剩余的 node_modules 为 npm_components
      relativePath = relativePath.replace(
        new RegExp(NODE_MODULES, 'gi'),
        NPM_MODULE_DIR
      )
    } else {
      relativePath = this.getRelativePathToSrcPaths(filePath, srcPaths)
    }

    let entryName: EntryName
    let isConditionalFile = false
    let priorityAmplifier = 0

    // 判断当前文件是否为条件编译的文件
    const relativePathWithoutExt = path.basename(relativePath, extname)
    if (
      this.conditionalFileExts.length &&
      this.conditionalFileExtsRegExp.test(relativePathWithoutExt)
    ) {
      isConditionalFile = true

      // 不同后缀的条件编译文件，优先级不一样, 当用户配置了多个条件编译的时候
      // 条件编译后缀的先后顺序需要能够, 影响到文件优先级
      // 计算方式为数组最后一个放大倍数为 0, 位置每前进一位 + 1
      // 负数重置为 0
      const conditionalExt = path.extname(relativePathWithoutExt)
      priorityAmplifier =
        this.conditionalFileExts.length -
        this.conditionalFileExts.indexOf(conditionalExt)
      priorityAmplifier = priorityAmplifier < 0 ? 0 : priorityAmplifier
    }

    entryType = entryType ?? EntryType.unknown
    const entryFileType = this.extToEntryFileType(extname)

    if (customEntryName) {
      // 如果传入了自定义 customEntryName 则直接使用
      entryName = customEntryName + realExtname
    }
    // 通过文件生成 entryName
    else {
      // 替换 entry 名称为转换后的名称
      //  如 file.wx.less => file.acss
      //    file.less => file.acss
      //    file.wx.ts => file
      //    file.ts => file
      // 同时获取 entry 的优先级
      if (isConditionalFile) {
        entryName = relativePath.replace(
          new RegExp(`${this.conditionalFileExtsPattern}\\${extname}$`, 'i'),
          realExtname
        )
      } else {
        entryName = relativePath.replace(
          new RegExp(`\\${extname}$`, 'i'),
          realExtname
        )
      }
    }
    // 统一计算 entry 的优先级
    const priority = this.calculateEntryPriority(
      extname,
      isConditionalFile,
      priorityAmplifier,
      entryType
    )

    // 文件条件编译: 过滤掉多余的文件
    if (this.entries.has(entryName)) {
      const preEntry = this.entries.get(entryName)

      // 设置 entry 记录
      this.entryRecords.set(filePath, entryName)

      if (preEntry.priority > priority) {
        return preEntry
      } else if (preEntry.priority === priority) {
        logger.warn(
          '检测到两个相同优先级的文件，将处理第一个文件并忽略第二个文件，请注意：\n' +
            `文件一：${preEntry.fullPath}\n` +
            `文件二：${filePath}\n` +
            '如引发非预期的问题，请自行处理文件冲突'
        )
        return preEntry
      }
    }

    let entryItem: EntryItem = {
      extname,
      entryReferType: entryReferType ? entryReferType : 'direct',
      // 如果 realExtname 不存在 则代表是 js 文件
      fullEntryName: realExtname ? entryName : entryName + '.js',
      // 去掉后缀的名称
      entryName: pathWithoutExtname(entryName),
      entryDir: path.dirname(entryName),
      entryType,
      entryFileType,
      // 原始相对路径 可能包含条件后缀, 这里仅做记录
      relativePath,
      // entry 原始文件的完整路径
      fullPath: filePath,
      priority
    }

    // 触发 addEntry hook 并优先使用返回的结果
    if (this.runner.hooks.addEntry.isUsed()) {
      const { name, entry } = this.runner.hooks.addEntry.call({
        name: entryName,
        entry: entryItem
      })
      entryName = name || entryName
      entryItem = entry || entryItem
    }

    // 设置 entry 记录
    this.entryRecords.set(filePath, entryName)

    // 保存 entry 信息
    this.entries.set(entryName, entryItem)

    return entryItem
  }

  /**
   * 计算 entry 的优先级
   * @param extname - 文件后缀名
   * @param isConditionalFile - 是否为条件编译文件
   * @param priorityAmplifier - 放大条件编译文件的优先级, 放大数字为 5 * priorityAmplifier
   * @param entryType - Entry 分类，根据类型返回既定值
   */
  private calculateEntryPriority(
    extname: string,
    isConditionalFile: boolean,
    priorityAmplifier: number = 0,
    entryType: EntryType
  ): EntryPriority {
    if (entryType === EntryType.custom) {
      return EntryPriority.CustomEntry
    }
    if (isConditionalFile) {
      // 按照优先级自动放大
      return EntryPriority.Conditional + 5 * priorityAmplifier
    }

    if (
      this.targetFileTypes.template === extname ||
      this.targetFileTypes.style === extname
    ) {
      return EntryPriority.Native
    }

    if (
      this.wechatFileTypes.template === extname ||
      this.wechatFileTypes.style === extname ||
      this.targetFileTypes.sjs === extname
    ) {
      return EntryPriority.Wechat
    }

    if (
      this.alipayFileTypes.template === extname ||
      this.alipayFileTypes.style === extname ||
      this.alipayFileTypes.sjs === extname
    ) {
      return EntryPriority.Alipay
    }

    return EntryPriority.Normal
  }

  /**
   * 需要将查找文件的上下文转换为虚拟的目录地址
   * @example
   * ```
   * 例如:
   *   假设 rootDirs 为 ['/aaa/dir1', '/bbb/ccc/dir2']
   *       contexts 为 ['/aaa/dir1/mmm']
   *   那么需要将 contexts 转换为 ['/aaa/dir1/mmm', '/bbb/ccc/dir2/mmm']
   *   以确保 rootDirs 中不同根目录下的文件可以相互引用
   * ```
   * @param contexts - 文件的上下文 目录地址, contexts 的来源可能是 父文件的目录也可能是 srcPaths
   * @param rootDirs - 根目录
   * @returns 转换后的上下文目录列表
   */
  private expandContextsAccordingToRootDirs(
    contexts: string[],
    rootDirs?: string[]
  ): Set<string> {
    let contextDirs: Set<string> = new Set()

    const roots = rootDirs?.length ? rootDirs : this.srcPaths

    if (contexts !== roots) {
      for (const context of contexts) {
        const contextDir = this.getRelativePathToSrcPaths(context, rootDirs)
        for (const root of roots) {
          contextDirs.add(path.resolve(root, contextDir))
        }
      }
    } else {
      contextDirs = new Set(roots)
    }

    return contextDirs
  }

  /**
   * ```
   * 基于 后缀的顺序，返回第一个命中的文件路径
   * 文件维度条件编译的核心逻辑
   * fileExts 参数中需要确保条件编译文件后缀优先于普通文件后缀
   * ```
   * @param fileName - 文件名称, 不含后缀
   * @param fileExts - 尝试获取的文件后缀列表
   * @param contexts - 文件的上下文 目录地址, contexts 的来源可能是 父文件的目录也可能是 srcPaths
   * @param parentPath - 引用该文件的路径, 主要用于输出警告信息, 可选值
   * @param rootDirs - 文件检索根目录, 默认为 srcPaths
   * @returns 返回第一个命中的文件
   */
  async tryReachFileByExts(
    fileName: string,
    fileExts: string[],
    contexts: string[],
    parentPath?: string,
    rootDirs?: string[]
  ): Promise<string> {
    // 确保无后缀
    const fileNameWithoutExt = pathWithoutExtname(fileName)

    const roots = rootDirs?.length ? rootDirs : this.srcPaths

    const contextDirs = this.expandContextsAccordingToRootDirs(contexts, roots)

    // 需要判断文件是否为绝对路径
    const isAbsolute = path.isAbsolute(fileName)

    // 支持多 context 返回查找到的第一个文件
    for await (const contextDir of contextDirs) {
      let filePath = fileNameWithoutExt

      if (isAbsolute) {
        // 绝对路径需要限制在 contextDir 之内
        filePath = filePath.startsWith(contextDir)
          ? filePath
          : path.join(contextDir, filePath)
      } else {
        filePath = path.resolve(contextDir, filePath)
      }

      for await (const ext of fileExts) {
        // 拼接后缀
        const finalPath = filePath + ext
        if (await this.fs.fileExists(finalPath)) {
          return finalPath
        }
      }
    }

    // 如果逻辑走到这里, 且路径包含 .. 则代表用户可能输入了错误的地址导致文件检索路径超出了
    // srcPaths 之外, 这里进行一次 fallback 查询, 将路径转化为绝对路径并输出警告
    if (fileName.startsWith('..')) {
      const fallbackFileName = path.resolve('/', fileName)
      const fallbackFilePath = await this.tryReachFileByExts(
        fallbackFileName,
        fileExts,
        roots,
        parentPath,
        roots
      )

      // 如果找到了, 输出警告和正确的路径提示
      if (fallbackFilePath) {
        const possibleFileName = pathWithoutExtname(
          path.relative(contexts[0], fallbackFilePath)
        )
        logger.warnOnce(
          `引用路径错误: ${fileName}, 请检查\n` +
            `可能的路径为: ${possibleFileName}` +
            (parentPath ? `\n引用的文件为: ${parentPath}` : '')
        )
      }

      return fallbackFilePath
    }
  }

  /**
   * 通过 glob 的方式构建 entry
   * * @param globPattern - 模式
   */
  async buildByGlob(globPattern?: string) {
    const { ignore } = this.userConfig
    const { compiler, watching } = this.webpackWrapper
    const fs = this.fs

    // fast-glob 不支持在 ignore 中使用 negative pattern
    // 详细参见: https://github.com/mrmlnc/fast-glob/issues/86
    // 这里做下兼容, 反向 ignore 模式会被放入 includePatterns 中且会全部应用
    const antiIgnorePatterns: string[] = []
    const ignorePattern: string[] = []
    asArray(ignore).map((pattern) => {
      if (pattern.includes('!')) {
        antiIgnorePatterns.push(pattern)
      } else {
        ignorePattern.push(pattern)
      }
    })
    const antiMatcher = micromatch.matcher('**', { ignore: antiIgnorePatterns })
    const isMatchAntiPatterns = function (str: string) {
      // 如果没有 negative pattern 则全部返回 true
      if (antiIgnorePatterns.length === 0) return true
      return antiMatcher(str)
    }
    const globOptions = {
      fs: fs as unknown as FS,
      ignore: ignorePattern,
      absolute: true,
      onlyFiles: true,
      unique: true,
      dot: true,
      cwd: this.runner.getCwd()
    }

    const { modifiedFiles } = compiler

    globPattern = globPattern || this.globPatterns

    // 支持多 srcPath 目录
    let globPatterns = this.srcPaths.map((srcPath) => {
      return slash(path.join(srcPath, '**', globPattern))
    })

    const addToGlobPattern = async (file: string, lastFile?: string) => {
      // 如果上一个处理的文件包含了当前文件
      // 则 可以认为 当前文件为 上一个文件的父级文件夹
      // 这种情况下跳过后续步骤
      if (lastFile && lastFile.startsWith(file)) return

      if (await fs.fileExists(file)) {
        globPatterns.push(slash(file))
      } else {
        globPatterns.push(slash(path.join(file, '**', globPattern)))
      }
    }

    // watch 模式下优化 glob 性能
    if (watching) {
      if (modifiedFiles?.size) {
        globPatterns = []
        let lastFile: string
        for await (const file of modifiedFiles) {
          await addToGlobPattern(file, lastFile)
          lastFile = file
        }
      }
    }

    const globStream = glob.stream(globPatterns, globOptions)
    for await (const p of globStream) {
      const filePath = p.toString()

      if (!isMatchAntiPatterns(filePath)) continue

      // glob 生成的路径为 posix 类型
      // 需要 normalize 为适配不同系统的路径
      const entryItem = this.addToEntry(path.normalize(filePath))

      // 额外处理一下文件，以建立引用关系
      if (entryItem?.entryFileType === EntryFileType.template) {
        await this.processXmlFileDependencies(entryItem)
      } else if (entryItem?.entryFileType === EntryFileType.sjs) {
        await this.processSjsFileDependencies(entryItem)
      }
    }
  }

  /**
   * 基于不同的 compileType 类型来解析入口的 entry 配置文件
   *
   * 不同 compileType 对应的问题为:
   * - miniprogram: app.json
   * - subpackage: subpackage.json
   * - plugin: plugin.json
   *
   * 注意: compileType 为 subpackage 时, 会优先从 context 中获取 subpackageJson
   *
   * 当 compileMode 为 transform 时, 不强制要求 entry 文件存在
   * @param compileType - 编译类型
   * @param compileMode - 编译模式
   * @returns 是否需要额外编译支持, 仅用于 transform 模式下未找到 entry 文件的情况
   */
  async buildByCompileType(compileType: CompileType, compileMode: CompileMode) {
    let appJson: IAppConfig
    const customEntries = this.userConfig?.customEntries || {}

    // 手动指定入口配置文件时，会有绝对路径，默认情况下 morjs 会限制绝对路径为 srcPaths 中
    // 这里兼容下 自定义入口文件 所在的文件夹
    const generateSearchPaths = (fileName: string) => {
      if (!path.isAbsolute(fileName)) return this.srcPaths
      const dirname = path.dirname(fileName)
      if (this.srcPaths.includes(dirname)) return this.srcPaths
      return [dirname].concat(this.srcPaths)
    }

    // 分包配置优先从 context 中获取
    // 如果可以拿到 则代表是独立分包
    let subpackageJson: ISubPackageConfig = this.context.get(
      INDEPENDENT_SUBPACAKGE_JSON
    )

    // 这里需要判断是支付宝还是微信的格式
    let pluginJson: Record<string, any>

    const isEntryFileRequired = compileMode === 'bundle'

    // 加载 小程序项目配置文件
    await this.tryAddProjectConfigFile()

    // 小程序配置
    const appEntry = customEntries['app.json'] || 'app'
    const searchPaths = generateSearchPaths(appEntry)
    const appJsonPath = await this.tryReachFileByExts(
      appEntry,
      this.configWithConditionalExts,
      searchPaths,
      null,
      searchPaths
    )

    // 尝试载入全局文件
    await this.tryAddGlobalFiles()

    // 全局 entry 通常指向 app.json 或 subpackage.json 或 plugin.json
    let globalEntry: EntryItem

    // 先载入 app.json
    if (appJsonPath) {
      try {
        appJson = await this.readAndPreprocessJsonLikeFile(appJsonPath)

        // 保存 app.json 文件地址
        this.globalConfigFilePath = appJsonPath
      } catch (error) {
        logger.error(`读取 app.json 失败: ${error.message}`, { error })
      }
    }

    // 小程序构建
    if (compileType === CompileTypes.miniprogram) {
      if (appJson) {
        globalEntry = await this.buildByApp(appJson, appJsonPath)
      } else {
        if (isEntryFileRequired) {
          logger.error(
            `未找到 app.json 文件, 请检查是否在 ${this.srcPaths.join(
              ', '
            )} 目录中`
          )
        }
      }
    }

    // 插件构建
    else if (compileType === CompileTypes.plugin) {
      const pluginEntry = customEntries['plugin.json'] || 'plugin'
      const searchPaths = generateSearchPaths(pluginEntry)
      const pluginJsonPath = await this.tryReachFileByExts(
        pluginEntry,
        this.configWithConditionalExts,
        searchPaths,
        null,
        searchPaths
      )

      if (pluginJsonPath) {
        pluginJson = await this.readAndPreprocessJsonLikeFile(pluginJsonPath)
        // 判断是否为 微信 的 plugin.json
        // 如果是 转换成 支付宝的 plugin.json
        if (isPlainObject(pluginJson?.pages)) {
          const publicPages = pluginJson.pages as Record<string, string>
          pluginJson = {
            publicComponents: pluginJson?.publicComponents || {},
            publicPages,
            pages: Object.values(publicPages)
          } as IPluginConfig
        }
        globalEntry = await this.buildByPlugin(pluginJson, pluginJsonPath)
      }

      // 如果 plugin.json 不存在, 则尝试使用 appJson 构建 plugin.json
      else if (appJson) {
        logger.warn(
          '未找到有效的 plugin.json, 尝试从 app.json 直接构建为小程序插件'
        )
        globalEntry = await this.buildByApp(
          appJson,
          appJsonPath,
          CompileTypes.plugin
        )
      } else {
        if (isEntryFileRequired) {
          logger.error(
            `未找到 plugin.json 文件, 请检查是否在 ${this.srcPaths.join(
              ', '
            )} 目录中`
          )
        }
      }
    }

    // 分包构建
    else if (compileType === CompileTypes.subpackage) {
      // 如果分包配置已存在, 则代表是独立分包构建, 直接进行后续流程
      if (subpackageJson) {
        globalEntry = await this.buildBySubPackage(subpackageJson)
      }
      // 否则尝试读取分包配置文件或从 app.json 中推断
      else {
        const subpackageEntry = customEntries['subpackage.json'] || 'subpackage'
        const searchPaths = generateSearchPaths(subpackageEntry)
        const subpackageJsonPath = await this.tryReachFileByExts(
          subpackageEntry,
          this.configWithConditionalExts,
          searchPaths,
          null,
          searchPaths
        )
        if (subpackageJsonPath) {
          subpackageJson = await this.readAndPreprocessJsonLikeFile(
            subpackageJsonPath
          )
          globalEntry = await this.buildBySubPackage(
            subpackageJson,
            subpackageJsonPath
          )
        }
        // 如果 subpackage.json 不存在, 则尝试使用 appJson 构建 subpackage.json
        else if (appJson) {
          logger.warn(
            '未找到有效的 subpackage.json, 尝试从 app.json 直接构建为小程序分包'
          )
          globalEntry = await this.buildByApp(
            appJson,
            appJsonPath,
            CompileTypes.subpackage
          )
        } else {
          if (isEntryFileRequired) {
            logger.error(
              `未找到 subpackage.json 文件, 请检查是否在 ${this.srcPaths.join(
                ', '
              )} 目录中`
            )
          }
        }
      }
    } else {
      throw new Error(`不支持的编译类型: ${compileType}, 请检查配置`)
    }

    // 添加自定义组件
    await this.tryAddCustomEntries(globalEntry)
  }

  /**
   * 加载小程序项目配置文件
   */
  private async tryAddProjectConfigFile() {
    const { target, compileType } = this.userConfig

    // 分包无需添加项目配置
    if (compileType === CompileTypes.subpackage) return

    const composedPlugins = getComposedCompilerPlugins()

    const projectConfigFiles = composedPlugins.projectConfigFiles[target] || []

    // 最后一个文件为实际要输出的 entry 文件名
    // 如果未取到值则代表不需要生成项目配置文件
    const projectConfigFileEntryName =
      projectConfigFiles[projectConfigFiles.length - 1]

    if (!projectConfigFileEntryName) return

    let projectConfigFile: string

    for await (const fileName of projectConfigFiles) {
      projectConfigFile = await this.tryReachFileByExts(
        fileName,
        this.configWithConditionalExts,
        this.srcPaths
      )

      if (projectConfigFile) break
    }

    if (projectConfigFile && projectConfigFileEntryName) {
      this.addToEntry(
        projectConfigFile,
        EntryType.project,
        'direct',
        undefined,
        undefined,
        pathWithoutExtname(projectConfigFileEntryName)
      )
    }
  }

  /**
   * 尝试载入自定义的 entries
   */
  private async tryAddCustomEntries(globalEntry: EntryItem) {
    try {
      await Promise.all(
        _.map(
          _.omit(
            this.userConfig?.customEntries || {},
            _.keys(RootEntryConfigFiles)
          ),
          async (filePathOrObject, entryName) => {
            if (entryName === 'pages') {
              await this.addPageEntries(
                (filePathOrObject as string[]) || [],
                globalEntry
              )
            } else if (entryName === 'components') {
              await this.addComponentEntries(
                ((filePathOrObject as string[]) || []).reduce((res, v) => {
                  res[v] = v
                  return res
                }, {}),
                globalEntry
              )
            } else {
              this.addToEntry(
                filePathOrObject as string,
                EntryType.custom,
                'direct',
                null,
                null,
                pathWithoutExtname(entryName)
              )
            }
          }
        )
      )
    } catch (error) {
      logger.error(
        `载入自定义 entries 失败，原因：${error?.message || '未知错误'}`,
        { error: error as Error }
      )
    }
  }

  /**
   * 处理 app.x 以及 mockAppEntry 逻辑
   * 插件优先使用 mor.plugin.app
   * 分包优先使用 mor.subpackage.app
   */
  private async tryAddGlobalFiles() {
    const { compileType, mockAppEntry, globalNameSuffix } = this.userConfig

    const globalAppName = mockAppEntry || 'app'
    let globalAppPrefix = ''

    this.globalAppName = globalAppName

    // 用户未自定义的情况下
    //   插件优先查找 mor.plugin.app
    //   分包优先查找 mor.subpackage.app
    if (globalAppName === 'app') {
      if (compileType === CompileTypes.plugin) {
        globalAppPrefix = 'mor.plugin.'
      }
      if (compileType === CompileTypes.subpackage) {
        globalAppPrefix = 'mor.subpackage.'
      }

      if (globalAppPrefix) {
        const fullAppName = globalAppPrefix + globalAppName

        // 全局脚本
        this.globalScriptFilePath = await this.tryReachFileByExts(
          fullAppName,
          this.scriptWithConditionalExts,
          this.srcPaths
        )

        // 设置正确的 app 名称
        if (this.globalScriptFilePath) this.globalAppName = fullAppName

        // 全局样式
        this.globalStyleFilePath = await this.tryReachFileByExts(
          fullAppName,
          this.styleWithConditionalExts,
          this.srcPaths
        )
      }
    }

    // 兜底检查
    // 全局脚本
    this.globalScriptFilePath = this.globalScriptFilePath
      ? this.globalScriptFilePath
      : await this.tryReachFileByExts(
          'app',
          this.scriptWithConditionalExts,
          this.srcPaths
        )
    // 全局样式
    this.globalStyleFilePath = this.globalStyleFilePath
      ? this.globalStyleFilePath
      : await this.tryReachFileByExts(
          'app',
          this.styleWithConditionalExts,
          this.srcPaths
        )

    // 支付宝 appx 1 构建时会为样式加上插件前缀, 但 app.acss 文件不会加
    // 导致即使引用了全局样式也不会生效, 所以这里需要对产物重命名一下
    // 另, 为保持统一 插件和分包的产物文件均以 MOR_APP_FILE 定义的名称为准
    const customEntryName =
      compileType === CompileTypes.plugin ||
      compileType === CompileTypes.subpackage
        ? MOR_APP_FILE(globalNameSuffix)
        : 'app'

    if (this.globalScriptFilePath) {
      this.addToEntry(
        this.globalScriptFilePath,
        EntryType.app,
        undefined,
        undefined,
        undefined,
        customEntryName
      )
    }

    if (this.globalStyleFilePath) {
      this.addToEntry(
        this.globalStyleFilePath,
        EntryType.app,
        undefined,
        undefined,
        undefined,
        customEntryName
      )
    }
  }

  /**
   * 尝试载入其他配置文件
   *  - sitemap.json
   *  - theme.json
   *  - preload.json
   *  - ext.json
   */
  private async tryLoadExtraConfigFiles(appJson: IAppConfig) {
    const configNames = ['sitemap', 'theme', 'preload', 'ext'] as const
    await Promise.all(
      configNames.map(async (configName) => {
        const configFile = await this.tryReachFileByExts(
          pathWithoutExtname(
            appJson?.[`${configName}Location`] || `${configName}.json`
          ),
          this.configWithConditionalExts,
          this.srcPaths
        )

        if (configFile) {
          this.addToEntry(configFile, EntryType[configName])
        }
      })
    )
  }

  /**
   * 解析 app.json
   * 以及 从 app.json 推断 plugin.json 或 subpackage.json
   * @param appJson 小程序配置内容
   * @param appJsonPath 小程序配置路径
   * @param compileType 编译类型, 可以指定为 plugin 或 subpackage, 用于模拟对应的配置
   */
  async buildByApp(
    appJson: IAppConfig,
    appJsonPath: string,
    compileType: CompileType = CompileTypes.miniprogram
  ) {
    this.appJson = appJson

    const compileMode = this.userConfig.compileMode

    let pages = appJson?.pages || []
    const subpackages = appJson.subpackages || appJson.subPackages || []

    // 用于插件
    const publicPages: Record<string, string> = {}

    // 分组页面, 基于分包
    const groupedPages: Record<string, string[]> = {}

    pages.forEach((page) => {
      publicPages[page] = page
      if (!groupedPages[MAIN_GROUP_NAME]) groupedPages[MAIN_GROUP_NAME] = []
      groupedPages[MAIN_GROUP_NAME].push(page)
    })

    // 清空独立分包配置
    this.independentSubpackages.clear()

    // 组合分包中所有页面
    pages = pages.concat(
      subpackages.reduce((result, subpackage): string[] => {
        // 检查是否是独立分包
        if (compileMode === CompileModes.bundle && subpackage?.independent) {
          if (subpackage?.pages?.length && subpackage.root) {
            // 独立分包配置剥离出来
            this.independentSubpackages.set(subpackage.root, subpackage)
          }
          return result
        }
        // 正常的包构建逻辑
        else {
          if (subpackage?.independent) {
            logger.warn(
              `当前编译模式 \`${compileMode}\` 不支持独立分包构建\n` +
                `分包: ${subpackage.root} 将按照普通分包编译\n` +
                `如需启用独立分包编译, 请使用 \`${CompileModes.bundle}\` 编译模式`
            )
          }

          return result.concat(
            (subpackage?.pages || []).map((page) => {
              const p = path.join(subpackage.root, page)
              publicPages[p] = p

              // 添加组
              if (!groupedPages[subpackage.root]) {
                groupedPages[subpackage.root] = []
              }
              groupedPages[subpackage.root].push(p)

              return p
            })
          )
        }
      }, [])
    )

    const shouldAnalyze = await this.shouldAnalyzeFileDepenencies(appJsonPath)

    const entry = this.addToEntry(
      appJsonPath,
      EntryType.app,
      'direct',
      null,
      null,
      'app'
    )

    // 判断是否需要继续分析依赖
    if (shouldAnalyze === false) return entry

    // 处理 小程序
    if (compileType === CompileTypes.miniprogram) {
      for await (const groupName of Object.keys(groupedPages)) {
        await this.addPageEntries(groupedPages[groupName], entry, groupName)
      }

      // 微信小程序全局组件支持
      // 需要将全局组件追加到所有非 npm 的页面和组件中
      const globalComponents = { ...(appJson?.usingComponents || {}) }

      // 自定义 tabBar 支持
      if (appJson?.tabBar?.custom) {
        // 将自定义组件文件作为全局组件处理
        globalComponents['custom-tab-bar'] = '/custom-tab-bar/index'
      }

      // 添加自定义组件相关文件
      await this.addComponentEntries(globalComponents, entry, undefined, true)

      // 添加小程序相关的其他配置文件
      await this.tryLoadExtraConfigFiles(appJson)
    }

    // 通过 appJson 组装 subpackageJson
    // 条件约定: 自动取用 package.json 中的 name 字段
    //          并将所有非 英文、数字、下划线和中划线 的字符替换为下划线
    else if (compileType === CompileTypes.subpackage) {
      if (!this.projectName) {
        logger.error(
          '无法自动从 app.json 中自动组装 subpackage.json, ' +
            '请设置 package.json 中的 name 字段, ' +
            '或增加 subpackage.json 配置文件'
        )
      } else {
        await this.buildBySubPackage(
          {
            root: this.projectName,
            pages
          },
          null,
          entry
        )
      }
    }

    // 通过 appJson 组装 pluginJson 内容
    else if (compileType === CompileTypes.plugin) {
      // 这里统一按照 支付宝的 plugin.json 来
      await this.buildByPlugin(
        {
          pages,
          publicPages,
          publicComponents: {}
        },
        null,
        entry
      )
    }

    return entry
  }

  /**
   * 解析 subpackage.json 并构建 entry
   * @param subpackageJson 分包配置内容
   * @param subpackageJsonPath 分包配置路径
   * @param parentEntry 父级 entry
   */
  async buildBySubPackage(
    subpackageJson: ISubPackageConfig,
    subpackageJsonPath?: string,
    parentEntry?: EntryItem
  ) {
    // 保存 分包配置
    this.subpackageJson = subpackageJson

    // 分包配置可能来自于 app.json
    let entry = parentEntry

    // 添加分包配置文件
    if (subpackageJsonPath) {
      const shouldAnalyze = await this.shouldAnalyzeFileDepenencies(
        subpackageJsonPath
      )

      entry = this.addToEntry(
        subpackageJsonPath,
        EntryType.subpackage,
        'direct',
        parentEntry,
        null,
        'subpackage'
      )

      // 判断是否需要继续分析依赖
      if (shouldAnalyze === false) return entry
    }

    await this.addPageEntries(subpackageJson.pages || [], entry)

    return entry
  }

  /**
   * 解析 plugin.json 并构建 entry
   * @param pluginJson - 插件配置内容
   * @param pluginJsonPath - 插件配置路径
   * @param parentEntry - 父级 entry
   */
  async buildByPlugin(
    pluginJson: IPluginConfig,
    pluginJsonPath?: string,
    parentEntry?: EntryItem
  ) {
    // 保存 插件配置
    this.pluginJson = pluginJson

    // 插件配置可能来自于 app.json
    let entry = parentEntry

    // 添加插件配置文件,
    if (pluginJsonPath) {
      const shouldAnalyze = await this.shouldAnalyzeFileDepenencies(
        pluginJsonPath
      )

      entry = this.addToEntry(
        pluginJsonPath,
        EntryType.plugin,
        'direct',
        parentEntry,
        null,
        'plugin'
      )
      // 判断是否需要继续分析依赖
      if (shouldAnalyze === false) return entry
    }

    // 添加插件的 main 文件
    if (pluginJson.main) {
      const pluginMainFile = await this.tryReachFileByExts(
        pluginJson.main,
        this.scriptWithConditionalExts,
        this.srcPaths
      )

      if (pluginMainFile) {
        this.addToEntry(pluginMainFile, EntryType.plugin, 'direct', entry)
      }
    }

    await Promise.all([
      await this.addPageEntries(pluginJson.pages || [], entry),
      await this.addComponentEntries(
        pluginJson.publicComponents || {},
        entry,
        undefined,
        true
      )
    ])

    return entry
  }

  /**
   * 添加页面 entries
   * @param pages - 页面数组, 支持数组或对象, 对象可用于指定自定义 entry 名称
   * @param parentEntry - 父级 entry
   * @param groupName - 分组名称
   * @param rootDirs - 文件检索根目录, 可选, 默认为 srcPaths
   */
  async addPageEntries(
    pages: string[] | Record<string, string>,
    parentEntry: EntryItem,
    groupName?: string,
    rootDirs?: string[]
  ): Promise<void> {
    const hasCustomEntryName = !Array.isArray(pages || [])

    await Promise.all(
      _.map(pages, (pagePath, entryName) => {
        return this.tryAddEntriesFromPageOrComponent(
          pagePath as string,
          EntryType.page,
          parentEntry,
          null,
          groupName,
          undefined,
          hasCustomEntryName ? entryName : undefined,
          rootDirs
        )
      })
    )
  }

  /**
   * 获取路径中的 npm 包名
   * @param filePath - 引用路径
   */
  getPackageName(filePath: string) {
    let packageName = this.pathAndPackageNames.get(filePath)
    if (packageName) return packageName

    const char = filePath.charAt(0)
    const split = filePath.split('/')
    packageName = split[0]
    if (char === '@') packageName = [split[0], split[1]].join('/')

    this.pathAndPackageNames.set(filePath, packageName)
    return packageName
  }

  /**
   * 添加组件 entries
   * @param components - 组件对象
   * @param parentEntry - 上一级 EntryItem
   * @param rootDirs - 文件检索根目录, 可选, 默认为 srcPaths
   * @param preferRelative - 是否倾向于按照相对目录解析组件
   * @param componentPlaceholder - 占位组件配置
   */
  async addComponentEntries(
    components: Record<string, string> = {},
    parentEntry: EntryItem,
    rootDirs?: string[],
    preferRelative?: boolean,
    componentPlaceholder: Record<string, string> = {}
  ) {
    // 保存 entry 使用 自定义组件的映射
    const usingComponentNames = Object.keys(components)
    this.usingComponentsMap.set(parentEntry.entryName, usingComponentNames)

    // 批量解析自定义组件
    await Promise.all(
      usingComponentNames.map((name) => {
        const component = components[name]
        // 当标记为不处理 componentPlaceholder 时
        // 如果占位组件中包含当前组件, 则跳过编译部分
        if (
          this.userConfig.processPlaceholderComponents === false &&
          componentPlaceholder?.[name]
        ) {
          logger.debug(
            `自定义组件 '${name}' 被标记为了占位组件, 将跳过编译\n引用文件: ${
              parentEntry?.fullPath || '未知'
            }`
          )
          return
        }

        let entryType: EntryType

        // 如果父级 entry 为 npmComponent
        // 则通常 父级引用的文件也是 npmComponent
        if (parentEntry?.entryType === EntryType.npmComponent) {
          entryType = EntryType.npmComponent
        } else {
          // 识别插件组件
          if (component.startsWith('plugin://')) {
            entryType = EntryType.pluginComponent
          }
          // 识别普通组件
          else if (component.startsWith('.') || component.startsWith('/')) {
            entryType = EntryType.component
          }
          // 其余的作为 npm 插件
          else {
            entryType = EntryType.npmComponent
          }
        }

        // 需要判断 组件来源，可能来源于 npm
        return this.tryAddEntriesFromPageOrComponent(
          component,
          entryType,
          parentEntry,
          undefined,
          undefined,
          undefined,
          undefined,
          rootDirs,
          preferRelative
        )
      })
    )
  }

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
  async tryAddEntriesFromPageOrComponent(
    referencePath: string,
    entryType: EntryType,
    parentEntry: EntryItem,
    fileType?: EntryFileType,
    groupName?: string,
    entryReferType?: EntryReferType,
    customEntryName?: string,
    rootDirs?: string[],
    preferRelative?: boolean
  ): Promise<void | EntryItem> {
    // 不处理插件中的组件
    if (entryType === EntryType.pluginComponent) return

    // 判断是否需要处理页面或组件
    if (
      this.runner.hooks.shouldAddPageOrComponent.call(referencePath, {
        entryType,
        entryFileType: fileType,
        parentEntry,
        groupName
      }) === false
    ) {
      return
    }

    // 基于类型 展开 entry 获取
    if (!fileType) {
      await Promise.all([
        this.tryAddEntriesFromPageOrComponent(
          referencePath,
          entryType,
          parentEntry,
          EntryFileType.script,
          groupName,
          undefined,
          customEntryName,
          rootDirs,
          preferRelative
        ),
        this.tryAddEntriesFromPageOrComponent(
          referencePath,
          entryType,
          parentEntry,
          EntryFileType.template,
          groupName,
          undefined,
          customEntryName,
          rootDirs,
          preferRelative
        ),
        this.tryAddEntriesFromPageOrComponent(
          referencePath,
          entryType,
          parentEntry,
          EntryFileType.config,
          groupName,
          undefined,
          customEntryName,
          rootDirs,
          preferRelative
        ),
        this.tryAddEntriesFromPageOrComponent(
          referencePath,
          entryType,
          parentEntry,
          EntryFileType.style,
          groupName,
          undefined,
          customEntryName,
          rootDirs,
          preferRelative
        )
      ])

      return
    }

    const roots = rootDirs?.length ? rootDirs : this.srcPaths

    /* 以下逻辑为: entry 路径获取  */

    // entry 完整路径
    let filePath: string

    const isAbsolutePath = path.isAbsolute(referencePath)

    // 用于查找引用文件的目录
    const baseDir = parentEntry ? path.dirname(parentEntry.fullPath) : ''

    // 如果 entry 类型为 npmComponent 或 父级 entry 类型为 npmComponent
    // 则当前文件 均当做 npmComponent 处理
    if (
      entryType === EntryType.npmComponent ||
      parentEntry?.entryType === EntryType.npmComponent
    ) {
      if (isAbsolutePath) {
        logger.warnOnce(
          '目前尚未支持在组件库中以 / 开头的 usingComponents 地址, 可能会引起问题\n' +
            `文件类型: ${fileType}\n` +
            parentEntry
            ? `引用的文件为: ${parentEntry.fullPath}\n`
            : ''
        )
        return
      }

      // 允许 npm 多端组件缺少文件：
      // 1. 样式文件
      // 2. 如果编译模式不是 bundle 则允许找不到组件库文件，原因是 transform 模式不编译组件库
      const allowMissingNpmFiles =
        (parentEntry?.entryFileType === EntryFileType.config &&
          fileType === EntryFileType.style) ||
        this.userConfig.compileMode !== CompileModes.bundle

      // npm 中不支持 条件后缀
      const propName: ExtsPropName = `${fileType}Exts`
      filePath = await this.resolveRealFilePath(
        baseDir || roots[0],
        referencePath,
        true,
        // 如果是样式文件未找到, 不报错
        allowMissingNpmFiles ? true : false,
        // 指定后缀
        preferRelative == null
          ? { extensions: this[propName] }
          : { extensions: this[propName], preferRelative }
      )

      // debug 信息中警告缺少的文件
      if (!filePath) {
        logger.debug(
          `未找到文件: ${referencePath}\n` +
            `文件类型: ${fileType}\n` +
            parentEntry
            ? `引用的文件为: ${parentEntry.fullPath}\n`
            : ''
        )
        return
      }

      // 如果路径中不包含 node_modules
      // 且 当前组件被错误标记为 npm 组件
      // 则此处矫正为普通组件
      // 通常的场景为:
      //   1. 通过 alias 将本地文件或目录配置为了 npm 的模块
      //   2. 在 package.json 的 dependencies 或 devDependencies 直接将依赖映射为本地文件
      //   3. npm 中真的引用了 node_modules 之外的文件 (虽然属于很奇怪的用法, 但这里也支持)
      if (
        entryType === EntryType.npmComponent &&
        !filePath.includes(NODE_MODULES)
      ) {
        logger.debug(
          `引用文件: ${referencePath}\n` +
            `文件类型: ${fileType}\n` +
            '被标记为: npmComponent\n' +
            `已更正为: component\n` +
            (parentEntry?.entryType === EntryType.npmComponent
              ? `NPM 组件: ${parentEntry.fullPath}, 引用了 node_modules 之外的文件, 可能会引起问题\n`
              : '')
        )
        entryType = EntryType.component
      }
      // 如果 entry 类型为未知，但文件路径中包含了 node_modules
      // 则矫正 entryType 为 npmComponent
      else if (
        entryType === EntryType.unknown &&
        filePath.includes(NODE_MODULES)
      ) {
        logger.debug(
          `引用文件: ${referencePath}\n` +
            `文件类型: ${fileType}\n` +
            '被标记为: unknown\n' +
            `已更正为: npmComponent\n`
        )
        entryType = EntryType.npmComponent
      }
    }

    // 普通文件路径获取
    else {
      const propName: ConditionalExtsPropName = `${fileType}WithConditionalExts`

      filePath = await this.tryReachFileByExts(
        referencePath,
        this[propName],
        // 如果是绝对路径, 则限制在 roots 之内
        !isAbsolutePath && baseDir ? [baseDir] : roots,
        parentEntry ? parentEntry.relativePath : undefined,
        roots
      )

      // 如果文件不存在, 有可能是使用了 alias 配置导致的
      // 这里使用 enhanced-resolver 再尝试寻找一次文件
      if (!filePath) {
        filePath = await this.resolveRealFilePath(
          baseDir || roots[0],
          referencePath,
          false,
          true,
          // 指定后缀, 且不查询 node_modules
          { extensions: this[propName], modules: [] }
        )
      }
    }

    // 如果文件不存在 则不执行后续逻辑
    if (!filePath) {
      // 样式文件和配置文件非必须, 可以不输出警告
      if (
        parentEntry?.entryFileType === EntryFileType.config &&
        fileType !== EntryFileType.style &&
        fileType !== EntryFileType.config
      ) {
        logger.warnOnce(
          `未找到文件: ${referencePath}\n` +
            `文件类型: ${fileType}` +
            (parentEntry ? `\n引用的文件为: ${parentEntry.relativePath}` : '')
        )
      }
      return
    }

    // 建立文件之间的引用映射
    // 用于换取后续真实引用相对路径
    if (parentEntry?.fullPath) {
      this.linkReferenceRelationShip(
        parentEntry.fullPath,
        referencePath,
        filePath
      )
    }

    const shouldAnalyze = await this.shouldAnalyzeFileDepenencies(filePath)

    // 添加到 entry
    const entry = this.addToEntry(
      filePath,
      entryType,
      entryReferType ?? 'direct',
      parentEntry,
      groupName,
      customEntryName,
      rootDirs
    )

    // 添加失败 或 entry 被忽略
    if (!entry) return

    // 判断是否需要继续分析依赖
    // 如果不需要 则直接返回 entry
    if (shouldAnalyze === false) return entry

    // 解析 json 文件
    // 除了 json 文件以外的文件交给 webpack 解析依赖
    if (fileType === EntryFileType.config) {
      let pageOrComponentConfig: IUsingComponentConfig

      try {
        pageOrComponentConfig = await this.readAndPreprocessJsonLikeFile(
          filePath
        )
      } catch (error) {
        logger.error(
          `小程序${entryType === EntryType.page ? '页面' : '组件'}` +
            `配置信息载入失败: ${filePath}`,
          { error }
        )
      }

      // 自定义组件
      const usingComponents = {
        ...(pageOrComponentConfig?.usingComponents || {})
      }

      // 自定义组件的抽象节点支持
      // 将抽象节点的默认组件插入 usingComponents 中去解析
      // 组件名称固定使用 componentGenerics_${key}
      const componentGenerics = pageOrComponentConfig?.componentGenerics || {}
      _.forEach(componentGenerics, function (val, key) {
        if (typeof val === 'object' && typeof val?.default === 'string') {
          usingComponents[`componentGenerics_${key}`] = val.default
        }
      })

      // 继续解析 usingComponents
      await this.addComponentEntries(
        usingComponents,
        entry,
        roots,
        undefined,
        pageOrComponentConfig?.componentPlaceholder || {}
      )
    }
    // 解析 sjs 依赖
    else if (fileType === EntryFileType.sjs) {
      try {
        await this.processSjsFileDependencies(entry, undefined, roots)
      } catch (error) {
        logger.error(`文件 ${entry.relativePath} 依赖解析失败`, { error })
      }
    }
    // 解析 *xml 依赖
    else if (fileType === EntryFileType.template) {
      try {
        await this.processXmlFileDependencies(entry, roots)
      } catch (error) {
        logger.error(`文件 ${entry.relativePath} 依赖解析失败`, { error })
      }
    }

    return entry
  }

  /**
   * 建立文件和文件之间的引用映射及引用真实路径关系
   * @param parentPath - 父路径
   * @param referencePath - 引用路径
   * @param referenceRealPath - 引用真实路径
   */
  private linkReferenceRelationShip(
    parentPath: string,
    referencePath: string,
    referenceRealPath: string
  ) {
    const record = this.referencesMap.get(parentPath) || {}
    record[referencePath] = referenceRealPath
    this.referencesMap.set(parentPath, record)
  }

  /**
   * 处理 *xml 文件的依赖
   * @param entry - 当前文件 entry
   * @param rootDirs - 文件检索根目录, 可选, 默认为 srcPaths
   */
  private async processXmlFileDependencies(
    entry: EntryItem,
    rootDirs?: string[]
  ) {
    const { target } = this.userConfig
    const composedPlugins = getComposedCompilerPlugins()

    const fileContent = (await this.fs.readFile(entry.fullPath)).toString(
      'utf-8'
    )

    if (!fileContent) return
    if (!this.tempalteImportTagRegExp.test(fileContent)) return

    const templateImportPaths: string[] = []
    const sjsImportPaths: string[] = []
    let sjsContents: string[] = []

    // 解析文件相关路径
    await templateTransformer(
      fileContent,
      {
        userConfig: this.userConfig,
        fileInfo: {
          path: entry.fullPath,
          content: fileContent,
          extname: entry.extname,
          entryType: entry.entryType,
          entryFileType: entry.entryFileType
        }
      },
      [],
      composedPlugins.templateSingleTagClosingType?.[target],
      (tree) => {
        tree.walk((node) => {
          // 先解析 template 引用
          if (node.tag === 'import' || node.tag === 'include') {
            if (node.attrs?.['src'])
              templateImportPaths.push(node.attrs?.['src'])
            return node
          }

          // 然后解析 sjs 引用
          if (
            node.tag === composedPlugins.sjsTagName[target] ||
            node.tag === composedPlugins.sjsTagName[SourceTypes.wechat] ||
            node.tag === composedPlugins.sjsTagName[SourceTypes.alipay]
          ) {
            if (node.attrs?.['src']) {
              sjsImportPaths.push(node.attrs?.['src'])
            } else if (node.attrs?.['from']) {
              sjsImportPaths.push(node.attrs?.['from'])
            } else if (node.content?.length) {
              sjsContents = sjsContents.concat(sjsContents)
            }
          }

          return node
        })
      }
    )

    // npm 组件中的文件自动继承 entryType
    const entryType =
      entry.entryType === EntryType.npmComponent
        ? EntryType.npmComponent
        : EntryType.unknown

    // 处理 template 引用
    for await (const importPath of templateImportPaths) {
      await this.tryAddEntriesFromPageOrComponent(
        importPath,
        entryType,
        entry,
        EntryFileType.template,
        undefined,
        undefined,
        undefined,
        rootDirs
      )
    }

    // 处理 sjs 引用
    for await (const importPath of sjsImportPaths) {
      await this.tryAddEntriesFromPageOrComponent(
        importPath,
        entryType,
        entry,
        EntryFileType.sjs,
        undefined,
        undefined,
        undefined,
        rootDirs
      )
    }

    // 处理 sjs 内容
    for await (const content of sjsContents) {
      await this.processSjsFileDependencies(entry, content, rootDirs)
    }
  }

  /**
   * 解析 sjs 依赖
   * @param entry - 当前文件 entry
   * @param content - 当前文件内容
   * @param rootDirs - 文件检索根目录, 可选, 默认为 srcPaths
   */
  private async processSjsFileDependencies(
    entry: EntryItem,
    content?: string,
    rootDirs?: string[]
  ) {
    const fileContent =
      content == null
        ? (await this.fs.readFile(entry.fullPath)).toString('utf-8')
        : content

    if (!fileContent) return

    // 不包含引用时 直接跳过
    if (!fileContent.includes('import') && !fileContent.includes('require')) {
      return
    }

    const importPaths: string[] = []

    // 解析 引用的文件路径
    await scriptTransformer(
      fileContent,
      EntryFileType.sjs,
      {
        userConfig: this.userConfig,
        fileInfo: {
          path: entry.fullPath,
          content: fileContent,
          extname: entry.extname,
          entryType: entry.entryType,
          entryFileType: entry.entryFileType
        }
      },
      {
        before: [
          tsTransformerFactory((node) => {
            let importPath: string

            if (ts.isImportDeclaration(node)) {
              importPath = node.moduleSpecifier.getText()
            } else if (
              ts.isCallExpression(node) &&
              ts.isIdentifier(node.expression) &&
              node.expression.escapedText === 'require'
            ) {
              if (node.arguments && node.arguments.length) {
                const arg = node.arguments[0]
                if (ts.isStringLiteral(arg)) {
                  importPath = arg.getText()
                } else {
                  logger.warn('尚未支持的 require 方式: ' + entry.fullPath)
                }
              } else {
                logger.warn('尚未支持的 require 方式: ' + entry.fullPath)
              }
            }

            if (importPath) {
              importPath = importPath
                .replace(/^('|")/, '')
                .replace(/('|")$/, '')
              importPaths.push(importPath)
            }

            return node
          })
        ]
      }
    )

    // npm 组件中的文件自动继承 entryType
    const entryType =
      entry.entryType === EntryType.npmComponent
        ? EntryType.npmComponent
        : EntryType.unknown

    // 逐个解析 sjs 依赖
    for await (const importPath of importPaths) {
      await this.tryAddEntriesFromPageOrComponent(
        importPath,
        entryType,
        entry,
        EntryFileType.sjs,
        undefined,
        undefined,
        undefined,
        rootDirs
      )
    }
  }

  /**
   * 获取 webpack normal resolver
   * @param options - ResolverOptions 用于传递给 resolver
   */
  private getResolver(options?: webpack.ResolveOptions): webpack.Resolver {
    return this.webpackWrapper.compiler.resolverFactory.get('normal', options)
  }

  /**
   * 解析 npm 文件的真实路径
   * @param contextDir - 上下文所在的文件夹
   * @param requestPath - 请求路径
   * @param fromNodeModules - 是否查找 node_modules, 代表是否启用 多端组件规范
   * @param suppressError - 是否忽略 错误
   * @param options - ResolverOptions 用于传递给 resolver
   */
  private async resolveRealFilePath(
    contextDir: string,
    requestPath: string,
    fromNodeModules: boolean,
    suppressError: boolean,
    options?: webpack.ResolveOptions
  ): Promise<string> {
    const resolver = this.getResolver(options)
    const { realPath, result } = (await new Promise((resolve, reject) => {
      resolver.resolve(
        {},
        contextDir,
        requestPath,
        {},
        (err, realPath, result) => {
          if (err)
            return suppressError
              ? resolve({ realPath: realPath || '', result })
              : reject(err)
          if (realPath) {
            resolve({ realPath: realPath, result })
          } else {
            if (suppressError) {
              resolve({ realPath: '', result })
            } else {
              reject(new Error(`未在 node_modules 中找到文件: ${requestPath}`))
            }
          }
        }
      )
    })) as {
      realPath: string
      result: Parameters<Parameters<typeof resolver.resolve>[4]>[2]
    }

    if (fromNodeModules) {
      // 如果未找到且标记了忽略错误, 则直接返回
      if (suppressError && !realPath) return realPath

      return await this.replaceRealPathByTarget(
        realPath,
        requestPath,
        // webpack 的 resolve 中包含了 包 信息
        // 这里直接 复用 减少重复解析
        result.descriptionFileData,
        result.descriptionFileRoot
      )
    } else {
      return realPath
    }
  }

  /**
   * 替换文件路径为 构建目标 真正需要的文件路径
   * 主要目的为: 支持多端组件库
   * 路径替换需要遵从 《多端组件库规范》
   * @param realPath - 文件真实路径
   * @param requestPath - 实际请求的路径
   * @param packageJson - package.json 文件内容
   * @param packagePath - package.json 文件地址
   */
  private async replaceRealPathByTarget(
    realPath: string,
    requestPath: string,
    packageJson: any,
    packagePath: string
  ): Promise<string> {
    const { target, processNodeModules } = this.userConfig
    const mainFields = getComposedCompilerPlugins().resolveMainFields[target]

    const packageName = packageJson?.name || this.getPackageName(requestPath)

    // 保存文件和 npm 包名的映射
    if (!this.pathAndPackageNames.has(requestPath)) {
      this.pathAndPackageNames.set(requestPath, packageName)
    }
    if (!this.usedNpmPackages.has(packageName)) {
      this.usedNpmPackages.set(packageName, packagePath)
    }

    let mainField = this.npmMainFields.get(packageName)

    // 如果 不存在 则基于 package.json 的内容分析
    if (!mainField) {
      for (const field of mainFields) {
        // main 和 module 作为 npm 的标准配置字段存在
        // 这里统一作为兜底支持
        if (packageJson?.[field] && field !== 'main' && field !== 'module') {
          mainField = packageJson?.[field]
          break
        }
      }

      if (mainField) {
        // 有后缀，lib/index.js 这种写法
        if (path.extname(mainField)) mainField = path.dirname(mainField)

        const isDirExists = await this.fs.pathExists(
          path.join(packagePath, mainField)
        )

        if (!isDirExists) {
          // 无后缀, 如 lib/index 这种写法
          mainField = path.dirname(`${mainField}.js`)
        }

        // 缓存 mainField
        if (!this.npmMainFields.has(packageName)) {
          this.npmMainFields.set(packageName, mainField)
        }
      }
    }

    // 要替换的路径
    const modulePath = path.normalize(`/node_modules/${packageName}/`)
    let newModulePath = modulePath
    let mainFieldPath = ''

    // NOTE: 这里有逻辑问题
    // 支持的路径为  lib
    //             wechat/lib
    // 有点奇怪，需要按照多端组件库的规范以及对上述内容的兼容

    // 如果存在, 则进行路径替换
    if (mainField) {
      // 这种情况下，引用的路径已经包含了 mainField 的内容了
      if (!realPath.includes(path.normalize(`${modulePath}${mainField}/`))) {
        mainFieldPath = path.normalize(`${mainField}/`)
      }
    }

    newModulePath = newModulePath + mainFieldPath

    const finalPath = realPath.includes(newModulePath)
      ? realPath
      : realPath.replace(modulePath, newModulePath)

    return shouldProcessFileByPlugins(finalPath, processNodeModules, false)
      ? finalPath
      : this.replaceExtAsExpected(finalPath)
  }

  /**
   * 替换文件后缀为期望的后缀，用于解决源代码后缀和目标产物文件后缀不同的情况
   * @param filePath - 原始文件路径
   * @returns 替换过后缀的文件路径
   */
  public replaceExtAsExpected(filePath: string) {
    const extname = path.extname(filePath)
    const expectedExtname = this.extMap[extname] || extname
    if (extname === expectedExtname) return filePath
    return path.join(
      path.dirname(filePath),
      path.basename(filePath, extname) + expectedExtname
    )
  }
}
