import {
  AsyncParallelHook,
  AsyncSeriesHook,
  AsyncSeriesWaterfallHook,
  HookMap,
  SyncBailHook,
  SyncHook
} from 'tapable'
import { AnyZodObject, z } from 'zod'
import { Cli, CommandOptions } from '../cli'
import { HookError } from '../errors'
import type { Runner } from '../index'
import { logger } from '../logger'
import { UserConfig } from '../types'

type Zod = typeof z

// 自定义 hook
const CUSTOM_HOOK_FACTORIES: RunnerHookFactories = {}

export interface RunnerHooks {
  /**
   * 初始化, 当 runner 被初始化并完成插件加载之后运行
   */
  initialize: SyncHook<Runner>

  /**
   * 构建命令行时运行
   */
  cli: SyncHook<Cli>

  /**
   * 获取到匹配命令的阶段
   */
  matchedCommand: AsyncSeriesHook<CommandOptions>

  /**
   * 加载用户 config 阶段
   */
  loadConfig: AsyncSeriesHook<CommandOptions>

  /**
   * 修改用户配置
   */
  modifyUserConfig: AsyncSeriesWaterfallHook<[UserConfig, CommandOptions]>

  /**
   * 注册用户配置及校验 schema
   */
  registerUserConfig: AsyncSeriesWaterfallHook<[AnyZodObject, Zod]>

  /**
   * 是否需要运行后续逻辑
   * 执行的时机为 校验用户配置之前
   */
  shouldRun: SyncBailHook<Runner, boolean | undefined>

  /**
   * 是否校验用户配置, 部分不使用配置的命令, 可使用该 hook 结合 runner 的上下文
   * 来选择是否跳过用户配置校验
   */
  shouldValidateUserConfig: SyncBailHook<Runner, boolean | undefined>

  /**
   * 用户配置校验完成之后执行
   */
  userConfigValidated: AsyncSeriesHook<UserConfig>

  /**
   * 开始 run 之前的 hook, 可用于准备一些运行命令需要的数据或内容
   */
  beforeRun: AsyncSeriesHook<Runner>

  /**
   * 运行命令逻辑
   */
  run: HookMap<AsyncParallelHook<CommandOptions>>

  /**
   * runner 运行完成
   */
  done: AsyncParallelHook<Runner>

  /**
   * runner 运行失败
   */
  failed: AsyncSeriesHook<Error>

  /**
   * runner 主动关闭 runner 时执行
   */
  shutdown: AsyncSeriesHook<Runner>
}

/**
 * Hook 工厂对象, 用于扩展已有的 Hooks
 */
export type RunnerHookFactories = {
  [P in keyof RunnerHooks]?: () => RunnerHooks[P]
}

/**
 * 判定自定义 hook 工厂函数是否已被注册
 * @param hookName - hook 名称
 * @retuns `true` or `false`
 */
export function isHookRegistered(hookName: keyof RunnerHooks): boolean {
  return !!CUSTOM_HOOK_FACTORIES[hookName]
}

/**
 * 自定义 hook 工厂, 用于拓展 RunnerHooks
 * @param hookName - hook 名称
 * @param hookFactory - 工厂函数
 */
export function registerHook<T extends keyof RunnerHookFactories>(
  hookName: T,
  hookFactory: RunnerHookFactories[T]
): void {
  if (hookName in CUSTOM_HOOK_FACTORIES) {
    throw new HookError(`自定义 HookFactory: ${hookName} 已被注册, 请检查`)
  }
  CUSTOM_HOOK_FACTORIES[hookName] = hookFactory
}

/**
 * 批量注册 hook 工厂函数
 * @param hooks - Hook 工厂对象
 */
export function registerHooks(hooks: RunnerHookFactories): void {
  Object.keys(hooks).forEach(function (hook) {
    const hookName = hook as keyof RunnerHookFactories
    registerHook(hookName, hooks[hookName])
  })
}

/**
 * 创建 Runner 相关默认 Hooks
 * @returns 创建的 hooks
 */
export function createHooks(): RunnerHooks {
  const hooks: RunnerHooks = {
    initialize: new SyncHook(['runner']),

    cli: new SyncHook(['cli']),

    matchedCommand: new AsyncSeriesHook(['command']),

    loadConfig: new AsyncSeriesHook(['command']),

    modifyUserConfig: new AsyncSeriesWaterfallHook(['userConfig', 'command']),

    registerUserConfig: new AsyncSeriesWaterfallHook(['schema', 'zod']),

    shouldRun: new SyncBailHook(['runner']),

    shouldValidateUserConfig: new SyncBailHook(['runner']),

    userConfigValidated: new AsyncSeriesHook(['userConfig']),

    beforeRun: new AsyncSeriesHook(['runner']),

    run: new HookMap(() => new AsyncParallelHook(['command'])),

    done: new AsyncParallelHook(['runner']),

    failed: new AsyncSeriesHook(['error']),

    shutdown: new AsyncSeriesHook(['runner'])
  }

  // 设置自定义 hook
  function setCustomHook<T extends keyof RunnerHooks>(
    name: T,
    hookFactory: () => RunnerHooks[T]
  ): void {
    if (hooks[name]) {
      logger.warn(`自定义 Hook: ${name} 已忽略, 原因: 已存在相同名称的 Hook`)
      return
    }
    hooks[name] = hookFactory()
  }

  // 添加自定义 hook
  for (const hook in CUSTOM_HOOK_FACTORIES) {
    const hookName = hook as keyof RunnerHookFactories
    const hookFactory = CUSTOM_HOOK_FACTORIES[hookName]
    if (hookFactory) setCustomHook(hookName, hookFactory)
  }

  return hooks
}
