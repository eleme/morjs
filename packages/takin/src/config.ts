import * as fs from 'fs-extra'
import { createRequire } from 'module'
import * as path from 'path'
import {
  DEFAULT_CONFIG_OPTION_NAME,
  DEFAULT_CONFIG_OPTION_NAME_ALIAS,
  DEFAULT_MULTIPLE_CONFIG_FIELD,
  DEFAULT_ROOT,
  PKG_FILE,
  SupportConfigExtensions
} from './constants'
import { Environment } from './environment'
import { ConfigError, PluginError } from './errors'
import { createLogger, Logger } from './logger'
import type { Plugin } from './plugin'
import type { Takin } from './takin'
import type { Json, JsonArray, ObjectValues, UserConfig } from './types'
import {
  asArray,
  importJsOrMjsOrTsFromFile,
  interopRequireDefault,
  lookupFile,
  readJsonLike
} from './utils'

export type UserConfigFn = () => UserConfig | Promise<UserConfig>

export type UserConfigExport = UserConfig | Promise<UserConfig> | UserConfigFn

/**
 * 支持的插件类型
 */
export type PluginOption = Plugin | [string, Json] | string

/**
 * 插件类型
 */
export enum PluginTypes {
  /**
   * 通过 npm 自动载入的
   */
  auto = 'auto',

  /**
   * 通过 use 方法传入
   */
  use = 'use',

  /**
   * 通过 Runner.run 方法直接指定
   */
  runner = 'runner',

  /**
   * 通过 userConfig 传入
   */
  config = 'config',

  /**
   * 通过 命令行选项 传入
   */
  cli = 'cli'
}

export type UsedPluginsMap = Map<
  string,
  { plugin: Plugin; pluginType: PluginTypes; version: string }
>

/**
 * 配置文件过滤条件类型
 */
export type ConfigFilterType = string[] | string | undefined

/**
 * 支持的配置文件后缀名类型
 */
export type SupportConfigExtensionTypes = ObjectValues<
  typeof SupportConfigExtensions
>

/**
 * 多配置选项
 */
export interface MultipleConfigOptions {
  /**
   * 多配置字段名称
   */
  by: string
}

/**
 * 用户配置支持
 * 1. 支持自定义 配置 配置文件的名称
 * 2. 支持 js、ts、mjs、json 四种配置文件方式
 * 3. 不同的文件使用不同的方式载入
 * 4. 支持用户自定义配置文件名称, 并指定配置文件的支持类型
 * 5. 支持通过插件注册配置字段和校验schema
 * 6. 支持 开启配置数组, 并通过用户指定的 字段来区分
 * 7. 支持配置合并
 */
export class Config {
  /**
   * 配置基础名称
   */
  private _name!: string

  /**
   * option 名称
   */
  optionName = DEFAULT_CONFIG_OPTION_NAME

  /**
   * option 别名
   */
  optionNameAlias? = DEFAULT_CONFIG_OPTION_NAME_ALIAS

  /**
   * 是否开启多配置支持
   * 默认为 `false`
   * 多配置支持示例: `[{ name: 'config-one' }, { name: 'config-two' }]`
   */
  multipleConfigEnabled = false

  /**
   * 是否开启通过 package.json 读取配置
   * 如: `{ takin： {} }`
   */
  packageJsonConfigEnabled = false

  /**
   * 是否开启了 env 支持
   */
  env = new Environment()

  /**
   * 多配置名称字段
   * 默认为 `name`
   */
  multipleConfigNameField? = DEFAULT_MULTIPLE_CONFIG_FIELD

  /**
   * 允许自定义支持的配置文件类型
   */
  supportConfigExtensions = Object.values(SupportConfigExtensions)

  /**
   * 支持设置用户配置文件名称, 不包含后缀设置
   * 默认为 `takin.config`
   */
  supportConfigNames: string[] = []

  /**
   * 当前项目 package.json 内容
   */
  pkg?: Json

  /**
   * 当前项目的 package.json 路径
   */
  pkgPath: string = ''

  /**
   * 用户配置文件内容
   */
  userConfig?: UserConfig[]

  /**
   * 用户配置文件地址
   */
  userConfigFilePath?: string

  /**
   * 已使用的插件
   */
  usedPlugins: UsedPluginsMap = new Map()

  /**
   * 配置专用 logger
   */
  logger!: Logger

  /**
   * 插件动态载入规则配置, 支持一组正则
   */
  private pluginAutoLoadPatterns: RegExp[] = []

  /**
   * 项目执行文件根目录, 默认为 `process.cwd()`
   */
  cwd: string = DEFAULT_ROOT

  /**
   * 缓存文件夹
   */
  private cacheDir?: string

  /**
   * 临时文件夹
   */
  private tempDir?: string

  /**
   * 初始化时使用的配置文件名称
   * @param name - 配置文件名称
   */
  constructor(name: string) {
    this.setName(name)
    this.setSupportConfigFileNames([`${name}.config`])
  }

  /**
   * 设置全局名称
   * @param name - 命令行全局名称
   * @return this
   */
  setName(name: string): this {
    if (!name) throw new ConfigError('配置缺少名称')

    this._name = name

    // 创建 config 专属 logger
    this.logger = createLogger('info', {
      prefix: `[${name}]`,
      debugPrefix: `${name}:config`
    })

    return this
  }

  /**
   * 获取 cli 全局名称
   */
  get name() {
    return this._name
  }

  /**
   * 设置 option 名称和别名, 用于命令行
   * @param name - 名称
   * @param alias - 别名
   * @return this
   */
  setOptionName(name: string, alias?: string): this {
    this.optionName = name
    this.optionNameAlias = alias

    return this
  }

  /**
   * 配置支持的配置文件名称
   * @param names - 文件名称, 如 `['takin.config']`
   * @return this
   */
  setSupportConfigFileNames(names: string[]): this {
    if (names?.length) this.supportConfigNames = names

    return this
  }

  /**
   * 配置支持的配置文件名称
   * @param extensions - 后缀名, 如 `['.js']`
   * @return this
   */
  setSupportConfigFileExtensions(
    extensions: SupportConfigExtensionTypes[]
  ): this {
    if (extensions?.length) this.supportConfigExtensions = extensions

    return this
  }

  /**
   * 开启通过 package.json 读取用户配置
   * @return this
   */
  enablePackageJsonConfig(): this {
    this.packageJsonConfigEnabled = true

    return this
  }

  /**
   * 关闭通过 package.json 读取用户配置
   * @return this
   */
  disablePackageJsonConfig(): this {
    this.packageJsonConfigEnabled = false

    return this
  }

  /**
   * 开启多配置支持
   * @param opts - 多配置支持选项
   * @return this
   */
  enableMultipleConfig(opts?: MultipleConfigOptions): this {
    this.multipleConfigEnabled = true
    this.multipleConfigNameField = opts?.by || DEFAULT_MULTIPLE_CONFIG_FIELD

    return this
  }

  /**
   * 关闭多配置支持
   * @return this
   */
  disableMultipleConfig(): this {
    this.multipleConfigEnabled = false
    this.multipleConfigNameField = undefined

    return this
  }

  /**
   * 设置插件自动加载规则
   * @param patterns - 规则
   * @return this
   */
  setPluginAutoLoadPatterns(patterns: RegExp[]): this {
    this.pluginAutoLoadPatterns = patterns

    return this
  }

  /**
   * 从 package.json 的 dependencies 和 devDependencies 中基于规则自动载入插件-
   */
  async autoLoadPlugins(): Promise<void> {
    // 如果为设置规则, 代表不开启这项功能
    if (!this.pluginAutoLoadPatterns?.length) return
    // 未发现 pkg 则自动载入
    if (!this.pkg) await this.loadPackageJson()

    const dependencies = {
      ...((this.pkg?.dependencies as Record<string, string>) || {}),
      ...((this.pkg?.devDependencies as Record<string, string>) || {})
    }

    const plugins: Set<string> = new Set()

    for (const packageName in dependencies) {
      for (const pattern of this.pluginAutoLoadPatterns) {
        if (pattern.test(packageName) && !plugins.has(packageName)) {
          plugins.add(packageName)
          break
        }
      }
    }

    this.usePlugins(Array.from(plugins), PluginTypes.auto)
  }

  /**
   * @private
   * 设置内部插件
   */
  usePlugins(plugins: PluginOption[], pluginType: PluginTypes): void {
    this.resolveUserPlugins(plugins, true, pluginType).forEach(
      (pluginInfo, pluginName) => {
        this.warnDuplicatePlugin(
          this.usedPlugins,
          pluginName,
          pluginInfo.version
        )
        this.usedPlugins.set(pluginName, pluginInfo)
      }
    )
  }

  /**
   * @private
   * 警告插件重复
   * @returns true 为 重复, false 为不重复
   */
  warnDuplicatePlugin(
    plugins: UsedPluginsMap,
    pluginName: string,
    version: string
  ): boolean {
    if (plugins.has(pluginName)) {
      this.logger.warnOnce(
        `插件: ${pluginName} 被重复载入, 将使用最后一次载入的版本 ${version}`
      )
      return true
    } else {
      return false
    }
  }

  /**
   * @private
   * 加载用户 插件列表, 并执行
   * 支持的格式
   * ```
   *   plugins: [
   *     'plugin_name',
   *     ['plugin_name', { somePluginOption: 1 }],
   *     new Plugin({}),
   *   ]
   * ```
   * @param plugins - 插件列表
   * @param invokeOnUse - 是否触发插件 onUse 回调
   * @param pluginType - 插件调用类型
   */
  resolveUserPlugins(
    plugins: PluginOption[],
    invokeOnUse: boolean = false,
    pluginType: PluginTypes
  ): UsedPluginsMap {
    const resolvedPlugins: UsedPluginsMap = new Map()

    // 定制 require 函数
    const requireFn = this.cwd
      ? createRequire(path.resolve(this.cwd, 'noop.js'))
      : require

    try {
      asArray(plugins).forEach((p) => {
        let _p: Plugin
        let _name: string
        let _version = '*'

        if (!p) throw new PluginError(`${p} 不是一个有效的插件.`)

        if (Array.isArray(p) || typeof p === 'string') {
          const [pluginName, pluginOption] = asArray<PluginOption>(p)
          _name = pluginName as string
          const P = interopRequireDefault(requireFn(pluginName as string))
            .default as new (...args: any[]) => Plugin

          if (!P) {
            throw new PluginError(
              `插件: ${pluginName} 未找到, 或没有被正确的 export .`
            )
          }

          _p = new P(pluginOption)

          if (_p?.version) {
            _version = _p.version
          }
          // 尝试载入 npm 插件版本信息
          else {
            try {
              const pluginPkg = requireFn(`${pluginName}/package.json`)
              _version = pluginPkg?.version || _version
            } catch (error) {
              this.logger.debug(`未找到插件 ${pluginName} 版本信息`)
            }
          }
        } else {
          _p = p
          if (_p.name) {
            _name = _p.name
          } else {
            _name = _p.constructor.name
          }

          _version = _p?.version || _version
        }

        // 检查插件是否包含 apply 方法
        if (typeof _p?.apply !== 'function') {
          throw new PluginError(`插件: ${_name} 缺少 apply 方法, 请检查.`)
        }

        // 自动载入的插件打印信息
        if (pluginType === PluginTypes.auto) {
          this.logger.info(`插件: ${_name}@${_version} 已自动载入`)
        }

        // 触发插件 onUse 方法
        if (invokeOnUse && typeof _p?.onUse === 'function') {
          _p.onUse(this as unknown as Takin)

          this.logger.debug(`插件: ${_name} 已触发 onUse 方法`)
        }

        this.warnDuplicatePlugin(resolvedPlugins, _name, _version)

        resolvedPlugins.set(_name, {
          plugin: _p,
          pluginType,
          version: _version
        })
      })
    } catch (err) {
      const error = err as Error
      error.message = (error.message || '插件加载失败').replace(
        /^Cannot find module '(\S+)'/,
        "找不到名称为 '$1' 的插件"
      )
      this.logger.error(error.message, {
        error,
        color: true
      })

      throw err
    }

    return resolvedPlugins
  }

  /**
   * 对用户使用的插件进行排序
   *   plugin.enforce 属性只处理 pre 和 post 两个值, 其他值会忽略
   *   原则上除了将部分插件提前或置后之外, 不改变用户自行设定的插件顺序
   *   plugin.enforce = 'pre' 会排在所有插件最前面
   *   plugin.enforce = 'post' 会排在所有插件最后面
   * @param plugins - 插件列表
   */
  sortUserPlugins(
    plugins: (Plugin | Plugin[])[] | undefined
  ): [Plugin[], Plugin[], Plugin[]] {
    const prePlugins: Plugin[] = []
    const postPlugins: Plugin[] = []
    const normalPlugins: Plugin[] = []

    if (plugins) {
      plugins.flat().forEach((p) => {
        if (p.enforce === 'pre') prePlugins.push(p)
        else if (p.enforce === 'post') postPlugins.push(p)
        else normalPlugins.push(p)
      })
    }

    return [prePlugins, normalPlugins, postPlugins]
  }

  /**
   * 解析配置过滤条件
   * @param filters - 过滤条件
   * @returns 解析后的过滤条件
   */
  parseFilter(filters?: ConfigFilterType): Set<string> | undefined {
    if (!filters) return

    if (!Array.isArray(filters)) filters = String(filters).split(',')

    const parsedFilters = new Set<string>()

    filters.forEach(function (f) {
      if (f == null) return
      parsedFilters.add(String(f).valueOf().trim())
    })

    return parsedFilters
  }

  /**
   * 过滤用户配置
   * @param filters - 过滤条件
   * @param userConfigs - 需要过滤的用户配置
   * @returns 过滤后的用户配置
   */
  protected filterBy(
    filters?: ConfigFilterType,
    userConfigs?: UserConfig[]
  ): UserConfig[] {
    // 优先使用传入的 userConfigs, 如无 则使用当前 config 中载入的
    const configs = asArray(userConfigs ? userConfigs : this.userConfig || [])

    if (!configs.length) return []

    // 未开启多配置的情况下不过滤
    if (!this.multipleConfigEnabled) return asArray(configs[0])

    const validFilters = this.parseFilter(filters)

    // 无有效过滤条件, 返回全部
    if (!validFilters) return configs

    const configNameField = this.multipleConfigNameField

    // 配置命中的条件
    // 1. 配置不为空
    // 2. 配置名称字段存在且 filters 中包含配置名称 或 filters 中包含索引值
    return configs.filter((c, index) => {
      if (c == null) return false

      if (
        configNameField &&
        c?.[configNameField] != null &&
        validFilters.has(c?.[configNameField])
      ) {
        return true
      }

      if (validFilters.has(String(index))) return true

      return false
    })
  }

  /**
   * 载入和返回 package.json 的内容, 并存储在 this.pkg 中
   * @returns
   */
  private async loadPackageJson(): Promise<Json> {
    if (this.pkg) return this.pkg

    try {
      const pkgPath = lookupFile(this.cwd, ['package'], ['.json'], {
        pathOnly: true
      })
      if (pkgPath) {
        this.pkgPath = pkgPath
        this.pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
      }
      return this.pkg || {}
    } catch (e) {
      this.logger.debug(
        `未找到或未能正确解析 package.json 文件, 原因为: ${
          (e as Error).message
        }`
      )
      // 即使解析失败, 这里也存储一个空对象
      this.pkg = {}
    }

    return this.pkg
  }

  /**
   * 载入用户配置文件
   * @param configFile - 配置文件地址
   * @returns 配置文件内容
   */
  async loadConfigFromFile(configFile?: string): Promise<JsonArray | null> {
    const start = Date.now()

    let resolvedPath: string | undefined
    let isTs = false
    let isMjs = false
    let isJson = false
    let isPackageJson = false

    const pkg = await this.loadPackageJson()

    // 检查 package.json 中 "type" 字段 是否为 "module" 并设置 `isMjs` 为 true
    if (pkg?.type === 'module') isMjs = true

    // 指定 configFile 路径的配置文件, 只从项目根目录载入
    if (configFile) {
      resolvedPath = path.resolve(configFile)
      isTs = configFile.endsWith('.ts')
    }
    // 未指定的情况下, 根据配置文件规则自动查询
    else {
      resolvedPath = lookupFile(
        this.cwd,
        this.supportConfigNames,
        this.supportConfigExtensions,
        { pathOnly: true }
      )
    }

    let userConfig: UserConfigExport | undefined

    // 如果开启了 package.json 配置支持
    if (!resolvedPath && this.packageJsonConfigEnabled) {
      resolvedPath = this.pkgPath
    }

    // 如果未找到配置文件
    if (!resolvedPath) {
      this.logger.debug('没有找到配置文件.')

      return null
    }

    // 判断文件类型
    if (resolvedPath.endsWith(PKG_FILE)) isPackageJson = true
    if (resolvedPath.endsWith(SupportConfigExtensions.mjs)) isMjs = true
    if (resolvedPath.endsWith(SupportConfigExtensions.ts)) isTs = true
    if (resolvedPath.endsWith(SupportConfigExtensions.json)) isJson = true
    if (resolvedPath.endsWith(SupportConfigExtensions.jsonc)) isJson = true
    if (resolvedPath.endsWith(SupportConfigExtensions.json5)) isJson = true

    // 临时配置文件地址, 后续逻辑使用
    const tempConfigFileName = `.${this.name}.config.temp.js`
    const tempConfigFilePath = this.getCachedFilePath(tempConfigFileName)

    try {
      if (isJson) {
        if (isPackageJson) {
          userConfig = pkg?.[this.name] as UserConfig
          // 如果 package.json 里面无对应字段或对应的字段为 undefined
          // 则我们不将该文件作为 用户配置文件
          if (userConfig == null) {
            this.logger.debug(
              `文件 package.json 中未发现 \`${this.name}\` 相关配置, 已忽略`
            )
            return null
          }

          this.logger.debug(
            `已从 package.json 中加载配置, 耗时: ${
              Date.now() - start
            }ms, 路径信息:`,
            resolvedPath
          )
        } else {
          const jsonType = path.extname(resolvedPath).slice(1)
          userConfig = await readJsonLike(resolvedPath)
          this.logger.debug(
            `${jsonType} 配置文件已加载, 耗时: ${Date.now() - start}ms`,
            resolvedPath
          )
        }
      }

      this.logger.info(
        `发现配置文件: ${
          configFile ? configFile : path.relative(this.cwd, resolvedPath)
        }`
      )

      if (!userConfig) {
        userConfig = await importJsOrMjsOrTsFromFile({
          cwd: this.cwd,
          filePath: resolvedPath,
          tempFilePath: tempConfigFilePath,
          isMjs,
          isTs
        })
      }

      // 支持配置函数
      const config = await (typeof userConfig === 'function'
        ? await userConfig()
        : userConfig)

      this.userConfig = asArray<UserConfig>(config as UserConfig)

      this.logger.success(
        `配置文件加载成功: ${
          configFile ? configFile : path.relative(this.cwd, resolvedPath)
        }`
      )

      // 保存已载入的用户配置文件地址
      this.userConfigFilePath = resolvedPath

      return this.userConfig
    } catch (e) {
      const error = e as Error
      this.logger.error(
        `配置文件加载失败: ${
          configFile ? configFile : path.relative(this.cwd, resolvedPath)
        }`,
        { error }
      )
      throw e
    }
  }

  /**
   * 获取临时目录文件夹
   * @returns 当前 cwd 下的临时文件夹, 通常为 .[name] 文件夹
   */
  getTempDir() {
    const tempDir = this.tempDir
      ? this.tempDir
      : path.join(this.cwd, `.${this.name}`)
    fs.ensureDirSync(tempDir)
    return tempDir
  }

  /**
   * 设置临时文件夹
   */
  setTempDir(tempDir: string) {
    this.tempDir = path.resolve(this.cwd, tempDir)
  }

  /**
   * 清空临时文件夹
   */
  clearTempDir() {
    const tempDir = this.getTempDir()
    if (tempDir) fs.emptyDirSync(tempDir)
  }

  /**
   * 清空缓存文件夹
   */
  clearCacheDir() {
    const cacheDir = this.getCacheDir()
    if (cacheDir) fs.emptyDirSync(cacheDir)
  }

  /**
   * 写入到 cache 文件夹
   * @param fileName - 文件名称
   * @param content - 文件内容
   * @returns 缓存文件完整路径
   */
  writeToCacheDir(fileName: string, content: string): string {
    const filePath = this.getCachedFilePath(fileName)
    fs.ensureDirSync(path.dirname(filePath))
    fs.writeFileSync(filePath, content, 'utf-8')
    return filePath
  }

  /**
   * 读取缓存文件
   * @param fileName - 文件名称
   * @returns 文件内容
   */
  async loadCachedFile(fileName: string): Promise<string | undefined> {
    const filePath = this.getCachedFilePath(fileName)
    try {
      if (fs.statSync(filePath).isFile()) {
        return await fs.readFile(filePath, 'utf-8')
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  /**
   * 根据文件名称, 获取缓存文件完整地址
   * @param fileName - 文件名称
   * @returns 缓存文件完整地址
   */
  getCachedFilePath(fileName: string): string {
    return path.join(
      this.getCacheDir(),
      // 转换 ../abc 文件为 abc
      // 同时需要兼容 windows 路径
      path.relative('/', path.resolve('/', fileName))
    )
  }

  /**
   * 获取 缓存 文件夹
   * @returns 文件夹地址
   */
  getCacheDir() {
    if (this.cacheDir) return this.cacheDir

    const cwd = this.cwd
    let dir: string | undefined = cwd

    for (;;) {
      try {
        if (fs.statSync(path.join(dir, PKG_FILE)).isFile()) break
        // eslint-disable-next-line no-empty
      } catch (e) {}
      const parent = path.dirname(dir)
      if (dir === parent) {
        dir = undefined
        break
      }
      dir = parent
    }
    let cacheDir: string

    if (!dir) {
      cacheDir = path.resolve(cwd, `.cache/${this.name}`)
    } else if (process.versions.pnp === '1') {
      cacheDir = path.resolve(dir, `.pnp/.cache/${this.name}`)
    } else if (process.versions.pnp === '3') {
      cacheDir = path.resolve(dir, `.yarn/.cache/${this.name}`)
    } else {
      cacheDir = path.resolve(dir, `node_modules/.cache/${this.name}`)
    }

    this.cacheDir = cacheDir

    return cacheDir
  }
}
