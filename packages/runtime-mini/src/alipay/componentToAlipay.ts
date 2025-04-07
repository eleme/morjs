import { compose, logger } from '@morjs/runtime-base'
import clone from 'clone-deep'
import get from 'lodash.get'
import has from 'lodash.has'
import set from 'lodash.set'
import { injectHasBehaviorSupport } from '../common/behaviorOrMixin'
import {
  canIUse,
  injectComponentSelectorMethodsSupport,
  injectCreateIntersectionObserverSupport,
  injectCreateSelectorQuerySupport,
  injectTwoWayBindingMethodsSupport,
  markUnsupportMethods
} from './utilsToAlipay'

const MOR_PREFIX = 'mor' as const

/**
 * 用于在组件实例中保存 data 更新前的数据
 */
const MOR_PREV_DATA = `$${MOR_PREFIX}PrevData` as const
// 用于记录 DeriveDataFromProps 生命周期的第一次触发
const MOR_FIRST_DERIVE_DATA_FROM_PROPS =
  `$${MOR_PREFIX}FirstDeriveDataFromProps` as const
// 用于记录 InitPropertiesAndData 方法的第一次触发
const MOR_FIRST_INIT_PROPERTIES_AND_DATA =
  `$${MOR_PREFIX}FirstInitPropertiesAndData` as const

// 检查是否支持 component2
const isComponent2Enabled = canIUse('component2')
// 检查是否支持 observers 基础库 2.8.1
const isObserversSupported = canIUse('component.observers')
// 检查是否支持 relations
const isRelationsSupported = canIUse('component.relations')
// 检查是否支持 externalClasses
const isExternalClassesSupported = canIUse('component.externalClasses')
// 检查是否支持 lifetimes 基础库 2.8.5
const isLifetimesSupported = canIUse('component.lifetimes')

/**
 * 确保组件有对应的对象的存在
 *
 * @param options - 组件选项
 */
function ensureOptions(options: Record<string, any>): void {
  if (!options.data) options.data = {}
  if (!options.properties) options.properties = {}
  if (!options.props) options.props = {}
  if (!options.options) options.options = {}
  if (!options.methods) options.methods = {}
  if (!options.lifetimes) options.lifetimes = {}
}

/**
 * 确保组件有对应的对象的存在
 *
 * @param options - 组件选项
 */
function checkOptions(options: Record<string, any>): void {
  if (options.options?.styleIsolation) {
    logger.warn(
      '支付宝小程序不支持通过组件构造器 Component 的 options 来设置 styleIsolation',
      '请在组件对应的 json 文件中设置该属性'
    )
  }

  if (!isLifetimesSupported && (options.moved || options.lifetimes.moved)) {
    logger.warn(
      `组件中包含支付宝小程序低版本不支持的 moved 生命周期, 请升级基础库版本至 2.8.5 或以上，若不升级基础库则需自行适配相关逻辑`
    )
  }

  // 如果支持 relations 且用户未手动关闭，则默认开启
  if (isRelationsSupported && options.options?.relations !== false) {
    options.options.relations = true
  }

  // 如果支持 externalClasses 且用户未手动关闭，则默认开启
  if (
    isExternalClassesSupported &&
    options.options?.externalClasses !== false
  ) {
    options.options.externalClasses = true
  }

  // 如果支持 lifetimes 且用户未手动关闭，则默认开启
  if (isLifetimesSupported && options.options?.lifetimes !== false) {
    options.options.lifetimes = true
  }
}

/**
 * 清除无用的选项
 * @param options - 组件选项
 */
function cleanOptions(options: Record<string, any>): void {
  !isLifetimesSupported && delete options.lifetimes
  delete options.created
  delete options.attached
  delete options.ready
  delete options.moved
  delete options.detached
  delete options.error
}

/**
 * 判断是否是 小程序 event 对象
 */
function isEventObject(e: any): boolean {
  return e && typeof e === 'object' && 'target' in e && 'currentTarget' in e
}

// 深拷贝
function cloneDeep<T = Record<string, any>>(data: T): T {
  try {
    return clone(data)
  } catch (error) {
    logger.warn(
      `componentToAlipay cloneDeep, 兜底为浅拷贝, 失败原因: ${error}`,
      error
    )
    return Object.assign({}, data)
  }
}

/**
 * 用于保存上一次事件对象
 */
const MOR_EVENT_OBJECT_NAME = '$morLastEventInvokeObject'
/**
 * 用于保存事件对象的方法
 */
const MOR_SAVE_EVENT_OBJECT = '$morSaveEventObject'

/**
 * 兼容微信组件中的 triggerEvent
 */
function injectEventSupport(options: Record<string, any>) {
  if (options.methods.triggerEvent) {
    logger.warn(
      `组件 ${
        this?.is || ''
      } 中的 triggerEvent 方法冲突, 可能导致组件自定义事件失效`
    )
    return
  }

  // 封装所有的 methods 用于截获事件对象
  for (const methodName in options.methods) {
    const originalMethod = options.methods[methodName]
    options.methods[methodName] = function (...args: any[]) {
      if (this[MOR_SAVE_EVENT_OBJECT]) this[MOR_SAVE_EVENT_OBJECT](args?.[0])
      return originalMethod.call(this, ...args)
    }
  }

  // 添加 triggerEvent 方法并尝试和微信的自定义组件事件对齐
  options.methods.triggerEvent = function (
    name: string,
    params = {},
    opts = {}
  ) {
    name = name
      .replace(/^[a-zA-Z]{1}/, (s: string) => s.toUpperCase())
      .replace(/-./g, (s) => s[1].toUpperCase())

    // 自定义组件的事件中需要包含 data- 属性
    const dataset = {}
    Object.keys(this.props).forEach((key) => {
      if (key.indexOf('data-') === 0) {
        const newKey = key
          .toLowerCase()
          .replace('data-', '')
          .replace(/-./g, (c) => c[1].toUpperCase())
        dataset[newKey] = this.props[key]
      }
    })

    const eventObj = isEventObject(this[MOR_EVENT_OBJECT_NAME])
      ? this[MOR_EVENT_OBJECT_NAME]
      : {}

    // 支付宝组件传递函数时 必须以 on 开头并且 on 后的第一个字母必须大写（微信必须全小写）
    const callEventHandler = (eventName: string) => {
      const currentTarget = eventObj.currentTarget || {}
      const target = eventObj.target || {}
      const e = {
        ...eventObj,
        ...{
          currentTarget: {
            ...currentTarget,
            dataset: { ...(currentTarget.dataset || {}), ...dataset }
          },
          target: {
            ...target,
            dataset: { ...(target.dataset || {}), ...dataset },
            id: this.props.id
          }
        },
        type: name
      }

      e.detail = e.detail || {}

      if (Array.isArray(params)) {
        e.detail = params
      } else if (typeof params === 'object') {
        e.detail = { ...e.detail, ...params }
      } else {
        e.detail = params
      }

      this.props[eventName](e, opts)
    }
    if (typeof this.props[`on${name}`] === 'function') {
      callEventHandler(`on${name}`)
    } else if (typeof this.props[`catch${name}`] === 'function') {
      callEventHandler(`catch${name}`)
    }
  }

  options.methods[MOR_SAVE_EVENT_OBJECT] = function (e: Record<string, any>) {
    if (isEventObject(e)) {
      this[MOR_EVENT_OBJECT_NAME] = e
    }
  }
}

type PropType = string | number | boolean | object | any[] | null

/**
 * 转换 property 为固定额格式
 * @param property property 值
 */
function convertPropertyByType(property: any): {
  type: PropType
  value?: any
  [k: string]: any
} {
  let type: PropType = property?.type
  const observer = property?.observer
  const optionalTypes = property?.optionalTypes
  let value: any
  if (property === String || type === String) {
    type = String
    value = ''
  } else if (property === Number || type === Number) {
    type = Number
    value = 0
  } else if (property === Boolean || type === Boolean) {
    type = Boolean
    value = false
  } else if (property === Object || type === Object) {
    type = Object
    value = {}
  } else if (property === Array || type === Array) {
    type = Array
    value = []
  } else if (property == null || type == null) {
    type = null
    value = null
  }

  if (property && typeof property === 'object' && 'value' in property) {
    value = property.value
  }

  return {
    type,
    value,
    observer,
    optionalTypes
  }
}

/**
 * 覆盖 this.setData 方法, 用于监听数据变化
 */
function hackSetData() {
  const originalSetData = this.setData
  if (!originalSetData) {
    logger.error(`[mor] 劫持 setData 失败, 可能导致无法正确触发更新`)
  }

  // 初始化 data
  if (this.data) this[MOR_PREV_DATA] = this.data

  this.setData = (
    nextData: Record<string, any> = {},
    callback?: () => void
  ): void => {
    for (const key in nextData) {
      set(nextData, key, nextData[key])
    }

    this[MOR_PREV_DATA] = { ...(this[MOR_PREV_DATA] || {}), ...nextData }

    return originalSetData.call(this, nextData, callback)
  }
}

/**
 * 添加 properties 和 observers 支持
 */
function injectPropertiesAndObserversSupport(options: Record<string, any>) {
  // 如果支付宝小程序基础库已支持 observers 且用户未手动关闭 observers
  // 则直接自动启用 observers 监听器代替 MorJS 本身的实现逻辑
  const _observers = options.observers || {}
  if (isObserversSupported && options.options.observers !== false) {
    options.options.observers = true
  }

  const properties = options.properties || {}
  // 属性监听器
  const propertiesWithObserver = {}

  // 纯数据字段正则
  const pureDataPattern = options.pureDataPattern

  // 准备 props 以及 propertiesWithObserver
  const props: Record<string, any> = {}
  Object.keys(properties).forEach((key) => {
    const prop = convertPropertyByType(properties[key] || {})
    props[key] = prop.value

    // 保存属性监听器
    if (prop.observer) {
      if (typeof prop.observer === 'string') {
        propertiesWithObserver[key] = options.methods[prop.observer]
      } else if (typeof prop.observer === 'function') {
        propertiesWithObserver[key] = prop.observer
      }
    }
  })

  // 创建监听器函数
  const observers = options.observers || {}
  const observerFns = []
  for (const key in observers) {
    const keys = key.split(',').map(function (k) {
      return k.trim().replace('.**', '')
    })

    const originObserver = observers[key]

    observerFns.push(function (obj: any) {
      try {
        let hasTarget = false
        const values = keys.map((k) => {
          if (has(obj, k)) {
            hasTarget = true
            return get(obj, k)
          }
        })
        hasTarget && originObserver.apply(this, values)
      } catch (error) {
        logger.error(`组件 ${this.is} 监听器 observers[${key}] 报错: `, error)
      }
    })
  }

  const invokeObservers = compose(observerFns)

  // 初始化 props
  options.props = Object.assign(props, options.props || {})

  // 接收变更，需要开启 component2 支持
  const originalDeriveDataFromProps = options.deriveDataFromProps
  options.deriveDataFromProps = function (nextProps = {}) {
    // 1. 当基础库版本支持 lifetimes 时，由于生命周期执行委托给了原生，需跳过首次执行，若不跳过则会导致，
    //    data 同步 nextProps 后，传入的值前后对比未发现变更，而使在第一次初始化不触发 observer 的监听
    // 2. 当基础库版本不支持 lifetimes 时，使用 mor 的自实现，正常执行以下流程
    // 基于上述逻辑，初始化时，需记录状态，跳过 properties/data 赋值
    const firstDeriveDataFromProps = !this[MOR_FIRST_DERIVE_DATA_FROM_PROPS]
    const firstDeriveWithObserversSupported =
      firstDeriveDataFromProps && isObserversSupported

    // data变化触发双向绑定
    this.props.onMorChildTWBProxy?.(this.data, this.props)
    // created 生命周期触发之后， 会将 __createdEmitCallbacks__ 标记为null，只有首次进入时给当前组件实例初始化一个待执行队列
    if (
      isLifetimesSupported &&
      typeof this.__createdEmitCallbacks__ === 'undefined'
    )
      this.__createdEmitCallbacks__ = {}
    // 用于判断 nextProps 不为空对象
    let hasProps = false
    const updateProps: Record<string, any> = {}

    // 遍历所有更新的 prop 并触发更新
    for (const prop in nextProps) {
      // 支付宝中 prop 为函数时, 通常代表事件, 此处直接跳过赋值
      // if (typeof nextProps[prop] === 'function') continue

      // 哪些 prop 发生了改变
      const isPropChanged = firstDeriveDataFromProps
        ? nextProps[prop] !== options.props[prop]
        : nextProps[prop] !== this.props[prop]

      if (isPropChanged) {
        updateProps[prop] = nextProps[prop]
      }

      hasProps = true

      const originalValue = this.properties[prop]

      // 基于上述 1、2 两点逻辑，支持 observers 的版本初始化时不赋值。
      // 但是该做法会导致 property.observer 首次回调中，this.data
      // 和 this.properties 值不同步，可建议用户首次避免通过 data
      // 获取 properties 中的属性值
      if (!firstDeriveWithObserversSupported) {
        // 更新 properties 和 data
        // 微信小程序中的 properties 和 data 是一致的
        // 都包含 包括内部数据和属性值
        // 对象类型深拷贝，避免直接引用
        const _propValue =
          typeof nextProps[prop] === 'object'
            ? cloneDeep(nextProps[prop])
            : nextProps[prop]
        this.properties[prop] = _propValue
        this.data[prop] = _propValue
      }
      // 微信端组件初始化、属性改变时，会触发属性监听器 property.observer。
      // 而支付宝 deriveDataFromProps 方法，初始化时 this.props 和 nextProps
      // 中属性值相同，不满足 isPropChanged = true
      // 需通过 firstDeriveDataFromProps 强制初始化触发，与微信逻辑同步
      if (
        isPropChanged &&
        propertiesWithObserver[prop] &&
        !(pureDataPattern && pureDataPattern.test(prop))
      ) {
        try {
          const updateFn = propertiesWithObserver[prop].bind(
            this,
            nextProps[prop],
            originalValue
          )
          // created 执行之后 或者 lifetimes 不支持的场景，__createdEmitCallbacks__ 会为 null或者 undefined
          if (this.__createdEmitCallbacks__) {
            this.__createdEmitCallbacks__[prop] = updateFn // 推入待执行队列，等 created 生命周期触发后在执行，确保首次执行顺序
          } else {
            updateFn()
          }
        } catch (e) {
          logger.error(
            `组件 ${this.is} 属性监听器 properties.${prop}.observer 报错: `,
            e
          )
        }
      }
    }

    // 初始化时，记录首次执行状态
    this[MOR_FIRST_DERIVE_DATA_FROM_PROPS] = true
    if (firstDeriveWithObserversSupported) return

    // // 触发一次更新
    // props有值才更新
    if (hasProps && Object.keys(updateProps).length > 0) {
      this.setData(updateProps)
    }

    // 如果配置了 options.observers 则使用支付宝提供的数据变化观测器，否者触发自定义监听器
    if (!options.options?.observers) {
      const changedData = { ...(this[MOR_PREV_DATA] || {}), ...updateProps }
      this[MOR_PREV_DATA] = null
      invokeObservers.call(this, changedData)
    }

    // 执行原函数
    if (originalDeriveDataFromProps)
      originalDeriveDataFromProps.call(this, nextProps)
  }
  if (options.options.observers) {
    /**
     * 微信 observer执行时机 执行时机在 created 之后；初始化会执行一次
     * 支付宝 observer执行时机 执行时机在 deriveDataFromProps 之后，创建时在created之前，更新时在didUpdate之前
     * 微信 => 支付宝 使用原生observer
     * 创建阶段 将执行延后至created后。deriveDataFromProps在第一次执行不会将props数据塞至data,created之前 会执行 `initPropertiesAndData` 会将props数据塞至data, observer 可以执行也可以通过this.data拿到props
     * 更新阶段 直接执行
     */
    Object.keys(_observers).forEach((key) => {
      const preFn = _observers[key]
      _observers[key] = function (...args) {
        // 执行过createdEmitCallbacks，该值会复制为null，所以直接走update逻辑
        if (this.__createdEmitCallbacks__) {
          // 创建时： 放到 created之后
          this.__createdEmitCallbacks__[key] = () => preFn.apply(this, args)
        } else {
          // 更新时：直接调用，在didUpdate之前
          preFn.apply(this, args)
        }
      }
    })
    options.observers = _observers
  }
}

/**
 * 处理组件生命周期映射
 */
function hookComponentLifeCycle(options: Record<string, any>) {
  const lifetimes = options.lifetimes

  /**
   * 调用原本的生命周期函数
   * @param fnName 事件名
   */
  const callOriginalFn = function (fnName: string): (...args: any[]) => void {
    const originalFn = lifetimes[fnName] || options[fnName]
    return function (...args: any[]): void {
      if (originalFn) {
        originalFn.call(this, ...args)
      }
    }
  }

  /**
   * 初始化同步 properties 和 data 的值，为了兼容不同基础库版本，此处需触发两次
   * 第一次同步在 onInit 之前，目的是让 properties 同步 props 的值
   * 第二次同步是在 created 之前，目的是让之后的生命周期能正常从 data 和 properties 中取值
   */
  const initPropertiesAndData = function () {
    if (!this[MOR_FIRST_INIT_PROPERTIES_AND_DATA]) {
      this.properties = this.properties || {}
      for (const prop in this.props || {}) {
        if (typeof prop === 'function') continue
        this.properties[prop] = this.props[prop]
      }
      this[MOR_FIRST_INIT_PROPERTIES_AND_DATA] = true
    } else {
      this.properties = { ...this.properties, ...(this.data || {}) }
      this.data = this.properties
    }
  }

  // export => ref 映射
  if (options.export) {
    options.ref = options.export
    delete options.export
  }

  const executeCreatedCallbacks = function () {
    // created 生命周期触发时执行的回调（主要是为了解决首次 observer 和 created 生命周期的执行顺序问题）
    // 在微信中，created 触发时机早于 observer，在支付宝中由于该生命周期使用 deriveDataFromProps 模拟，而 deriveDataFromProps
    // 是先于 created 执行的，所以导致微信转支付宝场景下，observer 执行时机先于 created，这让某些依赖生命周期执行顺序的功能异常，所以在此做兼容适配
    if (
      !(
        this.__createdEmitCallbacks__ &&
        typeof this.__createdEmitCallbacks__ === 'object'
      )
    )
      return
    const keys = Object.keys(this.__createdEmitCallbacks__)
    if (keys.length > 0) {
      keys.forEach((key) => {
        const value = this.__createdEmitCallbacks__[key]
        value()
      })

      // 在这里将缓存队里置为 null，用于标记 created 已经执行过了，方便后续在 deriveDataFromProps 周期中进行判断（推入队列 or 直接执行）
      this.__createdEmitCallbacks__ = null
    }
  }

  /**
   * 生命周期执行顺序:
   * 1. 执行 hackSetData 劫持 setData，把需要变更的数据存入 MOR_PREV_DATA
   * 2. 执行第一次 initPropertiesAndData，使 properties 同步 props 的值
   * 3. 执行 onInit 生命周期
   * 4. 触发 deriveDataFromProps
   *  4.1 当基础库版本支持 lifetimes 时，需要跳过首次执行，防止 data 同步 nextProps 后无法触发下一步的 observer
   *  4.2 当基础库版本不支持 lifetimes 时，需要正常执行，来触发 Mor 自实现的 observers 监听
   * 5. 触发 observers 监听
   *  5.1 当基础库版本支持 lifetimes 时，此时 data 还未同步新值，故会触发原生事件的 observers 监听
   *  5.2 当基础库版本不支持 lifetimes 时，需要借助上一步 deriveDataFromProps，触发 invokeObservers 来实现 observers 监听，入参有两部分值:
   *    5.2.1 deriveDataFromProps 入参 nextProps，取其中发生了变更的 key，即 props 中的变更的参数
   *    5.2.2 第一步劫持的 setData 所保存的 MOR_PREV_DATA，即 data 中的变更的参数
   * 6. 执行第二次 initPropertiesAndData，使 data 和 properties 同步所有的数据
   * 7. 执行 created 生命周期，此后可兼容从 data 和 properties 取值
   * 8. 执行 attached 生命周期
   * …
   */

  options.onInit = compose([
    hackSetData,
    injectCreateIntersectionObserverSupport(),
    injectCreateSelectorQuerySupport(),
    initPropertiesAndData,
    callOriginalFn('onInit')
  ])

  if (isLifetimesSupported) {
    options.lifetimes.created = compose([
      initPropertiesAndData,
      callOriginalFn('created'),
      executeCreatedCallbacks
    ])
  }

  options.didMount = compose([
    !isLifetimesSupported && initPropertiesAndData,
    !isLifetimesSupported && callOriginalFn('created'),
    !isLifetimesSupported && callOriginalFn('attached'),
    callOriginalFn('didMount'),
    !isLifetimesSupported && callOriginalFn('ready')
  ])

  options.didUnmount = compose([
    !isLifetimesSupported && callOriginalFn('detached'),
    callOriginalFn('didUnmount')
  ])

  options.onError = compose([
    !isLifetimesSupported && callOriginalFn('error'),
    callOriginalFn('onError')
  ])
}

/**
 * 注入组件实例方法支持
 */
function injectComponentInstanceMethodSupport(options: Record<string, any>) {
  // 批量更新数据 支持
  options.groupSetData = function (cb: () => void) {
    if (typeof this.$batchedUpdates === 'function') {
      this.$batchedUpdates(cb)
    } else {
      cb()
    }
  }

  // 获取页面标识符
  options.getPageId = function () {
    return this.$page?.$viewId
  }
}

/**
 * 其他小程序转支付宝的 Component 差异抹平
 */
export function initComponent(options: Record<string, any>) {
  if (!isComponent2Enabled) {
    logger.error(
      '转换到支付宝小程序需要开启 component2 支持\n' +
        '开启方法: 在 支付宝小程序开发者工具 中的 详情 > 项目配置 中，勾选 component2 \n' +
        `或者 在 mini.project.json 或 project.alipay.json 文件中手动设置 component2 为 \`true\``
    )
  }

  // 确保选项必要字段存在
  ensureOptions(options)

  // 检查兼容性
  checkOptions(options)

  // 标记不支持的实例方法
  markUnsupportMethods(options.methods)

  // 注入双向绑定方法
  injectTwoWayBindingMethodsSupport(options.methods)

  // 增加组件实例方法支持
  injectComponentInstanceMethodSupport(options.methods)

  // 注入 hasBehavior 支持
  injectHasBehaviorSupport(options.methods, options.behaviors || [])

  // 注入事件支持
  injectEventSupport(options)

  // 注入组件选择器支持
  injectComponentSelectorMethodsSupport(options, 'component')

  // 注入 监听器和属性支持
  injectPropertiesAndObserversSupport(options)

  // 对齐生命周期
  hookComponentLifeCycle(options)

  // 清理选项
  cleanOptions(options)
}
