'use strict'

const { shouldProcess, templateProcessor } = require('../templateProcessor')

describe('@morjs/plugin-compiler-baidu - templateProcessor.test.js', () => {
  describe('shouldProcess', () => {
    test('returns true when target is CURRENT_TARGET and fileInfo extname is not fileType.template', () => {
      const options = {
        userConfig: {
          target: 'baidu'
        },
        fileInfo: {
          extname: 'js'
        }
      }

      const result = shouldProcess(options)

      expect(result).toBe(true)
    })

    test('returns false when target is not CURRENT_TARGET', () => {
      const options = {
        userConfig: {
          target: 'wechat'
        },
        fileInfo: {
          extname: 'template'
        }
      }

      const result = shouldProcess(options)

      expect(result).toBe(false)
    })

    test('returns false when fileInfo extname is fileType.template', () => {
      const options = {
        userConfig: {
          target: 'baidu'
        },
        fileInfo: {
          extname: 'template'
        }
      }

      const result = shouldProcess(options)

      expect(result).toBe(false)
    })
  })

  describe('templateProcessor', () => {
    let node
    let options

    beforeEach(() => {
      node = {
        tag: 'div',
        attrs: {}
      }

      options = {
        userConfig: {
          target: 'baidu'
        },
        fileInfo: {
          path: 'path/to/file'
        }
      }
    })

    test('onNode does not transform node when shouldProcess returns false', () => {
      const shouldProcessMock = jest
        .spyOn(templateProcessor, 'shouldProcess')
        .mockReturnValue(false)
      const transformForIFDirectiveMock = jest.spyOn(
        templateProcessor,
        'transformForIFDirective'
      )

      templateProcessor.onNode(node, options)

      expect(shouldProcessMock).toHaveBeenCalledWith(options)
      expect(transformForIFDirectiveMock).not.toHaveBeenCalled()
    })

    test('onNode transforms node when shouldProcess returns true', () => {
      const shouldProcessMock = jest
        .spyOn(templateProcessor, 'shouldProcess')
        .mockReturnValue(true)
      const transformForIFDirectiveMock = jest.spyOn(
        templateProcessor,
        'transformForIFDirective'
      )

      templateProcessor.onNode(node, options)

      expect(shouldProcessMock).toHaveBeenCalledWith(options)
      expect(transformForIFDirectiveMock).toHaveBeenCalledWith(node)
    })
  })
})
