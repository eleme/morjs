import { injectHasMixinSupport } from '../common/behaviorOrMixin'
import { addEventProxy, injectInstanceMethodsSupport } from './utilsToOther'

/**
 * 支付宝转其他端的 Page 差异抹平
 */
export function initPage(options: Record<string, any>): void {
  addEventProxy(options)
  injectInstanceMethodsSupport(options)
  injectHasMixinSupport(options, options.mixins || [])
}
