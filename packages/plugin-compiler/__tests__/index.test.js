'use strict'

const path = require('path')
const { Plugin, Runner, WebpackWrapper } = require('@morjs/utils')
const { compile } = require('../compile')
const { getComposedCompilerPlugins } = require('../compilerPlugins')
const { buildWebpackConfig, modifyUserConfig } = require('../config')
const { COMPILE_COMMAND_NAME } = require('../constants')
const { EntryBuilder } = require('../entries')
const {
  CSSClassNameCompressPlugin
} = require('../experiments/cssClassnameCompress')
const { TrimRuntimeHelperPlugin } = require('../experiments/trimRuntimeHelpers')
const { ConfigParserPlugin } = require('../parsers/configParserPlugin')
const { ScriptParserPlugin } = require('../parsers/scriptParserPlugin')
const { SjsParserPlugin } = require('../parsers/sjsParserPlugin')
const { StyleParserPlugin } = require('../parsers/styleParserPlugin')
const { TemplateParserPlugin } = require('../parsers/templateParserPlugin')
const { AliasSupportPlugin } = require('../plugins/aliasSupportPlugin')
const { AssetsManipulatePlugin } = require('../plugins/assetsManipulatePlugin')
const { DefineSupportPlugin } = require('../plugins/defineSupportPlugin')
const {
  DynamicRequireSupportPlugin
} = require('../plugins/dynamicRequireSupportPlugin')
const { EmitDeclarationsPlugin } = require('../plugins/emitDeclarationsPlugin')
const {
  GenerateComposedAppJsonFilePlugin
} = require('../plugins/generateComposedAppJsonFilePlugin')
const { InjectGetAppPlugin } = require('../plugins/injectGetAppPlugin')
const {
  ModuleSharingAndConsumingPlugin
} = require('../plugins/moduleSharingAndConsumingPlugin')
const {
  OptimizeSplitChunksPlugin
} = require('../plugins/optimizeSplitChunksPlugin')
const {
  PhantomDependencyPlugin
} = require('../plugins/phantomDependencyPlugin')
const {
  PreRuntimeDetectionPlugin
} = require('../plugins/preRuntimeDetectionPlugin')
const { ProgressPlugin } = require('../plugins/progressPlugin')
const { RuntimeInjectPlugin } = require('../plugins/runtimeInjectPlugin')
const { preprocess } = require('../preprocessors/codePreprocessor')
const MorCompilerPlugin = require('../MorCompilerPlugin')

describe('@morjs/plugin-compiler - index.test.js', () => {
  // Mock dependencies
  jest.mock('@morjs/utils')
  jest.mock(path.join(process.cwd(), './compile'))
  jest.mock(path.join(process.cwd(), './compilerPlugins'))
  jest.mock(path.join(process.cwd(), './config'))
  jest.mock(path.join(process.cwd(), './entries'))
  jest.mock(path.join(process.cwd(), './experiments/cssClassnameCompress'))
  jest.mock(path.join(process.cwd(), './experiments/trimRuntimeHelpers'))
  jest.mock(path.join(process.cwd(), './parsers/configParserPlugin'))
  jest.mock(path.join(process.cwd(), './parsers/scriptParserPlugin'))
  jest.mock(path.join(process.cwd(), './parsers/sjsParserPlugin'))
  jest.mock(path.join(process.cwd(), './parsers/styleParserPlugin'))
  jest.mock(path.join(process.cwd(), './parsers/templateParserPlugin'))
  jest.mock(path.join(process.cwd(), './plugins/aliasSupportPlugin'))
  jest.mock(path.join(process.cwd(), './plugins/assetsManipulatePlugin'))
  jest.mock(path.join(process.cwd(), './plugins/defineSupportPlugin'))
  jest.mock(path.join(process.cwd(), './plugins/dynamicRequireSupportPlugin'))
  jest.mock(path.join(process.cwd(), './plugins/emitDeclarationsPlugin'))
  jest.mock(
    path.join(process.cwd(), './plugins/generateComposedAppJsonFilePlugin')
  )
  jest.mock(path.join(process.cwd(), './plugins/injectGetAppPlugin'))
  jest.mock(
    path.join(process.cwd(), './plugins/moduleSharingAndConsumingPlugin')
  )
  jest.mock(path.join(process.cwd(), './plugins/optimizeSplitChunksPlugin'))
  jest.mock(path.join(process.cwd(), './plugins/phantomDependencyPlugin'))
  jest.mock(path.join(process.cwd(), './plugins/preRuntimeDetectionPlugin'))
  jest.mock(path.join(process.cwd(), './plugins/progressPlugin'))
  jest.mock(path.join(process.cwd(), './plugins/runtimeInjectPlugin'))
  jest.mock(path.join(process.cwd(), './preprocessors/codePreprocessor'))

  describe('MorCompilerPlugin', () => {
    let runner
    let webpackWrapper
    let entryBuilder

    beforeEach(() => {
      runner = new Runner()
      webpackWrapper = new WebpackWrapper()
      entryBuilder = new EntryBuilder()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('apply method', () => {
      const plugin = new MorCompilerPlugin()
      plugin.apply(runner)

      // Verify that the necessary plugins are applied
      expect(TrimRuntimeHelperPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(CSSClassNameCompressPlugin.prototype.apply).toHaveBeenCalledTimes(
        1
      )
      expect(EmitDeclarationsPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(
        ModuleSharingAndConsumingPlugin.prototype.apply
      ).toHaveBeenCalledTimes(1)
      expect(
        GenerateComposedAppJsonFilePlugin.prototype.apply
      ).toHaveBeenCalledTimes(1)
      expect(ProgressPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(AssetsManipulatePlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(InjectGetAppPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(OptimizeSplitChunksPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(RuntimeInjectPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(DynamicRequireSupportPlugin.prototype.apply).toHaveBeenCalledTimes(
        1
      )
      expect(AliasSupportPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(DefineSupportPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(PhantomDependencyPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(PreRuntimeDetectionPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(ConfigParserPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(ScriptParserPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(StyleParserPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(TemplateParserPlugin.prototype.apply).toHaveBeenCalledTimes(1)
      expect(SjsParserPlugin.prototype.apply).toHaveBeenCalledTimes(1)

      // Verify that the necessary hooks are tapped
      expect(runner.hooks.webpackWrapper.tap).toHaveBeenCalledTimes(1)
      expect(runner.hooks.matchedCommand.tap).toHaveBeenCalledTimes(1)
      expect(runner.hooks.cli.tap).toHaveBeenCalledTimes(1)
      expect(runner.hooks.userConfigValidated.tapPromise).toHaveBeenCalledTimes(
        2
      )
      expect(runner.hooks.modifyUserConfig.tap).toHaveBeenCalledTimes(1)
      expect(runner.hooks.entryBuilder.promise).toHaveBeenCalledTimes(1)
    })

    test('addCompilerMethods method', () => {
      const plugin = new MorCompilerPlugin()
      plugin['addCompilerMethods']()

      // Verify that the necessary methods are registered
      expect(runner.methods.register).toHaveBeenCalledWith(
        'getCompilerLoaders',
        expect.any(Function)
      )
      expect(runner.methods.register).toHaveBeenCalledWith(
        'getComposedCompilerPlugins',
        expect.any(Function)
      )
    })

    test('registerCli method', () => {
      const plugin = new MorCompilerPlugin()
      plugin['registerCli']()

      // Verify that the necessary options are registered
      expect(runner.hooks.cli.tap).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      )
      expect(runner.command).toHaveBeenCalledWith(
        COMPILE_COMMAND_NAME,
        '编译小程序工程'
      )
      expect(runner.usage).toHaveBeenCalledWith(expect.any(String))
      expect(runner.option).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      )
      expect(runner.action).toHaveBeenCalledWith(expect.any(Function))
    })

    test('modifyUserConfig method', () => {
      const plugin = new MorCompilerPlugin()
      plugin['modifyUserConfig']()

      // Verify that the necessary hooks are tapped
      expect(runner.hooks.modifyUserConfig.tap).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function)
      )
    })

    test('applyDefaultUserConfig method', async () => {
      const plugin = new MorCompilerPlugin()
      await plugin['applyDefaultUserConfig']()

      // Verify that the necessary hooks are tapped
      expect(runner.hooks.userConfigValidated.tapPromise).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      )
      expect(runner.hooks.entryBuilder.promise).toHaveBeenCalledTimes(1)
    })

    test('registerUserConfig method', () => {
      const plugin = new MorCompilerPlugin()
      plugin['registerUserConfig']()

      // Verify that the necessary hooks are tapped
      expect(runner.hooks.registerUserConfig.tap).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function)
      )
    })

    test('getEntryBuilder method', async () => {
      const plugin = new MorCompilerPlugin()
      const entryBuilder = await plugin['getEntryBuilder']()

      // Verify that the EntryBuilder instance is returned
      expect(EntryBuilder).toHaveBeenCalledTimes(1)
      expect(entryBuilder).toBeInstanceOf(EntryBuilder)
    })

    test('buildWebpackConfig method', async () => {
      const plugin = new MorCompilerPlugin()
      await plugin['buildWebpackConfig']()

      // Verify that the necessary hooks are tapped
      expect(runner.hooks.userConfigValidated.tapPromise).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      )
      expect(buildWebpackConfig).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        webpackWrapper,
        entryBuilder,
        runner
      )
    })

    test('runCompile method', async () => {
      const plugin = new MorCompilerPlugin()
      await plugin['runCompile']()

      // Verify that the necessary functions are called
      expect(compile).toHaveBeenCalledWith(webpackWrapper, entryBuilder, runner)
    })
  })
})
