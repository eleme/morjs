'use strict'

const { BaiduCompilerPlugin } = require('../BaiduCompilerPlugin')

describe('@morjs/plugin-compiler-baidu - plugin.test.js', () => {
  describe('BaiduCompilerPlugin', () => {
    let plugin

    beforeEach(() => {
      plugin = new BaiduCompilerPlugin()
    })

    test('name property is set correctly', () => {
      expect(plugin.name).toBe('BaiduCompilerPlugin')
    })

    test('shouldAddPageOrComponent hook returns false for dynamicLib:// prefix', () => {
      const runner = {
        hooks: {
          shouldAddPageOrComponent: {
            tap: jest.fn()
          }
        }
      }

      plugin.apply(runner)

      expect(runner.hooks.shouldAddPageOrComponent.tap).toHaveBeenCalledWith(
        plugin.name,
        expect.any(Function)
      )

      const tapCallback =
        runner.hooks.shouldAddPageOrComponent.tap.mock.calls[0][1]
      const pageOrComponent = 'dynamicLib://example'

      expect(tapCallback(pageOrComponent)).toBe(false)
    })
  })
})
