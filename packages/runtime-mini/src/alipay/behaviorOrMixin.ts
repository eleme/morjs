import { logger } from '@morjs/runtime-base'

/**
 * 自定义组件扩展
 * 微信参考文档: https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/extend.html
 * 支付宝参考文档: https://opendocs.alipay.com/mini/05bdpv?pathHash=4a676f9c
 */
export type DefinitionFilter = <T extends Record<string, any>>(
  /** 使用该 behavior/mixin 的 component - behavior/mixin 的定义对象 */
  defFields: T,
  /** 该 behavior/mixin 所使用的 behavior/mixin 的 definitionFilter 函数列表 */
  definitionFilterArr?: DefinitionFilter[]
) => void

export interface BehaviorOrMixinOptions {
  definitionFilter?: DefinitionFilter
  behaviors?: BehaviorOrMixinOptions[]
  [k: string]: any
}

type ITypeBehaviorOrMixin = 'behaviors' | 'mixins'

function BehaviorOrMixin(
  options: BehaviorOrMixinOptions,
  types: ITypeBehaviorOrMixin
): Omit<BehaviorOrMixinOptions, 'definitionFilter'> {
  const behaviorsOrMixins = options?.[types] || []
  const definitionFilter = options?.definitionFilter
  const definitionFilterArr: DefinitionFilter[] = []

  // 执行当前 behaviors/mixins 中的 definitionFilter
  behaviorsOrMixins.map((item) => {
    if (item.definitionFilter) {
      if (typeof item.definitionFilter === 'function') {
        definitionFilterArr.push(item.definitionFilter)
        item.definitionFilter(options)
      } else {
        logger.error(
          `${types} definitionFilter 定义段不是一个有效的函数: ${item.definitionFilter}`
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

/**
 * Behavior 构造函数实现
 * @param options - Behavior 选项
 */
export function Behavior(
  options: BehaviorOrMixinOptions
): Omit<BehaviorOrMixinOptions, 'definitionFilter'> {
  return BehaviorOrMixin(options, 'behaviors')
}

/**
 * Mixin 构造函数实现
 * @param options - Mixin 选项
 */
export function Mixin(
  options: BehaviorOrMixinOptions
): Omit<BehaviorOrMixinOptions, 'definitionFilter'> {
  return BehaviorOrMixin(options, 'mixins')
}
