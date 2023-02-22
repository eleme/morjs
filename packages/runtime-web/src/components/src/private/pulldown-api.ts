import PageHost from './page-host'

export function getPage(): PageHost {
  const pages = document.querySelectorAll('tiga-page-host')
  if (pages.length === 0) {
    return null
  }
  return pages[pages.length - 1] as PageHost
}

export default {
  startPullDownRefresh() {
    return new Promise((resolve) => {
      const page = getPage()
      page && page.startPullDownRefresh()
      resolve(undefined)
    })
  },
  stopPullDownRefresh() {
    return new Promise((resolve) => {
      const page = getPage()
      page && page.stopPullDownRefresh()
      resolve(undefined)
    })
  },
  setCanPullDown({ canPullDown }) {
    if (typeof canPullDown === 'undefined') return

    try {
      const pagesStack = getCurrentPages()
      const tigaHostName = 'tiga-page-host'
      const currPage = pagesStack[pagesStack.length - 1] || null
      const { pageId } = currPage
      let tigaHost: any = document
        .getElementById(pageId)
        .querySelector(tigaHostName)

      tigaHost.enbalePullRefresh = canPullDown

      setTimeout(() => {
        tigaHost = null
      }, 0)
    } catch (e) {}
  }
}
