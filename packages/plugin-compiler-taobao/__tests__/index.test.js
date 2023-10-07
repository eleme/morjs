'use strict'

const {
  target,
  targetDescription,
  compileModuleKind,
  compileScriptTarget,
  fileType,
  getRuntimeFiles,
  isSupportSjsContent,
  sjsModuleAttrName,
  sjsSrcAttrName,
  sjsTagName,
  supportGlobalComponents,
  templateDirectives,
  templateProcessor,
  templateSingleTagNames,
  globalObject,
  resolveMainFields,
  defaultConditionalFileExt,
  defaultOutputDir,
  projectConfigFiles
} = require('..')

describe('@morjs/plugin-compiler-taobao - index.test.js', () => {
  describe('constants', () => {
    it('should export the correct target', () => {
      expect(target).toBe('taobao')
    })

    it('should export the correct targetDescription', () => {
      expect(targetDescription).toBe('淘宝小程序')
    })

    it('should export the correct compileModuleKind', () => {
      expect(compileModuleKind).toBe(
        'CompileModuleKind value from plugin-compiler-alipay'
      )
    })

    it('should export the correct compileScriptTarget', () => {
      expect(compileScriptTarget).toBe(
        'CompileScriptTarget value from plugin-compiler-alipay'
      )
    })

    it('should export the correct fileType', () => {
      expect(fileType).toBe('fileType value from plugin-compiler-alipay')
    })

    it('should export the correct getRuntimeFiles', () => {
      expect(getRuntimeFiles).toBe(
        'getRuntimeFiles value from plugin-compiler-alipay'
      )
    })

    it('should export the correct isSupportSjsContent', () => {
      expect(isSupportSjsContent).toBe(
        'isSupportSjsContent value from plugin-compiler-alipay'
      )
    })

    it('should export the correct sjsModuleAttrName', () => {
      expect(sjsModuleAttrName).toBe(
        'sjsModuleAttrName value from plugin-compiler-alipay'
      )
    })

    it('should export the correct sjsSrcAttrName', () => {
      expect(sjsSrcAttrName).toBe(
        'sjsSrcAttrName value from plugin-compiler-alipay'
      )
    })

    it('should export the correct sjsTagName', () => {
      expect(sjsTagName).toBe('sjsTagName value from plugin-compiler-alipay')
    })

    it('should export the correct supportGlobalComponents', () => {
      expect(supportGlobalComponents).toBe(
        'supportGlobalComponents value from plugin-compiler-alipay'
      )
    })

    it('should export the correct templateDirectives', () => {
      expect(templateDirectives).toBe(
        'templateDirectives value from plugin-compiler-alipay'
      )
    })

    it('should export the correct templateProcessor', () => {
      expect(templateProcessor).toBe(
        'templateProcessor value from plugin-compiler-alipay'
      )
    })

    it('should export the correct templateSingleTagNames', () => {
      expect(templateSingleTagNames).toBe(
        'templateSingleTagNames value from plugin-compiler-alipay'
      )
    })

    it('should export the correct globalObject', () => {
      expect(globalObject).toBe('my')
    })

    it('should export the correct resolveMainFields', () => {
      expect(resolveMainFields).toEqual(['taobao', 'main'])
    })

    it('should export the correct defaultConditionalFileExt', () => {
      expect(defaultConditionalFileExt).toBe('.tb')
    })

    it('should export the correct defaultOutputDir', () => {
      expect(defaultOutputDir).toBe('dist/taobao')
    })

    it('should export the correct projectConfigFiles', () => {
      expect(projectConfigFiles).toEqual([
        'project.tb.json',
        'mini.project.json'
      ])
    })
  })
})
