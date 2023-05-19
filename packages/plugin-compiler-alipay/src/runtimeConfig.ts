import { isSimilarTarget, target as CurrentTarget } from './constants'

/**
 * 生成文件路径
 * @param fileName - 文件名
 */
function generatePath(fileName: string): string {
  return require.resolve(`@morjs/runtime-mini/lib/alipay/${fileName}.js`)
}

function generateCommonPath(fileName: string): string {
  return require.resolve(`@morjs/runtime-mini/lib/common/${fileName}.js`)
}

/**
 * 获取运行时抹平相关代码路径
 * @param sourceType - 源码类型
 * @param target - 目标平台
 */
export function getRuntimeFiles(sourceType: string, target: string) {
  let api: string
  let app: string
  let page: string
  let component: string
  let behavior: string
  let mixin: string

  if (sourceType !== target) {
    // 支付宝转其他端
    if (sourceType === CurrentTarget && !isSimilarTarget(target)) {
      api = generatePath('apisToOther')
      page = generatePath('pageToOther')
      component = generatePath('componentToOther')
      mixin = generateCommonPath('behaviorOrMixin')
    }
    // 其他端转支付宝(微信 => 支付宝)
    else if (isSimilarTarget(target)) {
      api = generatePath('apisToAlipay')
      page = generatePath('pageToAlipay')
      component = generatePath('componentToAlipay')
      behavior = generateCommonPath('behaviorOrMixin')
    }
  }

  return {
    api,
    app,
    page,
    component,
    behavior,
    mixin
  }
}
