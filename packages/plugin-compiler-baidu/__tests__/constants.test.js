'use strict'

const module = require('../constants')

describe('@morjs/plugin-compiler-baidu - constants.test.js', () => {
  describe('constants', () => {
    it('should export the correct target', () => {
      expect(module.target).toBe('baidu')
    })

    it('should export the correct target description', () => {
      expect(module.targetDescription).toBe('百度小程序')
    })

    it('should export the correct file types', () => {
      expect(module.fileType).toEqual({
        template: '.swan',
        style: '.css',
        config: '.json',
        script: '.js',
        sjs: '.sjs'
      })
    })

    it('should export the correct global object', () => {
      expect(module.globalObject).toBe('swan')
    })

    it('should export the correct resolve main fields', () => {
      expect(module.resolveMainFields).toEqual(['baidu', 'main'])
    })

    it('should export the correct default conditional file extension', () => {
      expect(module.defaultConditionalFileExt).toBe('.bd')
    })

    it('should export the correct sjsTagName', () => {
      expect(module.sjsTagName).toBe('import-sjs')
    })

    it('should export the correct sjsSrcAttrName', () => {
      expect(module.sjsSrcAttrName).toBe('src')
    })

    it('should export the correct sjsModuleAttrName', () => {
      expect(module.sjsModuleAttrName).toBe('module')
    })

    it('should export the correct isSupportSjsContent', () => {
      expect(module.isSupportSjsContent).toBe(true)
    })

    it('should export the correct defaultOutputDir', () => {
      expect(module.defaultOutputDir).toBe('dist/baidu')
    })

    it('should export the correct compileModuleKind', () => {
      expect(module.compileModuleKind).toBe('CommonJS')
    })

    it('should export the correct compileScriptTarget', () => {
      expect(module.compileScriptTarget).toBe('ES5')
    })

    it('should export the correct projectConfigFiles', () => {
      expect(module.projectConfigFiles).toEqual(['project.swan.json'])
    })

    it('should export the correct supportGlobalComponents', () => {
      expect(module.supportGlobalComponents).toBe(false)
    })

    it('should export the correct templateSingleTagNames', () => {
      expect(module.templateSingleTagNames).toEqual([])
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
  })
})
