import { CompileModuleKind, CompileScriptTarget } from '@morjs/utils'

export const target = 'kuaishou'
export const targetDescription = '快手小程序'

export const fileType = {
  template: '.ksml',
  style: '.css',
  config: '.json',
  script: '.js',
  sjs: '.wxs'
} as const

export const globalObject = 'ks'

export const resolveMainFields = ['kuaishou', 'main']
export const defaultConditionalFileExt = '.ks'
export const sjsTagName = 'wxs'
export const sjsSrcAttrName = 'src'
export const sjsModuleAttrName = 'module'
export const isSupportSjsContent = true
export const defaultOutputDir = 'dist/kuaishou'
export const compileModuleKind = CompileModuleKind.CommonJS
export const compileScriptTarget = CompileScriptTarget.ES5
export const projectConfigFiles = ['project.ks.json', 'project.config.json']
export const supportGlobalComponents = false
export const templateSingleTagNames = ['import', 'include']

export const templateDirectives = {
  if: 'ks:if',
  elseIf: 'ks:elif',
  else: 'ks:else',
  for: 'ks:for',
  forItem: 'ks:for-item',
  forIndex: 'ks:for-index',
  key: 'ks:key'
}
