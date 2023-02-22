import { css, html, LitElement } from 'lit-element'
import boolConverter from '../../utils/bool-converter'
import { attributes, properties } from './property'
import smoothBehaviorPolyfill from './smooth-behavior-polyfill'
import { fixedBody, isSupportIntersectionObserver, looseBody } from './utils'

export default class ScrollView extends LitElement {
  private _isFixed = false
  private observer = null
  static get styles() {
    return css`
      :host {
        display: block;
        overflow: hidden;
        -webkit-overflow-scrolling: touch;
      }

      /* 垂直方向滚动 */
      :host([scroll-y='true']) {
        overflow-y: scroll;
      }

      /* 水平方向滚动 */
      :host([scroll-x]) {
        overflow-x: scroll;
      }
    `
  }

  static get properties() {
    return {
      [properties.DISABLE_SCROLL]: {
        converter: boolConverter,
        attribute: attributes.DISABLE_SCROLL
      },
      [properties.SCROLL_TOP]: {
        type: Number,
        attribute: attributes.SCROLL_TOP
      },
      [properties.SCROLL_LEFT]: {
        type: Number,
        attribute: attributes.SCROLL_LEFT
      },
      [properties.SCROLL_INTO_VIEW]: {
        type: Number,
        attribute: attributes.SCROLL_INTO_VIEW
      },
      [properties.UPPER_THRESHOLD]: {
        type: Number,
        attribute: attributes.UPPER_THRESHOLD
      },
      [properties.LOWER_THRESHOLD]: {
        type: Number,
        attribute: attributes.LOWER_THRESHOLD
      },
      [properties.SCROLL_X]: {
        converter: boolConverter,
        attribute: attributes.SCROLL_X
      },
      [properties.SCROLL_Y]: {
        converter: boolConverter,
        attribute: attributes.SCROLL_Y
      },
      [properties.TRAP_SCROLL]: {
        converter: boolConverter,
        attribute: attributes.TRAP_SCROLL
      },
      [properties.SCROLL_WITH_ANIMATION]: {
        converter: boolConverter,
        attribute: attributes.SCROLL_WITH_ANIMATION
      }
    }
  }

  constructor() {
    super()

    this.initProperties()
  }

  initProperties() {
    this[properties.SCROLL_TOP] = 0
    this[properties.SCROLL_LEFT] = 0
    this[properties.SCROLL_INTO_VIEW] = 0
    this[properties.UPPER_THRESHOLD] = 50
    this[properties.LOWER_THRESHOLD] = 50
    this[properties.SCROLL_X] = false
    this[properties.SCROLL_Y] = false
    this[properties.DISABLE_SCROLL] = false
    this[properties.TRAP_SCROLL] = false
    this[properties.SCROLL_WITH_ANIMATION] = false
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    switch (name) {
      case attributes.SCROLL_INTO_VIEW: {
        setTimeout(() => {
          this._scrollIntoView(newVal)
        }, 0) // 等待渲染完成再做定位
        break
      }

      case attributes.SCROLL_TOP: {
        if (newVal != this.scrollTop) {
          this.scrollTo({
            top: newVal,
            behavior: this[properties.SCROLL_WITH_ANIMATION] ? 'smooth' : 'auto'
          })
        }
        break
      }

      case attributes.SCROLL_LEFT: {
        if (newVal != this.scrollLeft) {
          this.scrollTo({
            left: newVal,
            behavior: this[properties.SCROLL_WITH_ANIMATION] ? 'smooth' : 'auto'
          })
        }
        break
      }

      case attributes.DISABLE_SCROLL: {
        if (newVal === 'true') {
          this.addEventListener('touchmove', this.preventScroll)
        } else {
          this.removeEventListener('touchmove', this.preventScroll)
        }

        break
      }

      case attributes.TRAP_SCROLL: {
        if (newVal) {
          this.watchScrollView()
        } else {
          this.unWatchScrollView()
        }
        break
      }

      case attributes.SCROLL_WITH_ANIMATION: {
        if (newVal) smoothBehaviorPolyfill()
      }
    }
  }

  watchScrollView() {
    try {
      if (!isSupportIntersectionObserver()) return
      this.observer = new IntersectionObserver(
        (e) => {
          if (e && e[0]) {
            const { isIntersecting } = e[0]
            if (!isIntersecting && this._isFixed) {
              looseBody(document)
              this._isFixed = false
            }
          }
        },
        { threshold: 1 }
      )

      this.observer.observe(this)
    } catch (e) {}
  }

  unWatchScrollView() {
    try {
      if (!isSupportIntersectionObserver() || !this.observer) return
      this.observer.unobserve(this)
    } catch (e) {}
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('scroll', this.onScroll)
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    if (this._isFixed) {
      this._isFixed = false
      looseBody(document)
    }

    this.unWatchScrollView()
  }

  private preventScroll = (e) => {
    e.preventDefault()
  }

  private canHandleReachBottomY = false
  private canHandleReachTopY = false
  private canHandleReachBottomX = false
  private canHandleReachTopX = false
  private onScroll = (e) => {
    let isTop = false
    let isLower = false

    if (this[properties.SCROLL_Y]) {
      const scrollTop = this.scrollTop
      const clientHeight = this.clientHeight
      const scrollHeight = this.scrollHeight
      if (
        scrollHeight > clientHeight &&
        scrollHeight - scrollTop - clientHeight <=
          this[properties.LOWER_THRESHOLD]
      ) {
        if (this.canHandleReachBottomY) {
          this.canHandleReachBottomY = false
          isLower = true
        }
      } else {
        this.canHandleReachBottomY = true
      }

      if (
        scrollHeight > clientHeight &&
        scrollTop <= this[properties.UPPER_THRESHOLD]
      ) {
        if (this.canHandleReachTopY) {
          this.canHandleReachTopY = false
          isTop = true
        }
      } else {
        this.canHandleReachTopY = true
      }
    }

    if (this[properties.SCROLL_X]) {
      const scrollLeft = this.scrollLeft
      const clientWidth = this.clientWidth
      const scrollWidth = this.scrollWidth
      if (
        scrollWidth > clientWidth &&
        scrollWidth - scrollLeft - clientWidth <=
          this[properties.LOWER_THRESHOLD]
      ) {
        if (this.canHandleReachBottomX) {
          this.canHandleReachBottomX = false
          isLower = true
        }
      } else {
        this.canHandleReachBottomX = true
      }

      if (
        scrollWidth > clientWidth &&
        scrollLeft <= this[properties.UPPER_THRESHOLD]
      ) {
        if (this.canHandleReachTopX) {
          this.canHandleReachTopX = false
          isTop = true
        }
      } else {
        this.canHandleReachTopX = true
      }
    }

    if (isLower) {
      this.dispatchEvent(
        new CustomEvent('scrolltolower', {
          bubbles: false
        })
      )
    }

    if (isTop) {
      this.dispatchEvent(
        new CustomEvent('scrolltoupper', {
          bubbles: false
        })
      )
    }

    if (this[properties.TRAP_SCROLL]) {
      if (
        isLower ||
        isTop ||
        this.scrollTop <= 0 ||
        this.scrollHeight <= this.scrollTop + this.clientHeight
      ) {
        !this._isFixed && fixedBody(document)
        this._isFixed = true
      } else {
        this._isFixed && looseBody(document)
        this._isFixed = false
      }
    }
  }

  private _scrollIntoView(viewId) {
    if (viewId) {
      try {
        const el = this.querySelector(`#${viewId}`)

        try {
          const containerRect = this.getBoundingClientRect()
          const elementRect = el.getBoundingClientRect()
          if (this[properties.SCROLL_X])
            this.scrollTo({
              left: Math.max(
                elementRect.left + this.scrollLeft - containerRect.left,
                0
              ),
              top: 0,
              behavior: this[properties.SCROLL_WITH_ANIMATION]
                ? 'smooth'
                : 'auto'
            })
          if (this[properties.SCROLL_Y])
            this.scrollTo({
              left: 0,
              top: Math.max(
                elementRect.top + this.scrollTop - containerRect.top
              ),
              behavior: this[properties.SCROLL_WITH_ANIMATION]
                ? 'smooth'
                : 'auto'
            })
        } catch (e) {
          // 用 scrollIntoView 兜底
          el && el.scrollIntoView(true)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  render() {
    return html`<slot></slot>`
  }
}
