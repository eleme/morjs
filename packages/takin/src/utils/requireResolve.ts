/**
 * 由于 jest 没有办法 mock require.resolve, 需要单独封装方法来解决单测问题
 * https://github.com/facebook/jest/issues/9543
 * @param args
 */
export function requireResolve(
  ...args: Parameters<typeof require.resolve>
): ReturnType<typeof require.resolve> {
  return require.resolve(...args)
}
