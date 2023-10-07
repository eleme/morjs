'use strict'

const {
  BytedanceAsyncSubpackagePlugin
} = require('../BytedanceAsyncSubpackagePlugin')
const { CompileTypes } = require('@morjs/utils')

describe('@morjs/plugin-compiler-bytedance - bytedanceAsyncSubpackagePlugin.test.js', () => {
  describe('BytedanceAsyncSubpackagePlugin', () => {
    let plugin
    let runner
    let userConfig
    let entryBuilder

    beforeEach(() => {
      plugin = new BytedanceAsyncSubpackagePlugin()
      runner = {
        hooks: {
          userConfigValidated: {
            tap: jest.fn()
          },
          beforeBuildEntries: {
            tapPromise: jest.fn()
          }
        }
      }
      userConfig = {
        target: 'bytedance',
        compileType: CompileTypes.subpackage
      }
      entryBuilder = {
        subpackageJson: {
          common: true
        },
        buildByGlob: jest.fn()
      }
    })

    test('name property is set correctly', () => {
      expect(plugin.name).toBe('BytedanceAsyncSubpackagePlugin')
    })

    test('apply method sets runner and calls runAsyncSubpackage', () => {
      plugin.apply(runner)

      expect(plugin.runner).toBe(runner)
      expect(runner.hooks.userConfigValidated.tap).toHaveBeenCalledWith(
        plugin.name,
        expect.any(Function)
      )
      expect(plugin.runAsyncSubpackage).toHaveBeenCalled()
    })

    test('runAsyncSubpackage does not execute when compileTarget is not target', () => {
      plugin.runner = runner
      userConfig.target = 'wechat'

      plugin.runAsyncSubpackage()

      expect(runner.hooks.beforeBuildEntries.tapPromise).not.toHaveBeenCalled()
    })

    test('runAsyncSubpackage does not execute when compileType is not subpackage or miniprogram', () => {
      plugin.runner = runner
      userConfig.compileType = CompileTypes.component

      plugin.runAsyncSubpackage()

      expect(runner.hooks.beforeBuildEntries.tapPromise).not.toHaveBeenCalled()
    })

    test('runAsyncSubpackage executes buildByGlob when compileType is subpackage and common is true', async () => {
      plugin.runner = runner
      userConfig.compileType = CompileTypes.subpackage

      await plugin.runAsyncSubpackage()
      const tapPromiseCallback =
        runner.hooks.beforeBuildEntries.tapPromise.mock.calls[0][1]

      await tapPromiseCallback(entryBuilder)

      expect(entryBuilder.buildByGlob).toHaveBeenCalled()
    })

    test('runAsyncSubpackage executes buildByGlob for subpackages with common set to true', async () => {
      plugin.runner = runner
      userConfig.compileType = CompileTypes.miniprogram
      entryBuilder.appJson = {
        subpackages: [
          { root: 'subpackage1', common: true },
          { root: 'subpackage2', common: false }
        ]
      }

      await plugin.runAsyncSubpackage()
      const tapPromiseCallback =
        runner.hooks.beforeBuildEntries.tapPromise.mock.calls[0][1]

      await tapPromiseCallback(entryBuilder)

      expect(entryBuilder.buildByGlob).toHaveBeenCalledWith('subpackage1/**')
      expect(entryBuilder.buildByGlob).not.toHaveBeenCalledWith(
        'subpackage2/**'
      )
    })
  })
})
