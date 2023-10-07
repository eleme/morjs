'use strict'

const { mor, run, defineConfig } = require('..')

describe('@morjs/cli - index.test.js', () => {
  describe('Mor', () => {
    test('should enable .env support', () => {
      mor.env.enable()
      expect(mor.env.isEnabled()).toBe(true)
    })

    test('should enable multiple config support', () => {
      mor.enableMultipleConfig({ by: 'name' })
      expect(mor.isMultipleConfigEnabled()).toBe(true)
    })

    test('should enable package.json config support', () => {
      mor.enablePackageJsonConfig()
      expect(mor.isPackageJsonConfigEnabled()).toBe(true)
    })

    test('should set supported config file names', () => {
      const configFiles = ['mor.config']
      mor.setSupportConfigFileNames(configFiles)
      expect(mor.getSupportConfigFileNames()).toBe(configFiles)
    })

    test('should use plugins', () => {
      const plugins = [
        new CliPlugin(),
        new CleanPlugin(),
        new WebpackPlugin(),
        new CompilerPlugin(),
        new ComposerPlugin(),
        new GeneratorPlugin(),
        new AnalyzerPlugin(),
        new AutoReloadPlugin(),
        new PrettyErrorPlugin(),
        new MockerPlugin()
      ]
      mor.use(plugins)
      expect(mor.getPlugins()).toBe(plugins)
    })

    test('should run command with user configs and context', async () => {
      const command = { command: 'build' }
      const userConfigs = [{ mode: 'production' }]
      const context = { cwd: '/path/to/project' }
      const result = await run(command, userConfigs, context)
      expect(result).toBeDefined()
    })
  })

  describe('defineConfig', () => {
    test('should define and return user config', () => {
      const userConfig = { mode: 'production' }
      const config = defineConfig(userConfig)
      expect(config).toBe(userConfig)
    })
  })
})
