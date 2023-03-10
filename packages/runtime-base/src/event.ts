/* eslint-disable @typescript-eslint/no-non-null-assertion */

export type EventType = string | symbol

export type EventHandler<T = unknown> = (event: T) => void
export type WildcardEventHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T]
) => void
export type EventHandlerList<T = unknown> = Array<EventHandler<T>>
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<
  WildcardEventHandler<T>
>
export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | '*',
  EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>
export interface Emitter<Events extends Record<EventType, unknown>> {
  /**
   * 用于存储事件名称和处理方法的 Map 对象
   */
  all: EventHandlerMap<Events>

  /**
   * 注册事件及监听函数
   * @param type - 事件类型, * 可添加通配符监听函数
   * @param handler - 事件监听函数
   */
  on<Key extends keyof Events>(
    type: Key,
    handler: EventHandler<Events[Key]>
  ): void
  on(type: '*', handler: WildcardEventHandler<Events>): void

  /**
   * 移除特定类型的事件监听
   * 如果未指定 handler, 则该类型的事件将会被全部移除
   * @param type - 需要移除监听函数的类型 from (`'*'` 可用于移除通配符监听函数)
   * @param handler - 需要移除的特定监听函数
   */
  off<Key extends keyof Events>(
    type: Key,
    handler?: EventHandler<Events[Key]>
  ): void
  off(type: '*', handler: WildcardEventHandler<Events>): void

  /**
   * 触发特定类型的时间
   * `'*'` 通配符监听函数执行时间晚于普通事件类型
   * 注意: 不支持手动触发 '*' 事件
   *
   * @param type - 事件类型
   * @param evt - 传递给事件监听函数的值, 可以是任意类型
   */
  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void
  emit<Key extends keyof Events>(
    type: undefined extends Events[Key] ? Key : never
  ): void

  /**
   * 注册一次性事件及监听函数(仅执行一次)
   * @param type - 事件类型, * 可添加通配符监听函数
   * @param handler - 事件监听函数
   */
  once<Key extends keyof Events>(
    type: Key,
    handler: EventHandler<Events[Key]>
  ): void
  once(type: '*', handler: WildcardEventHandler<Events>): void
}

type Reason = string

// 搜集所有创建的 Emitter 实例
// 主要用于 调试或检查
const EVENT_EMITTER_INSTANCES: Record<
  Reason,
  {
    // 创建时间
    createdAt: number
    // 事件实例
    event: Emitter<any>
  }[]
> = {}

/**
 * 创建 Emitter 实例
 * @param reason - 事件创建原因, 用于统计
 * @param all - 自定义 Map 用于存储事件名称和事件处理函数
 * @returns Emitter
 */
export function createEvent<Events extends Record<EventType, unknown>>(
  reason: string,
  all?: EventHandlerMap<Events>
): Emitter<Events> {
  type GenericEventHandler =
    | EventHandler<Events[keyof Events]>
    | WildcardEventHandler<Events>

  all = all || new Map()

  function on<Key extends keyof Events>(
    type: Key,
    handler: GenericEventHandler
  ) {
    const handlers: Array<GenericEventHandler> | undefined = all!.get(type)
    if (handlers) {
      handlers.push(handler)
    } else {
      all!.set(type, [handler] as EventHandlerList<Events[keyof Events]>)
    }
  }

  function off<Key extends keyof Events>(
    type: Key,
    handler?: GenericEventHandler
  ) {
    const handlers: Array<GenericEventHandler> | undefined = all!.get(type)
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1)
      } else {
        all!.set(type, [])
      }
    }
  }

  function emit<Key extends keyof Events>(type: Key, evt?: Events[Key]) {
    let handlers = all!.get(type)
    if (handlers) {
      ;(handlers as EventHandlerList<Events[keyof Events]>)
        .slice()
        .map((handler) => {
          handler(evt!)
        })
    }

    handlers = all!.get('*')
    if (handlers) {
      ;(handlers as WildCardEventHandlerList<Events>).slice().map((handler) => {
        handler(type, evt!)
      })
    }
  }

  function once<Key extends keyof Events>(
    type: Key,
    handler: GenericEventHandler
  ) {
    if (type === '*') {
      const fn: WildcardEventHandler<Events> = function (type, event) {
        off(type, fn)
        ;(handler as WildcardEventHandler<Events>)(type, event)
      }
      on(type, fn)
    } else {
      const fn: EventHandler<Events[keyof Events]> = function (event) {
        off(type, fn)
        ;(handler as EventHandler<Events[keyof Events]>)(event)
      }
      on(type, fn)
    }
  }

  const emitter: Emitter<Events> = {
    all,
    on,
    off,
    emit,
    once
  }

  // 记录创建的 event
  EVENT_EMITTER_INSTANCES[reason] = EVENT_EMITTER_INSTANCES[reason] || []
  EVENT_EMITTER_INSTANCES[reason].push({
    createdAt: +new Date(),
    event: emitter
  })

  return emitter
}

/**
 * 获取所有 event 实例
 */
export function getAllEvents() {
  return EVENT_EMITTER_INSTANCES
}

/**
 * 全局默认 Event
 */
export const event = createEvent('default')
