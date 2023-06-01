import { isSimilarTarget, target as CurrentTarget } from './constants'

/**
 * 生成文件路径
 * @param dir - 目录
 * @param fileName - 文件名
 */
function generatePath(dir: string, fileName: string): string {
  return require.resolve(`@morjs/runtime-mini/lib/${dir}/${fileName}.js`)
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
      api = generatePath('alipay', 'apisToOther')
      page = generatePath('alipay', 'pageToOther')
      component = generatePath('alipay', 'componentToOther')
      mixin = generatePath('common', 'behaviorOrMixin')
    }
    // 其他端转支付宝(微信 => 支付宝)
    else if (isSimilarTarget(target)) {
      api = generatePath('alipay', 'apisToAlipay')
      page = generatePath('alipay', 'pageToAlipay')
      component = generatePath('alipay', 'componentToAlipay')
      behavior = generatePath('common', 'behaviorOrMixin')
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
