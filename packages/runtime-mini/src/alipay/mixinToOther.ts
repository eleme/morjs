import { logger } from '@morjs/runtime-base'
import type { DefinitionFilter, MixinOptions } from './utilsToOther'

/**
 * Mixin 构造函数实现
 * @param options - Mixin 选项
 */
export function Mixin(
  options: MixinOptions
): Omit<MixinOptions, 'definitionFilter'> {
  const mixins = options?.mixins || []
  const definitionFilter = options?.definitionFilter
  const definitionFilterArr: DefinitionFilter[] = []

  // 执行当前 mixins 中的 definitionFilter
  mixins.map((mixin) => {
    if (mixin.definitionFilter) {
      if (typeof mixin.definitionFilter === 'function') {
        definitionFilterArr.push(mixin.definitionFilter)
        mixin.definitionFilter(options)
      } else {
        logger.error(
          `Mixin definitionFilter 定义段不是一个有效的函数: ${mixin.definitionFilter}`
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
