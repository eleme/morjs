import { css, html, property } from 'lit-element'
import throttle from 'lodash.throttle'
import { BaseElement } from '../../baseElement'
import BooleanConverter from '../../utils/bool-converter'
import { findScrollParent, getElementVisibleRatio } from './helper'
const preventHandle = (e) => {
  e.stopPropagation()
  e.preventDefault()

  return false
}

export default class View extends BaseElement {
  @property({ converter: BooleanConverter })
  ['disable-scroll'] = false

  static get styles() {
    return css`
      :host {
        display: block;
      }

      :host([hidden='true']),
      :host([hidden='true']),
      :host([hidden='hidden']) {
        display: none !important;
      }
    `
  }

  private needBindAppear = false
  private listener = null

  addEventListener(type, callback, options?) {
    super.addEventListener(type, callback, options)
    switch (type) {
      case 'disappear':
      case 'firstappear':
      case 'appear': {
        this.needBindAppear = true
        break
      }
    }
  }

  firstUpdated() {
    setTimeout(() => {
      // firstUpdated 触发时，addEventListener 方法不一定会收到组件注册的 appear，disappear 事件，根据lit官方提示，做延迟处理
      if (this.needBindAppear) {
        this.watchTouchMove()
      }
    }, 0)
  }

  private scrollParent: Element = null
  getScrollParent() {
    if (this.scrollParent) return this.scrollParent

    return (this.scrollParent = findScrollParent(this))
  }

  private lastTrigger = -1 // 上次触发的是appear（1） 还是disappear（0）
  private hasAppeared = false //是否已经显示过

  watchTouchMove() {
    const parent: Element = this.getScrollParent()
    const callback = (ratio) => {
      if (ratio >= 0.5 && this.lastTrigger !== 1) {
        this.lastTrigger = 1
        if (!this.hasAppeared) {
          this.dispatchEvent(new CustomEvent('firstappear'))
          this.hasAppeared = true
        }
        this.dispatchEvent(new CustomEvent('appear'))
      }
      if (ratio < 0.5 && this.lastTrigger === 1) {
        this.lastTrigger = 0
        this.dispatchEvent(new CustomEvent('disappear'))
      }
    }

    requestAnimationFrame(() => {
      // 为了确保元素渲染出来调用
      const ratio = getElementVisibleRatio(this)
      callback(ratio)
    })

    this.listener = throttle(
      () => {
        const ratio = getElementVisibleRatio(this)
        callback(ratio)
      },
      66,
      { leading: true, trailing: true }
    )

    parent.addEventListener('scroll', this.listener)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.needBindAppear && this.listener && this.scrollParent) {
      // 回收操作
      this.scrollParent.removeEventListener('scroll', this.listener)
    }

    if (this['disable-scroll']) this.releaseScroll()
  }

  preventScroll() {
    // 组织元素上的滚动事件
    this.addEventListener('touchmove', preventHandle)
    this.addEventListener('scroll', preventHandle)
  }

  releaseScroll() {
    this.removeEventListener('touchmove', preventHandle)
    this.removeEventListener('scroll', preventHandle)
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)

    if (name === 'disable-scroll') {
      if (this['disable-scroll']) this.preventScroll()
      else if (!this['disable-scroll'] && oldVal) this.releaseScroll()
    }
  }

  render() {
    const style = css`
      text-decoration: inherit;
    `
    return html`<slot style="${style}"></slot>`
  }
}
