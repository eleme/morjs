import { CompileModuleKind, CompileScriptTarget } from '@morjs/utils'

export const target = 'bytedance'
export const targetDescription = '字节小程序'

export const fileType = {
  template: '.ttml',
  style: '.ttss',
  config: '.json',
  script: '.js',
  sjs: '.sjs'
} as const

export const globalObject = 'tt'

// 字节的小程序组件规范有些特别，需要
// miniprogramType 指定为 tt-npm 且
// 需要在 exports 字段中指定 pages 和 components
// https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/framework/npm/
// 后续要看下是否需要兼容字节小程序原生的组件支持
export const resolveMainFields = ['bytedance', 'main']
export const defaultConditionalFileExt = '.tt'
export const sjsTagName = 'sjs'
export const sjsSrcAttrName = 'src'
export const sjsModuleAttrName = 'module'
export const isSupportSjsContent = true
export const defaultOutputDir = 'dist/bytedance'
export const compileModuleKind = CompileModuleKind.CommonJS
export const compileScriptTarget = CompileScriptTarget.ES5
export const projectConfigFiles = ['project.tt.json', 'project.config.json']
export const supportGlobalComponents = false
export const templateSingleTagNames = ['import', 'include']

export const templateDirectives = {
  if: 'tt:if',
  elseIf: 'tt:elif',
  else: 'tt:else',
  for: 'tt:for',
  forItem: 'tt:for-item',
  forIndex: 'tt:for-index',
  key: 'tt:key'
}
