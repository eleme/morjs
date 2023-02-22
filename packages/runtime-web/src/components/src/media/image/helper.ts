export const isElementVisible = (el) => {
  const rect = el.getBoundingClientRect()
  const vWidth = window.innerWidth || document.documentElement.clientWidth
  const vHeight = window.innerHeight || document.documentElement.clientHeight

  if (
    rect.right < 0 ||
    rect.bottom < 0 ||
    rect.left > vWidth ||
    rect.top > vHeight
  ) {
    return false
  }

  return true
}

// 默认查询四代元素
export const outDocument = (el, index = 4) => {
  // 查询终止条件
  if (index <= 0 || !el) return false

  const { position } = window.getComputedStyle(el)
  const result = position === 'fixed' || position === 'absolute'

  if (result) return result
  else return outDocument(el.parentNode, index - 1)
}
