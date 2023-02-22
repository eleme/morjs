/**
 * 是否条件编译的注释
 * @param comment
 */
export function isIfDef(comment: string) {
  if (comment.trim().startsWith('#ifdef')) {
    return true
  }
  return false
}

export function isEndIf(comment: string) {
  if (comment.trim().startsWith('#endif')) {
    return true
  }
  return false
}

/**
 * 获取条件编译注释的 条件
 * @param comment
 */
export function defCondition(comment: string): string {
  return comment.trim().split(' ')[1]
}
