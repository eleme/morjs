const isRoot = (element: Element) => {
  if (!element) return false

  let { tagName = '' } = element
  tagName = tagName.toLowerCase()

  if (tagName && (tagName === 'tiga-page-host' || tagName === 'body'))
    return true

  return false
}

export const findScrollParent = (element) => {
  if (!element) {
    return undefined
  }

  const parentNode = element.parentNode

  if (parentNode && !isRoot(parentNode)) {
    const parentNodeStyle = window.getComputedStyle(parentNode)
    const parentNodeOverflowX = parentNodeStyle['overflow-x']
    const parentNodeOverflowY = parentNodeStyle['overflow-y']

    if (
      parentNodeOverflowX === 'auto' ||
      parentNodeOverflowY === 'auto' ||
      parentNodeOverflowX === 'scroll' ||
      parentNodeOverflowY === 'scroll'
    ) {
      return parentNode
    } else {
      return findScrollParent(parentNode)
    }
  } else {
    if (parentNode && parentNode.shadowRoot)
      return parentNode.shadowRoot.querySelector('.content')
    return parentNode
  }
}

let clientHeight = 0
let clientWidth = 0

export const getElementVisibleRatio = (element: Element) => {
  if (!clientHeight)
    clientHeight =
      document.body.clientHeight || document.documentElement.clientHeight
  if (!clientWidth)
    clientWidth =
      document.body.clientWidth || document.documentElement.clientWidth

  const ratio = 0
  const toFixed = (number: number) => number.toFixed(2)

  if (!element) return ratio
  try {
    const { width, height, top, right, bottom, left } =
      element.getBoundingClientRect()
    if (
      top <= -height ||
      right <= -width ||
      bottom <= -height ||
      left <= -width ||
      top >= clientHeight ||
      left >= clientWidth
    )
      return ratio

    if (top <= 0) return toFixed(1 + top / height)
    if (clientHeight - top > 0 && clientHeight - top <= height)
      return toFixed((clientHeight - top) / height)
    if (bottom <= 0) return toFixed(1 + bottom / height)
    if (left <= 0) return toFixed(1 + left / height)
    if (clientWidth - left > 0 && clientWidth - left <= width)
      return toFixed((clientWidth - left) / width)
    if (right <= 0) return toFixed(1 + right / height)

    return 1
  } catch (e) {}

  return ratio
}
