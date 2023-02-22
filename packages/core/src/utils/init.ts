import {
  applySolutions,
  createHooks,
  hooks,
  MorSolution
} from '@morjs/api/lib/hooks'
import { asArray } from '@morjs/api/lib/utils'
import { ContextPlugin } from '../plugins/contextPlugin'
import { EventPlugin } from '../plugins/eventPlugin'

let IS_DEFAULT_HOOKS_USED = false

/**
 * 初始化, 创建 $hooks 及应用 solutions
 * @param solution 解决方案
 */
export function init(solution?: MorSolution | MorSolution[]) {
  const solutions = [
    function () {
      return {
        plugins: [new EventPlugin(), new ContextPlugin()]
      }
    }
  ].concat(asArray(solution))

  const $hooks = IS_DEFAULT_HOOKS_USED
    ? createHooks('initWithSolutions')
    : hooks
  IS_DEFAULT_HOOKS_USED = true

  const pluginsNames = applySolutions($hooks, solutions)

  return {
    $hooks,
    pluginsNames
  }
}
