import { Plugin, Runner, WebpackWrapper } from '@morjs/utils'
import { compile } from './compile'
import {
  getAllCompilerTargets,
  getComposedCompilerPlugins
} from './compilerPlugins'
import {
  applyDefaults,
  buildWebpackConfig,
  LOADERS as COMPILE_LOADERS,
  modifyUserConfig
} from './config'
import {
  CompilerCliConfig,
  CompilerUserConfig,
  CompilerUserConfigSchema,
  COMPILE_COMMAND_NAME
} from './constants'
import { EntryBuilder } from './entries'
import { CSSClassNameCompressPlugin } from './experiments/cssClassnameCompress'
import { TrimRuntimeHelperPlugin } from './experiments/trimRuntimeHelpers'
import { ConfigParserPlugin } from './parsers/configParserPlugin'
import { ScriptParserPlugin } from './parsers/scriptParserPlugin'
import { SjsParserPlugin } from './parsers/sjsParserPlugin'
import { StyleParserPlugin } from './parsers/styleParserPlugin'
import { TemplateParserPlugin } from './parsers/templateParserPlugin'
import { AliasSupportPlugin } from './plugins/aliasSupportPlugin'
import { AssetsManipulatePlugin } from './plugins/assetsManipulatePlugin'
import { DefineSupportPlugin } from './plugins/defineSupportPlugin'
import { DynamicRequireSupportPlugin } from './plugins/dynamicRequireSupportPlugin'
import { EmitDeclarationsPlugin } from './plugins/emitDeclarationsPlugin'
import { GenerateComposedAppJsonFilePlugin } from './plugins/generateComposedAppJsonFilePlugin'
import { InjectGetAppPlugin } from './plugins/injectGetAppPlugin'
import { ModuleSharingAndConsumingPlugin } from './plugins/moduleSharingAndConsumingPlugin'
import { OptimizeSplitChunksPlugin } from './plugins/optimizeSplitChunksPlugin'
import { PhantomDependencyPlugin } from './plugins/phantomDependencyPlugin'
import { ProgressPlugin } from './plugins/progressPlugin'
import { RuntimeInjectPlugin } from './plugins/runtimeInjectPlugin'
import { preprocess } from './preprocessors/codePreprocessor'

export * from './compilerPlugins'
export * from './constants'
export { applyDefaults, COMPILE_LOADERS, preprocess }

const APPLY_DEFAULTS_TO_USER_CONFIG_STAGE = -500
const BUILD_WEBPACK_CONFIG_STAGE = -100

/**
 * 编译功能
 * 单独抽出来一个类, 方便变量局部私有
 */
class MorCompile {
  name: string
  runner: Runner
  webpackWrapper?: WebpackWrapper
  entryBuilder?: EntryBuilder

  constructor(name: string, runner: Runner) {
    this.name = name
    this.runner = runner

    this.addCompilerMethods()

    // 应用 experiments 插件
    new TrimRuntimeHelperPlugin().apply(runner)
    new CSSClassNameCompressPlugin().apply(runner)

    // 应用 declaration 生成支持插件
    new EmitDeclarationsPlugin().apply(runner)

    // 模块共享与消费插件
    new ModuleSharingAndConsumingPlugin().apply(runner)
    // app.json 编译和集成更新功能
    new GenerateComposedAppJsonFilePlugin().apply(runner)

    // 应用 编译相关 插件
    new ProgressPlugin().apply(runner)
    new AssetsManipulatePlugin().apply(runner)
    new InjectGetAppPlugin().apply(runner)
    new OptimizeSplitChunksPlugin().apply(runner)
    new RuntimeInjectPlugin().apply(runner)
    new DynamicRequireSupportPlugin().apply(runner)
    new AliasSupportPlugin().apply(runner)
    new DefineSupportPlugin().apply(runner)
    new PhantomDependencyPlugin().apply(runner)

    // 应用 parser 插件
    new ConfigParserPlugin().apply(runner)
    new ScriptParserPlugin().apply(runner)
    new StyleParserPlugin().apply(runner)
    new TemplateParserPlugin().apply(runner)
    new SjsParserPlugin().apply(runner)

    // 应用编译插件
    Object.values(getComposedCompilerPlugins().Plugin).forEach((Plugin) => {
      if (Plugin) new Plugin().apply(runner)
    })

    // 获取 webpackWrapper
    runner.hooks.webpackWrapper.tap(this.name, (webpackWrapper) => {
      this.webpackWrapper = webpackWrapper
    })

    this.registerCli()
    this.applyDefaultUserConfig()

    runner.hooks.matchedCommand.tap(this.name, (command = {}) => {
      // 非 compile 命令不执行后续
      if (command.name !== COMPILE_COMMAND_NAME) return

      this.registerUserConfig()
      this.modifyUserConfig()
      this.buildWebpackConfig()
    })
  }

  /**
   * 添加编译共享出来的方法
   */
  addCompilerMethods() {
    const methods = this.runner.methods

    /**
     * 支持获取编译器的默认 loaders
     */
    methods.register('getCompilerLoaders', function () {
      return COMPILE_LOADERS
    })

    /**
     * 支持获取 composedPlugins
     */
    methods.register('getComposedCompilerPlugins', function () {
      return getComposedCompilerPlugins()
    })
  }

  // 注册 cli 支持, 基于 CompilerCliConfig 中的设定自动生成
  registerCli() {
    this.runner.hooks.cli.tap(
      {
        name: this.name,
        stage: -100
      },
      (cli) => {
        const compileCommand = cli.command(
          COMPILE_COMMAND_NAME,
          '编译小程序工程'
        )

        const targets = getAllCompilerTargets()
        const composedPlugins = getComposedCompilerPlugins()

        const longestTargetLength = targets.reduce(
          (length, t) => (t.length >= length ? t.length : length),
          0
        )

        // 编译命令的使用介绍
        const usage = `compile 编译命令\n\n  支持的小程序或应用类型 (target):\n    ${Object.keys(
          composedPlugins.targetDescription
        )
          .sort()
          .map(
            (t) =>
              `${t.padEnd(longestTargetLength)}  ${
                composedPlugins.targetDescription[t]
              }`
          )
          .join('\n    ')}`

        compileCommand.usage(usage)

        for (const option in CompilerCliConfig) {
          const optionSchema = CompilerCliConfig[option]

          // 如未配置 cliOption 则跳过
          if (!optionSchema.cliOption) continue

          const options = {} as { default: any }

          // 命令行不设置默认值
          if ('default' in optionSchema) options.default = optionSchema.default

          // 拼接完整描述
          let optionDesc = optionSchema.name
          if (optionSchema.desc)
            optionDesc = `${optionDesc}, ${optionSchema.desc}`

          if (optionSchema.valuesDesc) {
            const valueDesc =
              typeof optionSchema.valuesDesc === 'function'
                ? optionSchema.valuesDesc()
                : optionSchema.valuesDesc
            optionDesc = `${optionDesc}, ${valueDesc}`
          }

          compileCommand.option(optionSchema.cliOption, optionDesc, options)
        }

        // 执行 compile
        compileCommand.action(async () => await this.runCompile())
      }
    )
  }

  // 基于命令行参数修改 userConfig
  modifyUserConfig() {
    const { config } = this.runner
    this.runner.hooks.modifyUserConfig.tap(
      this.name,
      function (userConfig = {}, command) {
        return modifyUserConfig(config, userConfig, command?.options || {})
      }
    )
  }

  // 应用用户默认配置
  applyDefaultUserConfig() {
    const { hooks, config } = this.runner
    hooks.userConfigValidated.tapPromise(
      {
        name: `${this.name}:applyDefaultUserConfig`,
        stage: APPLY_DEFAULTS_TO_USER_CONFIG_STAGE
      },
      async () => {
        const userConfig = this.runner.userConfig as CompilerUserConfig
        applyDefaults(config, userConfig)

        // 在 APPLY_DEFAULTS_TO_USER_CONFIG_STAGE 阶段初始化 entryBuidler
        // 并触发 entryBuilder hook
        await this.getEntryBuilder()
      }
    )
  }

  // compile 支持的配置
  registerUserConfig() {
    const { hooks } = this.runner
    hooks.registerUserConfig.tap(this.name, function (s, z) {
      const allTargets = getAllCompilerTargets()
      return s.merge(CompilerUserConfigSchema).extend({
        /**
         * 这里覆盖 target 的校验 用于允许通过外部自动追加编译插件
         */
        target: z
          .string()
          .refine(
            (val) => allTargets.includes(val),
            (val) => ({
              message: `无效的值. 期望是 ${allTargets
                .map((val) => `'${val}'`)
                .join(' 或 ')}, 实际是 '${val}'`
            })
          )
          .default(allTargets[0])
      })
    })
  }

  async getEntryBuilder(): Promise<EntryBuilder> {
    if (this.entryBuilder) return this.entryBuilder

    const entryBuilder = new EntryBuilder(
      this.runner.config,
      this.runner.userConfig as CompilerUserConfig,
      this.webpackWrapper,
      this.runner.context,
      this.runner
    )

    /* 触发 entryBuilder hook */
    await this.runner.hooks.entryBuilder.promise(entryBuilder)

    this.entryBuilder = entryBuilder
    return this.entryBuilder
  }

  buildWebpackConfig() {
    const { hooks, config } = this.runner
    hooks.userConfigValidated.tapPromise(
      {
        name: `${this.name}:buildWebpackConfig`,
        // 越小越靠前
        stage: BUILD_WEBPACK_CONFIG_STAGE
      },
      async () => {
        const userConfig = this.runner.userConfig as CompilerUserConfig
        const entryBuilder = await this.getEntryBuilder()
        await buildWebpackConfig(
          config,
          userConfig,
          this.webpackWrapper,
          entryBuilder,
          this.runner
        )
      }
    )
  }

  // 执行编译
  async runCompile() {
    const entryBuilder = await this.getEntryBuilder()
    await compile(this.webpackWrapper, entryBuilder, this.runner)
  }
}

/**
 * 编译插件
 */
export default class MorCompilerPlugin implements Plugin {
  name = 'MorCompilerPlugin'
  apply(runner: Runner) {
    new MorCompile(this.name, runner)
  }
}
