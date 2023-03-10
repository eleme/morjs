import { compose } from '@morjs/runtime-base'
import {
  injectComponentSelectorMethodsSupport,
  injectCreateIntersectionObserverSupport,
  injectHasBehaviorSupport,
  markUnsupportMethods
} from './utilsToAlipay'

/**
 * 注入页面实例方法支持
 */
function injectPageInstanceMethodSupport(options: Record<string, any>) {
  // 批量更新数据 支持
  options.groupSetData = function (cb: () => void) {
    this.$batchedUpdates(cb)
  }

  // 获取页面标识符
  options.getPageId = function () {
    return this.$viewId
  }
}

/**
 * 注入页面事件支持
 */
function injectPageEventSupport(options: Record<string, any>) {
  options.events = options.events || {}

  // onResize 对齐
  if (options.onResize) {
    options.events.onResize = options.onResize
  }
}

/**
 * 支付宝转其他端的 Page 差异抹平
 */
export function initPage(options: Record<string, any>): void {
  options = options || {}

  // 注入 createIntersectionObserver 方法
  const onLoadFns = [injectCreateIntersectionObserverSupport()]
  if (typeof options.onLoad === 'function') onLoadFns.push(options.onLoad)
  options.onLoad = compose(onLoadFns)

  // 注入页面事件支持
  injectPageEventSupport(options)

  // 标记不支持的实例方法
  markUnsupportMethods(options)

  // 注入页面实例方法支持
  injectPageInstanceMethodSupport(options)

  // 注入组件选择器支持
  injectComponentSelectorMethodsSupport(options, 'page')

  // 注入 hasBehavior 支持
  injectHasBehaviorSupport(options, options.behaviors || [])
}
