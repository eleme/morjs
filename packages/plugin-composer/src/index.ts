import {
  asArray,
  CommandOptions,
  CompileTypes,
  ComposeModuleStates,
  Plugin,
  Runner,
  validKeysMessage
} from '@morjs/utils'
import { compose, generateComposeModuleHash } from './compose'
import {
  COMMAND_NAME,
  ComposerUserConfig,
  ComposeUserConfigSchema
} from './constants'
import { AddComposeToCompilerPlugin } from './plugins/addComposeToCompilerPlugin'
import { CopyHostProjectFileComposePlugin } from './plugins/copyHostProjectFileComposePlugin'
import { ExtraComposeOptionsPlugin } from './plugins/extraComposeOptionsPlugin'
import { LoadScriptsAndDistForComposePlugin } from './plugins/loadScriptsAndDistForComposePlugin'
import { overrideUserConfig } from './utils'

export { ComposerUserConfig, generateComposeModuleHash }

class MorComposer {
  name: string
  runner: Runner

  constructor(name: string, runner: Runner) {
    this.name = name
    this.runner = runner

    // 为 compile 命令增加 --compose 支持
    new AddComposeToCompilerPlugin().apply(runner)

    // 为 compile 和 compose
    // 添加 --with-modules 和 --without-modules 支持
    //     --from-state 和 --to-state 支持
    //     --concurrency 支持
    new ExtraComposeOptionsPlugin().apply(runner)

    // 通过 package.json 载入 module 脚本及 dist
    new LoadScriptsAndDistForComposePlugin().apply(runner)

    // 自动拷贝项目配置文件到集成产物目录
    new CopyHostProjectFileComposePlugin().apply(runner)

    this.registerCli()
    this.registerUserConfig()
    this.modifyUserConfig()
  }

  /**
   * 配置 compose 命令
   */
  registerCli() {
    this.runner.hooks.cli.tap(this.name, (cli) => {
      cli
        .command(COMMAND_NAME, '小程序集成功能')
        .option(
          '-t, --target <target>',
          '编译目标, 将当前的工程编译为目标小程序工程, 如 wechat、alipay 等'
        )
        .option(
          '-o, --output-path <dir>',
          '编译产物输出目录, 不同的 target 会有默认的输出目录, 如 dist/wechat'
        )
        .option(
          '--compile-type <compileType>',
          `编译形态, 将当前工程编译为指定形态, ${validKeysMessage(
            CompileTypes
          )}`
        )
        .action(this.runCompose)
    })
  }

  /**
   * 注册 compose 相关用户配置校验
   */
  registerUserConfig() {
    this.runner.hooks.registerUserConfig.tap(this.name, function (schema) {
      return schema.merge(ComposeUserConfigSchema)
    })
  }

  modifyUserConfig() {
    // 支持 --output-path 覆盖 用户配置中的 outputPath
    this.runner.hooks.modifyUserConfig.tap(
      this.name,
      function (userConfig = {}, command) {
        if (command?.name !== COMMAND_NAME) return userConfig

        const options = command?.options || {}

        return overrideUserConfig({
          optionNames: ['target', 'outputPath', 'compileType'],
          userConfig,
          commandOptions: options
        })
      }
    )
  }

  /**
   * 执行 compose 命令
   */
  runCompose = async (command: CommandOptions) => {
    const withModules = asArray(command?.options?.withModules) as string[]

    const withoutModules = asArray(command?.options?.withoutModules) as string[]

    const fromState =
      command?.options?.fromState == null
        ? undefined
        : (Number(command?.options?.fromState) as ComposeModuleStates)

    const toState =
      command?.options?.toState == null
        ? undefined
        : (Number(command?.options?.toState) as ComposeModuleStates)

    const config = this.runner.userConfig as ComposerUserConfig & {
      compileType: string
      outputPath: string
    }
    const runner = this.runner
    const tempDir = runner.config.getTempDir()
    const compileType = config.compileType
    const outputPath = config.outputPath
    const combineModules = config.combineModules

    await compose(
      runner,
      config,
      compileType,
      tempDir,
      outputPath,
      'all',
      withModules,
      withoutModules,
      fromState,
      toState,
      combineModules
    )
  }
}

export default class MorComposerPlugin implements Plugin {
  name = 'MorComposerPlugin'
  apply(runner: Runner) {
    new MorComposer(this.name, runner)
  }
}
