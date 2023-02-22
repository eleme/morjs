import throttle from 'lodash.throttle'

let _scrollInstance = null

// 定制 image scroll 逻辑
export default class ScrollHelper {
  private callbacks
  private listener

  constructor() {
    this.callbacks = new Map()
    this.listenScroll()
  }

  static getInstance() {
    if (!_scrollInstance) _scrollInstance = new ScrollHelper()

    return _scrollInstance
  }

  getRoot(): Element {
    try {
      const pages = document.querySelectorAll('tiga-page-host')
      const page = pages[pages.length - 1]

      return page.shadowRoot.querySelector('.content')
    } catch (e) {
      return null
    }
  }

  listenScroll() {
    const root = this.getRoot()

    this.listener = throttle(
      () => {
        const { callbacks } = this
        if (callbacks.size <= 0) return

        for (const [, value] of callbacks) {
          typeof value === 'function' && value()
        }
      },
      132,
      { trailing: true }
    )

    root.addEventListener('scroll', this.listener, { passive: true })
    root.addEventListener('touchmove', this.listener, { passive: true })
  }

  add(element, callback) {
    this.callbacks.set(element, callback)
  }

  remove(element) {
    this.callbacks.has(element) && this.callbacks.delete(element)
  }

  destroy() {
    const root = this.getRoot()

    this.callbacks = null
    this.listener &&
      (root as any).removeEventListener('scroll', this.listener, {
        passive: true
      })
  }
}
