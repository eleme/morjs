import { CompileModuleKind, CompileScriptTarget } from '@morjs/utils'

export const target = 'wechat'
export const targetDescription = '微信小程序'
export const fileType = {
  template: '.wxml',
  style: '.wxss',
  config: '.json',
  script: '.js',
  sjs: '.wxs'
} as const

export const globalObject = 'wx'

export const resolveMainFields = ['wechat', 'miniprogram', 'main']
export const defaultNpmMiniProgramDist = 'miniprogram_dist'
export const defaultConditionalFileExt = '.wx'
export const sjsTagName = 'wxs'
export const sjsSrcAttrName = 'src'
export const sjsModuleAttrName = 'module'
export const isSupportSjsContent = true
export const defaultOutputDir = 'dist/wechat'
export const compileModuleKind = CompileModuleKind.CommonJS
export const compileScriptTarget = CompileScriptTarget.ES5
export const projectConfigFiles = ['project.wechat.json', 'project.config.json']
export const supportGlobalComponents = true
export const templateSingleTagNames = []

export const templateDirectives = {
  if: 'wx:if',
  elseIf: 'wx:elif',
  else: 'wx:else',
  for: 'wx:for',
  forItem: 'wx:for-item',
  forIndex: 'wx:for-index',
  key: 'wx:key'
}

/**
 * 自定义 template 处理
 */
export const templateProcessor = {}
