'use strict'

const module = require('..')
const { CompileModuleKind, CompileScriptTarget } = require('@morjs/utils')

describe('@morjs/plugin-compiler-qq - index.test.js', () => {
  describe('constants', () => {
    it('should export the correct target', () => {
      expect(module.target).toBe('qq')
    })

    it('should export the correct target description', () => {
      expect(module.targetDescription).toBe('QQ 小程序')
    })

    it('should export the correct fileType', () => {
      expect(module.fileType).toEqual({
        template: '.qml',
        style: '.qss',
        config: '.json',
        script: '.js',
        sjs: '.qs'
      })
    })

    it('should export the correct globalObject', () => {
      expect(module.globalObject).toBe('qq')
    })

    it('should export the correct resolveMainFields', () => {
      expect(module.resolveMainFields).toEqual(['qq', 'miniprogram', 'main'])
    })

    it('should export the correct defaultConditionalFileExt', () => {
      expect(module.defaultConditionalFileExt).toBe('.qq')
    })

    it('should export the correct sjsTagName', () => {
      expect(module.sjsTagName).toBe('qs')
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
      expect(module.defaultOutputDir).toBe('dist/qq')
    })

    it('should export the correct compileModuleKind', () => {
      expect(module.compileModuleKind).toBe(CompileModuleKind.CommonJS)
    })

    it('should export the correct compileScriptTarget', () => {
      expect(module.compileScriptTarget).toBe(CompileScriptTarget.ES5)
    })

    it('should export the correct projectConfigFiles', () => {
      expect(module.projectConfigFiles).toEqual([
        'project.qq.json',
        'project.config.json'
      ])
    })

    it('should export the correct supportGlobalComponents', () => {
      expect(module.supportGlobalComponents).toBe(true)
    })

    it('should export the correct templateSingleTagNames', () => {
      expect(module.templateSingleTagNames).toEqual([])
    })

    it('should export the correct templateDirectives', () => {
      expect(module.templateDirectives).toEqual({
        if: 'qq:if',
        elseIf: 'qq:elif',
        else: 'qq:else',
        for: 'qq:for',
        forItem: 'qq:for-item',
        forIndex: 'qq:for-index',
        key: 'qq:key'
      })
    })

    it('should export an empty templateProcessor', () => {
      expect(module.templateProcessor).toEqual({})
    })
  })

  describe('runtimeConfig', () => {
    jest.mock('@morjs/runtime-mini/lib/qq/apis', () => '/mock/apis.js')
    jest.mock(
      '@morjs/runtime-mini/lib/common/behaviorOrMixin',
      () => '/mock/behaviorOrMixin.js'
    )

    describe('generatePath', () => {
      it('should return the correct path for the given fileName', () => {
        const fileName = 'apis'
        const result = generatePath(fileName)
        expect(result).toBe('/mock/apis.js')
      })
    })

    describe('generateCommonPath', () => {
      it('should return the correct path for the given fileName', () => {
        const fileName = 'behaviorOrMixin'
        const result = generateCommonPath(fileName)
        expect(result).toBe('/mock/behaviorOrMixin.js')
      })
    })

    describe('getRuntimeFiles', () => {
      it('should return the correct runtime files object when sourceType is not equal to target', () => {
        const sourceType = 'some-other-target'
        const target = module.CurrentTarget
        const result = module.getRuntimeFiles(sourceType, target)
        expect(result).toEqual({
          api: '/mock/apis.js',
          app: undefined,
          page: undefined,
          component: undefined,
          behavior: undefined,
          mixin: '/mock/behaviorOrMixin.js'
        })
      })

      it('should return the correct runtime files object when sourceType is equal to target', () => {
        const sourceType = module.CurrentTarget
        const target = module.CurrentTarget
        const result = module.getRuntimeFiles(sourceType, target)
        expect(result).toEqual({
          api: undefined,
          app: undefined,
          page: undefined,
          component: undefined,
          behavior: undefined,
          mixin: undefined
        })
      })
    })
  })
})
