import { ConstObject } from '../types'

/**
 * 通过数组创建对象 enum
 * @param t - 静态数组
 */
export function objectEnum<U extends string, T extends Readonly<[U, ...U[]]>>(
  t: T
): ConstObject<T> {
  return t.reduce(function (res, v) {
    res[v] = v
    return res
  }, {} as ConstObject<T>)
}
