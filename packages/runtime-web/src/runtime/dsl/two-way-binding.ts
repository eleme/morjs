// 获取事件的value
function defaultGetValueFromEvent(valuePropName, event) {
  if (event && event.target && valuePropName in event.target) {
    return event.target[valuePropName]
  }
  return event
}

export default {
  // 双向绑定
  twoWayBinding(thisTarget) {
    const _this = thisTarget
    return function (valuePath, value) {
      _this.setData({
        [valuePath]: value
      })
    }
  },
  /**
   *
   * @param {*} thisTarget 处理数据更改事件的对象
   * @param {*} valuePropName 绑定的属性名
   * @param {*} valuePath 属性名对应的表达式
   * @param {*} getValueFromEvent 对于有些组件，无法通过简单的判断来确定具体value的来源，那么可以通过getValueFromEvent 显式告知runtime
   * @param {*} otherEventCallBack 其他的事件回调函数。可以形成调用链
   */
  twoWayBindingMergeChangeEvent(
    thisTarget,
    valuePropName,
    valuePath,
    getValueFromEvent,
    otherEventCallBack
  ) {
    // NOTE: 这里面其实已经不需要关心onChange方法会不会跟自定义组件冲突，导致既触发twoWayBindingMergeChangeEvent 又触发 twoWayBinding。
    // 因为，twoWayBinding 的触发，必须是由组件开发者主动通过setData({propname:v}) 来实现的。
    // 而onChange 是直接调用 onChange 方法来触发的。 这两种只会有二选一的情况出现。不会同时出现。

    // TODO:不过貌似还是有问题，比如：使用组件的时候确实是双向绑定，但是 onChange 是额外触发的
    // 这个后面再仔细靠考虑考虑怎么解决
    const _this = thisTarget
    return function (event) {
      // 先调用setData。
      if (getValueFromEvent && typeof getValueFromEvent === 'function') {
        _this.setData({
          [valuePath]: getValueFromEvent(event)
        })
      } else {
        _this.setData({
          [valuePath]: defaultGetValueFromEvent(valuePropName, event)
        })
      }

      // 然后调用额外的回调方法
      if (otherEventCallBack) {
        otherEventCallBack(event)
      }
    }
  }
}
