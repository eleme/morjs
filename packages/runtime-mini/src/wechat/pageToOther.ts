import { injectTwoWayBindingMethodsSupport } from './utilsToOther'

/**
 * 支付宝转其他端的 Page 差异抹平
 */
export function initPage(options: Record<string, any>): void {
  options = options || {}

  // 注入双向绑定支持
  injectTwoWayBindingMethodsSupport(options, {}, {}, false)
}
