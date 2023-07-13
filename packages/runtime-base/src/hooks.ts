import { logger } from './logger'
import { asArray } from './utils/asArray'

type AnyFunc = (...args: any[]) => any

enum HookInvokeState {
  pausing = 'pausing',
  resuming = 'resuming'
}

interface HookSharedState {
  state: HookInvokeState
  stack: [string, Tap, any, any[]][]
  hooksNameList: MorHookNames[]
}

interface Tap {
  name: string
  type: 'sync' | 'async'
  stage: number
  fn: AnyFunc
}

/**
 * 同步 Hook
 */
export class SyncHook {
  name: string
  taps: Tap[]
  sharedState?: HookSharedState

  /**
   * @constructor
   * @param name Hook 名称
   */
  constructor(name: string, sharedState?: HookSharedState) {
    this.name = name || ''
    this.taps = []
    this.sharedState = sharedState
  }

  /**
   * 返回 hook 是否已被使用
   */
  isUsed(): boolean {
    return this.taps.length > 0
  }

  /**
   * 创建 hook alias
   * @param name Hook 名称
   */
  alias(name: string): SyncHook {
    const aliasHook = new SyncHook(name, this.sharedState)

    // 这里直接使用 taps 数组, 方便 alias Hook 共用
    aliasHook.taps = this.taps

    return aliasHook
  }

  /**
   * 添加 hook 插件
   * @param nameOrOptions 名称或选项
   * @param fn 函数
   */
  tap<T extends AnyFunc>(
    nameOrOptions:
      | string
      | {
          name: string
          stage: number
        },
    fn: T
  ) {
    let name: string
    let stage: number
    if (typeof nameOrOptions === 'string') {
      name = nameOrOptions
      stage = 0
    } else {
      name = nameOrOptions.name
      stage = nameOrOptions.stage ?? 0
    }
    if (name == null) {
      logger.error(`$hooks.${this.name}.tap 缺少 name`)
    }

    this.taps.push({
      type: 'sync',
      name,
      stage,
      fn
    })
  }

  /**
   * 执行 hook
   * @param context 上下文
   * @param args 参数列表
   */
  call<T = any>(context: T, ...args: any[]): void {
    // 按照 stage 排序
    const taps = this.taps.sort(function (a, b) {
      return a.stage - b.stage
    })

    const state = this.sharedState

    for (const tap of taps) {
      // 当触发了 $hooks.pause 暂停，若未传入需要指定暂停的 hooks 则暂停所有生命周期触发
      // 若传入了某些指定的 hooks 数组，则只暂停这些传入 hooks
      if (
        state &&
        state.state === HookInvokeState.pausing &&
        (state.hooksNameList?.length === 0 ||
          state.hooksNameList?.includes(this.name as MorHookNames))
      ) {
        this.sharedState.stack.push([this.name, tap, context, args])
      } else {
        try {
          tap.fn.call(context, ...args)
        } catch (err) {
          logger.error(this.name, tap.name, err)
        }
      }
    }
  }
}

/**
 * 生命周期 Hook 列表
 */
export interface MorHooks {
  /**
   * 在应用初始化前执行，请注意不要进行长时间耗时的任务
   */
  appOnConstruct: SyncHook
  /**
   * appOnConstruct hook 的别名
   * @deprecated 已废弃, 请直接使用 appOnConstruct
   */
  appOnInit: SyncHook
  /**
   * 在 App 的 onLaunch 生命周期触发
   * 建议一般组件在这个生命周期执行初始化
   */
  appOnLaunch: SyncHook
  /**
   * 在 App 的 onError 生命周期触发
   */
  appOnError: SyncHook
  /**
   * 在 App 的 onShow 生命周期触发
   */
  appOnShow: SyncHook
  /**
   * 在 App 的 onHide 生命周期触发
   */
  appOnHide: SyncHook
  /**
   * 在 App 的 onPageNotFound 被调用时触发
   */
  appOnPageNotFound: SyncHook
  /**
   * 在 App 的 onUnhandledRejection 被调用时触发
   */
  appOnUnhandledRejection: SyncHook

  /**
   * 在页面初始化前执行，请注意这个生命周期会在应用启动后就立刻执行
   * 并不是等用户切换到对应的页面才会执行
   */
  pageOnConstruct: SyncHook

  /**
   * pageOnConstruct hook 的别名
   * @deprecated 已废弃, 请直接使用 pageOnConstruct
   */
  pageOnInit: SyncHook

  /**
   * 在 Page 的 onLoad 生命周期触发
   */
  pageOnLoad: SyncHook
  /**
   * 在 Page 的 onReady 生命周期触发
   */
  pageOnReady: SyncHook
  /**
   * 在 Page 的 onShow 生命周期触发
   */
  pageOnShow: SyncHook
  /**
   * 在 Page 的 onHide 生命周期触发
   */
  pageOnHide: SyncHook
  /**
   * 在 Page 的 onUnload 生命周期触发
   */
  pageOnUnload: SyncHook

  /**
   * 在 Component 创建前触发(组件注册的阶段)
   */
  componentOnConstruct: SyncHook

  /**
   * 在 Component 的 onInit 生命周期触发
   */
  componentOnInit: SyncHook
  /**
   * 在 Component 的 created 生命周期触发
   */
  componentOnCreated: SyncHook

  /**
   * 在 Component 的 didMount 生命周期触发
   */
  componentDidMount: SyncHook
  /**
   * 在 Component 的 attached 生命周期触发
   */
  componentOnAttached: SyncHook

  /**
   * 在 Component 的 didUnmount 生命周期触发
   */
  componentDidUnmount: SyncHook
  /**
   * 在 Component 的 detached 生命周期触发
   */
  componentOnDetached: SyncHook
  /**
   * 在 Component 的 onError 生命周期触发
   */
  componentOnError: SyncHook
  pause: (list?: string[]) => void
  resume: () => void
}

export type MorHookNames = keyof Omit<MorHooks, 'pause' | 'resume'>

type Reason = string

// 搜集所有创建的 hooks 实例
// 主要用于 调试或检查
const HOOKS_INSTANCES: Record<
  Reason,
  {
    // 创建时间
    createdAt: number
    // 事件实例
    hooks: MorHooks
  }[]
> = {}

/**
 * 创建 hooks 对象
 * @param reason Hooks 创建原因
 * @returns hooks 对象
 */
export function createHooks(reason: Reason): MorHooks {
  const sharedState = {
    state: 'resuming',
    stack: [],
    hooksNameList: []
  } as HookSharedState

  const appOnConstruct = new SyncHook('appOnConstruct', sharedState)
  const pageOnConstructHook = new SyncHook('pageOnConstruct', sharedState)
  const componentOnInitHook = new SyncHook('componentOnInit', sharedState)
  const componentDidMountHook = new SyncHook('componentDidMount', sharedState)
  const componentDidUnmountHook = new SyncHook(
    'componentDidUnmount',
    sharedState
  )
  const componentOnError = new SyncHook('componentOnError', sharedState)

  const hooks: MorHooks = {
    /* App 相关 hooks */
    appOnConstruct: appOnConstruct,
    // appOnInit 已废弃, 这里出于兼容性暂不移除
    appOnInit: appOnConstruct.alias('appOnInit'),
    appOnLaunch: new SyncHook('appOnLaunch', sharedState),
    appOnError: new SyncHook('appOnError', sharedState),
    appOnShow: new SyncHook('appOnShow', sharedState),
    appOnHide: new SyncHook('appOnHide', sharedState),
    appOnPageNotFound: new SyncHook('appOnPageNotFound', sharedState),
    appOnUnhandledRejection: new SyncHook(
      'appOnUnhandledRejection',
      sharedState
    ),

    /* Page 相关 hooks */
    pageOnConstruct: pageOnConstructHook,
    // pageOnInit 已废弃, 这里出于兼容性暂不移除
    pageOnInit: pageOnConstructHook.alias('pageOnInit'),
    pageOnLoad: new SyncHook('pageOnLoad', sharedState),
    pageOnReady: new SyncHook('pageOnReady', sharedState),
    pageOnShow: new SyncHook('pageOnShow', sharedState),
    pageOnHide: new SyncHook('pageOnHide', sharedState),
    pageOnUnload: new SyncHook('pageOnUnload', sharedState),

    /* Component 相关 hooks */
    componentOnConstruct: new SyncHook('componentOnConstruct', sharedState),
    componentOnInit: componentOnInitHook,
    componentOnCreated: componentOnInitHook.alias('componentOnCreated'),
    componentDidMount: componentDidMountHook,
    componentOnAttached: componentDidMountHook.alias('componentOnAttached'),
    componentDidUnmount: componentDidUnmountHook,
    componentOnDetached: componentDidUnmountHook.alias('componentOnDetached'),
    componentOnError: componentOnError,

    // 暂定某些生命周期暂时不执行，参数为空时暂停所有生命周期
    pause(hooksNameList?: MorHookNames[]) {
      sharedState.state = HookInvokeState.pausing
      sharedState.hooksNameList = hooksNameList || []
    },

    // 恢复所有生命周期，按顺依次执行
    resume() {
      sharedState.state = HookInvokeState.resuming
      let stackItem = sharedState.stack.shift()
      while (stackItem) {
        const [name, tap, context, args] = stackItem
        try {
          tap?.fn.call(context, ...args)
        } catch (error) {
          logger.error(name, tap.name, error)
        }
        stackItem = sharedState.stack.shift()
      }
    }
  }

  // 记录创建的所有 hooks
  HOOKS_INSTANCES[reason] = HOOKS_INSTANCES[reason] || []
  HOOKS_INSTANCES[reason].push({
    createdAt: +new Date(),
    hooks
  })

  return hooks
}

/**
 * 获取所有 hooks
 */
export function getAllHooks() {
  return HOOKS_INSTANCES
}

/**
 * 获取全局共享属性，用于作为原子化的兜底实现
 *   1. 首先查找上下文中的属性
 *   2. 如果不存在，则查找 getApp 中的
 *   3. 如果不存在，则查找 小程序环境的 globalObject, 如 my 中是否存在
 */
export const hooks = createHooks('default')

/**
 * Mor 插件
 */
export interface MorPlugin {
  /**
   * 插件名称
   */
  pluginName: string

  /**
   * 插件应用方法
   */
  apply: (hooks: MorHooks) => void
}

/**
 * Mor Solution 插件集合
 */
export interface MorSolution {
  (): { plugins: MorPlugin[] }
}

/**
 * Mor Solution 工厂函数
 */
export interface MorSolutionFactory {
  /**
   * @param options 选项
   * @returns Mor Solution 插件集合
   */
  (options?: Record<string, any>): MorSolution
}

/**
 * 应用插件
 * @param hooks Hooks
 * @param plugins 插件列表
 */
export function applyPlugins(hooks: MorHooks, plugins: MorPlugin[]): string[] {
  const pluginsNames: string[] = []

  plugins.forEach((plugin) => {
    try {
      plugin.apply(hooks)
      pluginsNames.push(plugin.pluginName)
    } catch (err) {
      logger.error(`[plugin ${plugin.pluginName}]: 初始化报错`, err)
    }
  })

  return pluginsNames
}

/**
 * 应用 Solutions
 * @param hooks Hooks
 * @param solutions 插件集列表
 */
export function applySolutions(
  hooks: MorHooks,
  solution: MorSolution[] | MorSolution
): string[] {
  const solutions = asArray(solution)
  let plugins: MorPlugin[] = []
  try {
    solutions.forEach(function (solution) {
      if (typeof solution === 'function') {
        plugins = plugins.concat(solution()?.plugins || [])
      } else {
        logger.error(
          `初始化运行时插件失败, 原因: ${solution} 不是一个有效的 solution`
        )
      }
    })
  } catch (err) {
    logger.error(`初始化运行时插件失败, 原因: ${err}`)
  }

  return applyPlugins(hooks, plugins)
}
