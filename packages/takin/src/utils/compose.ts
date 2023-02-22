import { AnyFunc } from '../types'

/**
 * 组合多个函数为一个，顺序执行
 * @param fns - 函数列表
 */
export function compose(fns: AnyFunc[]): AnyFunc {
  return async function composedFn(this: any, ...args: any[]): Promise<any> {
    for await (const fn of fns) {
      await fn.call(this, ...args)
    }
  }
}
