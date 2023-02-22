// 节点相关查询接口
import { getRootView, updateRootView } from '../../global'
import { wait } from '../../utils'
import IntersectionObserver from './intersection-observer'

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
          return rect
        } else {
          const reacts = []
          target.forEach((el) => {
            reacts.push(el.getBoundingClientRect())
          })
          return reacts
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
          const reacts = []
          target.forEach((el) => {
            reacts.push({
              scrollTop: el.scrollTop,
              scrollLeft: el.scrollLeft
            })
          })
          return reacts
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
