import { fileType } from '@morjs/plugin-compiler-alipay'
import {
  asArray,
  EntryBuilderHelpers,
  EntryItem,
  slash,
  webpack,
  WebpackUserConfig
} from '@morjs/utils'
import path from 'path'
import { BuildOptions } from '../compiler/core/option'
import { defaultConditionalFileExt } from '../constants'

export interface WebLoaderOptions {
  /**
   * 全局组件名称的配置关系
   */
  globalComponentsConfig: object

  /**
   * 全局自定义组件
   */
  usingComponents?: object

  /**
   * rpx 方案的 root value。默认是32。也就是 16*2
   */
  rpxRootValue?: number

  /**
   * 是否使用 rpx2rem 插件对 rpx 单位进行转换
   */
  needRpx?: boolean
  /**
   * 默认编译出来的样式会以 rem 为单位，
   * 配合 runtime 层提供的 setRootFontSizeForRem 方法可以实现移动端的响应式。
   * 如果不想将样式单位编译成 rem 可以配置该对象，
   * 对象中包含一个参数 ratio 用于指定 rpx 2 px 的转换比例。
   * 如 ratio 为 1， 那么 1rpx = 1px， 如果配置 ratio 为 2， 那么 1rpx = 0.5px
   */
  usePx?: { ratio?: number }
  /**
   * 是否需要样式隔离，如果开启该功能，在编译时会给样式加上唯一 hash 值，用于多页面解决样式冲突问题
   */
  styleScope?: boolean

  /**
   *  平台 小写。默认 h5
   */
  platform?: string

  /**
   * 文件条件编译后缀
   */
  conditionalCompileFileExt?: string[]

  /**
   * entry builder helpers
   */
  entryBuilder: EntryBuilderHelpers

  /**
   * 用户配置
   */
  userConfig: WebpackUserConfig & { compileType: string; [k: string]: any }
}

type LoaderCompileMethod = (options: BuildOptions) => Promise<string>

export class LoaderBuilder {
  static process(
    loader: webpack.LoaderContext<WebLoaderOptions>,
    fn: LoaderCompileMethod
  ) {
    return new LoaderBuilder(loader).compile(fn)
  }

  private loader: webpack.LoaderContext<WebLoaderOptions>

  private loaderOptions: WebLoaderOptions

  private entryBuilder: EntryBuilderHelpers

  private userConfig: WebLoaderOptions['userConfig']

  /**
   * 是否为组件编译模式
   */
  private isAtomicMode: boolean
  /**
   * 关联文件
   */
  relevantPaths: Pick<
    BuildOptions,
    'scriptFilePath' | 'templateFilePath' | 'styleFilePath' | 'configFilePath'
  >

  /**
   * 获取关联的 entries
   */
  relevantEntries: {
    scriptEntry?: EntryItem
    templateEntry?: EntryItem
    styleEntry?: EntryItem
    configEntry?: EntryItem
  }

  private callback: ReturnType<webpack.LoaderContext<WebLoaderOptions>['async']>

  constructor(loader: webpack.LoaderContext<WebLoaderOptions>) {
    this.loader = loader
    this.loaderOptions = loader.getOptions()
    this.userConfig = this.loaderOptions.userConfig
    this.isAtomicMode = this.userConfig?.compileMode !== 'bundle'
    this.entryBuilder = this.loaderOptions.entryBuilder
    this.callback = loader.async()
    this.getRelevants(loader.resourcePath)
  }

  private getResourceName() {
    const name = path.parse(this.loader.resourcePath).name
    const conditionalFileExts =
      this.loaderOptions.conditionalCompileFileExt ||
      asArray(defaultConditionalFileExt)
    if (!conditionalFileExts.length) return name
    return name.replace(
      new RegExp(
        `\\.(${conditionalFileExts.map((e) => e.slice(1)).join('|')})$`
      ),
      ''
    )
  }

  // 创建当前文件的编译选项
  async generateOptions(): Promise<BuildOptions> {
    const opts = this.loaderOptions

    const appConfig =
      (await this.loadAppConfig()) || ({} as BuildOptions['appConfig'])

    appConfig.usingComponents = {
      ...(opts.usingComponents || {}),
      ...(appConfig.usingComponents || {})
    }

    let appStyleFilePath = this.entryBuilder.globalStyleFilePath
    // 因为 tiga 编译逻辑会针对 / 开头的路径追加 @
    // 这里转换为相对路径
    if (appStyleFilePath) {
      appStyleFilePath = path.basename(appStyleFilePath)
    }

    return {
      ...opts,
      isAtomicMode: this.isAtomicMode,
      name: this.getResourceName(),
      config: await this.loadRelatedConfig(),
      appConfig,
      hasAppConfig: !!this.getAppConfigFilePath(),
      resourcePath: this.loader.resourcePath,
      rootPath: this.userConfig.srcPath,
      globalComponentsConfig: opts.globalComponentsConfig,
      rpxRootValue: opts.rpxRootValue || 32,
      platform: opts.platform || 'h5',
      conditionalCompileFileExt: opts.conditionalCompileFileExt,
      appStyleFilePath,
      ...this.relevantPaths
    }
  }

  private getRelevants(resourcePath: string) {
    const eb = this.entryBuilder
    const entry = eb.getEntryByFilePath(resourcePath)
    if (!entry) {
      this.relevantEntries = {}
      this.relevantPaths = {}
      return
    }

    // 组件编译模式下使用 fullEntryName
    const field = this.isAtomicMode ? 'fullEntryName' : 'fullPath'

    const contextPath = path.dirname(entry[field])

    this.relevantEntries = {
      scriptEntry: eb.entries.get(entry.entryName),
      templateEntry: eb.entries.get(
        `${entry.entryName}${fileType.template}${
          this.isAtomicMode ? '.js' : ''
        }`
      ),
      styleEntry: eb.entries.get(
        `${entry.entryName}${this.isAtomicMode ? '.css' : fileType.style}`
      ),
      configEntry: eb.entries.get(`${entry.entryName}${fileType.config}`)
    }

    this.relevantPaths = {
      scriptFilePath: this.getRelativePath(
        contextPath,
        this.relevantEntries.scriptEntry?.[field]
      ),
      templateFilePath: this.getRelativePath(
        contextPath,
        this.relevantEntries.templateEntry?.[field]
      ),
      styleFilePath: this.getRelativePath(
        contextPath,
        this.relevantEntries.styleEntry?.[field]
      ),
      configFilePath: this.getRelativePath(
        contextPath,
        this.relevantEntries.configEntry?.[field]
      )
    }
  }

  private getRelativePath(contextPath: string, targetPath?: string) {
    if (!targetPath) return
    const relativePath = slash(path.relative(contextPath, targetPath))
    if (relativePath.startsWith('.')) return relativePath
    return `./${relativePath}`
  }

  private async loadModule(request: string): Promise<{
    source: string
    sourceMap: any
    module: webpack.NormalModule
  }> {
    return await new Promise((resolve, reject) => {
      this.loader.loadModule(request, (err, source, sourceMap, module) => {
        if (err) {
          reject(err)
        } else {
          resolve({ source, sourceMap, module })
        }
      })
    })
  }

  async compile(fn: LoaderCompileMethod): Promise<void> {
    const options = await this.generateOptions()

    try {
      const result = await fn(options)
      this.callback(null, result)
    } catch (err) {
      this.callback(err)
    }
  }

  // 获取当前文件的config
  private async loadRelatedConfig() {
    const configFilePath = this.relevantEntries.configEntry?.fullPath
    if (configFilePath) {
      const { module } = (await this.loadModule(configFilePath)) as any
      return this.getModuleJsonData(module)
    } else {
      return null
    }
  }

  private getModuleJsonData(
    module: webpack.NormalModule
  ): BuildOptions['appConfig'] {
    if (!(module && module.buildInfo && module.buildInfo.jsonData)) {
      return {} as BuildOptions['appConfig']
    }

    const { jsonData } = module.buildInfo
    return typeof jsonData.get === 'function' ? jsonData.get() : jsonData
  }

  private getAppConfigFilePath() {
    if (this.userConfig.compileType === 'miniprogram') {
      return this.entryBuilder.globalConfigFilePath
    }
  }

  // 获取 app.json 配置
  private async loadAppConfig(): Promise<BuildOptions['appConfig']> {
    const appJsonPath = this.getAppConfigFilePath()
    if (appJsonPath) {
      const { module } = await this.loadModule(appJsonPath)
      return this.getModuleJsonData(module) as BuildOptions['appConfig']
    }
    return {} as BuildOptions['appConfig']
  }
}
