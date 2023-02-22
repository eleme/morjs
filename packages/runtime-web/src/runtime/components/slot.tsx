import flattendeep from 'lodash.flattendeep'
import get from 'lodash.get'
import React from 'react'

export class Slot extends React.PureComponent<{
  name: string
  slots: React.ReactNode
  $scopeKeys: string[]
}> {
  componentDidMount() {
    const instance = get(this.props, 'slots._owner._instance')
    instance &&
      typeof instance._bindEvents === 'function' &&
      instance._bindEvents()
  }

  override render() {
    const { name, slots } = this.props
    if (!slots) {
      return this.props.children || false
    }
    const findSlots = []
    // NOTE：之所以递归降维到一维数组，是因为有可能slots本身就是一个数组。
    flattendeep([slots]).forEach((s) => {
      if (typeof s === 'function') {
        // slot是function，那么目前只有一种可能，那就是slot-scope
        if (s._name === name || (!name && !s._name)) {
          // 具名插槽或者是默认插槽
          // 合成数据对象。
          const $scopeKeys = this.props.$scopeKeys
          const args = {}
          if ($scopeKeys && $scopeKeys.length > 0) {
            $scopeKeys.forEach((key) => (args[key] = this.props[key]))
          }
          // slot-scope
          // 直接调用函数，并且将数据传入。
          findSlots.push(s(args))
        }
      } else {
        try {
          if (s.props._slot === name) {
            //具名插槽
            findSlots.push(s)
          }
        } catch (e) {
          // 之所以会出现crash的情况，这里为了简化实现方案。比如string、number这些值类型数据，是没有props属性的。
          if (!name)
            // 只有在默认插槽下面才会显示
            findSlots.push(s)
        }
      }
    })
    if (findSlots.length === 0) return this.props.children || false
    if (findSlots.length === 1) return findSlots[0]
    return findSlots
  }
}
