/**
 * mor 事件名称前缀
 */
export const MOR_EVENT_PREFIX = '$mor:' as const

/**
 * mor 注入的事件方法前缀
 */
export const MOR_EVENT_METHOD_PREFIX = `${MOR_EVENT_PREFIX}event:` as const

/**
 * 监听 app 事件名称
 */
export const APP_ON_SHOW_EVENT = `${MOR_EVENT_PREFIX}appOnShow` as const
export const APP_ON_HIDE_EVENT = `${MOR_EVENT_PREFIX}appOnHide` as const
