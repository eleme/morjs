import type { Emitter } from '@morjs/api/lib/event'
import type { MorHookNames, MorHooks, MorSolution } from '@morjs/api/lib/hooks'
import { logger } from '@morjs/api/lib/logger'
import { asArray, compose } from '@morjs/api/lib/utils'
import type { IAppContext } from './plugins/contextPlugin'
import type { IData } from './types'
import { MOR_EVENT_PREFIX } from './utils/constants'
import { init } from './utils/init'
import { invokeOriginalFunction } from './utils/invokeOriginalFunction'

// 跨端支持的应用运行时引用注入位置, '' 空字符串是为了防止该注释被移除
// prettier-ignore
/* MOR_APP_POLYFILL_IMPORT_REPLACER */ ''

type CompoundAppOptions<T, G> = tinyapp.IAppOptionsMethods & {
  globalData?: G
  [name: string]: any
} & Partial<WechatMiniprogram.App.Option> &
  T

interface GetAppOption {
  /**
   * 在 `App` 未定义时返回默认实现。当App被调用时，默认实现中定义的属性会被覆盖合并到App中。一般用于独立分包
   */
  allowDefault?: boolean
}

/**
 * getApp 函数类型
 */
export type GetAppFunction = <T = IData>(
  opts?: GetAppOption
) => MorAppInstance & T

/**
 * mor app 转端适配器
 */
export interface MorAppAdapter {
  initApp?: (appOptions: Record<string, any>) => void
}

// 转端适配器
const APP_ADAPTERS: MorAppAdapter[] = []

/**
 * App 扩展实例属性
 */
export interface MorAppInstance {
  /**
   * mor 运行时 hooks 支持, 可用于接入到 App / Page / Component 的各个声明周期中
   */
  $morHooks: MorHooks
  /**
   * 全局事件支持
   */
  $event: Emitter<any>
  /**
   * App 上下文, 包含 onLaunch 的载入 query 参数
   */
  $context: IAppContext
  /**
   * mor 运行时已载入的插件名称列表
   */
  $morPluginsNames: string[]
}

type MorAppOptions<T extends IData, G extends IData> = CompoundAppOptions<
  T,
  G
> &
  Partial<MorAppInstance> &
  ThisType<
    T &
      MorAppInstance &
      WechatMiniprogram.App.Instance<T> &
      tinyapp.IAppInstance<G>
  >

type DefaultMorAppOptions = MorAppOptions<IData, IData>

type AppEventHookName = 'appOnShow' | 'appOnHide'

// 初始化标记
let IS_INITIALIZED = false

// 全局应用事件
const APP_EVENT_MAPPINGS = {
  onPageNotFound: 'appOnPageNotFound',
  onUnhandledRejection: 'appOnUnhandledRejection'
} as const

/**
 * 注入 app 生命周期 hook
 * @param appOptions 小程序 app 初始化 options
 */
function hookAppLifeCycle(appOptions: DefaultMorAppOptions): void {
  /**
   * 调用 hook
   * @param hookName hook名字
   */
  const invokeHook = function (hookName: string) {
    return function (this: DefaultMorAppOptions, ...args: any[]): void {
      this.$morHooks[hookName].call(this, ...args)
    }
  }

  /**
   * 调用事件通知
   * @param eventName 事件标识
   */
  const invokeEvent = function (eventName: AppEventHookName) {
    return function (this: DefaultMorAppOptions, arg: any): void {
      if (this.$event) {
        this.$event.emit(`${MOR_EVENT_PREFIX}${eventName}`, arg)
      }
    }
  }

  appOptions.onLaunch = compose([
    invokeHook('appOnLaunch'),
    invokeOriginalFunction('onLaunch', appOptions)
  ])
  appOptions.onShow = compose([
    invokeHook('appOnShow'),
    invokeOriginalFunction('onShow', appOptions),
    invokeEvent('appOnShow')
  ])
  appOptions.onHide = compose([
    invokeHook('appOnHide'),
    invokeOriginalFunction('onHide', appOptions),
    invokeEvent('appOnHide')
  ])
  appOptions.onError = compose([
    invokeHook('appOnError'),
    invokeOriginalFunction('onError', appOptions)
  ])

  // 这里的事件可能会改变小程序本身的行为, 故这里单独处理
  for (const eventName in APP_EVENT_MAPPINGS) {
    const hookName = APP_EVENT_MAPPINGS[eventName] as MorHookNames
    if (
      hookName &&
      (appOptions[eventName] || appOptions.$morHooks?.[hookName]?.isUsed?.())
    ) {
      appOptions[eventName] = compose([
        invokeHook(hookName),
        invokeOriginalFunction(eventName, appOptions)
      ])
    }
  }
}

/**
 * 注册 App
 */
export function createApp<T extends IData, G extends IData>(
  options: MorAppOptions<T, G>,
  /**
   * 运行时 Solution 支持
   */
  solution?: MorSolution | MorSolution[],
  /**
   * 拓展参数
   */
  extend?: {
    /**
     * 模拟全局 App 构造函数, 用于不存在 App 构造函数的环境, 如 小程序插件
     */
    globalApp?: (options: IData) => any
  }
): any {
  logger.time('createApp-init')

  // 配置 globalApp 的时候不检查多实例的问题
  // 原因： 允许插件或分包工程使用模拟 App
  //       这种情况下一个小程序会出现多个 App 初始化
  if (!extend?.globalApp) {
    if (IS_INITIALIZED) {
      logger.error('App 有且只能执行一次!')
      return
    } else {
      IS_INITIALIZED = true
    }
  }

  const appOptions = { ...options }

  logger.time('app-init-solution')
  const { $hooks, pluginsNames } = init(solution)
  logger.timeEnd('app-init-solution')

  // 添加到 App 实例中
  appOptions.$morHooks = $hooks
  appOptions.$morPluginsNames = pluginsNames

  // 触发 appOnConstruct hook, 兼容旧版本当 appOnConstruct 不存在时用 appOnInit 兜底
  const appOnConstruct = $hooks.appOnConstruct || $hooks.appOnInit
  appOnConstruct.call(appOptions, appOptions)

  // 生命周期 hook
  logger.time('app-hook-lifetimes')
  hookAppLifeCycle(appOptions)
  logger.timeEnd('app-hook-lifetimes')

  // 跨端支持的应用运行时调用注入位置, '' 空字符串是为了防止该注释被移除
  // prettier-ignore
  /* MOR_APP_POLYFILL_INVOKE_REPLACER */ ''

  // 执行 app 适配器初始化
  if (APP_ADAPTERS?.length) {
    APP_ADAPTERS.forEach(function (adapter) {
      if (typeof adapter?.initApp === 'function') {
        adapter.initApp(appOptions)
      } else {
        logger.error(`adapter.initApp 必须是一个函数, 请检查`)
      }
    })
  }

  logger.timeEnd('app-init')

  // 使用 extend.globalApp 替代 App
  // 用于 插件和分包模式下的 App 构造函数模拟
  if (extend?.globalApp) {
    if (typeof extend.globalApp !== 'function') {
      logger.error('globalApp 必须是函数, 请检查 App 的 extends 配置')
      return
    }
    return extend.globalApp(appOptions)
  } else {
    return App(appOptions as Record<string, any>)
  }
}

/**
 * 注册应用转端适配器
 * @param adapters - 应用转端适配器
 */
export function registerAppAdapters(
  adapters?: MorAppAdapter | MorAppAdapter[]
) {
  APP_ADAPTERS.push(...asArray(adapters))
}

/**
 * 注册支付宝小程序 App
 */
export const aApp = createApp

/**
 * 注册微信小程序 App
 */
export const wApp = createApp
