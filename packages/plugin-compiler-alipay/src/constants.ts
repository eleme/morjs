import { CompileModuleKind, CompileScriptTarget } from '@morjs/utils'

export const target = 'alipay'
export const targetDescription = '支付宝小程序'

export const fileType = {
  template: '.axml',
  style: '.acss',
  config: '.json',
  script: '.js',
  sjs: '.sjs'
} as const

export const globalObject = 'my'
export const resolveMainFields = ['alipay', 'module', 'main']
export const defaultConditionalFileExt = '.my'
export const sjsTagName = 'import-sjs'
export const sjsSrcAttrName = 'from'
export const sjsModuleAttrName = 'name'
export const isSupportSjsContent = false
export const defaultOutputDir = 'dist/alipay'
export const compileModuleKind = CompileModuleKind.ESNext
export const compileScriptTarget = CompileScriptTarget.ES2015
export const compileSjsTarget = CompileScriptTarget.ES2019
export const projectConfigFiles = ['project.alipay.json', 'mini.project.json']
// 支付宝 IDE 3.1.2 及以上开始支持
export const supportGlobalComponents = true
export const templateSingleTagNames = [
  'switch',
  'image',
  'video',
  'icon',
  'progress',
  'input'
]

export const templateDirectives = {
  if: 'a:if',
  elseIf: 'a:elif',
  else: 'a:else',
  for: 'a:for',
  forItem: 'a:for-item',
  forIndex: 'a:for-index',
  key: 'a:key'
}

// 支持双向绑定的组件配置
export const twoWayBindingComponents = {
  input: {
    bindEventName: 'onInput',
    bindEventKey: 'value'
  },
  textarea: {
    bindEventName: 'onInput',
    bindEventKey: 'value'
  },
  swiper: {
    bindEventName: 'onChange',
    bindEventKey: 'current'
  },
  switch: {
    bindEventName: 'onChange',
    bindEventKey: 'value'
  },
  slider: {
    bindEventName: 'onChange',
    bindEventKey: 'value'
  }
}

/**
 * 支付宝相关小程序
 * 由于 阿里系 小程序已支付宝小程序为基础
 * 这里允许通过外部设定某个 target 可以当做 支付宝小程序处理
 */
const SIMILAR_TARGETS = new Set<string>([target])

/**
 * 判断是否是类似支付宝的小程序
 * @param target - 目标平台
 * @returns 是否是类似支付宝的小程序
 */
export function isSimilarTarget(target: string): boolean {
  return SIMILAR_TARGETS.has(target)
}

/**
 * 添加类似支付宝小程序的 target
 * @param target - 目标平台
 */
export function addSimilarTarget(target: string): void {
  SIMILAR_TARGETS.add(target)
}

/**
 * 添加类似支付宝小程序的 target
 * @param t - 目标平台
 */
export function removeSimilarTarget(t: string): void {
  // 不允许删除 alipay 本身
  if (t === target) return
  SIMILAR_TARGETS.delete(t)
}
