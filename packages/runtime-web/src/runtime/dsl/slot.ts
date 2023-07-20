export function slotScope(f, name) {
  // 主要是为了防止因为打包的问题，将方法的名称重命名，导致slot匹配不到
  if (name) {
    f._name = name
  }
  return f
}
