import { getPage } from './pulldown-api'

export default {
  pageScrollTo({ scrollTop, duration = 0, selector }) {
    return new Promise((resolve, reject) => {
      if (scrollTop < 0) {
        reject('scrollTop 必须大于0')
        return
      }

      if (selector) {
        reject('暂不支持selector')
        return
      }

      duration = Number.isNaN(Number(duration))
        ? 0
        : Math.max(0, Number(duration))

      const page = getPage()
      const scrollSelector = page.shadowRoot.querySelector('.content')

      const currentScrollTop = scrollSelector.scrollTop // 滚动开始时的位置
      const distance = scrollTop - currentScrollTop // 一共需要滚动的距离

      if (duration === 0 && distance !== 0) {
        // 无duration，有滚动距离
        requestAnimationFrame(() => {
          scrollSelector.scrollTo({ top: scrollTop, left: 0 })
        })
        return resolve(undefined)
      } else if (duration === 0 || distance === 0) {
        // 无duration 或 无滚动距离
        return resolve(undefined)
      }

      const start = Date.now() // 滚动开始时间
      requestAnimationFrame(function doPageScroll() {
        const scrollingTime = Date.now() - start

        const newScrollTop = (function (
          scrollingTime,
          currentScrollTop,
          distance,
          duration
        ) {
          return (
            -distance * (scrollingTime /= duration) * (scrollingTime - 2) +
            currentScrollTop
          )
        })(scrollingTime, currentScrollTop, distance, duration)

        if (duration <= scrollingTime) {
          scrollSelector.scrollTo({ top: scrollTop, left: 0 })
          return
        }

        scrollSelector.scrollTo({ top: newScrollTop, left: 0 })

        requestAnimationFrame(doPageScroll)
      })
      resolve(undefined)
    })
  }
}
