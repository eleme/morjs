'use strict'

const { BytedanceCompilerPlugin } = require('../BytedanceCompilerPlugin')

describe('@morjs/plugin-compiler-bytedance - plugin.test.js', () => {
  describe('BytedanceCompilerPlugin', () => {
    let plugin
    let runner
    let webpackWrapper
    let externals

    beforeEach(() => {
      plugin = new BytedanceCompilerPlugin()
      runner = {
        hooks: {
          shouldAddPageOrComponent: {
            tap: jest.fn()
          },
          webpackWrapper: {
            tap: jest.fn()
          },
          userConfigValidated: {
            tap: jest.fn()
          }
        }
      }
      webpackWrapper = {
        chain: {
          get: jest.fn(),
          externals: jest.fn()
        }
      }
      externals = []

      jest.clearAllMocks()
    })

    test('name property is set correctly', () => {
      expect(plugin.name).toBe('BytedanceCompilerPlugin')
    })

    test('apply method sets hooks and applies BytedanceAsyncSubpackagePlugin', () => {
      const applyMock = jest.spyOn(
        BytedanceAsyncSubpackagePlugin.prototype,
        'apply'
      )

      plugin.apply(runner)

      expect(runner.hooks.shouldAddPageOrComponent.tap).toHaveBeenCalledWith(
        plugin.name,
        expect.any(Function)
      )
      expect(runner.hooks.webpackWrapper.tap).toHaveBeenCalledWith(
        plugin.name,
        expect.any(Function)
      )
      expect(runner.hooks.userConfigValidated.tap).toHaveBeenCalledWith(
        plugin.name,
        expect.any(Function)
      )
      expect(applyMock).toHaveBeenCalled()
    })

    test('shouldAddPageOrComponent hook returns false for PLUGIN_EXT_PREFIX prefix', () => {
      const tapCallback =
        runner.hooks.shouldAddPageOrComponent.tap.mock.calls[0][1]
      const pageOrComponent = 'ext://example'

      const result = tapCallback(pageOrComponent)

      expect(result).toBe(false)
    })

    test('webpackWrapper hook sets webpackWrapper', () => {
      const tapCallback = runner.hooks.webpackWrapper.tap.mock.calls[0][1]

      tapCallback(webpackWrapper)

      expect(webpackWrapper.chain).toBe(webpackWrapper)
    })

    test('userConfigValidated hook adds externals for PLUGIN_EXT_PREFIX prefix', () => {
      const tapCallback = runner.hooks.userConfigValidated.tap.mock.calls[0][1]
      const externalsGetMock = jest.spyOn(webpackWrapper.chain, 'get')
      const externalsMock = jest.spyOn(webpackWrapper.chain, 'externals')

      externalsGetMock.mockReturnValue(externals)
      tapCallback()

      expect(externalsGetMock).toHaveBeenCalledWith('externals')
      expect(externalsMock).toHaveBeenCalledWith(expect.any(Function))
      expect(externals).toContainEqual(expect.any(Function))

      const externalsCallback = externals[0]
      const request = 'ext://example'
      const callback = jest.fn()

      externalsCallback({ request }, callback)

      expect(callback).toHaveBeenCalledWith(null, `commonjs `)
    })
  })
})
