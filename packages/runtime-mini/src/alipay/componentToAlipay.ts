import { compose, logger } from '@morjs/runtime-base'
import get from 'lodash.get'
import has from 'lodash.has'
import set from 'lodash.set'
import {
  canIUse,
  injectComponentSelectorMethodsSupport,
  injectCreateIntersectionObserverSupport,
  injectHasBehaviorSupport,
  markUnsupportMethods
} from './utilsToAlipay'

const MOR_PREFIX = 'mor' as const

/**
 * 用于在组件实例中保存 data 更新前的数据
 */
const MOR_PREV_DATA = `$${MOR_PREFIX}PrevData` as const

// 检查是否支持 component2
const isComponent2Enabled = canIUse('component2')
// 检查是否支持 observers
const isObserversSupported = canIUse('component.observers')
// 检查是否支持 relations
const isRelationsSupported = canIUse('conponent.relations')

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

  if (options.moved || options.lifetimes.moved) {
    logger.warn(
      `组件中包含支付宝小程序不支持的 moved 生命周期, 请自行适配相关逻辑`
    )
  }

  // 如果支持 relations 且用户未手动关闭，则默认开启
  if (isRelationsSupported && options.options?.relations !== false) {
    options.options.relations = true
  }
}

/**
 * 清除无用的选项
 * @param options - 组件选项
 */
function cleanOptions(options: Record<string, any>): void {
  delete options.lifetimes
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
    name = name.replace(/^[a-zA-Z]{1}/, (s: string) => s.toUpperCase())

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
    if (typeof this.props[`on${name}`] === 'function') {
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
            dataset: { ...(target.dataset || {}), ...dataset }
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

      this.props[`on${name}`](e, opts)
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
    // 用于判断 nextProps 不为空对象
    let hasProps = false
    const updateProps: Record<string, any> = {}

    // 遍历所有更新的 prop 并触发更新
    for (const prop in nextProps) {
      // 支付宝中 prop 为函数时, 通常代表事件, 此处直接跳过赋值
      if (typeof nextProps[prop] === 'function') continue

      // 哪些 prop 发生了改变
      const isPropChanged = nextProps[prop] !== this.props[prop]
      if (isPropChanged) {
        updateProps[prop] = nextProps[prop]
      }

      hasProps = true

      const originalValue = this.properties[prop]

      // 更新 properties 和 data
      // 微信小程序中的 properties 和 data 是一致的
      // 都包含 包括内部数据和属性值
      this.properties[prop] = nextProps[prop]
      this.data[prop] = nextProps[prop]

      // 执行属性监听器，仅执行发生了变化的属性
      if (
        isPropChanged &&
        propertiesWithObserver[prop] &&
        !(pureDataPattern && pureDataPattern.test(prop))
      ) {
        try {
          propertiesWithObserver[prop].call(
            this,
            nextProps[prop],
            originalValue
          )
        } catch (e) {
          logger.error(
            `组件 ${this.is} 属性监听器 properties.${prop}.observer 报错: `,
            e
          )
        }
      }
    }
    // 触发一次更新
    if (hasProps) {
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

  const initPropertiesAndData = function () {
    this.properties = { ...(this.data || {}) }
    for (const prop in this.props || {}) {
      if (typeof prop === 'function') continue
      this.properties[prop] = this.props[prop]
    }
    this.data = this.properties
  }

  // export => ref 映射
  if (options.export) {
    options.ref = options.export
    delete options.export
  }

  options.onInit = compose([
    hackSetData,
    // 注入 createIntersectionObserver 方法
    injectCreateIntersectionObserverSupport(),
    initPropertiesAndData,
    callOriginalFn('created'),
    callOriginalFn('onInit')
  ])

  options.didMount = compose([
    callOriginalFn('attached'),
    callOriginalFn('didMount'),
    callOriginalFn('ready')
  ])

  options.didUnmount = compose([
    callOriginalFn('detached'),
    callOriginalFn('didUnmount')
  ])

  options.onError = compose([
    callOriginalFn('error'),
    callOriginalFn('onError')
  ])
}

/**
 * 注入组件实例方法支持
 */
function injectComponentInstanceMethodSupport(options: Record<string, any>) {
  // 批量更新数据 支持
  options.groupSetData = function (cb: () => void) {
    this.$batchedUpdates(cb)
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
