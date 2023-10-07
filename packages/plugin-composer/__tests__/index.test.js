'use strict'

const { asArray } = require('@morjs/utils')
const { ComposeUserConfigSchema } = require('../constants')
const {
  AddComposeToCompilerPlugin,
  CopyHostProjectFileComposePlugin,
  ExtraComposeOptionsPlugin,
  LoadScriptsAndDistForComposePlugin
} = require('../plugins')
const { MorComposer } = require('../')
const { overrideUserConfig } = require('../utils')

jest.mock('@morjs/utils', () => ({
  asArray: jest.fn(),
  validKeysMessage: jest.fn()
}))

jest.mock('./constants', () => ({
  COMMAND_NAME: 'compose',
  ComposerUserConfig: jest.fn(),
  ComposeUserConfigSchema: jest.fn()
}))

jest.mock('./plugins', () => ({
  AddComposeToCompilerPlugin: jest.fn(),
  CopyHostProjectFileComposePlugin: jest.fn(),
  ExtraComposeOptionsPlugin: jest.fn(),
  LoadScriptsAndDistForComposePlugin: jest.fn()
}))

jest.mock('./utils', () => ({
  overrideUserConfig: jest.fn()
}))

describe('@morjs/plugin-generator - index.test.js', () => {
  describe('MorComposer', () => {
    let runner
    let composer

    beforeEach(() => {
      runner = {
        hooks: {
          cli: { tap: jest.fn() },
          registerUserConfig: { tap: jest.fn() },
          modifyUserConfig: { tap: jest.fn() }
        },
        config: { getTempDir: jest.fn() },
        userConfig: {}
      }

      composer = new MorComposer('name', runner)
    })

    describe('constructor', () => {
      test('should create a new instance', () => {
        expect(composer.name).toBe('name')
        expect(composer.runner).toBe(runner)

        expect(AddComposeToCompilerPlugin).toHaveBeenCalledTimes(1)
        expect(
          AddComposeToCompilerPlugin.mock.instances[0].apply
        ).toHaveBeenCalledWith(runner)

        expect(ExtraComposeOptionsPlugin).toHaveBeenCalledTimes(1)
        expect(
          ExtraComposeOptionsPlugin.mock.instances[0].apply
        ).toHaveBeenCalledWith(runner)

        expect(LoadScriptsAndDistForComposePlugin).toHaveBeenCalledTimes(1)
        expect(
          LoadScriptsAndDistForComposePlugin.mock.instances[0].apply
        ).toHaveBeenCalledWith(runner)

        expect(CopyHostProjectFileComposePlugin).toHaveBeenCalledTimes(1)
        expect(
          CopyHostProjectFileComposePlugin.mock.instances[0].apply
        ).toHaveBeenCalledWith(runner)

        expect(composer.registerCli).toHaveBeenCalledTimes(1)
        expect(composer.registerUserConfig).toHaveBeenCalledTimes(1)
        expect(composer.modifyUserConfig).toHaveBeenCalledTimes(1)
      })
    })

    describe('registerCli', () => {
      test('should register the compose command', () => {
        const cli = {
          command: jest.fn().mockReturnThis(),
          option: jest.fn().mockReturnThis(),
          action: jest.fn()
        }
        runner.hooks.cli.tap.mockImplementation((name, callback) =>
          callback(cli)
        )

        composer.registerCli()

        expect(runner.hooks.cli.tap).toHaveBeenCalledTimes(1)
        expect(runner.hooks.cli.tap).toHaveBeenCalledWith(
          'name',
          expect.any(Function)
        )

        expect(cli.command).toHaveBeenCalledTimes(1)
        expect(cli.command).toHaveBeenCalledWith('compose', '小程序集成功能')

        expect(cli.option).toHaveBeenCalledTimes(3)
        expect(cli.option).toHaveBeenNthCalledWith(
          1,
          '-t, --target <target>',
          '编译目标, 将当前的工程编译为目标小程序工程, 如 wechat、alipay 等'
        )
        expect(cli.option).toHaveBeenNthCalledWith(
          2,
          '-o, --output-path <dir>',
          '编译产物输出目录, 不同的 target 会有默认的输出目录, 如 dist/wechat'
        )
        expect(cli.option).toHaveBeenNthCalledWith(
          3,
          '--compile-type <compileType>',
          expect.any(String)
        )

        expect(cli.action).toHaveBeenCalledTimes(1)
        expect(cli.action).toHaveBeenCalledWith(composer.runCompose)
      })
    })

    describe('registerUserConfig', () => {
      test('should register the user config schema', () => {
        const schema = { merge: jest.fn() }
        runner.hooks.registerUserConfig.tap.mockImplementation(
          (name, callback) => callback(schema)
        )

        composer.registerUserConfig()

        expect(runner.hooks.registerUserConfig.tap).toHaveBeenCalledTimes(1)
        expect(runner.hooks.registerUserConfig.tap).toHaveBeenCalledWith(
          'name',
          expect.any(Function)
        )

        expect(schema.merge).toHaveBeenCalledTimes(1)
        expect(schema.merge).toHaveBeenCalledWith(ComposeUserConfigSchema)
      })
    })

    describe('modifyUserConfig', () => {
      test('should modify the user config', () => {
        const command = { name: 'compose', options: {} }
        runner.hooks.modifyUserConfig.tap.mockImplementation((name, callback) =>
          callback({}, command)
        )

        composer.modifyUserConfig()

        expect(runner.hooks.modifyUserConfig.tap).toHaveBeenCalledTimes(1)
        expect(runner.hooks.modifyUserConfig.tap).toHaveBeenCalledWith(
          'name',
          expect.any(Function)
        )

        expect(overrideUserConfig).toHaveBeenCalledTimes(1)
        expect(overrideUserConfig).toHaveBeenCalledWith({
          optionNames: ['target', 'outputPath', 'compileType'],
          userConfig: {},
          commandOptions: command.options
        })
      })

      test('should not modify the user config if command name is not compose', () => {
        const command = { name: 'other', options: {} }
        runner.hooks.modifyUserConfig.tap.mockImplementation((name, callback) =>
          callback({}, command)
        )

        composer.modifyUserConfig()

        expect(runner.hooks.modifyUserConfig.tap).toHaveBeenCalledTimes(1)
        expect(runner.hooks.modifyUserConfig.tap).toHaveBeenCalledWith(
          'name',
          expect.any(Function)
        )

        expect(overrideUserConfig).not.toHaveBeenCalled()
      })
    })

    describe('runCompose', () => {
      beforeEach(() => {
        runner.userConfig = {
          compileType: 'type',
          outputPath: 'path'
        }
      })

      test('should run compose with correct parameters', async () => {
        const command = {
          options: {
            withModules: 'module1,module2',
            withoutModules: 'module3,module4',
            fromState: '1',
            toState: '2'
          }
        }

        asArray.mockReturnValueOnce(['module1', 'module2'])
        asArray.mockReturnValueOnce(['module3', 'module4'])
        Number.mockReturnValueOnce(1)
        Number.mockReturnValueOnce(2)

        await composer.runCompose(command)

        expect(asArray).toHaveBeenCalledTimes(2)
        expect(asArray).toHaveBeenNthCalledWith(1, 'module1,module2')
        expect(asArray).toHaveBeenNthCalledWith(2, 'module3,module4')

        expect(Number).toHaveBeenCalledTimes(2)
        expect(Number).toHaveBeenNthCalledWith(1, '1')
        expect(Number).toHaveBeenNthCalledWith(2, '2')

        expect(compose).toHaveBeenCalledTimes(1)
        expect(compose).toHaveBeenCalledWith(
          runner,
          runner.userConfig,
          'type',
          expect.any(String),
          'path',
          'all',
          ['module1', 'module2'],
          ['module3', 'module4'],
          1,
          2,
          undefined
        )
      })

      test('should run compose with default values for optional parameters', async () => {
        const command = { options: {} }

        asArray.mockReturnValueOnce([])
        asArray.mockReturnValueOnce([])
        Number.mockReturnValueOnce(undefined)
        Number.mockReturnValueOnce(undefined)

        await composer.runCompose(command)

        expect(asArray).toHaveBeenCalledTimes(2)
        expect(asArray).toHaveBeenNthCalledWith(1, undefined)
        expect(asArray).toHaveBeenNthCalledWith(2, undefined)

        expect(Number).toHaveBeenCalledTimes(2)
        expect(Number).toHaveBeenNthCalledWith(1, undefined)
        expect(Number).toHaveBeenNthCalledWith(2, undefined)

        expect(compose).toHaveBeenCalledTimes(1)
        expect(compose).toHaveBeenCalledWith(
          runner,
          runner.userConfig,
          'type',
          expect.any(String),
          'path',
          'all',
          [],
          [],
          undefined,
          undefined,
          undefined
        )
      })
    })
  })

  describe('MorComposerPlugin', () => {
    let runner
    let plugin

    beforeEach(() => {
      runner = {}
      plugin = new MorComposerPlugin()
    })

    test('should create a new instance', () => {
      expect(plugin.name).toBe('MorComposerPlugin')
      expect(plugin.apply).toBeInstanceOf(Function)
    })

    test('should apply the plugin to the runner', () => {
      const apply = jest.spyOn(MorComposer.prototype, 'apply')

      plugin.apply(runner)

      expect(apply).toHaveBeenCalledTimes(1)
      expect(apply).toHaveBeenCalledWith(runner)
    })
  })
})
