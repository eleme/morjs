import type { Plugin } from '../plugin'
import type { Runner } from '../runner'

/**
 * 用于设置阻止 runner.run 执行的插件
 */
export default class StopRunPlugin implements Plugin {
  name = 'TakinStopRunPlugin'

  apply(runner: Runner): void {
    runner.hooks.shouldRun.tap(this.name, function () {
      return false
    })
  }
}
