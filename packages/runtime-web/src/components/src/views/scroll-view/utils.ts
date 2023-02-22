export const isSupportIntersectionObserver = () =>
  typeof window.IntersectionObserver === 'function'

// 解决滚动穿透，紧固页面
export const fixedBody = (document) => {
  if (!isSupportIntersectionObserver()) return

  const getStyle = (scrollTop) =>
    `position: fixed; top: ${scrollTop}px; left: 0; right: 0;height: 100%;`
  const tigaPage = document.querySelector('tiga-page')

  if (tigaPage) {
    const pageScrollTop = tigaPage.getBoundingClientRect().top
    tigaPage.style.cssText += getStyle(pageScrollTop)
  }
}

// 解决滚动穿透，释放页面
export const looseBody = (document) => {
  if (!isSupportIntersectionObserver()) return
  const tigaPage = document.querySelector('tiga-page')
  const pageHost = document.querySelector('tiga-page-host').shadowRoot
  const content = pageHost.querySelector('.content')
  const tigaHeader = pageHost.querySelector('tiga-header')

  const setStyle = (element, top) => {
    element.style.position = ''
    element.style.top =
      element.style.left =
      element.style.right =
      element.style.bottom =
        ''
    element.style.height = ''
    const scrollTop =
      Number.parseFloat(top) - ((tigaHeader && tigaHeader.offsetHeight) || 0)
    content.scrollTop = -scrollTop
  }

  if (tigaPage) {
    const pageTop = tigaPage.style.top
    setStyle(tigaPage, pageTop)
  }
}
