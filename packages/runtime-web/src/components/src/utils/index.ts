import { rpxToRem } from '../rpx'

/**
 * 设备是否支持触摸事件
 */
export function supportTouch() {
  return 'ontouchend' in document ? true : false
}

export function uuid() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

//颜色取反
export function colorReverse(oldColor) {
  const color: any = '0x' + oldColor.replace(/#/g, '')
  const str = '000000' + (0xffffff - color).toString(16)
  return '#' + str.substring(str.length - 6, str.length)
}

// 判断颜色是否为白色
export const isPureWhite = (color = '') => {
  color = color.toLowerCase()
  const WHITE = ['#fff', '#ffffff']

  return !!~WHITE.indexOf(color)
}

// 根据ua判断是否为ios系统
export const isIos = () => {
  try {
    const userAgent = navigator.userAgent
    return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  } catch (e) {
    console.warn(`${e}`)
    return false
  }
}

/*
  对于既支持 touch 又支持mouse的设备上，在touch中阻止了mouse事件，
  所以input类型的元素也无法聚焦，使用本方法给input类型元素加上focus行为
*/
export const addFocusToInputTypeElement = (node) => {
  const WHITE_LIST = ['input', 'textarea']
  try {
    const name = node.nodeName.toLowerCase()
    const isInputType = WHITE_LIST.some((item) => name.indexOf(item))
    // 如果不是input类型，直接返回
    if (!isInputType) return

    const findNode = (name) =>
      node && node.shadowRoot && node.shadowRoot.querySelector(name)
    const focus = (nodeArr = []) =>
      nodeArr.forEach(
        (item) => typeof item.focus === 'function' && item.focus()
      )
    const nodes = []

    WHITE_LIST.map((item) => {
      const nodeItem = findNode(item)
      nodeItem && nodes.push(nodeItem)
    })

    focus(nodes)
  } catch (e) {}
}

// 给定一个 propery 数组，返回 property map
export const getPropertiesByAttributes = (keys = []) => {
  const map = {}

  if (keys.length <= 0) return map
  keys.forEach((key) => (map[key] = Symbol.for(key)))

  return map
}

export const defineElement = (name, element) => {
  if (!customElements.get(name)) {
    customElements.define(name, element)
  }
}

export const converterForPx = {
  fromAttribute: (value = '') => {
    const isPx = String(value).indexOf('px') > -1

    if (isPx) return value
    return rpxToRem(Number(value))
  }
}

export function shouldEnableFor(
  feature:
    | boolean
    | string[]
    | ((pagePath: string, pageOptions: Record<string, any>) => boolean),
  pagePath: string,
  pageOptions: Record<string, any>
): boolean | undefined {
  // 未获取到 pagePath 或者未传递 feature 的场景 直接返回，不做任何处理
  if (!pagePath || typeof feature === 'undefined') return
  if (feature === true) return true
  if (feature === false) return false

  if (Array.isArray(feature)) {
    return feature.includes(pagePath)
  }
  if (typeof feature === 'function') {
    return !!feature(pagePath, pageOptions)
  }
}

export function getPageConfig(
  config:
    | Record<string, any>
    | ((
        pagePath: string,
        pageOptions: Record<string, any>
      ) => Record<string, any>),
  pagePath: string,
  pageOptions: Record<string, any>
) {
  if (!pagePath) return
  if (typeof config === 'object') return config

  if (typeof config === 'function') {
    const result = config(pagePath, pageOptions)
    if (typeof result === 'object') return result
  }
}

export const getCurrentPageParams = (keys = []): Record<string, any> => {
  try {
    const pageStack = getCurrentPages() || []
    const currentPage = pageStack[pageStack.length - 1]
    const result = {}
    keys.forEach((key) => {
      result[key] = currentPage[key]
    })

    return result
  } catch (e) {
    return {}
  }
}

export const getCurrentPagePath = () => {
  try {
    const pageStack = getCurrentPages() || []
    const currentPage = pageStack[pageStack.length - 1]
    return currentPage.path
  } catch (e) {}
}

const REFRESH_INTERVAL = 1000 / 60
export const requestAnimationFrame = (callback) => {
  if (typeof window.requestAnimationFrame === 'function')
    return window.requestAnimationFrame(callback)

  return setTimeout(callback, REFRESH_INTERVAL)
}

// 获取当前页面的参数
export function getQueryParams(url) {
  const encodeEqual = encodeURIComponent('=')
  // 说明url被encode过
  if (url && url.indexOf(encodeEqual) >= 0 && url.indexOf('=') < 0) {
    url = decodeURIComponent(url)
  }

  const params = {}
  if (url.indexOf('?') !== -1) {
    const str = url.substr(url.indexOf('?') + 1)
    const strArr = str.split('&')
    for (let i = 0; i < strArr.length; i++) {
      params[strArr[i].split('=')[0]] = decodeURIComponent(
        strArr[i].split('=')[1]
      )
    }
  }
  return params
}

export const isUndefined = (param) => typeof param === 'undefined'

export const isFunction = (param) => typeof param === 'function'

export const isObject = (param) => param !== null && typeof param === 'object'

export const isTypeOf = (param, type) => {
  const typeString = Object.prototype.toString.call(param)

  return /^\[object (.*)\]$/.exec(typeString)[1] === type
}

type NavItemType =
  | number
  | string
  | ((page: string, pageOptions: Record<string, any>) => number | string)
export interface NavConfigType {
  statusBarHeight?: NavItemType
  titleBarHeight?: NavItemType
}
/**
 * 根据导航配置和页面路径获取导航属性
 * @param {navConfig} nav - 导航配置对象
 * @param {string} pagePath - 当前页面路径
 * @param {string} pageOptions - 当前页面 query 对象
 * @returns {Object} 包含状态栏高度和标题栏高度的对象
 */
export function getNav(
  nav: NavConfigType,
  pagePath: string,
  pageOptions: Record<string, any>
) {
  const navProps = {}
  if (!isObject(nav)) return navProps

  Object.keys(nav).forEach((key) => {
    const value = nav[key]
    if (!isUndefined(value)) {
      // 函数类型 值支持
      if (isFunction(value)) {
        const result = value(pagePath, pageOptions)
        // 当函数返回值类型为数字或字符串时，更新对象
        if (isTypeOf(result, 'Number') || isTypeOf(result, 'String')) {
          navProps[key] = result
        } else
          console.warn(
            `自定义 ${key} 失败: 当指定为函数类型时，返回值应为 string 或者 number 类型`
          )
      }
      // 字符串 / 数字 类型支持
      else navProps[key] = value
    }
  })

  return navProps
}
