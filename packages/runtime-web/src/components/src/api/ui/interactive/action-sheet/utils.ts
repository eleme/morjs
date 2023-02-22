// 解决滚动穿透，紧固页面
export const fixedBody = (document) => {
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop
  const style = `position: fixed; top: -${scrollTop}px; left: 0; right: 0;bottom: 0;`

  document.body.style.cssText += style
}

// 解决滚动穿透，释放页面
export const looseBody = (document) => {
  const body = document.body
  const top = body.style.top

  body.style.position = ''
  document.body.scrollTop = document.documentElement.scrollTop =
    -parseFloat(top)
  body.style.top = body.style.left = body.style.right = body.style.bottom = ''
}

export const take = (array, property) => {
  const result = []

  array.forEach((item) => {
    result.push(item[property])
  })

  return result
}

export const getValueByIndex = (array, index) => {
  let value = null

  array.forEach((item) => {
    if (item.index === index) value = item
  })

  return value
}

export const formateNum = (num) => {
  num = Number(num)

  if (!Number.isInteger(num) || num <= 0) return null

  if (num >= 100) return -1

  return num
}

export const isIos = () => {
  try {
    const userAgent = navigator.userAgent
    return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  } catch (e) {
    console.warn(`${e}`)
    return false
  }
}
