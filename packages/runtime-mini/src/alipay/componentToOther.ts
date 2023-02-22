import { Base64 } from '@morjs/api/lib/base64'
import { logger } from '@morjs/api/lib/logger'
import { compose, generateId, getSharedProperty } from '@morjs/api/lib/utils'
import clone from 'clone-deep'
import { addEventProxy, injectInstanceMethodsSupport } from './utilsToOther'

const MOR_PREFIX = 'mor' as const
/**
 * 保存在 dataset 的事件代理相关方法名称映射
 */
const MOR_EVENT_HANDLERS_DATASET = `${MOR_PREFIX}EventHandlers` as const
/**
 * 用于保存事件代理相关方法名称映射
 */
const MOR_EVENT_HANDLERS = `$${MOR_EVENT_HANDLERS_DATASET}` as const
/**
 * 用于保存 函数类型 的 props
 */
const MOR_FUNCTION_PROPS = `$${MOR_PREFIX}FuncProps` as const
/**
 * 用于保存 非函数类型 的 props
 */
const MOR_COMMON_PROPS = `$${MOR_PREFIX}CommonProps` as const
/**
 * 用于保存 deriveDataFromProps 函数，并模拟触发
 */
const MOR_DERIVE_DATA_FROM_PROPS_LIFECYCLE =
  `$${MOR_PREFIX}DeriveDataFromPropsLifeCycle` as const
/**
 * 标记 mor 是否需要忽略下一次 deriveDataFromProps 函数执行, 用于跳过重复触发, 避免循环调用
 */
const MOR_IGNORE_NEXT_DERIVE_DATA_FROM_PROPS_FLAG =
  `$${MOR_PREFIX}IgnoreNextDeriveDataFromPropsLifeCycle` as const
/**
 * 标记 mor 是否正在执行 deriveDataFromProps 函数
 */
const MOR_IS_RUNNING_DERIVE_DATA_FROM_PROPS_FLAG =
  `$${MOR_PREFIX}IsRunningDeriveDataFromPropsLifeCycle` as const
/**
 * 标记 mor 是否已初始化完成
 */
const MOR_IS_INITIALIZED_FLAG = `$${MOR_PREFIX}IsInitialized` as const
/**
 * 用于保存 didUpdate 函数，并模拟触发
 */
const MOR_DID_UPDATE_LIFECYCLE = `$${MOR_PREFIX}DidUpdateLifeCycle` as const
/**
 * 用于在组件实例中保存 data 更新前的数据
 */
const MOR_PREV_DATA = `$${MOR_PREFIX}PrevData` as const
/**
 * 用于在组件实例中保存 props 更新前的数据
 */
const MOR_PREV_PROPS = `$${MOR_PREFIX}PrevProps` as const
/**
 * 标记为已完成首次挂载
 */
const MOR_IS_IN_DID_MOUNT_FLAG = `$${MOR_PREFIX}IsInDidMount` as const

/**
 *  属性类型
 */
type ComponentPropType =
  | string
  | number
  | boolean
  | Record<string, any>
  | Array<any>
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function
  | null

declare function getCurrentPages(): any[]

interface IComponentProperties {
  [prop: string]: {
    type: ComponentPropType
    value: any
  }
}

interface IComponentConvertProp {
  name: string
  value: any
  type: ComponentPropType
}

// 空函数
function emptyFn(): void {
  return undefined
}

// 深拷贝
function cloneDeep<T = Record<string, any>>(
  data: T,
  type: string,
  from = ''
): T {
  try {
    return clone(data)
  } catch (error) {
    logger.warn(
      `[mor] 组件 ${from} 深拷贝 ${type} 失败, 兜底为浅拷贝, 失败原因: `,
      error
    )
    return { ...data }
  }
}

/**
 * 生成随机不重复事件 ID
 * @returns 事件 ID
 */
function generateEventId(prefix = 'e'): string {
  return prefix + '-' + String(+new Date()) + String(Math.random())
}

// 事件属性名称正则
// 也用于识别函数正则 按照支付宝小程序的规则，on 开头的是函数
const EVENT_ATTR_REG = /^on([A-Za-z]+)/

/**
 * 提取事件名称
 * @param attr 属性
 * @returns 事件名称
 */
function getEventName(attr: string): string {
  const match = attr.match(EVENT_ATTR_REG)
  if (match) {
    const eventName = match[1]
    return `${eventName[0].toLowerCase()}${eventName.slice(1)}`
  }
  return ''
}

/**
 * 获取 prop 的值类型
 *
 * 微信自定义组件的属性类型可以为 String Number Boolean Object Array 其一，也可以为 null 表示不限制类型
 *
 * 参见文档: https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html
 *
 * @param val - 组件中设置的 prop 属性值
 * @returns 属性类型
 */
function getPropType(val: any): ComponentPropType {
  const propType = Object.prototype.toString.call(val).slice(8, -1)
  if (propType === 'String') return String
  if (propType === 'Number') return Number
  if (propType === 'Boolean') return Boolean
  if (propType === 'Object') return Object
  if (propType === 'Array') return Array
  if (propType === 'Function') return Function
  return null
}

/**
 * 映射的 prop 名字，主要用于支持在微信中不识别或者有兼容问题的 prop
 */
const MAP_PROPS = { style: 'morStyle' }

/**
 * 还原映射后的 prop 名字，分开两个 object 主要是为了取值方便
 */
const RESTORE_PROPS = { morStyle: 'style' }

/**
 * 是否是需要映射的 prop
 *
 * @param prop - 属性名
 * @returns 是否是映射属性
 */
function isMapProp(prop: string): boolean {
  return prop in MAP_PROPS
}

/**
 * 判断是否是函数属性
 *
 * @param name - 属性名
 * @param value - 属性值
 * @param type - 属性类型
 * @returns 是否为函数属性
 */
function isFuncProp(name: string, value: any, type: any): boolean {
  if (
    type != null &&
    (type.name === 'Function' || typeof value === 'function')
  ) {
    return true
  }
  if (EVENT_ATTR_REG.test(name)) {
    return true
  }

  return false
}

/**
 * 处理映射的属性关系
 *
 * @param componentOptions - 组件选项
 * @param mappedProps - 映射的属性列表
 */
function hookMapProps(
  componentOptions: Record<string, any>,
  mappedProps: string[]
): void {
  if (!mappedProps.length) return
  for (const mapName of mappedProps) {
    componentOptions.observers[MAP_PROPS[mapName]] = function (val: any): void {
      this.setData({ [mapName]: val })
    }
  }
}

/**
 * 处理属性转换
 *
 * @param options - 组件选项
 */
function injectAndTransformProps(options: Record<string, any>): {
  commonProps: IComponentConvertProp[]
  funcProps: IComponentConvertProp[]
  mappedProps: string[]
} {
  const funcProps: IComponentConvertProp[] = []
  const commonProps: IComponentConvertProp[] = []
  const properties: IComponentProperties = {}

  const mappedProps = [] as string[]

  if (options.props) {
    Object.keys(options.props).forEach((name) => {
      if (name in MAP_PROPS) {
        mappedProps.push(name)
      }
      const value = options.props[name]
      const type = getPropType(value)
      const propName = isMapProp(name) ? MAP_PROPS[name] : name
      if (isFuncProp(name, value, type)) {
        funcProps.push({
          name: propName,
          value,
          type
        })
      } else {
        properties[propName] = {
          type,
          value
        }
        commonProps.push({
          name: propName,
          value,
          type
        })
      }
    })

    if (commonProps.length > 0) {
      options.properties = {
        ...options.properties,
        ...properties
      }
    }
  }

  options.data[MOR_FUNCTION_PROPS] = funcProps
  options.data[MOR_COMMON_PROPS] = commonProps

  return {
    commonProps,
    funcProps,
    mappedProps
  }
}

/**
 * 增加属性的监听，实现 this.props 的映射
 *
 * @param options - 组件选项
 * @param commonProps - 属性列表
 */
function injectObserversForCommonProps(
  options: Record<string, any>,
  commonProps: IComponentConvertProp[]
): void {
  const observerNames = commonProps.map((prop) => prop.name).join(',')

  options.observers[observerNames] = function (): void {
    if (!this[MOR_IS_INITIALIZED_FLAG]) this[MOR_IS_INITIALIZED_FLAG] = true
    if (!this.props) this.props = {}

    this.data[MOR_COMMON_PROPS].forEach((prop: IComponentConvertProp) => {
      this.props[prop.name] = this.data[prop.name]
      if (prop.name in RESTORE_PROPS) {
        this.props[RESTORE_PROPS[prop.name]] = this.data[prop.name]
      }
    })
  }
}

/**
 * 处理更新类的生命周期函数挂载
 *
 * @param options - 组件选项
 */
function hookObserversLifeCycle(options: Record<string, any>): void {
  if (options.didUpdate) {
    options.methods[MOR_DID_UPDATE_LIFECYCLE] = options.didUpdate
  }
  if (options.deriveDataFromProps) {
    options.methods[MOR_DERIVE_DATA_FROM_PROPS_LIFECYCLE] =
      options.deriveDataFromProps
  }
}

/**
 * 增加所有数据的监听，实现 this.props 等的映射
 *
 * @param componentOptions - 组件选项
 */
function injectWildcardObserversProps(
  componentOptions: Record<string, any>
): void {
  componentOptions.observers['**'] = function (): void {
    if (!this.props) this.props = {}
    if (!this[MOR_IS_INITIALIZED_FLAG]) this[MOR_PREV_DATA] = { ...this.data }
    if (!this[MOR_IGNORE_NEXT_DERIVE_DATA_FROM_PROPS_FLAG]) {
      this[MOR_PREV_PROPS] = { ...this.props }
    }

    const nextProps = cloneDeep(this.props, 'this.props', this?.is)

    if (this.data[MOR_COMMON_PROPS]) {
      this.data[MOR_COMMON_PROPS].forEach((prop: IComponentConvertProp) => {
        nextProps[prop.name] = this.data[prop.name]
        if (prop.name in RESTORE_PROPS) {
          nextProps[RESTORE_PROPS[prop.name]] = this.data[prop.name]
        }
      })
    }

    let ignoreNextDidUpdate = false
    if (
      this[MOR_DERIVE_DATA_FROM_PROPS_LIFECYCLE] &&
      !this[MOR_IGNORE_NEXT_DERIVE_DATA_FROM_PROPS_FLAG]
    ) {
      this[MOR_IS_RUNNING_DERIVE_DATA_FROM_PROPS_FLAG] = true
      this[MOR_DERIVE_DATA_FROM_PROPS_LIFECYCLE](nextProps)
      this[MOR_IS_RUNNING_DERIVE_DATA_FROM_PROPS_FLAG] = false

      if (this[MOR_IGNORE_NEXT_DERIVE_DATA_FROM_PROPS_FLAG]) {
        ignoreNextDidUpdate = true
      }
    }

    this.props = nextProps

    if (
      this[MOR_DID_UPDATE_LIFECYCLE] &&
      this[MOR_IS_INITIALIZED_FLAG] &&
      this[MOR_IS_IN_DID_MOUNT_FLAG] &&
      !ignoreNextDidUpdate
    ) {
      this[MOR_DID_UPDATE_LIFECYCLE](this[MOR_PREV_PROPS], this[MOR_PREV_DATA])
    }

    if (!this[MOR_IS_INITIALIZED_FLAG] && !ignoreNextDidUpdate) {
      this[MOR_IS_INITIALIZED_FLAG] = true
    }
  }
}

/**
 * 处理生命周期映射
 *
 * @param componentOptions - 组件选项
 * @param needsToObserversLifeCycle - 是否有做数据监听
 */
function hookComponentLifeCycle(
  componentOptions: Record<string, any>,
  needsToObserversLifeCycle: boolean
): void {
  /**
   * 调用原本的生命周期函数
   * @param fnName 事件名
   */
  const callOriginalFn = function (fnName: string): (...args: any[]) => void {
    let originalFn = componentOptions[fnName]
    if (componentOptions.lifetimes?.[fnName]) {
      originalFn = componentOptions.lifetimes[fnName]
    }
    return function (...args: any[]): void {
      if (originalFn) {
        originalFn.call(this, ...args)
      }
    }
  }

  /**
   * 初始化 this.props
   */
  const initializeProps = function (): void {
    if (!this[MOR_IS_INITIALIZED_FLAG] && this.data[MOR_COMMON_PROPS]) {
      if (!this.props) this.props = {}
      this.data[MOR_COMMON_PROPS].forEach((prop: IComponentConvertProp) => {
        this.props[prop.name] = this.data[prop.name]
        if (prop.name in RESTORE_PROPS) {
          this.props[RESTORE_PROPS[prop.name]] = this.data[prop.name]
        }
      })
    }
  }

  /**
   * 覆盖 this.setData 方法, 用于监听数据变化
   */
  const hackSetData = function (): void {
    const originalSetData = this.setData
    if (!originalSetData) {
      logger.error(`[mor] 劫持 setData 失败, 可能导致无法正确触发更新`)
    }
    this[MOR_PREV_DATA] = {}
    this.setData = (nextData: Record<string, any>, fn?: () => void): void => {
      // 在 deriveDataFromProps 中调用了 setData
      if (this[MOR_IS_RUNNING_DERIVE_DATA_FROM_PROPS_FLAG]) {
        this[MOR_IGNORE_NEXT_DERIVE_DATA_FROM_PROPS_FLAG] = true
        // 单独处理 deriveDataFromProps 中 setData 过程中修改的部分，否则 prevData 会错乱
        Object.keys(nextData).forEach((name) => {
          this[MOR_PREV_DATA][name] = this.data[name]
        })
      } else {
        this[MOR_IGNORE_NEXT_DERIVE_DATA_FROM_PROPS_FLAG] = false
        // 全量备份 prevData
        this[MOR_PREV_DATA] = {
          ...this.data
        }
      }
      originalSetData.call(this, nextData, () => {
        this[MOR_IGNORE_NEXT_DERIVE_DATA_FROM_PROPS_FLAG] = false
        // 补偿机制，可能会有风险，如果 setData 的回调执行过快
        this[MOR_PREV_DATA] = {
          ...this.data
        }

        fn?.call?.(this)
      })
    }
  }

  /**
   * 确保基础信息存在
   */
  const ensureBaseInfo = function (): void {
    if (!this.$page) {
      if (typeof getCurrentPages === 'function') {
        const pages = getCurrentPages()
        this.$page = pages[pages.length - 1]
      }
    }
    if (!this.$morId) this.$morId = String(generateId())
    if (!this.$id) this.$id = this.$morId
  }

  /**
   * 注入 this.props 函数事件
   */
  const injectPropsEventFunctions = function (): void {
    const morFuncProps = this.data[MOR_FUNCTION_PROPS]
    if (!morFuncProps?.length) return

    morFuncProps.forEach((eventProp: IComponentConvertProp) => {
      // 将函数 prop 写入到 this.props
      // 确保支付宝小程序中的诸如 this.props.onClick 可以被正确调用
      this.props[eventProp.name] = (...args: any[]): Promise<any> | void => {
        const triggerEventName = getEventName(eventProp.name)
        const eventId = generateEventId(eventProp.name)

        return new Promise((resolve, reject) => {
          if (this[MOR_EVENT_HANDLERS]) {
            const $event = getSharedProperty('$event', this)
            if ($event) {
              // 这里监听 eventId
              // 并标记为事件完成或失败
              $event.once(eventId, (value: any) => {
                // 如果是异常需要抛出
                value instanceof Error ? reject(value) : resolve(value)
              })
            } else {
              logger.warn(
                'aComponent 或 createComponent 运行时强依赖 $event 做事件处理，请检查配置'
              )
            }

            // 触发小程序原生事件
            // 事件会被 $morEventHandlerProxy 事件代理方法捕获
            // 并触发 event 事件, 基于 eventId
            this.triggerEvent(triggerEventName, {
              name: this[MOR_EVENT_HANDLERS][triggerEventName],
              args,
              id: eventId
            })

            // 如果无 $event 则直接 标记 完成
            if (!$event) resolve(undefined)
          }
        })
      }
    })
  }

  const injectEventHandlers = function (): void {
    const morEventHandlers = this.dataset?.[MOR_EVENT_HANDLERS_DATASET]

    if (morEventHandlers) {
      try {
        this[MOR_EVENT_HANDLERS] = JSON.parse(Base64.decode(morEventHandlers))

        // ref 支持
        if (this[MOR_EVENT_HANDLERS].ref) {
          this.triggerEvent('ref', {
            name: this[MOR_EVENT_HANDLERS].ref,
            args: [this]
          })
        }

        // 其他事件代理
        const handlerNames = Object.keys(this[MOR_EVENT_HANDLERS])
        if (this.data[MOR_FUNCTION_PROPS]) {
          this.data[MOR_FUNCTION_PROPS].forEach(
            (prop: IComponentConvertProp) => {
              if (handlerNames.indexOf(getEventName(prop.name)) === -1) {
                this.props[prop.name] = prop.value
              }
            }
          )
        }
      } catch (err) {
        logger.error(
          '转换 aComponent 或 createComponent 事件出错',
          morEventHandlers,
          err
        )
      }
    } else {
      if (this.data[MOR_FUNCTION_PROPS]) {
        this.data[MOR_FUNCTION_PROPS].forEach((prop: IComponentConvertProp) => {
          this.props[prop.name] = prop.value
        })
      }
    }
  }

  // 标记为 didMount
  const markAsDidMount = function (): void {
    this[MOR_IS_IN_DID_MOUNT_FLAG] = true
  }

  const lifetimes = componentOptions.lifetimes

  componentOptions.created = lifetimes.created = compose([
    needsToObserversLifeCycle ? hackSetData : emptyFn
  ])

  componentOptions.attached = lifetimes.attached = compose([
    initializeProps,
    ensureBaseInfo,
    injectPropsEventFunctions,
    injectEventHandlers,
    callOriginalFn('onInit'),
    callOriginalFn('attached')
  ])

  componentOptions.ready = lifetimes.ready = compose([
    markAsDidMount,
    // 补偿设置多一次，某些情况下会偶现 getCurrentPages 返回为空，导致 this.$page 为空
    ensureBaseInfo,
    callOriginalFn('didMount'),
    callOriginalFn('ready')
  ])

  componentOptions.detached = lifetimes.detached = compose([
    callOriginalFn('didUnmount'),
    callOriginalFn('detached')
  ])

  componentOptions.error = lifetimes.error = compose([
    callOriginalFn('onError'),
    callOriginalFn('error')
  ])
}

/**
 * 处理默认自定义组件的 options
 *
 * @param componentOptions - 组件选项
 */
function addCompatibleOptions(componentOptions: Record<string, any>): void {
  if (!componentOptions.options.styleIsolation) {
    // 将样式共享默认设置成全局，保持和支付宝一致的行为
    componentOptions.options.styleIsolation = 'shared'
  }

  if (typeof componentOptions.options.multipleSlots === 'undefined') {
    // 默认设置成多slot，经过实验，默认slot开启了没关系
    componentOptions.options.multipleSlots = true
  }

  if (componentOptions.options.pureDataPattern) {
    logger.warn(
      'options.pureDataPattern 会用于 aComponent 或 createComponent 的 $mor 内部属性维护' +
        '如果需要使用请增加 /^\\$mor/ 的适配'
    )
  } else {
    componentOptions.options.pureDataPattern = /^\$mor/
  }
}

/**
 * 确保组件有对应的对象的存在
 *
 * @param options - 组件选项
 */
function ensureOptions(options: Record<string, any>): void {
  if (!options.data) options.data = {}
  if (!options.observers) options.observers = {}
  if (!options.options) options.options = {}
  if (!options.methods) options.methods = {}
  if (!options.lifetimes) options.lifetimes = {}
}

/**
 * 清除无用的选项
 * @param options - 组件选项
 */
function cleanOptions(options: Record<string, any>): void {
  delete options.props
  delete options.onInit
  delete options.deriveDataFromProps
  delete options.didMount
  delete options.didUpdate
  delete options.didUnmount
}

/**
 * 支付宝小程序转其他端的 Component 差异抹平
 *
 * @export
 * @param options - 组件选项
 */
export function initComponent(options: Record<string, any>): void {
  const hasDidUpdate = typeof options.didUpdate === 'function'
  const hasDeriveDataFromProps =
    typeof options.deriveDataFromProps === 'function'
  const needsToObserversLifeCycle = hasDidUpdate || hasDeriveDataFromProps

  // 确保必要的内容
  ensureOptions(options)

  // 设置自定义组件的兼容性选项
  addCompatibleOptions(options)

  // 属性兼容性处理
  const { commonProps, mappedProps } = injectAndTransformProps(options)
  if (mappedProps.length) hookMapProps(options, mappedProps)
  if (commonProps.length && !needsToObserversLifeCycle) {
    injectObserversForCommonProps(options, commonProps)
  }

  if (needsToObserversLifeCycle) {
    hookObserversLifeCycle(options)
    injectWildcardObserversProps(options)
  }

  // 注入组件生命周期
  hookComponentLifeCycle(options, needsToObserversLifeCycle)

  // 添加事件代理支持
  addEventProxy(options.methods)

  // 注入实例方法的兼容性支持
  injectInstanceMethodsSupport(options.methods)

  // 清理无用的 选项
  cleanOptions(options)
}
