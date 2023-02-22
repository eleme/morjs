import { CompileModuleKind, CompileScriptTarget } from '@morjs/utils'

export const target = 'baidu'
export const targetDescription = '百度小程序'

export const fileType = {
  template: '.swan',
  style: '.css',
  config: '.json',
  script: '.js',
  sjs: '.sjs'
} as const

export const globalObject = 'swan'
export const resolveMainFields = ['baidu', 'main']
export const defaultConditionalFileExt = '.bd'
export const sjsTagName = 'import-sjs'
export const sjsSrcAttrName = 'src'
export const sjsModuleAttrName = 'module'
export const isSupportSjsContent = true
export const defaultOutputDir = 'dist/baidu'
export const compileModuleKind = CompileModuleKind.CommonJS
export const compileScriptTarget = CompileScriptTarget.ES5
export const projectConfigFiles = ['project.swan.json']
export const supportGlobalComponents = false
export const templateSingleTagNames = []

export const templateDirectives = {
  if: 's-if',
  elseIf: 's-elif',
  else: 's-else',
  for: 's-for',
  forItem: 's-for-item',
  forIndex: 's-for-index',
  key: 'trackBy'
}
