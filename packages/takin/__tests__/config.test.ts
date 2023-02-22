import * as path from 'path'
import { Config, Plugin, PluginTypes } from '../src'
import { PluginError } from '../src/errors'

const configFilePath = path.join(process.cwd(), 'takin.config.js')
const otherConfigFilePath = path.join(process.cwd(), 'test.config.js')

describe('__tests__/config.test.ts', () => {
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
        },
        "takin": {
          "name": "takin-pkg"
        }
      }`,
      [configFilePath]: `
        module.exports = {
          name: 'takin-config',
        }
      `,
      [otherConfigFilePath]: `
        module.exports = {
          name: 'test',
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
          apply = jest.fn()
        }
        return TakinPluginB
      },
      { virtual: true }
    )
    jest.mock(
      '@ali/takin-plugin-b/package.json',
      () => {
        return {
          name: '@ali/takin-plugin-b',
          version: '2.0'
        }
      },
      { virtual: true }
    )
    jest.mock('@ali/takin-plugin-export-error', () => {}, { virtual: true })
    jest.mock(
      '@ali/takin-plugin-apply-error',
      () => {
        class TakinPluginApplyError {
          apply = undefined
        }
        return TakinPluginApplyError
      },
      { virtual: true }
    )
    jest.mock(
      '@ali/takin-plugin-constructor-error',
      () => {
        return {}
      },
      { virtual: true }
    )
    jest.mock(
      configFilePath,
      () => {
        return {
          name: 'takin-config'
        }
      },
      { virtual: true }
    )
    jest.mock(
      otherConfigFilePath,
      () => {
        return {
          name: 'test'
        }
      },
      { virtual: true }
    )
  })

  it('PluginTypes', () => {
    expect(PluginTypes).toHaveProperty('auto')
    expect(PluginTypes).toHaveProperty('use')
    expect(PluginTypes).toHaveProperty('runner')
    expect(PluginTypes).toHaveProperty('config')
  })

  it('config init & property', () => {
    const config = new Config('takin')

    expect(config.name).toEqual('takin')
    expect(config.supportConfigNames).toEqual(['takin.config'])

    expect(config.setName('test')).toEqual(config)
    expect(config.name).toEqual('test')
    expect(() => config.setName('')).toThrowError()

    expect(config.packageJsonConfigEnabled).toEqual(false)
    expect(config.enablePackageJsonConfig()).toEqual(config)
    expect(config.packageJsonConfigEnabled).toEqual(true)
    expect(config.disablePackageJsonConfig()).toEqual(config)
    expect(config.packageJsonConfigEnabled).toEqual(false)

    expect(config.multipleConfigEnabled).toEqual(false)
    expect(config.enableMultipleConfig()).toEqual(config)
    expect(config.multipleConfigEnabled).toEqual(true)
    expect(config.multipleConfigNameField).toEqual('name')
    expect(config.disableMultipleConfig()).toEqual(config)
    expect(config.multipleConfigEnabled).toEqual(false)
    expect(config.multipleConfigNameField).toEqual(undefined)

    expect(config.supportConfigExtensions).toEqual([
      '.ts',
      '.js',
      '.mjs',
      '.json',
      '.jsonc',
      '.json5'
    ])
    expect(config.setSupportConfigFileExtensions(['.ts', '.js'])).toEqual(
      config
    )
    expect(config.supportConfigExtensions).toEqual(['.ts', '.js'])

    expect(config.optionName).toEqual('config')
    expect(config.optionNameAlias).toEqual('c')
    expect(config.setOptionName('configName', 'configAlias')).toEqual(config)
    expect(config.optionName).toEqual('configName')
    expect(config.optionNameAlias).toEqual('configAlias')
  })

  it('config auto load plugin - success', async () => {
    const config = new Config('takin')
    config.setPluginAutoLoadPatterns([/^@ali\/takin-plugin-/])

    await config.autoLoadPlugins()

    expect(config.usedPlugins.get('@ali/takin-plugin-a')).toBeTruthy()
    expect(config.usedPlugins.get('@ali/takin-plugin-a')).toHaveProperty(
      'version',
      '1.0'
    )
    expect(config.usedPlugins.get('@ali/takin-plugin-a')).toHaveProperty(
      'pluginType',
      'auto'
    )
    expect(config.usedPlugins.get('@ali/takin-plugin-b')).toBeTruthy()
    expect(config.usedPlugins.get('@ali/takin-plugin-b')).toHaveProperty(
      'version',
      '2.0'
    )
    expect(config.usedPlugins.get('@ali/takin-plugin-b')).toHaveProperty(
      'pluginType',
      'auto'
    )
  })

  it('config auto load plugin - failed', async () => {
    const config = new Config('takin')
    config.setPluginAutoLoadPatterns([/^@ali\/takin-plugin-/])

    fsExtra._setMockFiles({
      [path.join(process.cwd(), 'package.json')]: `{
        "name": "takin-unit-test",
        "dependencies": {
          "@ali/takin-plugin-a": "0.1"
        },
        "devDependencies": {
          "@ali/takin-plugin-b": "0.2",
          "@ali/takin-plugin-export-error": "0.3",
          "@ali/takin-plugin-apply-error": "0.4",
          "@ali/takin-plugin-constructor-error": "0.5"
        },
        "takin": {
          "name": "takin-pkg"
        }
      }`,
      [configFilePath]: `
        module.exports = {
          name: 'takin-config',
        }
      `,
      [otherConfigFilePath]: `
        module.exports = {
          name: 'test',
        }
      `
    })

    await expect(async function () {
      await config.autoLoadPlugins()
    }).rejects.toThrow(PluginError)

    expect(config.usedPlugins.get('@ali/takin-plugin-a')).toBeFalsy()
    expect(config.usedPlugins.get('@ali/takin-plugin-b')).toBeFalsy()
    expect(config.usedPlugins.get('@ali/takin-plugin-export-error')).toBeFalsy()
    expect(config.usedPlugins.get('@ali/takin-plugin-apply-error')).toBeFalsy()
    expect(
      config.usedPlugins.get('@ali/takin-plugin-constructor-error')
    ).toBeFalsy()
  })

  it('sortUserPlugins', () => {
    const config = new Config('takin')
    /* eslint-disable @typescript-eslint/no-empty-function */
    class PluginA implements Plugin {
      name = 'pluginA'
      enforce: Plugin['enforce'] = 'pre'
      apply() {}
    }
    class PluginB implements Plugin {
      name = 'pluginB'
      enforce: Plugin['enforce'] = 'post'
      apply() {}
    }
    class PluginC implements Plugin {
      name = 'pluginC'
      apply() {}
    }
    class PluginD implements Plugin {
      name = 'pluginD'
      apply() {}
    }
    class PluginE implements Plugin {
      name = 'pluginE'
      enforce: Plugin['enforce'] = 'post'
      apply() {}
    }
    class PluginF implements Plugin {
      name = 'pluginF'
      enforce: Plugin['enforce'] = 'pre'
      apply() {}
    }
    /* eslint-enable @typescript-eslint/no-empty-function */
    const pluginA = new PluginA()
    const pluginB = new PluginB()
    const pluginC = new PluginC()
    const pluginD = new PluginD()
    const pluginE = new PluginE()
    const pluginF = new PluginF()

    expect(
      config.sortUserPlugins([
        pluginA,
        pluginB,
        pluginC,
        pluginD,
        pluginE,
        pluginF
      ])
    ).toEqual([
      [pluginA, pluginF],
      [pluginC, pluginD],
      [pluginB, pluginE]
    ])

    expect(
      config.sortUserPlugins([
        [pluginA, pluginB, pluginC],
        pluginD,
        [pluginE, pluginF]
      ])
    ).toEqual([
      [pluginA, pluginF],
      [pluginC, pluginD],
      [pluginB, pluginE]
    ])
  })

  it('tempDir', () => {
    const config = new Config('takin')

    const defaultTempDirPath = path.join(process.cwd(), '.takin')
    expect(config.getTempDir()).toEqual(defaultTempDirPath)
    expect(fsExtra.readdirSync(defaultTempDirPath)).toBeTruthy()

    config.setTempDir('.temp')
    const customTempDirPath = path.join(process.cwd(), '.temp')
    expect(config.getTempDir()).toEqual(customTempDirPath)
    expect(fsExtra.readdirSync(customTempDirPath)).toBeTruthy()

    config.clearTempDir()
    expect(fsExtra.readdirSync(customTempDirPath)).toBeFalsy()
  })

  describe('cacheDir', () => {
    afterEach(() => {
      Object.defineProperty(process.versions, 'pnp', {
        get() {
          return undefined
        },
        configurable: true
      })
    })

    it('default', () => {
      const config = new Config('takin')
      expect(config.getCacheDir()).toEqual(
        path.join(process.cwd(), 'node_modules', '.cache', 'takin')
      )
    })

    it('pnp', () => {
      const config = new Config('takin')

      Object.defineProperty(process.versions, 'pnp', {
        get() {
          return '1'
        },
        configurable: true
      })
      expect(config.getCacheDir()).toEqual(
        path.join(process.cwd(), '.pnp', '.cache', 'takin')
      )
    })

    it('yarn', () => {
      const config = new Config('takin')

      Object.defineProperty(process.versions, 'pnp', {
        get() {
          return '3'
        },
        configurable: true
      })
      expect(config.getCacheDir()).toEqual(
        path.join(process.cwd(), '.yarn', '.cache', 'takin')
      )
    })

    it('getCachedFilePath', () => {
      const config = new Config('takin')
      expect(config.getCachedFilePath('a.js')).toEqual(
        path.join(process.cwd(), 'node_modules', '.cache', 'takin', 'a.js')
      )
    })

    it('write and read cache file', async () => {
      const config = new Config('takin')
      const cacheFilePath = config.writeToCacheDir('cache.js', 'cache')
      expect(cacheFilePath).toEqual(
        path.join(process.cwd(), 'node_modules', '.cache', 'takin', 'cache.js')
      )

      const cacheContent = await config.loadCachedFile('cache.js')
      expect(cacheContent).toEqual('cache')
    })

    it('clearCacheDir', () => {
      const config = new Config('takin')
      config.clearCacheDir()
      expect(
        fsExtra.readdirSync(
          path.join(process.cwd(), '.yarn', '.cache', 'takin')
        )
      ).toBeFalsy()
    })
  })

  describe('config file', () => {
    it('loadConfigFromFile default', async () => {
      const config = new Config('takin')
      const userConfig = await config.loadConfigFromFile()
      expect(userConfig?.length).toEqual(1)
      expect(userConfig?.[0]).toHaveProperty('name', 'takin-config')
    })

    it('loadConfigFromFile package.json', async () => {
      fsExtra.unlinkSync(configFilePath)
      const config = new Config('takin')
      config.enablePackageJsonConfig()
      const userConfig = await config.loadConfigFromFile()
      expect(userConfig?.length).toEqual(1)
      expect(userConfig?.[0]).toHaveProperty('name', 'takin-pkg')
    })

    it('loadConfigFromFile configFile', async () => {
      const config = new Config('takin')
      const userConfig = await config.loadConfigFromFile('test.config.js')
      expect(userConfig?.length).toEqual(1)
      expect(userConfig?.[0]).toHaveProperty('name', 'test')
    })
  })

  it('parseFilter', () => {
    const config = new Config('takin')

    expect(config.parseFilter()).toEqual(undefined)
    const parsedFilterResult = config.parseFilter('a , b ,  c')
    expect(parsedFilterResult?.has('a')).toBeTruthy()
    expect(parsedFilterResult?.has('b')).toBeTruthy()
    expect(parsedFilterResult?.has('c')).toBeTruthy()
    expect(parsedFilterResult?.has('d')).toBeFalsy()
    expect(parsedFilterResult?.size).toEqual(3)

    const parsedFilterResult2 = config.parseFilter(['a', 'b', 'c'])
    expect(parsedFilterResult2?.has('a')).toBeTruthy()
    expect(parsedFilterResult2?.has('b')).toBeTruthy()
    expect(parsedFilterResult2?.has('c')).toBeTruthy()
    expect(parsedFilterResult2?.has('d')).toBeFalsy()
    expect(parsedFilterResult2?.size).toEqual(3)
  })

  it('filterBy', async () => {
    class CustomConfig extends Config {
      constructor(name: string) {
        super(name)
      }

      callFilterBy(
        ...args: Parameters<Config['filterBy']>
      ): ReturnType<Config['filterBy']> {
        return super.filterBy(...args)
      }
    }
    const config = new CustomConfig('takin')

    expect(config.callFilterBy()).toEqual([])
    expect(config.callFilterBy(undefined, [{ name: 'takin-config' }])).toEqual([
      { name: 'takin-config' }
    ])

    await config.loadConfigFromFile()
    expect(config.callFilterBy()).toEqual([{ name: 'takin-config' }])

    config.enableMultipleConfig()
    expect(config.callFilterBy()).toEqual([{ name: 'takin-config' }])

    expect(
      config.callFilterBy('takin-config', [
        { name: 'takin-config' },
        { x: 1, y: 2 }
      ])
    ).toEqual([{ name: 'takin-config' }])

    expect(
      config.callFilterBy('1', [{ name: 'takin-config' }, { x: 1, y: 2 }])
    ).toEqual([{ x: 1, y: 2 }])
  })
})
