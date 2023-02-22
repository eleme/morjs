/**
 * 函数类型
 */
export interface IAnyFunc {
  (...args: any[]): any
}

/**
 * 将多个函数合并为一个函数
 * @param stack - 函数堆栈
 * @returns 合并后的函数
 */
export function compose<T extends IAnyFunc>(stack: T[]) {
  return function (...args: any[]): void {
    for (const fn of stack) {
      fn.call(this, ...args)
    }
  }
}
