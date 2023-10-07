'use strict'

const {
  fileType,
  resolveMainFields,
  defaultConditionalFileExt,
  sjsTagName,
  sjsSrcAttrName,
  sjsModuleAttrName,
  isSupportSjsContent,
  defaultOutputDir,
  compileModuleKind,
  compileScriptTarget,
  projectConfigFiles,
  supportGlobalComponents,
  templateSingleTagNames,
  templateDirectives
} = require('../constants')

describe('@morjs/plugin-compiler-bytedance - constants.test.js', () => {
  describe('constants', () => {
    test('fileType is defined correctly', () => {
      expect(fileType).toEqual({
        template: '.ttml',
        style: '.ttss',
        config: '.json',
        script: '.js',
        sjs: '.sjs'
      })
    })

    test('resolveMainFields is defined correctly', () => {
      expect(resolveMainFields).toEqual(['bytedance', 'main'])
    })

    test('defaultConditionalFileExt is defined correctly', () => {
      expect(defaultConditionalFileExt).toBe('.tt')
    })

    test('sjsTagName is defined correctly', () => {
      expect(sjsTagName).toBe('sjs')
    })

    test('sjsSrcAttrName is defined correctly', () => {
      expect(sjsSrcAttrName).toBe('src')
    })

    test('sjsModuleAttrName is defined correctly', () => {
      expect(sjsModuleAttrName).toBe('module')
    })

    test('isSupportSjsContent is defined correctly', () => {
      expect(isSupportSjsContent).toBe(true)
    })

    test('defaultOutputDir is defined correctly', () => {
      expect(defaultOutputDir).toBe('dist/bytedance')
    })

    test('compileModuleKind is defined correctly', () => {
      expect(compileModuleKind).toBe(CompileModuleKind.CommonJS)
    })

    test('compileScriptTarget is defined correctly', () => {
      expect(compileScriptTarget).toBe(CompileScriptTarget.ES5)
    })

    test('projectConfigFiles is defined correctly', () => {
      expect(projectConfigFiles).toEqual([
        'project.tt.json',
        'project.config.json'
      ])
    })

    test('supportGlobalComponents is defined correctly', () => {
      expect(supportGlobalComponents).toBe(false)
    })

    test('templateSingleTagNames is defined correctly', () => {
      expect(templateSingleTagNames).toEqual(['import', 'include'])
    })

    test('templateDirectives is defined correctly', () => {
      expect(templateDirectives).toEqual({
        if: 'tt:if',
        elseIf: 'tt:elif',
        else: 'tt:else',
        for: 'tt:for',
        forItem: 'tt:for-item',
        forIndex: 'tt:for-index',
        key: 'tt:key'
      })
    })
  })
})
