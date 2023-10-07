'use strict'

const { Runner, Takin } = require('@morjs/utils')
const MorGeneratorPlugin = require('..')

jest.mock('@morjs/utils', () => ({
  asArray: jest.fn(),
  Plugin: jest.fn(),
  Runner: jest.fn(),
  Takin: jest.fn()
}))
jest.mock('./create', () => jest.fn())
jest.mock('./generate', () => jest.fn())

describe('@morjs/plugin-generator - index.test.js', () => {
  describe('MorGeneratorPlugin', () => {
    let runner
    let morGeneratorPlugin

    beforeEach(() => {
      runner = new Runner()
      morGeneratorPlugin = new MorGeneratorPlugin()
      morGeneratorPlugin.apply(runner)
    })

    it('should set the name property', () => {
      expect(morGeneratorPlugin.name).toBe('MorGeneratorPlugin')
    })

    describe('onUse', () => {
      let takin
      let configFilteredHook

      beforeEach(() => {
        takin = new Takin()
        configFilteredHook = jest.fn()
        takin.hooks.configFiltered.tap = configFilteredHook
      })

      it('should filter userConfigs based on command', () => {
        const userConfigs = ['config1', 'config2']
        const command = { name: 'init', options: {} }

        const result = morGeneratorPlugin.onUse(takin)

        expect(result).toBeUndefined()
        expect(configFilteredHook).toHaveBeenCalledWith(userConfigs, command)
      })

      it('should return the first userConfig if selectedConfigName is provided', () => {
        const userConfigs = ['config1', 'config2']
        const selectedConfigName = 'config2'
        const command = { name: 'init', options: { name: selectedConfigName } }

        const result = morGeneratorPlugin.onUse(takin)

        expect(result).toBeUndefined()
        expect(configFilteredHook).toHaveBeenCalledWith(
          [userConfigs[0]],
          command
        )
      })

      it('should return an empty array if command is not supported', () => {
        const userConfigs = ['config1', 'config2']
        const command = { name: 'other', options: {} }

        const result = morGeneratorPlugin.onUse(takin)

        expect(result).toBeUndefined()
        expect(configFilteredHook).toHaveBeenCalledWith([], command)
      })
    })

    describe('registerCli', () => {
      let cli

      beforeEach(() => {
        cli = jest.fn()
        runner.hooks.cli.tap.mock.calls[0][1](cli)
      })

      it('should register generate command', () => {
        const generateCommand = cli.mock.calls[0][1]
        expect(generateCommand).toHaveBeenCalledWith(
          'generate <type> [...args]',
          '生成器, 命令别名 [g]'
        )
        expect(generateCommand.alias).toHaveBeenCalledWith('g')
        expect(generateCommand.action).toHaveBeenCalledWith(
          expect.any(Function)
        )
      })

      it('should register init command', () => {
        const initCommand = cli.mock.calls[1][1]
        expect(initCommand).toHaveBeenCalledWith(
          'init [projectDir]',
          '初始化/创建 Mor 项目、插件、脚手架等, 命令别名 [create]'
        )
        expect(initCommand.alias).toHaveBeenCalledWith('create')
        expect(initCommand.action).toHaveBeenCalledWith(expect.any(Function))
      })
    })

    describe('skipValidateUserConfig', () => {
      let shouldValidateUserConfigHook

      beforeEach(() => {
        shouldValidateUserConfigHook = jest.fn()
        runner.hooks.shouldValidateUserConfig.tap = shouldValidateUserConfigHook
      })

      it('should skip user config validation for supported commands', () => {
        runner.commandName = 'init'

        const result = morGeneratorPlugin.skipValidateUserConfig()

        expect(result).toBe(false)
        expect(shouldValidateUserConfigHook).toHaveBeenCalledWith(runner)
      })

      it('should not skip user config validation for unsupported commands', () => {
        runner.commandName = 'other'

        const result = morGeneratorPlugin.skipValidateUserConfig()

        expect(result).toBeUndefined()
        expect(shouldValidateUserConfigHook).not.toHaveBeenCalled()
      })
    })
  })
})
