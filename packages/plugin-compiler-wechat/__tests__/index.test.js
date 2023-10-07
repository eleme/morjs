'use strict'

const {
  target,
  fileType,
  resolveMainFields,
  compileModuleKind,
  compileScriptTarget,
  templateDirectives,
  generatePath,
  generateCommonPath,
  getRuntimeFiles,
  twbTemplateProcessor
} = require('..')

describe('@morjs/plugin-compiler-wechat - index.test.js', () => {
  describe('constants', () => {
    // 测试 target 变量的值是否正确
    test('target should be "wechat"', () => {
      expect(target).toBe('wechat')
    })

    // 测试 fileType 对象中的模板文件后缀名是否为 ".wxml"
    test('template file extension should be ".wxml"', () => {
      expect(fileType.template).toBe('.wxml')
    })

    // 测试 resolveMainFields 数组中的第一个元素是否为 "wechat"
    test('first element of resolveMainFields should be "wechat"', () => {
      expect(resolveMainFields[0]).toBe('wechat')
    })

    // 测试 compileModuleKind 变量的值是否为 CommonJS
    test('compileModuleKind should be CommonJS', () => {
      expect(compileModuleKind).toBe('CommonJS')
    })

    // 测试 compileScriptTarget 变量的值是否为 ES5
    test('compileScriptTarget should be ES5', () => {
      expect(compileScriptTarget).toBe('ES5')
    })

    // 测试 templateDirectives 对象中的 if 指令转换后的小程序指令是否为 "wx:if"
    test('template directive "if" should be converted to "wx:if"', () => {
      expect(templateDirectives.if).toBe('wx:if')
    })
  })

  describe('runtimeConfig', () => {
    describe('generatePath', () => {
      it('should generate the correct file path', () => {
        const fileName = 'example'
        const filePath = generatePath(fileName)
        expect(filePath).toEqual(expect.stringContaining('.js'))
        expect(filePath).toEqual(expect.stringContaining(fileName))
        expect(filePath).toEqual(expect.stringContaining('wechat'))
      })
    })

    describe('generateCommonPath', () => {
      it('should generate the correct common file path', () => {
        const fileName = 'example'
        const filePath = generateCommonPath(fileName)
        expect(filePath).toEqual(expect.stringContaining('.js'))
        expect(filePath).toEqual(expect.stringContaining(fileName))
        expect(filePath).toEqual(expect.stringContaining('common'))
      })
    })

    describe('getRuntimeFiles', () => {
      it('should return the correct runtime files', () => {
        const sourceType = 'wechat'
        const target = 'wechat'
        const runtimeFiles = getRuntimeFiles(sourceType, target)
        expect(runtimeFiles).toEqual(
          expect.objectContaining({
            api: expect.any(String),
            app: expect.any(String),
            page: expect.any(String),
            component: expect.any(String),
            behavior: expect.any(String),
            mixin: expect.any(String)
          })
        )
      })

      it('should generate different runtime files for different source type and target', () => {
        const sourceType = 'h5'
        const target = 'wechat'
        const runtimeFiles = getRuntimeFiles(sourceType, target)
        expect(runtimeFiles.api).toEqual(expect.stringContaining('wechat'))
        expect(runtimeFiles.mixin).toEqual(expect.stringContaining('common'))
      })
    })
  })

  describe('twbTemplateProcessor', () => {
    describe('twbTemplateProcessor', () => {
      const mockNode = {
        tag: 'input',
        attrs: {
          'model:value': '{{bindingValue}}'
        }
      }
      const mockOptions = {
        userConfig: {
          sourceType: target
        }
      }
      const mockContext = {
        usingComponentNames: ['custom-component']
      }

      it('should handle node attribute for twb', () => {
        twbTemplateProcessor.onNodeAttr(
          'model:value',
          mockNode,
          mockOptions,
          mockContext
        )

        expect(mockNode.attrs).toEqual({
          value: '{{bindingValue}}',
          'bind:mortwbproxy': '$morParentTWBProxy',
          'mor-child-twb-map': 'value:bindingValue'
        })
      })

      it('should handle node attribute for twb with custom component', () => {
        const customComponentNode = {
          tag: 'custom-component',
          attrs: {
            'model:value': '{{bindingValue}}'
          }
        }

        twbTemplateProcessor.onNodeAttr(
          'model:value',
          customComponentNode,
          mockOptions,
          mockContext
        )

        expect(customComponentNode.attrs).toEqual({
          value: '{{bindingValue}}',
          'bind:mortwbproxy': '$morParentTWBProxy',
          'mor-child-twb-map': 'value:bindingValue'
        })
      })

      it('should handle node attribute for twb with supported component', () => {
        const supportedComponentNode = {
          tag: 'input',
          attrs: {
            'model:value': '{{bindingValue}}'
          }
        }

        twbTemplateProcessor.onNodeAttr(
          'model:value',
          supportedComponentNode,
          mockOptions,
          {}
        )

        expect(supportedComponentNode.attrs).toEqual({
          'bind:input': '$morTWBProxy',
          'data-mortwbmethod': 'bind:input',
          'data-mortwbkey': 'value',
          'data-mortwbvalue': 'bindingValue'
        })
      })

      it('should not handle node attribute if sourceType does not match target', () => {
        const unsupportedSourceTypeNode = {
          tag: 'input',
          attrs: {
            'model:value': '{{bindingValue}}'
          }
        }
        const unsupportedSourceTypeOptions = {
          userConfig: {
            sourceType: 'unsupported'
          }
        }

        twbTemplateProcessor.onNodeAttr(
          'model:value',
          unsupportedSourceTypeNode,
          unsupportedSourceTypeOptions,
          {}
        )

        expect(unsupportedSourceTypeNode.attrs).toEqual({
          'model:value': '{{bindingValue}}'
        })
      })

      it('should not handle node attribute if attrName, node.tag, or node.attrs is missing', () => {
        const missingAttrNameNode = {
          tag: 'input',
          attrs: {
            'model:value': '{{bindingValue}}'
          }
        }
        const missingTagNode = {
          attrs: {
            'model:value': '{{bindingValue}}'
          }
        }
        const missingAttrsNode = {
          tag: 'input',
          attrs: {
            'model:value': '{{bindingValue}}'
          }
        }

        twbTemplateProcessor.onNodeAttr(
          undefined,
          mockNode,
          mockOptions,
          mockContext
        )
        twbTemplateProcessor.onNodeAttr(
          'model:value',
          missingAttrNameNode,
          mockOptions,
          mockContext
        )
        twbTemplateProcessor.onNodeAttr(
          'model:value',
          missingTagNode,
          mockOptions,
          mockContext
        )
        twbTemplateProcessor.onNodeAttr(
          'model:value',
          missingAttrsNode,
          mockOptions,
          mockContext
        )

        expect(mockNode.attrs).toEqual({
          'model:value': '{{bindingValue}}'
        })
        expect(missingAttrNameNode.attrs).toEqual({
          'model:value': '{{bindingValue}}'
        })
        expect(missingTagNode.attrs).toEqual({
          'model:value': '{{bindingValue}}'
        })
        expect(missingAttrsNode.attrs).toEqual({
          'model:value': '{{bindingValue}}'
        })
      })
    })
  })
})
