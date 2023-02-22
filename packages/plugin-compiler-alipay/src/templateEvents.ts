import { lodash as _ } from '@morjs/utils'

/**
 * 所有组件都支持的基础事件
 */
const commonNativeEvent = [
  // touch
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  // tap
  'tap',
  'longtap',
  // animation
  'transitionend',
  'animationiteration',
  'animationstart',
  'animationend'
]

/**
 * 原生小程序组件下支持的事件（用于区分自定义事件和原生事件）
 */
const tagNativeEvent = {
  view: ['appear', 'disappear', 'firstappear'],
  swiper: ['change', 'transition', 'animationend'],
  'scroll-view': ['scrolltoupper', 'scrolltolower', 'scroll'],
  'movable-view': ['change', 'changeend', 'scale'],
  form: ['submit', 'reset'],
  input: ['input', 'confirm', 'focus', 'blur'],
  textarea: ['input', 'confirm', 'focus', 'blur'],
  'radio-group': ['change'],
  checkbox: ['change'],
  'checkbox-group': ['change'],
  switch: ['change'],
  slider: ['change', 'changing'],
  'picker-view': ['change'],
  picker: ['change'],
  image: ['load', 'error'],
  video: [
    'play',
    'pause',
    'ended',
    'timeupdate',
    'loading',
    'stop',
    'renderstart',
    'error',
    'fullscreenchange',
    'useraction'
  ],
  map: ['markertap', 'callouttap', 'controltap', 'regionchange'],
  'web-view': ['message']
} as {
  [tag: string]: string[]
}

/**
 * 基础事件在当前小程序环境对应的事件
 */
const commonReplaceNativeEvent = {
  longTap: 'longpress',
  touchStart: 'touchstart',
  touchMove: 'touchmove',
  touchCancel: 'touchcancel',
  touchEnd: 'touchend',
  transitionEnd: 'transitionend',
  animationStart: 'animationstart',
  animationIteration: 'animationiteration',
  animationEnd: 'animationend'
}

/**
 * 原生小程序组件事件在当前小程序环境中对应的事件
 */
const tagReplaceNativeEvent = {
  'scroll-view': {
    scrollToUpper: 'scrolltoupper',
    scrollToLower: 'scrolltolower'
  },
  checkbox: {
    change: 'tap'
  },
  map: {
    regionChange: 'regionchange',
    markerTap: 'markertap',
    calloutTap: 'callouttap',
    controlTap: 'controltap'
  }
}

const tagReplacePropName = {
  slider: {
    'background-color': 'backgroundColor',
    'active-color': 'activeColor',
    'handle-size': 'block-size',
    handleSize: 'block-size',
    'handle-color': 'block-color',
    handleColor: 'block-color'
  }
}

/**
 * 判断小程序组件属性是否是事件（是否以on开头）
 */
const eventAttrReg = /^on([A-Za-z]+)/

/**
 * 是否是事件属性
 *
 * @export
 * @param {string} attr 属性名
 * @returns {boolean} 是否是事件属性
 */
export function isEventAttr(attr: string): boolean {
  return eventAttrReg.test(attr)
}

/**
 * 判断小程序组件属性是否是catch事件（是否以catch开头）
 */
const catchEventAttrReg = /^catch([A-Za-z]+)/

/**
 * 是否是catch事件属性
 *
 * @export
 * @param {string} attr 属性名
 * @returns {boolean} 是否是catch事件属性
 */
export function isCatchEventAttr(attr: string): boolean {
  return catchEventAttrReg.test(attr)
}

/**
 * 获取属性上的事件名（去除on、catch后的字符串）
 *
 * @export
 * @param {string} attr 属性名
 * @returns {string} 事件名
 */
export function getEventName(attr: string): string {
  const onMatch = attr.match(eventAttrReg)
  if (onMatch) {
    const eventName = onMatch[1]
    return _.lowerFirst(eventName)
  }
  const catchMatch = attr.match(catchEventAttrReg)
  if (catchMatch) {
    const eventName = catchMatch[1]
    return _.lowerFirst(eventName)
  }
  return ''
}

/**
 * 是否是小程序组件原生事件
 *
 * @export
 * @param {string} eventName 事件名
 * @param {string} tag 小程序组件名
 * @returns {boolean} 是否是小程序组件原生事件
 */
export function isNativeEvent(eventName: string, tag: string): boolean {
  const eventLowerName = eventName.toLowerCase()
  if (commonNativeEvent.includes(eventLowerName)) {
    return true
  }

  if (tag in tagNativeEvent && tagNativeEvent[tag].includes(eventLowerName)) {
    return true
  }

  return false
}

/**
 * 获取当前小程序环境下的小程序组件原生组件事件名
 *
 * @export
 * @param {string} eventName 事件名
 * @param {string} tag 小程序组件名
 * @returns {string} 事件名
 */
export function getNativeEventName(eventName: string, tag: string): string {
  if (eventName in commonReplaceNativeEvent) {
    return commonReplaceNativeEvent[eventName]
  }

  if (tag in tagReplaceNativeEvent && eventName in tagReplaceNativeEvent[tag]) {
    return tagReplaceNativeEvent[tag][eventName]
  }

  return eventName
}

/**
 * 获取当前小程序环境下的小程序组件原生属性名
 *
 * @export
 * @param {string} tag 小程序组件名
 * @param {string} propName 属性名
 * @returns {string} 属性名
 */
export function getNativePropName(tag: string, propName: string): string {
  if (tag in tagReplacePropName && propName in tagReplacePropName[tag]) {
    return tagReplacePropName[tag][propName]
  }

  return propName
}
