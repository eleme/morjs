import { CompileModuleKind, CompileScriptTarget } from '@morjs/utils'

export const target = 'qq'
export const targetDescription = 'QQ 小程序'

export const fileType = {
  template: '.qml',
  style: '.qss',
  config: '.json',
  script: '.js',
  sjs: '.qs'
} as const

export const globalObject = 'qq'
export const resolveMainFields = ['qq', 'miniprogram', 'main']
export const defaultConditionalFileExt = '.qq'
export const sjsTagName = 'qs'
export const sjsSrcAttrName = 'src'
export const sjsModuleAttrName = 'module'
export const isSupportSjsContent = true
export const defaultOutputDir = 'dist/qq'
export const compileModuleKind = CompileModuleKind.CommonJS
export const compileScriptTarget = CompileScriptTarget.ES5
export const projectConfigFiles = ['project.qq.json', 'project.config.json']
export const supportGlobalComponents = true
export const templateSingleTagNames = []

export const templateDirectives = {
  if: 'qq:if',
  elseIf: 'qq:elif',
  else: 'qq:else',
  for: 'qq:for',
  forItem: 'qq:for-item',
  forIndex: 'qq:for-index',
  key: 'qq:key'
}

/**
 * 自定义 template 处理
 */
export const templateProcessor = {}
