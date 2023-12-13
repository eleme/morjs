import deepCopy from 'lodash.clonedeep'
import get from 'lodash.get'
import lEqual from 'lodash.isequal'
import set from 'lodash.set'
import toPath from 'lodash.topath'
import React from 'react'
import ReactDOM from 'react-dom'
import eventConvert from './event-convert'
import { combineValue, mergeExecution } from './utils/common'
import { catchComponentMethodsError } from './utils/errorHandler'
import { mountIntersectionObserver } from './utils/instanceApi'

let componetLastId = 0

function isEqual(v1: any, v2: any) {
  // 不能直接调用  lodash.isequal。 因为如果开发者在调用setData 之前直接对原来的数据做处理，那么两次的比较肯定是一样的。这样就不会触发render
  return v1 === v2
}

interface IState {
  prevProps: any
  cachePrePropsAction: any
  deriveDataFromProps: (props?: Record<string, any>) => void
}

declare global {
  interface Window {
    // 用于标记 rax 运行环境
    $__USING_RAX__: boolean
  }
}

export class KBComponent extends React.PureComponent<any, IState> {
  private cachePreDataAction
  private updateDataQueue
  private options
  $id
  private eventsInfo

  protected _isMounted
  componentConfig
  protected $defaultProps: any
  /**
   *
   * @param {*} props
   * @param {*} componentConfig
   * @param {isComplexComponents,isComponent} options
   */
  constructor(props, componentConfig, options) {
    super(props)

    this.cachePreDataAction = {}
    this.updateDataQueue = []
    this.options = options || {}
    this.state = {
      // 将deriveDataFromProps 放在state中，实在是无奈之举
      // 因为 getDerivedStateFromProps 是静态方法，只能使用这样的方式来实现在 getDerivedStateFromProps 调用组件中的方法。
      deriveDataFromProps: this.deriveDataFromProps.bind(this),
      prevProps: deepCopy(componentConfig.props || {}),
      cachePrePropsAction: {}
    }

    // 避免自定义组件props为undefined
    componentConfig.props = componentConfig.props || {}

    componetLastId++
    // 得益于JS是单线程，因此这里也不用考虑串的问题。
    this.$id = componetLastId
    // 用于判断组件当前是否已经mounted，用于解决在组件未挂载就执行 forceData 的问题
    this._isMounted = false

    this.forceResetConfig(componentConfig)
    this.onInit()

    this.eventsInfo = {}
    this._raiseEvent = this._raiseEvent.bind(this)

    if (!window?.$__USING_RAX__) {
      /*
        描述: 解决 React 中一直报 warning 的问题
        具体错误: uses getDerivedStateFromProps() but also contains the following legacy lifecycles: componentWillReceiveProps
      */
      this.componentWillReceiveProps = undefined
    }
  }

  forceResetConfig(componentConfig) {
    if (this.options.isComponent) {
      componentConfig.$id = this.$id
    }
    // 默认属性
    this.$defaultProps = deepCopy(componentConfig.props)
    // 是否使用Proxy代理methods函数以便提供onError捕获
    const shouldProxyComponentMethods =
      this.options.isComponent && typeof componentConfig.onError === 'function'
    // 组件配置
    this.componentConfig = shouldProxyComponentMethods
      ? catchComponentMethodsError(componentConfig, componentConfig.onError)
      : componentConfig
    // 将methods中的方法移动到config中。方便在用户使用的时候以this来访问
    if (componentConfig.methods) {
      Object.keys(componentConfig.methods).forEach((key) => {
        if (typeof componentConfig.methods[key] === 'function') {
          componentConfig[key] = componentConfig.methods[key]
        }
      })
      delete componentConfig.methods
    }

    this.mergePropsToComponent(this.mergeProps(this.props))

    // 绑定componentConfig中方法的this指针
    for (const key in this.componentConfig) {
      const v = this.componentConfig[key]
      if (typeof v === 'function') {
        this.componentConfig[key] = this._bindMethod(v)
      }
    }

    // 绑定componentConfig.data中方法的this指针
    this.componentConfig.data = this.componentConfig.data || {}
    for (const key in this.componentConfig.data) {
      const v = this.componentConfig.data[key]
      if (typeof v === 'function') {
        this.componentConfig.data[key] = this._bindMethod(v)
      }
    }

    // 添加refs 引用变量
    this.componentConfig.refs = {}

    // 绑定 setData 方法
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this
    this.componentConfig.setData = function (data, callback) {
      const updateData = (obj, callback) => {
        let hasUpdateData = false // 是否有更新data中的数据

        Object.keys(obj).forEach((key) => {
          // 这里做了简单的 相等 判断。 防止某些生命周期的死循环
          const newValue = get(obj, key)
          if (
            newValue !== undefined &&
            !isEqual(newValue, get(this.data, key))
          ) {
            hasUpdateData = true
            Object.prototype.hasOwnProperty.call(this.data, key) &&
              (_this.cachePreDataAction[key] = get(this.data, key))
            set(this.data, key, newValue)
          }
        })

        if (hasUpdateData && _this._isMounted) {
          // false 的情况只有发生在，用户只是更新 props中的value
          _this.forceUpdate(callback)
        } else {
          callback && callback()
        }
      }

      if (!_this._isMounted) return updateData(data, callback)

      _this.updateDataQueue.push({ data, callback })
      // 合并批量更新
      setTimeout(() => {
        const obj = combineValue(_this.updateDataQueue)
        const callback = mergeExecution(_this.updateDataQueue)
        _this.updateDataQueue = []

        updateData(obj, callback)
      })
    }.bind(this.componentConfig)

    // 绑定 $spliceData 方法
    this.componentConfig.$spliceData = function (obj, callback) {
      const updateDataArray = {}

      Object.keys(obj).forEach((key) => {
        const propValue = obj[key]
        const dataValue = get(this.data, key)
        // 对非数组值进行过滤
        if (!Array.isArray(dataValue) || !Array.isArray(propValue)) {
          console.warn(`${key}: 用法错误，请检查参数或者当前 this.data 的值`)
          return
        }

        // 进行浅拷贝
        const resultValue = [...dataValue]

        Array.prototype.splice.apply(resultValue, propValue)
        updateDataArray[key] = resultValue
      })

      this.setData(updateDataArray, callback)
    }.bind(this.componentConfig)

    this.componentConfig._updateProp = function (propName, value) {
      // 更新 prop 必须由 外部调用 setData 来实现。组件内部不会调用
      // 更新prop的value必须由外部来更新
      if (this.props._onUpdateProp) {
        //使用propName来找到 实际更新的 valuePath,
        const valuePath = this.props._twoWayBindingPropPair[propName]
        this.props._onUpdateProp(valuePath, value)
      }
    }

    this.componentConfig.route = window.$getRoute && window.$getRoute()
    this.componentConfig.pageId = window.$getPageId && window.$getPageId()

    this.componentConfig.createIntersectionObserver = (options) => {
      return mountIntersectionObserver(options, this.getRoot())
    }

    this.updatePageConfig()
  }

  updatePageConfig() {
    if (!window.getCurrentPages) return

    const pageStack = getCurrentPages() || []
    const currentPage = pageStack[pageStack.length - 1]
    // TODO: 这里的 router 判断和 pageId 判断可以考虑合并, 两者的作用类似
    if (!currentPage || currentPage.route !== this.componentConfig.route) return

    if (this.options.isComponent) {
      this.componentConfig.$page = new Proxy(currentPage, {
        get(object, prop) {
          return Reflect.get(object, prop)
        },
        set(object, prop, value) {
          if (
            currentPage &&
            currentPage.__tigaPage &&
            currentPage.__tigaPage.componentConfig
          ) {
            currentPage.__tigaPage.componentConfig[prop] = value
          }

          return Reflect.set(object, prop, value)
        }
      })
    } else {
      // 页面实例相同才需要更新
      if (currentPage.pageId === this.componentConfig.pageId) {
        Object.assign(currentPage, this.componentConfig)
      }
    }
  }

  onInit() {
    // 组件生命周期函数，组件创建时触发
    if (this.componentConfig.onInit) {
      this.componentConfig.onInit()
    }
  }
  componentWillReceiveProps(props) {
    // 非 rax 环境不执行后续逻辑
    if (!window?.$__USING_RAX__) return

    const state = this.state
    let hasPropData = false // 是否有更新data中的数据

    Object.keys(props).forEach((key) => {
      // 这里做了简单的 相等 判断。 防止某些生命周期的死循环
      const newValue = get(props, key)
      const preValue = get(state.prevProps, key)
      if (newValue !== undefined && !lEqual(newValue, preValue)) {
        hasPropData = true

        typeof preValue !== 'undefined' &&
          (state.cachePrePropsAction[key] = preValue)
        set(state.prevProps, key, newValue)
      }
    })

    state.deriveDataFromProps(props)

    if (hasPropData) {
      return {
        ...state.prevProps
      }
    }

    return null
  }

  static getDerivedStateFromProps(props, state) {
    let hasPropData = false // 是否有更新data中的数据
    Object.keys(props).forEach((key) => {
      // 这里做了简单的 相等 判断。 防止某些生命周期的死循环
      const newValue = get(props, key)
      const preValue = get(state.prevProps, key)
      if (newValue !== undefined && !lEqual(newValue, preValue)) {
        hasPropData = true

        typeof preValue !== 'undefined' &&
          (state.cachePrePropsAction[key] = preValue)
        set(state.prevProps, key, newValue)
      }
    })
    state.deriveDataFromProps(props)

    if (hasPropData) {
      return {
        ...state.prevProps
      }
    }

    return null
  }

  // NOTE:组件创建时和更新前触发
  deriveDataFromProps(props) {
    /**
     * 合并props，如果传过来的props  value 是undifined 那么就使用defualtProp 替代
     */
    const newProps = this.mergeProps(props)
    ;(this.state as IState).prevProps = (() => {
      const keys = Object.keys(this.state.cachePrePropsAction)
      const result = { ...newProps, ...this.state.prevProps }

      keys.forEach((key) => {
        const value = newProps[key]

        if (typeof value === 'object') result[key] = deepCopy(value)
      })

      return result
    })()

    // mixin deriveDataFromProps 相关
    if (this.componentConfig.deriveDataFromProps) {
      this.componentConfig.deriveDataFromProps(newProps)
    }

    this.mergePropsToComponent(newProps)
    requestAnimationFrame(() => this.updatePageConfig())
  }

  mergeProps(props) {
    const newProps = this.hasPropsChanged(props)
      ? { ...this.componentConfig.props }
      : this.componentConfig.props || props

    Object.keys(props).forEach((key) => {
      if (key !== 'children') {
        const value = props[key]
        if (value !== undefined) {
          newProps[key] = value
        }
      }
    })
    // 删除children，当前runtime 不暴露 children
    delete newProps.children
    return newProps
  }

  hasPropsChanged(props) {
    let hasPropsChanged = false
    Object.keys(props).forEach((key) => {
      if (key !== 'children') {
        const newValue = get(props, key)
        if (
          newValue !== undefined &&
          !lEqual(newValue, get(this.componentConfig.props, key))
        ) {
          hasPropsChanged = true
        }
      }
    })

    return hasPropsChanged
  }

  // 合并props
  mergePropsToComponent(props) {
    // 将props 合并到自定义组件中
    if (
      !this.componentConfig.props ||
      typeof this.componentConfig.props !== 'object'
    ) {
      this.componentConfig.props = props
    } else {
      Object.assign(this.componentConfig.props, props)
    }
  }

  componentDidMount() {
    this._isMounted = true
    this._bindEvents()

    setTimeout(() => {
      this.didMount()
    })
  }

  didMount() {
    // 组件生命周期函数，组件创建完毕时触发
    if (this.componentConfig.didMount) {
      this.componentConfig.didMount()
    }
  }

  componentDidUpdate() {
    this.didUpdate()
    // 执行完didUpdate可能还有元素未显示出来导致dom无法获取绑定事件失败
    setTimeout(() => this._bindEvents())
  }

  getPreSnapshot(source, cacheActions) {
    const keys = Object.keys(cacheActions)
    const result = { ...source }

    keys.forEach((key) => {
      const path = toPath(key)
      if (path.length > 1) {
        // 对象值改动需要深克隆
        result[path[0]] = deepCopy(result[path[0]])
        set(result, path, cacheActions[key])
      } else {
        set(result, key, cacheActions[key])
      }
    })

    return result
  }

  didUpdate() {
    // 组件生命周期函数，组件更新完毕时触发
    if (this.componentConfig.didUpdate && this.options.isComponent) {
      this.componentConfig.didUpdate(
        this.getPreSnapshot(
          this.componentConfig.props || {},
          this.state.cachePrePropsAction
        ),
        this.getPreSnapshot(
          this.componentConfig.data || {},
          this.cachePreDataAction
        )
      )
      ;(this.state as IState).cachePrePropsAction = {}
      this.cachePreDataAction = {}
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    ;(this.state as IState).cachePrePropsAction = {}
    this.cachePreDataAction = {}
    this.updateDataQueue = []
    this.didUnmount()
  }

  didUnmount() {
    // 	组件生命周期函数，组件删除时触发
    if (this.componentConfig.didUnmount) {
      this.componentConfig.didUnmount()
    }
  }

  getRenderData() {
    // data 的数据会覆盖 prop 的数据。 这个是区别于微信小程序的，在微信小程序中，props会覆盖data中数据
    const $slots = {}
    if (this.props.children) {
      if (this.props.children instanceof Array) {
        this.props.children.forEach((i: ReactNodeSlot) => {
          if (i.props && i.props._slot) {
            $slots[i.props._slot] = i
          }
        })
      } else {
        const i = this.props.children as any
        if (i.props && i.props._slot) {
          $slots[i.props._slot] = i
        }
      }
    }
    return Object.assign(
      {
        $children: this.props.children,
        $reactComp: this,
        $slots,
        $id: this.$id
      },
      this.componentConfig.props,
      this.componentConfig.data
    )
  }

  // 当触发ref的时候
  onRef(ref, value) {
    if (ref && typeof this.componentConfig[value] === 'function') {
      // 从这里的代码可以看出，ref 有可能有三种不同的形态， 1、dom 原生元素 2、非小程序的react 组件 3、小程序自定义组件
      if (ref instanceof KBComponent) {
        let _ref = ref.componentConfig
        if (typeof _ref.ref === 'function') {
          _ref = _ref.ref()
        }
        this.componentConfig[value].call(this.componentConfig, _ref)
      } else {
        this.componentConfig[value].call(this.componentConfig, ref)
      }
      return true
    } else {
      // 进入自动绑定流程
      if (ref instanceof KBComponent) {
        this.componentConfig.refs[value] = ref.componentConfig
      } else {
        this.componentConfig.refs[value] = ref
      }
    }
    return false
  }

  // 根据方法名获取组件实例的方法
  getCompMethod(methodName) {
    let method
    if (typeof methodName === 'string') {
      const func = this.componentConfig[methodName]
      if (func && typeof func === 'function') {
        method = func
      }
    } else if (typeof methodName === 'function') {
      method = methodName
    } else {
      throw new Error('绑定的事件名必须是 string 或者 function')
    }
    return this._bindMethod(method)
  }

  _bindMethod(method) {
    if (method && !method.__isBind__) {
      method = method.bind(this.componentConfig)
      method.__isBind__ = true
      if (method.name in this.componentConfig) {
        this.componentConfig[method.name] = method //绑定到组件
      }
    }
    return method
  }

  /**
   * 动态绑定事件
   */
  _bindEvents() {
    // 避免卸载之后继续执行 findDOMNode 操作
    if (!this._isMounted) return

    const root = this.getRoot()
    if (!root) return

    for (const nodeId in this.eventsInfo) {
      const events = this.eventsInfo[nodeId]
      // NOTE: 这块后续可以优化成一次性找出所有的元素。
      // 先通过 tiga_node_id 来找到对应的节点元素。
      let elments

      if (this.options.isComplexComponents) {
        elments = Array.from(
          ((root.parentElement || root) as Element).getElementsByClassName(
            `${nodeId} comp-id-${this.$id}`
          )
        )
      } else {
        if ('classList' in root && root.classList.contains(nodeId)) {
          elments = [root]
        } else {
          if ('getElementsByClassName' in root) {
            elments = Array.from(root.getElementsByClassName(nodeId))
          }
        }
      }
      // 然后动态添加绑定。
      for (const el of elments) {
        // 动态给元素设置 一个属性 tigaNodeId，方便事件触发的时候找到 事件回调函数
        el.tigaNodeId = nodeId
        for (const eventInfo of events) {
          el.addEventListener(eventInfo.name, this._raiseEvent)
        }
      }
    }
  }

  _raiseEvent(e) {
    const currentTarget = e.currentTarget
    // 根据nodeId找到对应的事件配置
    const nodeId = currentTarget.tigaNodeId
    if (nodeId) {
      const events = this.eventsInfo[nodeId]
      if (events) {
        const eventInfo = events.filter((i) => i.name === e.type).pop()
        // NOTE:catch 会阻止事件冒泡  https://opendocs.alipay.com/mini/framework/events#%E4%BA%8B%E4%BB%B6%E7%B1%BB%E5%9E%8B
        if (eventInfo.catch) {
          e.stopPropagation()
        }
        const func = this.componentConfig[eventInfo.event]
        func && func.call(this.componentConfig, eventConvert(e))
      }
    }
  }

  registEvents(events, nodeId) {
    this.eventsInfo[nodeId] = events
  }

  getRoot() {
    try {
      return ReactDOM.findDOMNode(this)
    } catch (e) {
      return null
    }
  }
}
