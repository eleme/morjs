/**
 * 调用原本的生命周期函数
 * @param fnName 事件名
 * @param obj 事件方法来源
 * @param shouldDeleteProperty 是否移除属性, 一些生命周期函数需要保存后并移除, 以避免重复触发
 */
export const invokeOriginalFunction = function (
  fnName: string,
  obj: Record<string, any>,
  shouldDeleteProperty: boolean = false
): (...args: any[]) => void {
  const originalFn = obj[fnName]

  if (shouldDeleteProperty && obj && fnName && fnName in obj) {
    delete obj[fnName]
  }

  return function (this: typeof obj, ...args: any[]): void {
    if (originalFn && typeof originalFn === 'function') {
      return originalFn.call(this, ...args)
    }
  }
}
