'use strict'

const module = require('..')
const { CompileModuleKind, CompileScriptTarget } = require('@morjs/utils')
const { target: WechatTarget } = require('@morjs/plugin-compiler-wechat')

describe('@morjs/plugin-compiler-kuaishou - index.test.js', () => {
  describe('constants', () => {
    it('should export the correct target', () => {
      expect(module.target).toBe('kuaishou')
    })

    it('should export the correct target description', () => {
      expect(module.targetDescription).toBe('快手小程序')
    })

    it('should export the correct fileType', () => {
      expect(module.fileType).toEqual({
        template: '.ksml',
        style: '.css',
        config: '.json',
        script: '.js',
        sjs: '.wxs'
      })
    })

    it('should export the correct globalObject', () => {
      expect(module.globalObject).toBe('ks')
    })

    it('should export the correct resolveMainFields', () => {
      expect(module.resolveMainFields).toEqual(['kuaishou', 'main'])
    })

    it('should export the correct defaultConditionalFileExt', () => {
      expect(module.defaultConditionalFileExt).toBe('.ks')
    })

    it('should export the correct sjsTagName', () => {
      expect(module.sjsTagName).toBe('wxs')
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
      expect(module.defaultOutputDir).toBe('dist/kuaishou')
    })

    it('should export the correct compileModuleKind', () => {
      expect(module.compileModuleKind).toBe(CompileModuleKind.CommonJS)
    })

    it('should export the correct compileScriptTarget', () => {
      expect(module.compileScriptTarget).toBe(CompileScriptTarget.ES5)
    })

    it('should export the correct projectConfigFiles', () => {
      expect(module.projectConfigFiles).toEqual([
        'project.ks.json',
        'project.config.json'
      ])
    })

    it('should export the correct supportGlobalComponents', () => {
      expect(module.supportGlobalComponents).toBe(false)
    })

    it('should export the correct templateSingleTagNames', () => {
      expect(module.templateSingleTagNames).toEqual(['import', 'include'])
    })

    it('should export the correct templateDirectives', () => {
      expect(module.templateDirectives).toEqual({
        if: 'ks:if',
        elseIf: 'ks:elif',
        else: 'ks:else',
        for: 'ks:for',
        forItem: 'ks:for-item',
        forIndex: 'ks:for-index',
        key: 'ks:key'
      })
    })
  })

  describe('runtimeConfig', () => {
    jest.mock('@morjs/runtime-mini/lib/kuaishou/apis', () => '/mock/apis.js')
    jest.mock(
      '@morjs/runtime-mini/lib/common/behaviorOrMixin',
      () => '/mock/behaviorOrMixin.js'
    )
    jest.mock(
      '@morjs/runtime-mini/lib/wechat/componentToOther',
      () => '/mock/componentToOther.js'
    )
    jest.mock(
      '@morjs/runtime-mini/lib/wechat/pageToOther',
      () => '/mock/pageToOther.js'
    )

    describe('generatePath', () => {
      it('should return the correct path for the given dir and fileName', () => {
        const dir = 'kuaishou'
        const fileName = 'apis'
        const result = generatePath(dir, fileName)
        expect(result).toBe('/mock/apis.js')
      })
    })

    describe('getRuntimeFiles', () => {
      it('should return the correct runtime files object for the given sourceType and target', () => {
        const sourceType = WechatTarget
        const target = module.target
        const result = module.getRuntimeFiles(sourceType, target)
        expect(result).toEqual({
          api: '/mock/apis.js',
          app: undefined,
          page: '/mock/pageToOther.js',
          component: '/mock/componentToOther.js',
          behavior: undefined,
          mixin: '/mock/behaviorOrMixin.js'
        })
      })

      it('should return the correct runtime files object when sourceType is not equal to target', () => {
        const sourceType = 'some-other-target'
        const target = module.target
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
        const sourceType = module.target
        const target = module.target
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
