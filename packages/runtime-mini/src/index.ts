import * as apisToAlipay from './alipay/apisToAlipay'
import * as apisToOther from './alipay/apisToOther'
import * as componentToAlipay from './alipay/componentToAlipay'
import * as componentToOther from './alipay/componentToOther'
import * as pageToAlipay from './alipay/pageToAlipay'
import * as pageToOther from './alipay/pageToOther'
import * as apisToBaidu from './baidu/apis'
import * as apisToByteDance from './bytedance/apis'
import * as apisToKuaishou from './kuaishou/apis'
import * as apisToQQ from './qq/apis'
import * as apisToWechat from './wechat/apis'

interface InitAdapterOptions {
  sourceType: 'alipay' | 'wechat'
  target: string
  createApi: (
    api?: any,
    options?: any
  ) => { override: () => any } & Record<string, any>
  registerComponentAdapters: (adapters?: any[]) => void
  registerPageAdapters: (adapters?: any[]) => void
}

/**
 * 初始化转端适配逻辑
 * @param sourceType - 源码类型
 * @param target - 目标平台
 */
export function initAdapters(options: InitAdapterOptions) {
  const {
    sourceType,
    target,
    createApi,
    registerComponentAdapters,
    registerPageAdapters
  } = options || {}

  // 源码和目标平台一致时不转换
  if (sourceType === target) return

  // target 的 adapter 需要放在 source adapter 之前
  // 和编译时自动注入逻辑保持一致
  const componentAdapters: Record<string, any>[] = []
  const pageAdapters: Record<string, any>[] = []
  const apiAdapters: Record<string, any>[] = []

  // 支付宝转其他端
  if (sourceType === 'alipay') {
    switch (target) {
      case 'wechat':
        apiAdapters.push(apisToWechat)
        break
      case 'baidu':
        apiAdapters.push(apisToBaidu)
        break
      case 'bytedance':
        apiAdapters.push(apisToByteDance)
        break
      case 'qq':
        apiAdapters.push(apisToQQ)
        break
      case 'kuaishou':
        apiAdapters.push(apisToKuaishou)
        break
    }

    componentAdapters.push(componentToOther)
    pageAdapters.push(pageToOther)
    apiAdapters.push(apisToOther)
  }

  // 微信转其他端
  else if (sourceType === 'wechat') {
    switch (target) {
      case 'alipay':
        componentAdapters.push(componentToAlipay)
        pageAdapters.push(pageToAlipay)
        apiAdapters.push(apisToAlipay)
        break
      case 'baidu':
        apiAdapters.push(apisToBaidu)
        break
      case 'bytedance':
        apiAdapters.push(apisToByteDance)
        break
      case 'qq':
        apiAdapters.push(apisToQQ)
        break
      case 'kuaishou':
        apiAdapters.push(apisToKuaishou)
        break
    }
  }

  // 注入多端适配
  if (componentAdapters.length) registerComponentAdapters(componentAdapters)
  if (pageAdapters.length) registerPageAdapters(pageAdapters)
  if (apiAdapters.length) createApi(apiAdapters, {}).override()
}
