/**
 * 数组转换方法
 * @param value - 需要转换为数组的值
 * @returns 数组
 */
export function asArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value
  if (value == null) return []
  return [value]
}
