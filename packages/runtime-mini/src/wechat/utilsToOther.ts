const MOR_TWO_WAY_BINDING_MAP = 'morChildTwbMap'

/**
 * 注入双向绑定方法
 */
export function injectTwoWayBindingMethodsSupport(
  methods: Record<string, any>,
  observers: Record<string, any>,
  properties: Record<string, any>,
  isComponent: boolean
) {
  function parseTwoWayBingMap(str: string) {
    const map: Record<string, string> = {}
    str.split(',').forEach(function (pair) {
      const [key, value] = pair.split(':')
      map[key] = value
    })
    return map
  }

  // 双向绑定劫持自定义事件，主要针对原生组件的事件方法调用
  methods.$morTWBProxy = function (event: Record<string, any>) {
    const { mortwbmethod, mortwbkey, mortwbvalue } =
      event?.target?.dataset || {}

    this.setData({
      [mortwbvalue]: event?.detail?.[mortwbkey]
    })

    // 双向绑定时，tag 上自定义的响应事件
    if (mortwbmethod) {
      this[mortwbmethod]?.(event)
    }
  }

  // 自定义组件的双向绑定方法 $morParentTWBProxy
  methods.$morParentTWBProxy = function (event: Record<string, any>) {
    const { key, value } = event?.detail || {}
    if (key) {
      this.setData({ [key]: value })
    }
  }

  // 监听所有的 properties
  for (const property in properties) {
    const originalObserver = observers[property]
    // 注入属性变化的监听
    observers[property] = function (value: any) {
      const bindingStr = this.properties?.[MOR_TWO_WAY_BINDING_MAP]
      if (bindingStr && typeof bindingStr === 'string') {
        // 仅初始化一次：
        if (!this[MOR_TWO_WAY_BINDING_MAP]) {
          this[MOR_TWO_WAY_BINDING_MAP] = parseTwoWayBingMap(bindingStr)
        }

        const map = this[MOR_TWO_WAY_BINDING_MAP]
        if (map[property]) {
          // 自定义组件通知父组件更新时设置一定的延迟
          // 如果更新频率过高，可能导致父组件更新之后，再次触发子组件更新
          // 从而引发更新错乱以及反复更新的问题
          const timer = `${MOR_TWO_WAY_BINDING_MAP}-${property}-timer`
          if (this[timer]) clearTimeout(this[timer])
          this[timer] = setTimeout(() => {
            this.triggerEvent('mortwbproxy', {
              key: map[property],
              value: value
            })
          }, 16.6)
        }
      }

      if (typeof originalObserver === 'function') {
        originalObserver.call(this, value)
      }
    }
  }

  // 如果是自定义组件，通过 observers 实现数据变化的监听，并通过事件传递变化
  if (isComponent) {
    // 注入双向绑定的映射关系属性
    properties[MOR_TWO_WAY_BINDING_MAP] = {
      type: String,
      value: ''
    }
  }
}
