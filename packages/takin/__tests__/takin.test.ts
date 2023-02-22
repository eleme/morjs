import path from 'path'
import { Runner, RunnerOptions, Takin, zod } from '../src'

declare module '../src' {
  interface RunnerExtendable {
    envs: Record<string, any>
    addEnv(name: string, value: any): void
    runnerOptions: RunnerOptions
  }
}

const configFilePath = path.join(process.cwd(), 'takin.config.js')

describe('__tests__/takin.test.ts', () => {
  beforeEach(async () => {
    const fsExtra: any = await import('fs-extra')
    fsExtra._setMockFiles({
      [configFilePath]: `
        module.exports = {
          name: 'takin-config',
          x: 1
        }
      `
    })
    jest.mock(
      configFilePath,
      () => {
        return {
          name: 'takin-config',
          x: 1
        }
      },
      { virtual: true }
    )
  })

  it('takin init', () => {
    const takin = new Takin('takin')

    expect(takin.usedPlugins.get('TakinChangeCwdPlugin')).toBeTruthy()
    expect(takin.usedPlugins.get('TakinCustomConfigPlugin')).toBeTruthy()
    expect(takin.usedPlugins.get('TakinMultiConfigPlugin')).toBeTruthy()
    expect(takin.usedPlugins.get('TakinPluginConfigPlugin')).toBeTruthy()
  })

  it('takin run', async () => {
    const takin = new Takin('takin')

    const initializeFn = jest.fn()
    const configLoadedFn = jest.fn()
    const configFilteredFn = jest.fn()
    takin.hooks.initialize.tap('initialize', initializeFn)
    takin.hooks.configLoaded.tap('configLoaded', configLoadedFn)
    takin.hooks.configFiltered.tap('configFiltered', configFilteredFn)
    takin.hooks.extendRunner.tap('extendRunner', function (Runner, options) {
      return class RunnerWithEnvs extends Runner {
        override envs: Record<string, any> = {}
        override addEnv(name: string, value: any) {
          this.envs[name] = value
        }
        override runnerOptions = options
      }
    })

    let runner!: Runner
    takin.use([
      {
        name: 'testPlugin',
        apply: function (r) {
          runner = r
        }
      }
    ])

    await takin.run()

    expect(initializeFn).toHaveBeenCalled()
    expect(configLoadedFn).toHaveBeenCalled()
    expect(runner).toHaveProperty('addEnv')
    runner.addEnv('abc', 'abcValue')
    expect(runner).toHaveProperty('envs', { abc: 'abcValue' })
    expect(runner).toHaveProperty('runnerOptions')
  })

  it('userConfig', async () => {
    const takin = new Takin('takin')

    class Foo {
      name = 'Foo'
      apply(runner: Runner) {
        expect(runner.userConfig.x).toEqual(1)
      }
    }

    class Bar {
      name = 'Bar'
      apply(runner: Runner) {
        runner.hooks.registerUserConfig.tap(this.name, (scheme) => {
          return scheme.merge(
            zod.object({
              x: zod.number()
            })
          )
        })

        runner.hooks.modifyUserConfig.tap(this.name, (userConfig) => {
          userConfig.x = 2
          return userConfig
        })

        runner.hooks.beforeRun.tap(this.name, () => {
          expect(runner.userConfig.x).toEqual(2)
        })
      }
    }

    takin.use([new Foo(), new Bar()])

    takin.hooks.configLoaded.tap('configLoaded', (core) => {
      expect(core?.userConfig?.[0]?.x).toEqual(1)
    })

    await takin.run()
  })
})
