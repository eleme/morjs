/**
 * 对象中是否包含对应的属性
 * @param obj - 对象
 * @param propertyName - 属性名称
 * @returns true or false
 */
export function hasOwnProperty(obj: any, propertyName: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, propertyName)
}
