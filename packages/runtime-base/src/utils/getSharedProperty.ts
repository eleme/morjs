import { getGlobalObject } from '../env'
import type { Emitter } from '../event'
import { event } from '../event'
import type { MorHooks } from '../hooks'
import { hooks } from '../hooks'

// 默认的共享对象
const SHARED = {
  $morHooks: hooks,
  $event: event
} as const

type IShareObj = {
  $morHooks: MorHooks
  $event: Emitter<any>
}

type PropName = keyof IShareObj

declare function getApp(): any

/**
 * 获取全局共享属性，用于作为原子化的兜底实现
 *   1. 首先查找上下文中对应的属性
 *   2. 如果不存在，则查找 getApp 中的
 *   3. 如果不存在，则查找 小程序环境的 globalObject, 如 my 中是否存在
 *   4. 如果不存在，则使用 SHARED 作为兜底
 * @param propName - 共享属性名称
 * @param context - 当前执行环境的上下文
 * @returns propValue
 */
export function getSharedProperty<T extends PropName>(
  propName: T,
  context?: any
): IShareObj[T] {
  // 先从当前上下文张获取，如果上下文存在的话
  if (context && context[propName] != null) return context[propName]

  // 尝试从 getApp 中获取
  if (typeof getApp === 'function') {
    const app = getApp()
    if (app && app[propName] != null) return app[propName]
  }

  // 从全局对象中获取
  const globalObj = getGlobalObject()
  if (globalObj && globalObj[propName] != null) return globalObj[propName]

  return SHARED[propName]
}
