import path from 'path'
import type { Plugin } from '../plugin'
import type { Runner } from '../runner'

/**
 * 用于修改当前工作目录 cwd
 */
export default class ChangeCwdPlugin implements Plugin {
  name = 'TakinChangeCwdPlugin'

  apply(runner: Runner): void {
    runner.hooks.cli.tap(this.name, function (cli) {
      cli.option('--cwd <cwd>', '当前工作目录, 默认为 process.cwd()')
    })

    runner.hooks.matchedCommand.tap(
      {
        name: this.name,
        stage: Number.NEGATIVE_INFINITY
      },
      function (command) {
        const cwd = command?.options?.['cwd'] || runner.config.cwd
        runner.config.cwd = path.resolve(cwd)
      }
    )
  }
}
