import * as path from 'path'
import {
  Config,
  isHookRegistered,
  Plugin,
  registerHooks,
  Runner,
  tapable,
  UserConfig,
  zod
} from '../src'

declare module '../src' {
  interface RunnerHooks {
    unitTest?: tapable.AsyncSeriesHook<string[]>
    unitTest1?: tapable.AsyncSeriesHook<string[]>
  }
}

const configFilePath = path.join(process.cwd(), 'takin.config.js')

describe('__tests__/runner.test.ts', () => {
  let fsExtra: any
  beforeEach(async () => {
    fsExtra = await import('fs-extra')

    fsExtra._setMockFiles({
      [path.join(process.cwd(), 'package.json')]: `{
        "name": "takin-unit-test",
        "dependencies": {
          "@ali/takin-plugin-a": "0.1"
        },
        "devDependencies": {
          "@ali/takin-plugin-b": "0.2"
        }
      }`,
      [configFilePath]: `
        module.exports = {
          name: 'takin-config',
        }
      `
    })
    jest.mock(
      '@ali/takin-plugin-a',
      () => {
        class TakinPluginA {
          name = 'takinPluginA'
          version = '1.0'
          apply = jest.fn()
        }

        return TakinPluginA
      },
      { virtual: true }
    )
    jest.mock(
      '@ali/takin-plugin-b',
      () => {
        class TakinPluginB {
          name = 'takinPluginB'
          version = '1.0'
          apply = jest.fn()
        }
        return TakinPluginB
      },
      { virtual: true }
    )
    jest.mock(
      configFilePath,
      () => {
        class TakinPluginC {
          name = 'takinPluginC'
          version = '1.0'
          apply = jest.fn()
          enforce = 'pre'
        }
        class TakinPluginD {
          name = 'takinPluginD'
          version = '1.0'
          apply = jest.fn()
          enforce = 'post'
        }

        return {
          name: 'takin-config',
          plugins: [new TakinPluginC(), new TakinPluginD()]
        }
      },
      { virtual: true }
    )
  })

  it('registerHook', () => {
    registerHooks({
      unitTest: () => {
        return new tapable.AsyncSeriesHook(['x', 'y', 'z'])
      }
    })

    expect(() =>
      registerHooks({
        unitTest: () => {
          return new tapable.AsyncSeriesHook(['x', 'y', 'z'])
        }
      })
    ).toThrowError()
  })

  it('isHookRegistered', () => {
    registerHooks({
      unitTest1: () => {
        return new tapable.AsyncSeriesHook(['x', 'y', 'z'])
      }
    })

    expect(isHookRegistered('unitTest1')).toBe(true)
  })

  describe('Runner', () => {
    it('init', async () => {
      const config = new Config('takin')
      const runner = new Runner(config, {})

      expect(runner.getRunnerName().startsWith('takin:runner:#')).toBeTruthy()
      expect(runner.getResult()).toBeFalsy()
      expect(runner.getPlugins().size).toEqual(0)
      expect(runner.getCurrentPluginName()).toBeFalsy()
      expect(runner.getCommandOptions()).toEqual({
        name: undefined,
        args: [],
        options: {}
      })
    })

    it('run', async () => {
      const pluginADoneFn = jest.fn()

      class PluginA implements Plugin {
        name = 'pluginA'
        apply(_runner: Runner) {
          _runner.hooks.done.tap('pluginA', pluginADoneFn)
          _runner.methods.register('pluginAMethod', () => 'pluginAMethod')
        }
      }

      class PluginB implements Plugin {
        name = 'pluginB'
        apply(_runner: Runner) {
          const r = _runner.methods.invoke('pluginAMethod')
          expect(r).toEqual('pluginAMethod')

          expect(() =>
            _runner.methods.register('pluginAMethod', () => {})
          ).toThrowError()

          expect(_runner.methods.getInfo('pluginAMethod')).toEqual({
            pluginName: 'pluginA'
          })
        }
      }
      const config = new Config('takin')
      const runner = new Runner(config, {})

      const runOrder: string[] = []

      const initializeFn = jest.fn(() => {
        runOrder.push('initialize')
      })
      const cliFn = jest.fn(() => {
        runOrder.push('cli')
      })
      const matchedCommandFn = jest.fn(() => {
        runOrder.push('matchedCommand')
      })
      const loadConfigFn = jest.fn(() => {
        runOrder.push('loadConfig')
      })
      const modifyUserConfigFn = jest.fn(() => {
        runOrder.push('modifyUserConfig')
        return {}
      })
      const registerUserConfigFn = jest.fn(() => {
        runOrder.push('registerUserConfig')
        return zod.object({})
      })
      const shouldRunFn = jest.fn(() => {
        runOrder.push('shouldRun')
        return true
      })
      const shouldValidateUserConfigFn = jest.fn(() => {
        runOrder.push('shouldValidateUserConfig')
        return true
      })
      const userConfigValidatedFn = jest.fn(() => {
        runOrder.push('userConfigValidated')
      })
      const beforeRunFn = jest.fn(() => {
        runOrder.push('beforeRun')
      })
      const doneFn = jest.fn(() => {
        runOrder.push('done')
      })

      runner.hooks.initialize.tap('initialize', initializeFn)
      runner.hooks.cli.tap('cli', cliFn)
      runner.hooks.matchedCommand.tap('matchedCommand', matchedCommandFn)
      runner.hooks.loadConfig.tap('loadConfig', loadConfigFn)
      runner.hooks.modifyUserConfig.tap('modifyUserConfig', modifyUserConfigFn)
      runner.hooks.registerUserConfig.tap(
        'registerUserConfig',
        registerUserConfigFn
      )
      runner.hooks.shouldRun.tap('shouldRun', shouldRunFn)
      runner.hooks.shouldValidateUserConfig.tap(
        'shouldValidateUserConfig',
        shouldValidateUserConfigFn
      )
      runner.hooks.userConfigValidated.tap(
        'userConfigValidated',
        userConfigValidatedFn
      )
      runner.hooks.beforeRun.tap('beforeRun', beforeRunFn)
      runner.hooks.done.tap('done', doneFn)

      await runner.run(undefined, [new PluginA(), new PluginB()])

      expect(initializeFn).toHaveBeenCalled()
      expect(cliFn).toHaveBeenCalled()
      expect(matchedCommandFn).toHaveBeenCalled()
      expect(modifyUserConfigFn).toHaveBeenCalled()
      expect(registerUserConfigFn).toHaveBeenCalled()
      expect(shouldRunFn).toHaveBeenCalled()
      expect(shouldValidateUserConfigFn).toHaveBeenCalled()
      expect(userConfigValidatedFn).toHaveBeenCalled()
      expect(beforeRunFn).toHaveBeenCalled()
      expect(doneFn).toHaveBeenCalled()

      expect(pluginADoneFn).toHaveBeenCalled()

      expect(runOrder).toEqual([
        'initialize',
        'cli',
        'matchedCommand',
        'loadConfig',
        'modifyUserConfig',
        'registerUserConfig',
        'shouldRun',
        'shouldValidateUserConfig',
        'userConfigValidated',
        'beforeRun',
        'done'
      ])
    })

    it('run with userConfig', async () => {
      const config = new Config('takin')
      config.setPluginAutoLoadPatterns([/^@ali\/takin-plugin-/])
      await config.autoLoadPlugins()
      const userConfig = await config.loadConfigFromFile()
      const context = {
        a: 'a',
        b: 2,
        c: true
      }
      const runner = new Runner(config, userConfig![0] as UserConfig, context)

      await runner.run()

      expect(runner.getPlugins().size).toEqual(4)
    })
  })
})
