import { getSharedProperty, logger } from '@morjs/runtime-base'
import type { BehaviorOrMixinOptions } from './behaviorOrMixin'

/**
 * 注入 hasMixin 方法支持
 */
export function injectHasMixinSupport(
  options: Record<string, any>,
  mixins?: BehaviorOrMixinOptions[]
) {
  // 保存当前页面或组件中的 mixins
  mixins = mixins || []

  function hasMixin(
    mixins: BehaviorOrMixinOptions[],
    mixin: BehaviorOrMixinOptions
  ): boolean {
    if (!mixin) return false

    if (mixins.indexOf(mixin) !== -1) return true

    for (let i = 0; i < mixins.length; i++) {
      if (hasMixin(mixins[i]?.mixins || [], mixin)) return true
    }

    return false
  }

  options.hasMixin = function (mixin: BehaviorOrMixinOptions): boolean {
    return hasMixin(mixins, mixin)
  }
}

interface IEventDetail {
  name?: string
  args?: any[]
  id?: string
}

export interface IEvent {
  type: string
  timeStamp: number
  target: {
    id: string
    dataset: Record<string, any>
  }
  currentTarget: {
    id: string
    dataset: Record<string, any>
  }
  detail: IEventDetail
}

/**
 * 事件代理能力注入
 *
 * @param options - 组件或页面选项
 */
export function addEventProxy(options: Record<string, any>): void {
  /**
   * 支付宝小程序转其他小程序的事件代理函数
   * @param event 事件
   */
  options.$morEventHandlerProxy = function (event: IEvent): void {
    const { name, args, id } = event.detail
    let value: any

    if (typeof this[name] === 'function') {
      try {
        value = this[name](...args)
      } catch (err) {
        // 如果是异常了，需要透传到函数接受方那里抛出
        value = err
      }
    } else {
      logger.warn('调用的事件并非函数', name)
    }

    const $event = getSharedProperty('$event', this)

    if ($event) {
      $event.emit(id, value)
    } else {
      logger.warn('aComponent 依赖 $event 的注入，请检查配置')
    }
  }

  /**
   * 用于禁止触摸或滚动的相关事件操作
   */
  /* eslint-disable @typescript-eslint/no-empty-function */
  options.$morDisableScrollProxy = function (): void {}
}

/**
 * 注入实例方法支持
 */
export function injectInstanceMethodsSupport(options: Record<string, any>) {
  // 提供批量更新方法支持
  options.$batchedUpdates = function (cb: () => void) {
    if (this.groupSetData) this.groupSetData(cb)
  }
}
