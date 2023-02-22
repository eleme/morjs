import type { Plugin, Runner, Takin } from '@morjs/utils'
import create from './create'
import generate from './generate'

const SUPPORT_COMMANDS = ['init', 'create']

export default class MorGeneratorPlugin implements Plugin {
  name = 'MorGeneratorPlugin'

  runner?: Runner

  onUse(takin: Takin) {
    takin.hooks.configFiltered.tap(this.name, function (userConfigs, command) {
      const commandName =
        command.name == null ? command?.args?.[0] : command.name
      // generator 仅运行 runner 一次
      if (SUPPORT_COMMANDS.includes(commandName)) return []
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
