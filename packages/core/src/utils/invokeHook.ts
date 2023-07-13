import { getSharedProperty, logger, MorHookNames } from '@morjs/api'

/**
 * 调用 hook
 * @param hookName hook 名字
 */
export const invokeHook = function (hookName: MorHookNames) {
  return function (this: Record<string, any>, ...args: any[]): void {
    const hook = getSharedProperty('$morHooks', this)?.[hookName]
    if (typeof hook?.call === 'function') {
      hook.call(this, ...args)
    } else {
      logger.error(`${hookName} 不是一个有效的 hook`)
    }
  }
}
