import { target as WechatTarget } from '@morjs/plugin-compiler-wechat'
import { target as CurrentTarget } from './constants'

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

  if (sourceType !== target && target === CurrentTarget) {
    api = generatePath('kuaishou', 'apis')
    mixin = generatePath('common', 'behaviorOrMixin')

    // 微信 DSL 转 字节
    if (sourceType === WechatTarget) {
      component = generatePath('wechat', 'componentToOther')
      page = generatePath('wechat', 'pageToOther')
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
