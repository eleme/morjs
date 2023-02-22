import { SafeParseError, z } from 'zod'
import { Cli, CommandOptions } from '../cli'
import { Config, PluginOption, PluginTypes, UsedPluginsMap } from '../config'
import { RunnerError } from '../errors'
import { Generator } from '../generator'
import { COLORS, createLogger, Logger } from '../logger'
import { Plugin } from '../plugin'
import { UserConfig } from '../types'
import './customZod'
import {
  createHooks,
  isHookRegistered,
  registerHook,
  registerHooks,
  RunnerHookFactories,
  RunnerHooks
} from './hooks'
import { MethodsContainer } from './methods'

export {
  RunnerHookFactories,
  registerHook,
  registerHooks,
  RunnerHooks,
  isHookRegistered
}

export type Zod = typeof z

export interface RunnerAddCommandActionOptions {
  /**
   * 命令名称
   */
  name: string
  /**
   * 插件名称
   */
  pluginName: string
  /**
   * 命令需要执行的函数
   */
  callback: (command: CommandOptions) => any
}

/**
 * runner 上下文, 可用于插件之间传递信息
 */
export type RunnerContext = Map<any, any>

type ChangeableRunnerFields =
  | 'commandName'
  | 'commandArgs'
  | 'commandOptions'
  | 'userConfig'
  | 'commandInvokedBy'

/**
 * 为插件 apply 方法提供唯一 runner
 */
function createRunnerByPlugin(runner: Runner, pluginName: string): Runner {
  function changeable<T extends ChangeableRunnerFields>(field: T) {
    return {
      configurable: false,
      get() {
        return runner[field]
      },
      set(val: Runner[T]) {
        runner[field] = val
      }
    }
  }

  const methods = new MethodsContainer(runner.methods, pluginName)

  return Object.create(runner, {
    commandName: changeable('commandName'),
    commandArgs: changeable('commandArgs'),
    commandOptions: changeable('commandOptions'),
    userConfig: changeable('userConfig'),
    commandInvokedBy: changeable('commandInvokedBy'),
    // 确保插件中调用的 methods 已自动携带插件名称信息
    methods: {
      configurable: false,
      get() {
        return methods
      }
    },
    currentPluginName: {
      configurable: false,
      get() {
        return pluginName
      }
    }
  })
}

// runner id, 内部使用
let RUNNER_ID = 0

/**
 * Runner 初始化选项
 */
export interface RunnerOptions {
  config: Config
  userConfig: UserConfig
  command?: CommandOptions
  plugins?: Plugin[]
  context?: RunnerContext | Record<string, any>
}

/**
 * 用于扩展 Runner 属性或方法
 *
 * @example
 * const takinInstance = takin('name')
 *
 * // 步骤一: 这里扩展方法或属性的类型
 * declare module 'takin' {
 *   interface RunnerExtendable {
 *      customProp: any
 *      customMethod(..args: any[]): void
 *   }
 * }
 *
 * // 步骤二: 这里通过 extendRunner 提供扩展方法和属性的实现
 * takinInstance.hooks.extendRunner.tap('ExtendRunnerPluginName', (Runner) => {
 *   return class extends Runner {
 *     override customProp: any
 *     override customMethod(..args: any[]): void
 *   }
 * })
 *
 * // 完成步骤一和步骤二之后
 * // 插件 apply 方法拿到的 runner 就会包含 customProp 属性和 customMethod 方法
 */
export abstract class RunnerExtendable {}

/**
 * 命令运行器
 */
export class Runner<R = any> extends RunnerExtendable {
  /**
   * 命令名称, cli commandName
   */
  commandName?: CommandOptions['name']

  /**
   * 命令参数, 如: cli commandName arg1 arg2
   */
  commandArgs?: CommandOptions['args']

  /**
   * 命令选项, 如: cli commandName arg1 --option1 --option2
   */
  commandOptions?: CommandOptions['options']

  /**
   * 当前 Runner 对应的用户配置
   */
  userConfig: UserConfig

  /**
   * Runner 命令被触发的方式, 用于辅助判断执行结果的退出方式和抛错方式
   * - cli 代表命令是从命令行中解析出来的
   * - api 代表命令是直接通过 API 传入的
   */
  commandInvokedBy: 'cli' | 'api' = 'cli'

  /**
   * runner id 用于 debug 显示
   */
  readonly runnerId: number

  /**
   * runner 支持的 hooks, 可通过 registerHook 或 registerHooks 方法进行扩展
   */
  readonly hooks: RunnerHooks

  /**
   * 配置类实例, 提供用户配置、部分功能开关、名称设置、缓存文件夹及临时文件夹等功能
   */
  readonly config: Config

  /**
   * Runner 的 logger 实例
   */
  readonly logger: Logger

  /**
   * 脚手架生成器
   */
  readonly generator: typeof Generator

  /**
   * Runner 上下文, Map 对象, 可用于当前 Runner 运行期间的数据交换或存储
   */
  readonly context: RunnerContext

  /**
   * Runner 共享方法, 用于插件之间共享方法
   */
  readonly methods: MethodsContainer

  // Cli 实例
  private cli: Cli

  // 保存本地 Runner 运行结果
  private result?: R

  // 记录已使用的插件
  private plugins: UsedPluginsMap = new Map()

  // 使用当前 runner 的插件名称
  private currentPluginName?: string

  /**
   * 执行 Runner
   */
  static async run({
    config,
    userConfig,
    command,
    plugins,
    context
  }: RunnerOptions): Promise<Runner> {
    const runner = new this(config, userConfig, context)
    await runner.run(command, plugins)
    return runner
  }

  /**
   * @constructor
   * @param config - Config 实例
   * @param userConfig - 本地执行的用户配置
   * @param context - 传入的 Runner 上下文
   */
  constructor(
    config: Config,
    userConfig: UserConfig,
    context?: RunnerContext | Record<string, any>
  ) {
    super()

    this.config = config

    const cliName = config.name

    this.runnerId = ++RUNNER_ID

    this.logger = createLogger('info', {
      prefix: `[${cliName}]`,
      debugPrefix: this.getRunnerName()
    })

    this.context = new Map<any, any>()
    if (context) {
      for (const [k, v] of context instanceof Map
        ? context
        : Object.entries(context)) {
        this.context.set(k, v)
      }
    }

    this.methods = new MethodsContainer()

    this.cli = new Cli(cliName, this)

    this.generator = Generator

    this.userConfig = userConfig

    // 初始化 hooks
    this.hooks = createHooks()

    // 自动记录 pluginName
    this.hooks.cli.intercept({
      tap: (tapInfo) => {
        this.cli.pluginName = tapInfo.name
      }
    })
  }

  /**
   * 获取当前工作目录
   * @returns 当前工作目录
   */
  getCwd() {
    return this.config.cwd
  }

  /**
   * 获取 runner 运行后的结果
   */
  getResult(): R | undefined {
    return this.result
  }

  /**
   * 获取已载入的插件
   */
  getPlugins(): UsedPluginsMap {
    return this.plugins
  }

  /**
   * 获取当前插件的名称
   */
  getCurrentPluginName() {
    return this.currentPluginName
  }

  /**
   * 获取命令配置
   */
  getCommandOptions(): CommandOptions {
    return {
      name: this.commandName,
      args: this.commandArgs || [],
      options: this.commandOptions || {}
    }
  }

  /**
   * 获取 runner 名称
   */
  getRunnerName() {
    return `${this.config.name}:runner:#${this.runnerId}`
  }

  /**
   * 基于传入的命令或命令行参数运行 runner
   * @param command - 指定需要运行的命令及参数
   * @param plugins - 当前 runner 需要运行的插件列表
   * @returns 命令执行的结果
   */
  async run(command?: CommandOptions, plugins?: Plugin[]): Promise<R | void> {
    let error: Error & { isErrorLogged?: boolean }
    let result: R | void

    try {
      this.logger.time('total run')
      result = await this._run(command, plugins)
    } catch (err) {
      // 记录 Error
      error = err as Error
    }

    this.logger.timeEnd('total run')

    // 异常退出
    if (error != null) {
      const errorMsg = COLORS.error(
        error?.message || `unknown ${error?.name || 'error'}`
      )

      // 仅输出一次错误日志, 避免因为在 runner 内部通过 takin.run 执行方法抛错
      // 导致的多次日志输出
      if (!error?.isErrorLogged) {
        this.logger.error(errorMsg, { error })
      }

      // 标记为已打印日志
      error.isErrorLogged = true

      // 触发 failed hook
      await this.hooks.failed.promise(error)

      // 如果从是 cli 执行, 则直接异常退出
      if (this.commandInvokedBy === 'cli') {
        process.exit(1)
      }
      // 其他情况如通过 api 调用, 则直接将错误抛出
      else {
        throw error
      }
    } else {
      // 返回执行结果
      return result
    }
  }

  /**
   * 运行 runner
   */
  private async _run(
    command?: CommandOptions,
    plugins?: Plugin[]
  ): Promise<R | void> {
    // 1. 执行指定的或所有的插件
    this.logger.time('loadPlugins')
    this.applySpecificOrAllPlugins(plugins)
    this.logger.timeEnd('loadPlugins')

    // 2. 执行初始化逻辑
    this.logger.time('Hooks.initialize')
    this.hooks.initialize.call(this)
    this.logger.timeEnd('Hooks.initialize')

    // 3. 运行命令行注册, 并获取匹配的命令
    this.logger.time('Hooks.cli')
    await this.prepareCliAndParseMatchedCommand(command)
    this.logger.timeEnd('Hooks.cli')

    // 4. 获取匹配的命令和参数
    this.logger.time('Hooks.matchedCommand')
    const matchedCommand = (await this.cli.prepareMatchedCommandAndArgs()) || {}
    await this.hooks.matchedCommand.promise(matchedCommand)
    this.logger.timeEnd('Hooks.matchedCommand')

    // 5. 加载 config 阶段, 会基于获取到的配置路径, 并完成加载操作
    this.logger.time('Hooks.loadConfig')
    await this.hooks.loadConfig.promise(matchedCommand)
    this.logger.timeEnd('Hooks.loadConfig')

    // 6. 基于命令和命令选项修改配置, 一般用于设定或修改默认值
    this.logger.time('Hooks.modifyUserConfig')
    this.userConfig = await this.hooks.modifyUserConfig.promise(
      this.userConfig,
      matchedCommand
    )
    this.logger.timeEnd('Hooks.modifyUserConfig')

    // 7. 获取用户自定义的 schema
    this.logger.time('Hooks.registerUserConfig')
    const schema = await this.hooks.registerUserConfig.promise(z.object({}), z)
    this.logger.timeEnd('Hooks.registerUserConfig')

    // 8. 判断是否需要继续执行后续逻辑
    this.logger.time('Hooks.shouldRun')
    const shouldRun = this.hooks.shouldRun.call(this)
    this.logger.time('Hooks.shouldRun')
    if (shouldRun === false) {
      this.logger.debug('stop by shouldRun === false')
      return
    }

    // 9. 检查是否需要校验用户配置
    this.logger.time('Hooks.shouldValidateUserConfig')
    const shouldValidateUserConfig =
      this.hooks.shouldValidateUserConfig.call(this)
    this.logger.time('Hooks.shouldValidateUserConfig')

    // 10. 校验用户配置
    if (shouldValidateUserConfig !== false) {
      this.logger.time('validateUserConfig')
      const result = await schema
        .passthrough()
        .safeParseAsync(this.userConfig, {})
      this.logger.timeEnd('validateUserConfig')

      if (result.success) {
        this.userConfig = result.data
      } else {
        const messages = (result as SafeParseError<any>).error.issues.map(
          (d) => `${d.path.join('.')}: ${d.message}`
        )
        messages.unshift('')
        throw new RunnerError(
          `校验配置出错, 请检查以下配置:${messages.join('\n  ')}`
        )
      }
    } else {
      this.logger.debug('skip validateUserConfig')
    }

    // 11. 执行命令开始前的 hook
    this.logger.time('Hooks.userConfigValidated')
    await this.hooks.userConfigValidated.promise(this.userConfig)
    this.logger.timeEnd('Hooks.userConfigValidated')

    // 12. 执行命令开始前的 hook
    this.logger.time('Hooks.beforeRun')
    await this.hooks.beforeRun.promise(this)
    this.logger.timeEnd('Hooks.beforeRun')

    // 13. 执行命令方法
    await this.invokeCommandAction(matchedCommand)

    // 14. 执行运行后 hook
    this.logger.time('Hooks.done')
    await this.hooks.done.promise(this)
    this.logger.time('Hooks.done')

    // 返回 命令执行的结果, 如果有的话
    return this.result
  }

  /**
   * 添加可执行的命令
   * @param options - 选项
   */
  addCommandAction({
    name,
    pluginName,
    callback
  }: RunnerAddCommandActionOptions): void {
    const fullCommand = `command:${name}`
    this.logger.debug(`Register: ${fullCommand}`)

    // 这里使用 async/await 包裹一层, 确保返回值是 promise
    this.hooks.run.for(fullCommand).tapPromise(pluginName, async (command) => {
      const result = await callback(command)
      this.result = result
      return result
    })
  }

  /**
   * 运行命令对应的 action
   */
  async invokeCommandAction(command: CommandOptions = {}): Promise<void> {
    const label = `Execute: command:${command.name || 'unknown'}`
    this.logger.time(label)
    await this.hooks.run.for(`command:${command.name}`).promise(command)
    this.logger.timeEnd(label)
  }

  /**
   * 解析命令行或传入的命令
   * @param command - 命令配置
   * @returns 解析后的命令
   */
  private async prepareCliAndParseMatchedCommand(
    command?: CommandOptions
  ): Promise<CommandOptions> {
    // 准备 cli 命令
    await this.hooks.cli.promise(this.cli)

    // 解析命令和参数, 并判断命令触发方式
    if (
      command?.name != null ||
      command?.args?.length ||
      command?.options != null
    ) {
      this.cli.parseByCommand(command)
      this.commandInvokedBy = 'api'
    }
    // 从命令行获取匹配的命令
    else {
      this.cli.parse(process.argv, { run: false })
      this.commandInvokedBy = 'cli'
    }

    const { matchedCommandName, options, args } = this.cli

    this.commandName = matchedCommandName
    this.commandArgs = args
    this.commandOptions = options

    return { name: matchedCommandName, options }
  }

  /**
   * 执行所有插件
   */
  private applySpecificOrAllPlugins(plugins?: Plugin[]): void {
    let allPlugins: UsedPluginsMap

    // 优先使用传入的插件
    // 通常用于使用 runner 执行特定的逻辑
    if (plugins?.length) {
      allPlugins = this.config.resolveUserPlugins(
        plugins,
        false,
        PluginTypes.runner
      )

      // 应用插件
      allPlugins.forEach(({ plugin, version }, pluginName) => {
        plugin.apply(createRunnerByPlugin(this, pluginName))
        this.logger.debug(`插件: ${pluginName}@${version} 已应用`)
      })
    }
    // 载入所有符合要求的插件
    // 包含： 内置已使用插件和用户插件
    else {
      const cnf = this.userConfig
      let userPlugins: Plugin[] = []

      allPlugins = this.config.resolveUserPlugins(
        cnf?.plugins as PluginOption[],
        false,
        PluginTypes.config
      )

      // 用于记录名称和版本信息
      const reverseMap = new Map<Plugin, { name: string; version: string }>()

      allPlugins.forEach(({ plugin, version }, name) => {
        userPlugins.push(plugin)
        reverseMap.set(plugin, { name, version })
      })

      const internalPlugins: Plugin[] = []
      this.config.usedPlugins.forEach((pluginInfo, pluginName) => {
        if (
          this.config.warnDuplicatePlugin(
            allPlugins,
            pluginName,
            pluginInfo.version
          )
        )
          return

        internalPlugins.push(pluginInfo.plugin)

        // 记录内部插件
        allPlugins.set(pluginName, pluginInfo)

        reverseMap.set(pluginInfo.plugin, {
          name: pluginName,
          version: pluginInfo.version
        })
      })

      const [prePlugins, normalPlugins, postPlugins] =
        this.config.sortUserPlugins(userPlugins)

      ;[prePlugins, internalPlugins, normalPlugins, postPlugins].forEach(
        (pluginSet) => {
          pluginSet.forEach((p) => {
            const info = reverseMap.get(p)
            if (!info) return
            p.apply(createRunnerByPlugin(this, info.name))
            this.logger.debug(`插件: ${info.name}@${info.version} 已应用`)
          })
        }
      )

      reverseMap.clear()
      userPlugins = []
    }

    this.plugins = allPlugins
  }
}
