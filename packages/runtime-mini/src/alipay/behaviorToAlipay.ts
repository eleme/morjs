import { logger } from '@morjs/api'
import type { BehaviorOptions, DefinitionFilter } from './utilsToAlipay'

/**
 * Behavior 构造函数实现
 * @param options - Behavior 选项
 */
export function Behavior(
  options: BehaviorOptions
): Omit<BehaviorOptions, 'definitionFilter'> {
  const behaviors = options?.behaviors || []
  const definitionFilter = options?.definitionFilter
  const definitionFilterArr: DefinitionFilter[] = []

  // 执行当前 behaviors 中的 definitionFilter
  behaviors.map((behavior) => {
    if (behavior.definitionFilter) {
      if (typeof behavior.definitionFilter === 'function') {
        definitionFilterArr.push(behavior.definitionFilter)
        behavior.definitionFilter(options)
      } else {
        logger.error(
          `Behavior definitionFilter 定义段不是一个有效的函数: ${behavior.definitionFilter}`
        )
      }
    }
  })

  // 重写 definitionFilter, 补充 definitionFilterArr 参数
  if (definitionFilter) {
    options.definitionFilter = function (defFields) {
      definitionFilter(defFields, definitionFilterArr)
    }
  }

  return options
}
