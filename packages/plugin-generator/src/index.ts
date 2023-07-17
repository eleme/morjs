import { asArray, Plugin, Runner, Takin } from '@morjs/utils'
import create from './create'
import generate from './generate'

const SUPPORT_COMMANDS = ['init', 'create', 'generator', 'g']

export default class MorGeneratorPlugin implements Plugin {
  name = 'MorGeneratorPlugin'

  runner?: Runner

  onUse(takin: Takin) {
    takin.hooks.configFiltered.tap(this.name, function (userConfigs, command) {
      const selectedConfigName = command?.options?.name
      const commandName =
        command.name == null ? command?.args?.[0] : command.name
      if (SUPPORT_COMMANDS.includes(commandName)) {
        // 如果用户选择了某个配置，则返回第一个
        if (selectedConfigName) return asArray(userConfigs?.[0])
        // 否则返回空
        return []
      }
      return userConfigs
    })
  }

  apply(runner: Runner) {
    this.runner = runner

    this.registerCli()
    this.skipValidateUserConfig()
  }

  registerCli() {
    this.runner.hooks.cli.tap(this.name, (cli) => {
      cli
        .command('generate <type> [...args]', '生成器, 命令别名 [g]')
        .option('-s, --src-path <dir>', '源代码根目录, 默认为 src')
        .option(
          '--source-type <sourceType>',
          '源码类型, 用于判断小程序页面或组件使用了哪种 DSL, 可选值为 wechat, alipay'
        )
        .option('--ts, --typescript', '是否使用 typescript')
        .option('--less', '是否使用 less')
        .option('--sass, --scss', '是否使用 sass 或 scss')
        .alias('g')
        .action((command) => generate(command, this.runner))

      cli
        .command(
          'init [projectDir]',
          '初始化/创建 Mor 项目、插件、脚手架等, 命令别名 [create]'
        )
        .alias('create')
        .option('--template, -t <template>', '指定脚手架模版')
        .option('--no-custom', '关闭初始化/创建功能定制')
        .action((command) => create(command, this.runner))
    })
  }

  // 脚手架命令不需要校验用户配置，故此处跳过
  skipValidateUserConfig() {
    const runner = this.runner
    this.runner.hooks.shouldValidateUserConfig.tap(this.name, function () {
      if (SUPPORT_COMMANDS.includes(runner.commandName)) return false
    })
  }
}
