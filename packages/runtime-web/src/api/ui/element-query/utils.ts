export const getPlainObjectFromRect = (rect) => {
  if (!rect) return {}
  const { top, right, bottom, left, width, height, x, y } = rect

  return { top, right, bottom, left, width, height, x, y }
}
