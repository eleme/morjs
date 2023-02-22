import path from 'path'
import type { Plugin } from '../plugin'
import type { Runner } from '../runner'

/**
 * 载入 env 支持插件
 * 默认为未开启状态，需要通过 config.env.enable() 开启后才会生效
 */
export default class LoadEnvPlugin implements Plugin {
  name = 'TakinLoadEnvPlugin'

  apply(runner: Runner): void {
    runner.hooks.matchedCommand.tap(this.name, function () {
      const config = runner.config
      const env = runner.config.env
      env.options.path = env.options.path ?? path.join(config.cwd, '.env')
      env.load()
    })
  }
}
