import { getPageAsKey } from '../utils/index'

// 整合page route 逻辑
export const getEventName = (eventName) => {
  return getPageAsKey() + '_' + eventName
}

export const PAGE_ON_READY = 'pageOnReady'

export default class Event {
  private callbackMap = {}

  on(eventName, callback) {
    const keys = Object.keys(this.callbackMap)

    if (keys.indexOf(eventName) < 0) this.callbackMap[eventName] = []

    this.callbackMap[eventName].push(callback)
  }

  emit(eventName, params) {
    eventName = getEventName(eventName)
    // 页面销毁时会触发该事件，销毁该页面绑定的所有回调
    if (eventName === 'clearPageOnReadyCallback')
      return this.removeAllCallbacks(getEventName(PAGE_ON_READY))

    const keys = Object.keys(this.callbackMap)

    if (keys.indexOf(eventName) < 0) return

    const callbacks = this.callbackMap[eventName]
    callbacks.forEach((callback) => callback(params))
  }

  clear() {
    this.callbackMap = {}
  }

  removeAllCallbacks(eventName) {
    if (this.callbackMap[eventName] && this.callbackMap[eventName].length > 0) {
      this.callbackMap[eventName] = []
    }
  }

  remove(eventName, callback) {
    const keys = Object.keys(this.callbackMap)

    if (keys.indexOf(eventName) < 0) return

    const callbacks = this.callbackMap[eventName]
    const callbackIndex = callbacks.indexOf(callback)

    if (callbackIndex >= 0) this.callbackMap[eventName].splice(callbackIndex, 1)
  }

  size(eventName) {
    const keys = Object.keys(this.callbackMap)
    if (keys.indexOf(eventName) < 0) return 0

    return this.callbackMap[eventName].length
  }

  once(eventName, callback) {
    const index = this.size(eventName)

    const wrapperCallback = (params) => {
      callback(params)
      this.remove(eventName, this.callbackMap[eventName][index])
    }

    this.on(eventName, wrapperCallback)
  }
}
