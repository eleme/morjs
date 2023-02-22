// 解决滚动穿透，紧固页面
export const fixedBody = (document) => {
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop
  const style = `position: fixed; top: -${scrollTop}px; left: 0; right: 0;height: 100%;`

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
  body.style.height = 'auto'
}
