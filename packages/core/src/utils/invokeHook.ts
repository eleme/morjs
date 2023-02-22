import type { MorHooks } from '@morjs/api/lib/hooks'
import { getSharedProperty } from '@morjs/api/lib/utils'

/**
 * 调用hook
 * @param hookName hook名字
 */
export const invokeHook = function (hookName: keyof MorHooks) {
  return function (this: Record<string, any>, ...args: any[]): void {
    getSharedProperty('$morHooks', this)[hookName].call(this, ...args)
  }
}
