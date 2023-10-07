'use strict'

const module = require('..')
const { addSimilarTarget } = require('@morjs/plugin-compiler-alipay')

describe('@morjs/plugin-compiler-dingding - index.test.js', () => {
  describe('index', () => {
    it('should export the correct target', () => {
      expect(module.target).toBe('dingding')
    })

    it('should export the correct target description', () => {
      expect(module.targetDescription).toBe('钉钉小程序')
    })

    it('should export the correct compileModuleKind', () => {
      expect(module.compileModuleKind).toBe('CommonJS')
    })

    it('should export the correct compileScriptTarget', () => {
      expect(module.compileScriptTarget).toBe('ES5')
    })

    it('should export the correct fileType', () => {
      expect(module.fileType).toEqual({
        template: '.swan',
        style: '.css',
        config: '.json',
        script: '.js',
        sjs: '.sjs'
      })
    })

    it('should export the correct getRuntimeFiles', () => {
      expect(module.getRuntimeFiles).toBeInstanceOf(Function)
    })

    it('should export the correct isSupportSjsContent', () => {
      expect(module.isSupportSjsContent).toBe(true)
    })

    it('should export the correct sjsModuleAttrName', () => {
      expect(module.sjsModuleAttrName).toBe('module')
    })

    it('should export the correct sjsSrcAttrName', () => {
      expect(module.sjsSrcAttrName).toBe('src')
    })

    it('should export the correct sjsTagName', () => {
      expect(module.sjsTagName).toBe('import-sjs')
    })

    it('should export the correct supportGlobalComponents', () => {
      expect(module.supportGlobalComponents).toBe(false)
    })

    it('should export the correct templateDirectives', () => {
      expect(module.templateDirectives).toEqual({
        if: 's-if',
        elseIf: 's-elif',
        else: 's-else',
        for: 's-for',
        forItem: 's-for-item',
        forIndex: 's-for-index',
        key: 'trackBy'
      })
    })

    it('should export the correct templateProcessor', () => {
      expect(module.templateProcessor).toBeInstanceOf(Function)
    })

    it('should export the correct templateSingleTagNames', () => {
      expect(module.templateSingleTagNames).toEqual([])
    })

    it('should export the correct globalObject', () => {
      expect(module.globalObject).toBe('dd')
    })

    it('should export the correct resolveMainFields', () => {
      expect(module.resolveMainFields).toEqual(['dingding', 'main'])
    })

    it('should export the correct defaultConditionalFileExt', () => {
      expect(module.defaultConditionalFileExt).toBe('.dd')
    })

    it('should export the correct defaultOutputDir', () => {
      expect(module.defaultOutputDir).toBe('dist/dingding')
    })

    it('should export the correct projectConfigFiles', () => {
      expect(module.projectConfigFiles).toEqual([
        'project.dd.json',
        'mini.project.json'
      ])
    })

    it('should call addSimilarTarget with the correct target', () => {
      expect(addSimilarTarget).toHaveBeenCalledWith('dingding')
    })
  })
})
