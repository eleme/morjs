/**
 * 用于 rpx => rem 的转换
 */
let ROOT_VALUE = 2 * 16

function updateFontSize(rootFontSize: number) {
  window.document.documentElement.style.setProperty(
    'font-size',
    (rootFontSize * window.document.documentElement.clientWidth) / 375 + 'px'
  )
}

/**
 * 设置根节点 font-size
 */
export function setRootFontSizeForRem(rootFontSize: number) {
  ROOT_VALUE = 2 * rootFontSize
  updateFontSize(rootFontSize)
  window.addEventListener('resize', () => {
    updateFontSize(rootFontSize)
  })
}

export function rpxToRem(rpxValue: number) {
  return `${rpxValue / ROOT_VALUE}rem`
}
window.$rpxToRem = rpxToRem

/**
 * 自动同步根节点的 font-size
 * 并设置 ROOT_VALUE
 */
export function autoSyncRootFontSize(updateOnResize = true) {
  const rootStyle = window?.document?.documentElement?.style
  const fontSize = String(rootStyle?.getPropertyValue?.('font-size') || '')
    .trim()
    .replace(/([0-9]+).+/, '$1')
  if (fontSize) {
    ROOT_VALUE =
      ((Number(fontSize) * 375) / window.document.documentElement.clientWidth) *
      2
  }

  if (updateOnResize) {
    window.addEventListener('resize', () => {
      autoSyncRootFontSize(false)
    })
  }
}
