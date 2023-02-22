import { ComposeModuleStates, Plugin, QUEUE, Runner } from '@morjs/utils'
import { COMMAND_NAME } from '../constants'

/**
 * 过滤需要编译的模块以及控制集成输出状态
 * - 提供 --with-modules 和 --without-modules 支持
 * - 提供 --from-state 和 --to-state 支持
 * - 提供 --concurrency 支持
 */
export class ExtraComposeOptionsPlugin implements Plugin {
  name = 'MorExtraComposeOptionsPlugin'

  apply(runner: Runner) {
    runner.hooks.cli.tap(
      {
        name: `${this.name}`,
        stage: 100
      },
      (cli) => {
        const compileCommand = cli.command('compile')
        const composeCommand = cli.command(COMMAND_NAME)

        const statesRange = `${ComposeModuleStates.initial}-${ComposeModuleStates.composed}`

        const commonInfo = ', 该配置需要开启集成后生效'

        const withModules = [
          '--with-modules <moduleName>',
          `指定需要参与集成的模块, 支持 glob 模式${commonInfo}`
        ] as const
        const withoutModules = [
          '--without-modules <moduleName>',
          `排除不需要集成的模块, 支持 glob 模式${commonInfo}`
        ] as const
        const fromState = [
          '--from-state <state>',
          `控制模块集成时的初始状态, 可选值: ${statesRange}${commonInfo}`
        ] as const
        const toState = [
          '--to-state <state>',
          `控制模块集成时的最终状态, 可选值: ${statesRange}${commonInfo}`
        ] as const
        const concurrency = [
          '--concurrency <number>',
          `控制模块集成时的并发数量`
        ] as const
        const combineModules = [
          '--combine-modules',
          `合并模块配置 (主要用于合并分包配置的页面到主包中)`
        ] as const

        compileCommand.option(...withModules)
        compileCommand.option(...withoutModules)
        compileCommand.option(...fromState)
        compileCommand.option(...toState)
        compileCommand.option(...concurrency)
        compileCommand.option(...combineModules)

        composeCommand.option(...withModules)
        composeCommand.option(...withoutModules)
        composeCommand.option(...fromState)
        composeCommand.option(...toState)
        composeCommand.option(...concurrency)
        composeCommand.option(...combineModules)
      }
    )

    // 命令行覆盖用户配置
    runner.hooks.modifyUserConfig.tap(
      this.name,
      function (userConfig, command) {
        if (command?.options?.combineModules != null) {
          userConfig.combineModules = command.options.combineModules
        }

        return userConfig
      }
    )

    // 基于命令行配置并发数
    runner.hooks.matchedCommand.tap(this.name, function (command) {
      if (command?.options?.concurrency) {
        const concurrency = parseInt(command.options.concurrency)
        if (concurrency && concurrency >= 1) {
          QUEUE.concurrency = concurrency
        }
      }
    })
  }
}
