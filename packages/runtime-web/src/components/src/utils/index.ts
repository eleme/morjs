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
