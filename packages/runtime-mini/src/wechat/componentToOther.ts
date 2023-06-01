import { injectTwoWayBindingMethodsSupport } from './utilsToOther'

/**
 * 确保组件有对应的对象的存在
 *
 * @param options - 组件选项
 */
function ensureOptions(options: Record<string, any>): void {
  if (!options.data) options.data = {}
  if (!options.properties) options.properties = {}
  if (!options.props) options.props = {}
  if (!options.options) options.options = {}
  if (!options.methods) options.methods = {}
  if (!options.lifetimes) options.lifetimes = {}
  if (!options.observers) options.observers = {}
}

/**
 * 微信转其他小程序的 Component 差异抹平
 */
export function initComponent(options: Record<string, any>) {
  // 确保选项必要字段存在
  ensureOptions(options)

  // 注入双向绑定方法
  injectTwoWayBindingMethodsSupport(
    options.methods,
    options.observers,
    options.properties,
    true
  )
}
