import { injectTwoWayBindingMethodsSupport } from './utilsToOther'

/**
 * 微信转其他小程序的 Page 差异抹平
 */
export function initPage(options: Record<string, any>): void {
  options = options || {}

  // 注入双向绑定支持
  injectTwoWayBindingMethodsSupport(options, {}, {}, false)
}
