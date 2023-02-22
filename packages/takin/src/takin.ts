import { cloneDeep } from 'lodash'
import {
  AsyncSeriesHook,
  AsyncSeriesWaterfallHook,
  SyncWaterfallHook
} from 'tapable'
import { CommandOptions } from './cli'
import { Config, PluginOption, PluginTypes } from './config'
import { DEFAULT_NAME } from './constants'
import { logger } from './logger'
import ChangeCwdPlugin from './plugins/ChangeCwdPlugin'
import CustomConfigPlugin from './plugins/CustomConfigPlugin'
import LoadEnvPlugin from './plugins/LoadEnvPlugin'
import MultiConfigPlugin from './plugins/MultiConfigPlugin'
import PluginConfigPlugin from './plugins/PluginConfigPlugin'
import StopRunPlugin from './plugins/StopRunPlugin'
import { Runner, RunnerContext, RunnerOptions } from './runner'
import { UserConfig } from './types'

export interface TakinHooks {
  /**
   * 完成初始化之后并开始运行 run 命令之前执行
   */
  initialize: AsyncSeriesHook<[Takin]>

  /**
   * 前置准备阶段: 可在这个阶段做一些前期准备, 可在这个阶段通过插件来做前期功能干预
   * 注: 这个阶段是通过一个单独的 Runner 运行出来的
   *     通过 RunnerOptions 传入的插件是独立的且仅用于 prepare 阶段
   */
  prepare: AsyncSeriesHook<RunnerOptions>

  /**
   * 配置文件载入完成, 可在这个阶段修改整体配置
   * 如果配置通过 run 方法直接传入则该 hook 不会执行
   */
  configLoaded: AsyncSeriesHook<[Takin, CommandOptions]>

  /**
   * 配置完成筛选, 可在这个阶段调整需要运行的用户配置
   */
  configFiltered: AsyncSeriesWaterfallHook<[UserConfig[], CommandOptions]>

  /**
   * runner 扩展阶段, 可在这个阶段定制 Runner
   */
  extendRunner: SyncWaterfallHook<[typeof Runner, RunnerOptions]>
}

/**
 * 命令行扩展内核，基于 Runner 和 Plugin
 * 提供各类 Utils 方法
 */
export class Takin extends Config {
  /**
   * 配置实例, 已废弃
   * @deprecated takin 已直接继承 Config 类, config 的相关方法或属性调用请直接使用 takin 实例
   */
  readonly config: Config

  /**
   * takin hooks
   */
  readonly hooks: TakinHooks

  // 标记是否已载入配置, 防止多次重复载入
  private isConfigLoaded: boolean

  // 标记是否正在重载
  private isReloading

  // 保存最近一次运行时传入的参数
  private lastRunState?: {
    command?: CommandOptions
    userConfigs?: UserConfig[]
    context?: RunnerContext | Record<string, any>
  }

  /**
   * 当前执行的 runner
   */
  private currentRunners: Set<Runner>

  constructor(name: string = DEFAULT_NAME) {
    super(name)

    // 重新初始化默认 logger
    // 以传入的 name 为准
    logger.init('info', { debugPrefix: name, prefix: `[${name}]` })

    this.currentRunners = new Set()

    // 旧版兼容
    this.config = this

    this.isConfigLoaded = false
    this.isReloading = false

    this.hooks = {
      initialize: new AsyncSeriesHook(['takin']),
      prepare: new AsyncSeriesHook(['runnerOptions']),
      extendRunner: new SyncWaterfallHook(['Runner', 'runnerOptions']),
      configLoaded: new AsyncSeriesHook(['takin', 'commandOptions']),
      configFiltered: new AsyncSeriesWaterfallHook([
        'UserConfigs',
        'commandOptions'
      ])
    }

    // 内部插件
    this.use([
      new ChangeCwdPlugin(),
      new CustomConfigPlugin(),
      new MultiConfigPlugin(),
      new PluginConfigPlugin()
    ])
  }

  /**
   * 应用 Runner 插件
   */
  use(plugins: PluginOption[]): void {
    this.usePlugins(plugins, PluginTypes.use)
  }

  /**
   * 执行命令, 分为如下几个步骤
   * 1. 执行初始化 hook
   * 2. 尝试载入配置文件, 只执行一次
   * 3. 基于多配置的设定，获取 filters
   * 4. 基于 filters 筛选 用户配置
   * 5. 基于不同的用户配置分别运行 Runner
   * @param command - 命令参数, 可选, 如不填写则自动从命令行读取
   * @param userConfigs - 用户配置, 可选, 如不填写则使用 config 中载入的用户配置
   * @param context - Runner 上下文, 可用于初始化时候传入 Runner
   * @returns 返回命令执行的结果
   */
  async run<R = any>(
    command?: CommandOptions,
    userConfigs?: UserConfig[],
    context?: RunnerContext | Record<string, any>
  ): Promise<(R | undefined)[]> {
    // 保存当前参数
    this.lastRunState = cloneDeep({
      command,
      userConfigs,
      context
    })

    // 执行初始化 hook
    await this.hooks.initialize.promise(this)

    const results: (R | undefined)[] = []

    const baseOptions = {
      config: this,
      command,
      userConfig: {},
      context
    }

    const configs = await this.prepare(command, userConfigs)

    // 基于多配置逐一运行 runner
    for await (const userConfig of configs.length ? configs : [{}]) {
      if (this.isReloading) {
        logger.debug(`正在 reloading, 跳过 Runner 执行`)
        continue
      }

      const runner = await this.runExtendedRunner({
        ...baseOptions,
        userConfig
      })

      results.push(runner.getResult())
    }

    return results
  }

  /**
   * 基于最近一次命令传入参数重新运行命令
   * @returns 返回命令执行的结果
   */
  async reload<R = any>(): Promise<(R | undefined)[]> {
    // 避免重复 reloading
    if (this.isReloading) return []

    // 清理配置项
    this.pkg = undefined
    this.pkgPath = ''
    this.userConfig = undefined
    this.userConfigFilePath = undefined

    // 标记配置未载入
    this.isConfigLoaded = false

    // 标记为正在 reloading
    this.isReloading = true

    // 逐个关闭 runner
    for await (const runner of this.currentRunners) {
      logger.debug(`关闭 Runner#${runner.runnerId} 中...`)
      await runner.hooks.shutdown.promise(runner)
      logger.debug(`关闭 Runner#${runner.runnerId} 完成`)
    }
    this.currentRunners.clear()

    // 获取上次运行时传入的参数
    const { command, userConfigs, context } = this.lastRunState || {}
    this.lastRunState = undefined

    // 标记 reloading 结束
    this.isReloading = false

    // 重新执行命令
    return await this.run<R>(command, userConfigs, context)
  }

  /**
   * 执行扩展 Runner 方法
   */
  private async runExtendedRunner(options: RunnerOptions): Promise<Runner> {
    const RunnerExtended = this.hooks.extendRunner.call(Runner, options)
    const runner = new RunnerExtended(
      options.config,
      options.userConfig,
      options.context
    )
    this.currentRunners.add(runner)
    await runner.run(options.command, options.plugins)
    return runner
  }

  /**
   * 利用 Runner 的能力完成一些前置准备工作
   *   - 修改 cwd
   *   - 载入用户配置文件
   *   - 过滤用户配置
   * @param command - 通过接口传入的命令选项
   * @param userConfigs - 通过接口传入的用户配置
   * @returns 过滤后的用户配置数组
   */
  private async prepare(
    command?: CommandOptions,
    userConfigs?: UserConfig[]
  ): Promise<UserConfig[]> {
    let filteredConfigs: UserConfig[] = []

    const plugins = [
      new ChangeCwdPlugin(),
      new LoadEnvPlugin(),
      new MultiConfigPlugin(false, async (runner, filters) => {
        // 过滤用户配置
        filteredConfigs = this.filterBy(filters, userConfigs)

        // 过滤用户配置
        if (this.hooks.configFiltered.isUsed()) {
          filteredConfigs = await this.hooks.configFiltered.promise(
            filteredConfigs,
            runner.getCommandOptions()
          )
        }
      }),
      new PluginConfigPlugin({
        registerPluginSchema: false,
        loadCliOrEnvPlugins: true
      }),
      new StopRunPlugin()
    ]

    // 如果未传入用户配置，则尝试自动载入配置
    if (!userConfigs?.length && !this.isConfigLoaded) {
      plugins.push(
        new CustomConfigPlugin(true, async (runner) => {
          await this.hooks.configLoaded.promise(
            this,
            runner.getCommandOptions()
          )

          this.isConfigLoaded = true
        })
      )
    }

    const options: RunnerOptions = {
      command,
      config: this,
      userConfig: {},
      plugins
    }

    // 触发前置准备 Hook
    await this.hooks.prepare.promise(options)

    await Runner.run(options)

    return filteredConfigs
  }
}
