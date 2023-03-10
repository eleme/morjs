/**
 * 确保一个对象是数组
 *  - 如果 对象 == null 则返回空数组
 *  - 如果 对象不是数组 则返回包含该对象的数组
 *  - 如果 对象是数组 直接返回
 * @param arr - 需要转换为数组的参数
 * @returns 数组
 */
export function asArray<T = any>(arr: T | T[]): T[] {
  return Array.isArray(arr) ? arr : arr == null ? [] : [arr]
}
