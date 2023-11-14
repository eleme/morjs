import { getPage } from './pulldown-api'

function getTotalOffsetTop(element, root) {
  let totalOffsetTop = element.offsetTop
  let parent = element.offsetParent

  while (parent !== null && parent !== root) {
    totalOffsetTop += parent.offsetTop
    parent = parent.offsetParent
  }

  return totalOffsetTop
}

export default {
  pageScrollTo({ scrollTop, duration = 0, selector }) {
    return new Promise((resolve, reject) => {
      if (scrollTop < 0) {
        return reject('scrollTop 必须大于0')
      }

      if (typeof scrollTop === 'undefined' && typeof selector === 'undefined') {
        return reject(
          '缺少 scrollTop 或者 selector 参数，scrollTop 与 selector 必须传入一个'
        )
      }

      duration = Number.isNaN(Number(duration))
        ? 0
        : Math.max(0, Number(duration))

      const page = getPage()
      const scrollSelector = page.shadowRoot.querySelector('.content')

      const currentScrollTop = scrollSelector.scrollTop // 滚动开始时的位置
      let distance
      if (selector) {
        const element = document.querySelector(selector)
        if (!element)
          return reject(`未找到选择器为 ${selector} 的元素，请确认元素是否存在`)
        distance = getTotalOffsetTop(element, scrollSelector) - currentScrollTop
      } else {
        distance = scrollTop - currentScrollTop // 一共需要滚动的距离
      }

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
