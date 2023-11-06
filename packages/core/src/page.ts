import {
  asArray,
  compose,
  generateId,
  getSharedProperty,
  IAnyFunc,
  logger,
  SOURCE_TYPE
} from '@morjs/api'
import type { IData } from './types'
import {
  APP_ON_HIDE_EVENT,
  APP_ON_SHOW_EVENT,
  MOR_EVENT_METHOD_PREFIX
} from './utils/constants'
import { invokeHook } from './utils/invokeHook'
import { invokeOriginalFunction } from './utils/invokeOriginalFunction'
import { isPromise } from './utils/isPromise'

// 跨端支持的页面运行时引用注入位置, '' 空字符串是为了防止该注释被移除
// prettier-ignore
/* MOR_PAGE_POLYFILL_IMPORT_REPLACER */ ''

/**
 * 支付宝和微信页面合并类型
 */
type CompoundPageOptions<D, T extends IData> = T &
  Partial<WechatMiniprogram.Page.Data<D>> &
  Partial<WechatMiniprogram.Page.ILifetime> & {
    options?: WechatMiniprogram.Component.ComponentOptions
  } & tinyapp.IPageOptionsMethods & {
    /**
     * 初始数据或返回初始化数据的函数, 为对象时所有页面共享。
     */
    data?: D

    /**
     * 事件处理函数集合。
     */
    events?: tinyapp.IPageEvents & ThisType<tinyapp.IPageInstance<D>>

    [name: string]: any
  }

type PageEventHookName =
  | 'pageOnReady'
  | 'pageOnShow'
  | 'pageOnHide'
  | 'pageOnResize'

/**
 * 页面 options
 */
export type MorPageOptions<D extends IData, T extends IData> = {
  mixins?: CompoundPageOptions<D, T>[]
  $eventListener?: Record<string, IAnyFunc>
} & CompoundPageOptions<D, T> &
  ThisType<WechatMiniprogram.Page.Instance<D, T> & tinyapp.IPageInstance<D>>

type DefaultMorPageOptions = MorPageOptions<IData, IData>

/**
 * mor page 转端适配器
 */
export interface MorPageAdapter {
  initPage?: (pageOptions: Record<string, any>) => void
}

// 转端适配器
const PAGE_ADAPTERS: MorPageAdapter[] = []

/**
 * 处理 Page 的生命周期
 */
function hookPageLifeCycle(
  pageOptions: DefaultMorPageOptions,
  sourceType: SOURCE_TYPE
): void {
  /**
   * 增加 appLifetimes 的事件监听
   *
   * 使用方法如下:
   * ```
   * createPage({
   *   appLifetimes: {
   *     show() {}
   *     hide() {}
   *   }
   * })
   * ```
   */
  const registerAppLifetimes = function (this: DefaultMorPageOptions): void {
    const appLifetimes = this.appLifetimes
    if (!appLifetimes) return
    const $event = getSharedProperty('$event', this)
    if (!$event) {
      return logger.warn(
        'createPage 中 appLifetimes 的运行依赖 $event，请检查配置'
      )
    }

    // app show 支持
    if (appLifetimes.show) {
      if (typeof appLifetimes.show === 'function') {
        appLifetimes.show = appLifetimes.show.bind(this)
        $event.on(APP_ON_SHOW_EVENT, appLifetimes.show)
      } else {
        logger.warn('appLifetimes 的 show 方法必须是 function')
      }
    }

    // app hide 支持
    if (appLifetimes.hide) {
      if (typeof appLifetimes.hide === 'function') {
        appLifetimes.hide = appLifetimes.hide.bind(this)
        $event.on(APP_ON_HIDE_EVENT, appLifetimes.hide)
      } else {
        logger.warn('appLifetimes 的 hide 方法必须是 function')
      }
    }
  }

  /**
   * 取消 appLifetimes 的事件监听
   */
  const unregisterAppLifetimes = function (this: DefaultMorPageOptions): void {
    const appLifetimes = this.appLifetimes
    if (!appLifetimes) return
    const $event = getSharedProperty('$event', this)
    if (!$event) return

    if (appLifetimes.show) $event.off(APP_ON_SHOW_EVENT, appLifetimes.show)
    if (appLifetimes.hide) $event.off(APP_ON_HIDE_EVENT, appLifetimes.hide)
  }

  /**
   * 调用事件通知
   * @param eventName 事件标识
   */
  const invokeEvent = function (eventName: PageEventHookName) {
    return function (this: DefaultMorPageOptions, arg: any): void {
      const $event = getSharedProperty('$event', this)
      if ($event && this.$morPageFlag) {
        $event.emit(`$mor:${eventName}:${this.$morPageFlag}`, arg)
      }
    }
  }

  /**
   * 增加 $eventListener 的事件监听
   */
  const addEventListeners = function (this: DefaultMorPageOptions): void {
    const eventListener = this.$eventListener
    if (!eventListener) return
    const $event = getSharedProperty('$event', this)

    Object.keys(eventListener).forEach((eventName) => {
      /**
       * 事件需要 bind this，否则实例并非一致
       * 事件如果绑定在 $eventListener 对象上，而非直接在 this 对象上
       * 会有隐藏 bug，导致 appx 底层框架在事件内调用 setData 时判断失效
       */
      this[`${MOR_EVENT_METHOD_PREFIX}${eventName}`] =
        eventListener[eventName].bind(this)

      $event.on(eventName, this[`${MOR_EVENT_METHOD_PREFIX}${eventName}`])
    })
  }

  /**
   * 去除 $eventListener 的事件监听
   */
  const removeEventListeners = function (this: DefaultMorPageOptions): void {
    const eventListener = this.$eventListener
    if (!eventListener) return

    const $event = getSharedProperty('$event', this)
    Object.keys(eventListener).forEach((eventName) => {
      $event.off(eventName, this[`${MOR_EVENT_METHOD_PREFIX}${eventName}`])
    })
  }

  /**
   *  确保必要的标示存在
   */
  const ensureViewIdExistance = function (this: DefaultMorPageOptions): void {
    if (!('$viewId' in this)) this.$viewId = generateId()
    this.$morPageFlag = String(this.$viewId)
  }

  pageOptions.onLoad = compose([
    ensureViewIdExistance,
    invokeHook('pageOnLoad'),
    addEventListeners,
    invokeOriginalFunction('onLoad', pageOptions),
    registerAppLifetimes
  ])

  pageOptions.onReady = compose([
    invokeHook('pageOnReady'),
    invokeOriginalFunction('onReady', pageOptions),
    invokeEvent('pageOnReady')
  ])

  pageOptions.onShow = compose([
    invokeHook('pageOnShow'),
    invokeOriginalFunction('onShow', pageOptions),
    invokeEvent('pageOnShow')
  ])

  pageOptions.onHide = compose([
    invokeHook('pageOnHide'),
    invokeOriginalFunction('onHide', pageOptions),
    invokeEvent('pageOnHide')
  ])

  pageOptions.onUnload = compose([
    invokeHook('pageOnUnload'),
    removeEventListeners,
    invokeOriginalFunction('onUnload', pageOptions),
    unregisterAppLifetimes
  ])

  // resize 支持
  // 区分支付宝和微信的 onResize 支持
  if (sourceType === SOURCE_TYPE.ALIPAY) {
    pageOptions.events = pageOptions.events || {}
    const events = pageOptions.events as { onResize?: IAnyFunc }
    events.onResize = compose([
      invokeOriginalFunction('onResize', pageOptions.events),
      invokeEvent('pageOnResize')
    ])
  } else {
    pageOptions.onResize = compose([
      invokeOriginalFunction('onResize', pageOptions),
      invokeEvent('pageOnResize')
    ])
  }
}

type PageMixinMethodOption = {
  [k: string]: {
    /**
     * 代表当前函数包含返回值且需要提供返回值的合并处理方式
     * @param prev - 前面 mixin 方法执行的结果
     * @param current - 当前 mixin 方法执行的结果
     */
    r?: (previous: any, current: any) => any
  }
}

// 通用
const PAGE_METHOD_NAMES: PageMixinMethodOption = {
  onLoad: {},
  onShow: {},
  onHide: {},
  onReady: {},
  onUnload: {},
  onPullDownRefresh: {},
  onReachBottom: {},
  /**
   * 支付宝和微信表现不同
   * - 支付宝支持 promise, 这里直接对 promise 的结果进行合并
   * - 微信通过 { promise } 来获取异步结果, 且 3s 自动超时使用缺省内容, 这里仅做对象合并
   */
  onShareAppMessage: {
    r(previous?: Record<string, any>, current?: Record<string, any>) {
      if (previous == null) return current
      if (current == null) return previous
      if (isPromise(previous) || isPromise(current)) {
        return Promise.resolve(previous).then(function (p) {
          return Promise.resolve(current).then(function (c) {
            if (p == null) return c
            if (c == null) return p
            return { ...p, ...c }
          })
        })
      } else {
        return {
          ...previous,
          ...current
        }
      }
    }
  },
  onPageScroll: {}
}

// 微信小程序
const WECHAT_METHOD_NAMES: PageMixinMethodOption = {
  ...PAGE_METHOD_NAMES,
  onShareTimeline: {
    r(previous?: Record<string, any>, current?: Record<string, any>) {
      if (previous == null) return current
      if (current == null) return previous
      return {
        ...previous,
        ...current
      }
    }
  },
  onResize: {},
  onAddToFavorites: {}
}

// 支付宝小程序
const ALIPAY_METHOD_NAMES: PageMixinMethodOption = {
  ...PAGE_METHOD_NAMES,
  onTitleClick: {},
  onOptionMenuClick: {},
  onPopMenuClick: {},
  onPullIntercept: {},
  onTabItemTap: {}
}

function getPageMethodNames(sourceType: SOURCE_TYPE) {
  return sourceType === SOURCE_TYPE.WECHAT
    ? WECHAT_METHOD_NAMES
    : ALIPAY_METHOD_NAMES
}

/**
 * 实现 createPage 的 mixins 机制
 * @param pageOptions
 */
function processMixins(
  pageOptions: DefaultMorPageOptions,
  sourceType: SOURCE_TYPE
): void {
  const mixinType = sourceType === SOURCE_TYPE.WECHAT ? 'behaviors' : 'mixins'
  if (!pageOptions?.[mixinType]?.length) return

  const pageMethodNames = getPageMethodNames(sourceType)

  const mixins = pageOptions[mixinType]
  delete pageOptions[mixinType]

  const protoFns = {} as IData
  const merged = mixins.reduce((prev, curr) => {
    if (typeof curr !== 'object') {
      logger.error('无效的 mixin: ', curr, '已跳过')
      return prev
    }

    const result = { ...prev }
    Object.keys(curr).forEach((name) => {
      // 合并 数据
      if (typeof curr[name] === 'object') {
        result[name] = { ...result[name], ...curr[name] }
      }
      // 合并 方法
      else if (typeof curr[name] === 'function') {
        const isProtoFn = name in pageMethodNames

        if (isProtoFn) {
          protoFns[name] = protoFns[name] || []
          protoFns[name].push(curr[name])
        }
        // 非 proto method 只生效最后一个
        else {
          if (typeof result[name] === 'function') {
            logger.warn('mixins 中重复定义方法，将生效最后声明的', name)
          }
          result[name] = curr[name]
        }
      }
      // 其他的 赋值
      else {
        result[name] = curr[name]
      }
    })

    return result
  }, {})

  Object.keys(merged).forEach((name) => {
    if (name in pageOptions) {
      if (typeof merged[name] === 'object') {
        const currType = typeof pageOptions[name]
        if (currType !== 'object') {
          logger.warn(
            `${name}在 mixins 中定义为 object, 但是在当前 Page 为${currType}`
          )
          return
        }
        pageOptions[name] = {
          ...merged[name],
          ...pageOptions[name]
        }
      }
    } else {
      pageOptions[name] = merged[name]
    }
  })

  // 处理 proto 方法的合并
  Object.keys(protoFns).forEach((name) => {
    const originalFn = pageOptions[name]

    // 返回值
    const fnConfig = pageMethodNames[name]
    let result: any
    pageOptions[name] = function (...args: any[]): void {
      try {
        for (const fn of protoFns[name]) {
          const r = fn.call(this, ...args)
          result = fnConfig?.r?.(result, r)
        }
      } catch (err) {
        logger.error('mixins 函数报错', err)
      }

      if (originalFn) {
        const r = originalFn.call(this, ...args)
        result = fnConfig?.r?.(result, r)
      }

      if (fnConfig?.r) return result
    }
  })
}

/**
 * 增强页面功能: 注入 adapters/hooks、转换声明周期等
 */
export function enhancePage<D extends IData, T extends IData>(
  options: MorPageOptions<D, T>,
  sourceType?: SOURCE_TYPE
): IData {
  if (!sourceType) {
    logger.warn(`createPage 缺少 sourceType 可能会导致小程序页面初始化错误`)
  }

  const $morHooks = getSharedProperty('$morHooks', options)

  const pageOptions = { ...options }

  if (!$morHooks) {
    logger.warn('createPage 依赖 $morHooks，请检查配置')
    return options as IData
  }

  // mixins 支持
  processMixins(pageOptions, sourceType)

  // 触发 pageOnConstruct hook, 兼容旧版本当 pageOnConstruct 不存在时用 pageOnInit 兜底
  const pageOnConstruct = $morHooks.pageOnConstruct || $morHooks.pageOnInit
  pageOnConstruct.call(pageOptions, pageOptions)

  // 添加页面生命周期 hook
  hookPageLifeCycle(pageOptions, sourceType)

  // 跨端支持的页面运行时调用注入位置, '' 空字符串是为了防止该注释被移除
  // prettier-ignore
  /* MOR_PAGE_POLYFILL_INVOKE_REPLACER */ ''

  // 执行 page 适配器初始化
  if (PAGE_ADAPTERS?.length) {
    PAGE_ADAPTERS.forEach(function (adapter) {
      if (typeof adapter?.initPage === 'function') {
        adapter.initPage(pageOptions)
      } else {
        logger.error(`adapter.initPage 必须是一个函数, 请检查`)
      }
    })
  }

  return pageOptions as IData
}

/**
 * 注册 Page 函数
 */
export function createPage<D extends IData, T extends IData>(
  options: MorPageOptions<D, T>,
  sourceType?: SOURCE_TYPE
): any {
  logger.time('page-init')

  const pageOptions = enhancePage(options, sourceType)

  logger.timeEnd('page-init')

  return Page(pageOptions as IData)
}

/**
 * 注册页面转端适配器
 * @param adapters - 页面转端适配器
 */
export function registerPageAdapters(
  adapters?: MorPageAdapter | MorPageAdapter[]
) {
  PAGE_ADAPTERS.push(...asArray(adapters))
}

/**
 * 支付宝 Page 页面注册
 * @param options - 小程序页面配置
 */
export function aPage<D extends IData, T extends IData>(
  options: MorPageOptions<D, T>
): any {
  return createPage(options, SOURCE_TYPE.ALIPAY)
}

/**
 * 微信 Page 页面注册
 * @param options - 小程序页面配置
 */
export function wPage<D extends IData, T extends IData>(
  options: MorPageOptions<D, T>
): any {
  return createPage(options, SOURCE_TYPE.WECHAT)
}
