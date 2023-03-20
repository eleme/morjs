// 节点相关查询接口
import { getRootView, updateRootView } from '../../global'
import { wait } from '../../utils'
import IntersectionObserver from './intersection-observer'
import { getPlainObjectFromRect } from './utils'

export default {
  createIntersectionObserver(options?) {
    return new IntersectionObserver(options)
  },
  createSelectorQuery() {
    return new SelectorQuery()
  },
  updateRootView
}
class SelectorQuery {
  private target: HTMLElement | NodeListOf<HTMLElement>

  private execPromises: Promise<any>[] = []

  select(selector: string) {
    this.target = getRootView().querySelector(selector) as HTMLElement
    return this
  }

  selectAll(selector: string) {
    this.target = getRootView().querySelectorAll(selector)
    return this
  }

  selectViewport() {
    // TODO: 每个页面的 Viewport 是不一样的
    try {
      this.target = document
        .querySelector('tiga-page-host')
        .shadowRoot.querySelector('.content') as HTMLElement
    } catch (e) {
      this.target = getRootView()
    }

    return this
  }

  boundingClientRect() {
    const target = this.target
    this.execPromises.push(
      wait().then(() => {
        if (!target) {
          return null
        }
        if (target instanceof HTMLElement) {
          const rect = target.getBoundingClientRect()
          return getPlainObjectFromRect(rect)
        } else {
          const rects = []
          target.forEach((el) => {
            rects.push(getPlainObjectFromRect(el.getBoundingClientRect()))
          })
          return rects
        }
      })
    )

    return this
  }

  scrollOffset() {
    const target = this.target
    this.execPromises.push(
      wait().then(() => {
        if (!target) {
          return null
        }
        if (target instanceof HTMLElement) {
          const rect = {
            scrollTop: target.scrollTop,
            scrollLeft: target.scrollLeft
          }
          return rect
        } else {
          const rects = []
          target.forEach((el) => {
            rects.push({
              scrollTop: el.scrollTop,
              scrollLeft: el.scrollLeft
            })
          })
          return rects
        }
      })
    )
    return this
  }

  exec(callback) {
    Promise.all(this.execPromises).then((res) => {
      callback(res)
    })
  }
}
