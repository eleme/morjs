import {
  asArray,
  compose,
  ENV_TYPE,
  generateId,
  getEnv,
  getSharedProperty,
  IAnyFunc,
  logger,
  SOURCE_TYPE
} from '@morjs/api'
import type { IData } from './types'
import { MOR_EVENT_METHOD_PREFIX } from './utils/constants'
import { invokeHook } from './utils/invokeHook'
import { invokeOriginalFunction } from './utils/invokeOriginalFunction'

// 跨端支持的组件运行时引用注入位置, '' 空字符串是为了防止该注释被移除
// prettier-ignore
/* MOR_COMPONENT_POLYFILL_IMPORT_REPLACER */ ''

interface IMethod {
  [name: string]: (...args: any[]) => any
}

/**
 * 支付宝和微信 Component 组合实例类型
 */
type CompoundInstance<
  D extends IData,
  P extends IData
> = tinyapp.IComponentInstance<P, D> &
  WechatMiniprogram.Component.Instance<D, P, IMethod>

/**
 * 原生组件参数 微信+支付宝
 */
type CompoundComponentOptions<
  D extends IData,
  P extends IData,
  M extends IMethod
> = tinyapp.ComponentOptions<P, D, M> &
  WechatMiniprogram.Component.Options<D, P, M>

/**
 * Mor 内部方法
 */
interface MorComponentInternalMethods {
  $morPageOnShow?: IAnyFunc
  $morPageOnHide?: IAnyFunc
  $morPageOnResize?: IAnyFunc
}

/**
 * Mor 组件实例扩展字段
 */
interface MorComponentInstanceExtend extends MorComponentInternalMethods {
  $morId?: string
  /**
   * 当前组件所在页面的 标记
   */
  $morCurrentPageFlag?: string
  /**
   * 是否已添加 页面生命周期事件的标记
   */
  $morPageLifetimesIsHooked?: boolean
}

/**
 * 组件实例
 */
type MorComponentInstance<D extends IData, P extends IData> = CompoundInstance<
  D,
  P
> &
  MorComponentInstanceExtend

/**
 * 组件 options
 */
export type MorComponentOptions<
  D extends IData,
  P extends IData,
  M extends IMethod
> = Omit<CompoundComponentOptions<D, P, M>, 'methods' | 'data'> & {
  data?: D
  methods?: M &
    ThisType<MorComponentInstance<D, P> & M> &
    MorComponentInternalMethods &
    IMethod
  lifetimes?: CompoundComponentOptions<D, P, M>['lifetimes'] &
    ThisType<MorComponentInstance<D, P> & M> &
    MorComponentInternalMethods &
    IMethod
  mixins?: MorComponentOptions<D, P, M>[]
  $eventListener?: Record<string, IAnyFunc>
} & ThisType<MorComponentInstance<D, P> & M>

type DefaultMorComponentInstance = MorComponentInstance<IData, IData>

/**
 * mor component 转端适配器
 */
export interface MorComponentAdapter {
  initComponent?: (componentOptions: Record<string, any>) => void
}

export interface MorComponentEnhanceFeatures {
  /**
   * 是否触发组件的生命周期相关 morHooks, 默认为 false
   */
  invokeComponentHooks?: boolean
}

// 转端适配器
const COMPONENT_ADAPTERS: MorComponentAdapter[] = []

// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyFn = function () {}

/**
 * hook 组件生命周期
 */
function hookComponentLifeCycle<
  D extends IData,
  P extends IData,
  M extends IMethod
>(
  componentOptions: MorComponentOptions<D, P, M> & {
    onError?: (error: Error) => void
  },
  needsToHookPageLifetimes: boolean,
  sourceType: SOURCE_TYPE,
  invokeComponentHooks = true
): void {
  const isAlipaySource = sourceType === SOURCE_TYPE.ALIPAY

  /**
   * 设置基础信息
   */
  const makeBaseInfo = function (this: MorComponentInstanceExtend): void {
    if (!this.$morId) this.$morId = String(generateId())
  }

  /**
   * 做 pageLifetimes 的事件绑定
   * @param this 当前组件实例
   */
  const registerPageLifetimes = function (
    this: MorComponentInstanceExtend
  ): void {
    // 这里检查 getCurrentPages 是否存在，防止导致整个应用崩溃
    // 目的是部分小程序页面转 H5 时，缺少完整的小程序 runtime polyfill 而直接报错
    if (typeof getCurrentPages === 'undefined') {
      logger.error(
        '未发现 getCurrentPages 方法, 无法自动获取当前页面实例, pageLifetimes 相关事件注册失败'
      )
      return
    }

    const $event = getSharedProperty('$event', this)

    const allPages = getCurrentPages() || []

    // 在当前组件中保存 所在页面的标记
    const pageFlag = (this.$morCurrentPageFlag =
      allPages[allPages.length - 1]?.$morPageFlag)

    if (!pageFlag || !$event) {
      logger.warn(
        '当前运行环境缺乏 $event 或 $morPageFlag 支持, ' +
          '请检查页面是否采用了 createPage/aPage/wPage 以及 App 是否初始化正确'
      )
      return
    }

    // 避免不重复添加
    if (this.$morPageLifetimesIsHooked) return

    this.$morPageOnShow = this.$morPageOnShow.bind(this)
    this.$morPageOnHide = this.$morPageOnHide.bind(this)
    this.$morPageOnResize = this.$morPageOnResize.bind(this)

    $event.once(`$mor:pageOnReady:${pageFlag}`, this.$morPageOnShow)
    $event.on(`$mor:pageOnShow:${pageFlag}`, this.$morPageOnShow)
    $event.on(`$mor:pageOnHide:${pageFlag}`, this.$morPageOnHide)
    $event.on(`$mor:pageOnResize:${pageFlag}`, this.$morPageOnResize)

    this.$morPageLifetimesIsHooked = true
  }

  /**
   * 去除pageLifetime的事件绑定
   */
  const unregisterPageLifetimes = function (
    this: DefaultMorComponentInstance
  ): void {
    const $event = getSharedProperty('$event', this)
    if (!$event) return
    if (!this.$morCurrentPageFlag) return

    const pageFlag = this.$morCurrentPageFlag

    $event.off(`$mor:pageOnReady:${pageFlag}`, this.$morPageOnShow)
    $event.off(`$mor:pageOnShow:${pageFlag}`, this.$morPageOnShow)
    $event.off(`$mor:pageOnHide:${pageFlag}`, this.$morPageOnHide)
    $event.off(`$mor:pageOnResize:${pageFlag}`, this.$morPageOnResize)
  }

  /**
   * 增加 $eventListener 事件绑定
   * @param this 当前组件实例
   */
  const addEventListeners = function (this: DefaultMorComponentInstance): void {
    const $event = getSharedProperty('$event', this)
    if (!$event) return
    if (!this.data?.$morEventListenerNames?.length) return

    // 在当前组件实例中添加 事件
    this.data.$morEventListenerNames.forEach((eventName) => {
      const morEventName = `${MOR_EVENT_METHOD_PREFIX}${eventName}`
      this[morEventName] = this[morEventName].bind(this)
      $event.on(eventName, this[morEventName])
    })
  }

  /**
   * 去除 $eventListener 事件绑定
   */
  const removeEventListeners = function (
    this: DefaultMorComponentInstance
  ): void {
    const $event = getSharedProperty('$event', this)
    if (!$event) return
    if (!this.data?.$morEventListenerNames?.length) return

    this.data.$morEventListenerNames.forEach((eventName) => {
      const morEventName = `${MOR_EVENT_METHOD_PREFIX}${eventName}`
      $event.off(eventName, this[morEventName])
    })
  }

  const lifetimes = isAlipaySource
    ? componentOptions
    : componentOptions.lifetimes

  // 支付宝 DSL 支持
  if (isAlipaySource) {
    // onInit
    lifetimes.onInit = compose([
      needsToHookPageLifetimes ? registerPageLifetimes : emptyFn,
      invokeComponentHooks ? invokeHook('componentOnInit') : emptyFn,
      invokeOriginalFunction('onInit', lifetimes)
    ])

    // didMount
    componentOptions.didMount = compose([
      needsToHookPageLifetimes ? registerPageLifetimes : emptyFn,
      makeBaseInfo,
      invokeComponentHooks ? invokeHook('componentDidMount') : emptyFn,
      addEventListeners,
      invokeOriginalFunction('didMount', lifetimes)
    ])

    // didUnmount
    componentOptions.didUnmount = compose([
      needsToHookPageLifetimes ? unregisterPageLifetimes : emptyFn,
      invokeComponentHooks ? invokeHook('componentDidUnmount') : emptyFn,
      removeEventListeners,
      invokeOriginalFunction('didUnmount', componentOptions)
    ])

    // onError
    componentOptions.onError = compose([
      invokeComponentHooks ? invokeHook('componentOnError') : emptyFn,
      invokeOriginalFunction('onError', componentOptions)
    ])
  }
  // 微信 DSL 支持
  else {
    // created
    lifetimes.created = compose([
      needsToHookPageLifetimes ? registerPageLifetimes : emptyFn,
      invokeComponentHooks ? invokeHook('componentOnCreated') : emptyFn,
      invokeOriginalFunction('created', lifetimes)
    ])

    // attached
    lifetimes.attached = compose([
      needsToHookPageLifetimes ? registerPageLifetimes : emptyFn,
      makeBaseInfo,
      invokeComponentHooks ? invokeHook('componentOnAttached') : emptyFn,
      addEventListeners,
      invokeOriginalFunction('attached', lifetimes)
    ])

    // detached
    lifetimes.detached = compose([
      needsToHookPageLifetimes ? unregisterPageLifetimes : emptyFn,
      invokeComponentHooks ? invokeHook('componentOnDetached') : emptyFn,
      removeEventListeners,
      invokeOriginalFunction('detached', lifetimes)
    ])

    // error
    lifetimes.error = compose([
      invokeComponentHooks ? invokeHook('componentOnError') : emptyFn,
      invokeOriginalFunction('error', lifetimes)
    ])
  }
}

/**
 * 增加 pageLifetimes 的相关方法注入
 */
function hookPageLifetimes<D extends IData, P extends IData, M extends IMethod>(
  componentOptions: MorComponentOptions<D, P, M>,
  needsToHookPageLifetimes: boolean
): void {
  if (!needsToHookPageLifetimes) return

  const pageLifetimes = componentOptions.pageLifetimes || {}

  const originalPageOnShow = pageLifetimes.show
  componentOptions.methods.$morPageOnShow = function (): void {
    if (originalPageOnShow) {
      originalPageOnShow.call(this)
    }
  }

  const originalPageOnHide = pageLifetimes.hide
  componentOptions.methods.$morPageOnHide = function (): void {
    if (originalPageOnHide) {
      originalPageOnHide.call(this)
    }
  }

  const originalPageOnResize = pageLifetimes.resize
  componentOptions.methods.$morPageOnResize = function (): void {
    if (originalPageOnResize) {
      originalPageOnResize.call(this)
    }
  }

  delete componentOptions.pageLifetimes
}

/**
 * 注入 $eventListener 中对应的方法
 */
function hookEventListener<D extends IData, P extends IData>(
  componentOptions: MorComponentOptions<D, P, IMethod>
): void {
  if (componentOptions.$eventListener) {
    const eventNames = Object.keys(componentOptions.$eventListener)
    const data = componentOptions.data as Record<string, any>
    data.$morEventListenerNames = eventNames
    eventNames.forEach((eventName) => {
      const morEventName = `${MOR_EVENT_METHOD_PREFIX}${eventName}`
      componentOptions.methods[morEventName] =
        componentOptions.$eventListener[eventName]
    })
  }
}

/**
 * 确保自定义组件选项中必要的值存在
 */
function ensureDataAndMethodsAndLifetimes(
  options: Record<string, any>,
  sourceType: SOURCE_TYPE
): void {
  if (!options.methods) options.methods = {}
  if (!options.data) options.data = {}

  // 如果 微信DSL
  if (sourceType === SOURCE_TYPE.WECHAT) {
    if (!options.lifetimes) options.lifetimes = {}

    // 微信中 lifetimes 中的优先级高于 options 中的方法
    const created = options.lifetimes.created || options.created
    delete options.created
    options.lifetimes.created = created

    const attached = options.lifetimes.attached || options.attached
    delete options.attached
    options.lifetimes.attached = attached

    const ready = options.lifetimes.ready || options.ready
    delete options.ready
    options.lifetimes.ready = ready

    const moved = options.lifetimes.moved || options.moved
    delete options.moved
    options.lifetimes.moved = moved

    const detached = options.lifetimes.detached || options.detached
    delete options.detached
    options.lifetimes.detached = detached

    const error = options.lifetimes.error || options.error
    delete options.error
    options.lifetimes.error = error
  }
}

// 支付宝小程序运行环境
const isAlipayTarget =
  getEnv() === ENV_TYPE.ALIPAY ||
  getEnv() === ENV_TYPE.DINGDING ||
  getEnv() === ENV_TYPE.TAOBAO

const WECHAT_COMPONENT_LIFETIMES_METHODS = [
  'created',
  'attached',
  'ready',
  'moved',
  'detached',
  'error'
]
const ALIPAY_COMPONENT_LIFETIMES_METHODS = [
  'onInit',
  'deriveDataFromProps',
  'didMount',
  'didUpdate',
  'didUnmount',
  'onError'
].concat(WECHAT_COMPONENT_LIFETIMES_METHODS)

function getComponentLifetimesMethods(sourceType: SOURCE_TYPE) {
  return sourceType === SOURCE_TYPE.WECHAT
    ? WECHAT_COMPONENT_LIFETIMES_METHODS
    : ALIPAY_COMPONENT_LIFETIMES_METHODS
}

/**
 * 处理 mixins 或 behaviors
 *  - 声明周期方法会进行合并
 *  - methods 会使用最后声明的
 *  - 数据 会进行合并
 * @param componentOptions - Component 参数
 * @param mixinType - mixin 类型, 用于区分 mixin 和 behavior
 * @param sourceType - 源码类型
 */
function processMixinsOrBehaviors<
  D extends IData,
  P extends IData,
  M extends IMethod
>(
  componentOptions: MorComponentOptions<D, P, M>,
  mixinType: 'mixins' | 'behaviors',
  sourceType: SOURCE_TYPE
) {
  if (!componentOptions?.[mixinType]?.length) return

  const mixins = componentOptions[mixinType] as MorComponentOptions<D, P, M>[]
  delete componentOptions[mixinType]

  const lifetimesFunctions = {} as IData

  const componentLifetimesMethods = getComponentLifetimesMethods(sourceType)

  // 合并 mixins
  function processMixins(
    mixins: MorComponentOptions<D, P, M>[],
    // 是否是组件的直接 mixins
    isComponentDirectMixins: boolean
  ): MorComponentOptions<D, P, M> {
    return mixins.reduce((prev, curr) => {
      if (typeof curr !== 'object') {
        logger.error(`无效的 ${mixinType}: `, curr, '已跳过')
        return prev
      }

      let result: MorComponentOptions<D, P, M> = { ...prev }

      if (mixinType === 'behaviors') {
        // 如果是组件直接使用的 behaviors
        // 需要执行 definitionFilter 方法
        if (isComponentDirectMixins && curr.definitionFilter) {
          curr.definitionFilter(componentOptions)
        }

        // 处理 内嵌 behaviors
        if (curr?.[mixinType]?.length) {
          const childMixins = curr?.[mixinType] as MorComponentOptions<
            D,
            P,
            M
          >[]
          delete curr[mixinType]
          result = processMixins([result, ...childMixins], false)
        }
      }

      // 合并 lifetimes, lifetimes 中的函数优先级高
      const current = { ...curr, ...(curr.lifetimes || {}) }

      Object.keys(current).forEach((name) => {
        // 不处理 定义段函数
        if (name === 'definitionFilter') return

        // 合并 数据
        // 如 props/properties/data/methods
        if (typeof current[name] === 'object') {
          result[name] = { ...result[name], ...current[name] }
        }
        // 合并 方法
        else if (typeof current[name] === 'function') {
          const isLifetimeFn = componentLifetimesMethods.indexOf(name) !== -1

          if (isLifetimeFn) {
            lifetimesFunctions[name] = lifetimesFunctions[name] || []
            lifetimesFunctions[name].push(current[name])
          }
          // 非 lifetime method 只生效最后一个
          else {
            if (typeof result[name] === 'function') {
              logger.warn(`${mixinType} 中重复定义方法, 将生效最后声明的`, name)
            }
            result[name] = current[name]
          }
        }
        // 其他的 赋值
        else {
          result[name] = current[name]
        }
      })

      return result
    }, {})
  }

  const merged = processMixins(mixins, true)

  // 合并普通数据或方法
  Object.keys(merged).forEach((name) => {
    if (name in componentOptions) {
      if (typeof merged[name] === 'object') {
        const currType = typeof componentOptions[name]
        if (currType !== 'object') {
          logger.warn(
            `${name} 在 ${mixinType} 中定义为 object, 但是在当前 Component 为${currType}`
          )
          return
        }
        componentOptions[name] = {
          ...merged[name],
          ...componentOptions[name]
        }
      }
    } else {
      componentOptions[name] = merged[name]
    }
  })

  // 合并 生命周期 函数
  Object.keys(lifetimesFunctions).forEach((name) => {
    // const originalFn = sourceType === SOURCE_TYPE.WECHAT ? componentOptions?.lifetimes?.[name] || componentOptions[name] : componentOptions[name]
    const originalFn =
      componentOptions?.lifetimes?.[name] || componentOptions[name]

    componentOptions[name] = function (...args: any[]): void {
      try {
        for (const fn of lifetimesFunctions[name]) {
          fn.call(this, ...args)
        }
      } catch (err) {
        logger.error(`${mixinType} 函数 ${name} 报错`, err)
      }

      if (originalFn) originalFn.call(this, ...args)
    }

    // 微信 DSL 需要确保 lifetimes 中函数和 组件中一致
    // if (sourceType === SOURCE_TYPE.WECHAT) {
    componentOptions.lifetimes[name] = componentOptions[name]
    // }
  })
}

/**
 * 增强 Component 组件
 * @param options - 小程序组件配置
 * @param sourceType - 小程序组件源码类型, 编译时由 Mor 自动填充
 * @param features - 功能特性配置
 */
export function enhanceComponent<
  D extends IData,
  P extends IData,
  M extends IMethod
>(
  options: MorComponentOptions<D, P, M> & IData,
  sourceType?: SOURCE_TYPE,
  features: MorComponentEnhanceFeatures = {}
): Record<string, any> {
  logger.time('component-init')

  if (!sourceType) {
    logger.warn(
      `createComponent 缺少 sourceType 可能会导致小程序组件初始化错误`
    )
  }

  const componentOptions = { ...options }

  const $morHooks = getSharedProperty('$morHooks', options)

  if (!$morHooks) {
    logger.warn('createComponent 依赖于 $morHooks 的初始化, 请检查配置')
    return componentOptions
  }

  // 确保 data 属性 和 methods 属性
  ensureDataAndMethodsAndLifetimes(componentOptions, sourceType)

  // 处理 mixins
  processMixinsOrBehaviors(componentOptions, 'mixins', sourceType)

  // 仅非支付宝DSL且目标为支付宝小程序运行环境需要处理 behaviors
  if (sourceType === SOURCE_TYPE.WECHAT && isAlipayTarget) {
    processMixinsOrBehaviors(componentOptions, 'behaviors', sourceType)
  }

  // 触发 onConstruct, 兼容旧版本当 componentOnConstruct 不存在时用 componentOnInit 兜底
  if (features.invokeComponentHooks !== false) {
    const componentOnConstruct =
      $morHooks.componentOnConstruct || $morHooks.componentOnInit
    componentOnConstruct.call(componentOptions, componentOptions)
  }

  // 是否需要添加 页面生命周期 支持，目前仅 支付宝及支付宝相关小程序运行环境 下需要
  const needsToHookPageLifetimes =
    componentOptions.pageLifetimes && isAlipayTarget

  // 添加 生命周期 hook
  hookComponentLifeCycle(
    componentOptions,
    needsToHookPageLifetimes,
    sourceType,
    features.invokeComponentHooks !== false
  )

  // 添加 页面生命周期监听
  hookPageLifetimes(componentOptions, needsToHookPageLifetimes)

  // 添加 $eventListener 支持
  hookEventListener(componentOptions)

  // 跨端支持的组件运行时调用注入位置, '' 空字符串是为了防止该注释被移除
  // prettier-ignore
  /* MOR_COMPONENT_POLYFILL_INVOKE_REPLACER */ ''

  // 执行 component 适配器初始化
  if (COMPONENT_ADAPTERS?.length) {
    COMPONENT_ADAPTERS.forEach(function (adapter) {
      if (typeof adapter?.initComponent === 'function') {
        adapter.initComponent(componentOptions)
      } else {
        logger.error(`adapter.initComponent 必须是一个函数, 请检查`)
      }
    })
  }

  logger.timeEnd('component-init')

  return componentOptions
}

/**
 * Component 组件注册
 * @param options - 小程序组件配置
 * @param sourceType - 小程序组件源码类型, 编译时由 Mor 自动填充
 */
export function createComponent<
  D extends IData,
  P extends IData,
  M extends IMethod
>(
  options: MorComponentOptions<D, P, M> & IData,
  sourceType?: SOURCE_TYPE
): any {
  logger.time('component-init')

  const componentOptions = enhanceComponent(options, sourceType)

  logger.timeEnd('component-init')

  return Component(componentOptions)
}

/**
 * 注册组件转端适配器
 * @param adapters - 组件转端适配器
 */
export function registerComponentAdapters(
  adapters?: MorComponentAdapter | MorComponentAdapter[]
) {
  COMPONENT_ADAPTERS.push(...asArray(adapters))
}

/**
 * 支付宝 Component 组件注册
 * @param options - 小程序组件配置
 */
export function aComponent<D extends IData, P extends IData, M extends IMethod>(
  options: MorComponentOptions<D, P, M> & IData
): any {
  return createComponent(options, SOURCE_TYPE.ALIPAY)
}

/**
 * 微信 Component 组件注册
 * @param options - 小程序组件配置
 */
export function wComponent<D extends IData, P extends IData, M extends IMethod>(
  options: MorComponentOptions<D, P, M> & IData
): any {
  return createComponent(options, SOURCE_TYPE.WECHAT)
}
