import { css, html, property } from 'lit-element'
import throttle from 'lodash.throttle'
import { BaseElement } from '../../baseElement'
import { requestAnimationFrame } from '../../utils'
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
      :host([hidden='hidden']) {
        display: none !important;
      }
    `
  }

  private needBindAppear = false
  // 标记是否已经触发 firstUpdated 生命周期
  private isFirstUpdatedInvoked = false
  // 标记是否已经监听了滚动事件
  private isWatchTouchMove = false
  private listener = null

  addEventListener(type, callback, options?) {
    super.addEventListener(type, callback, options)
    switch (type) {
      case 'disappear':
      case 'firstappear':
      case 'appear': {
        this.needBindAppear = true
        /*
         * 正常情况下是 addEventListener 先执行，然后在 firstUpdated 中绑定事件用于支持 appear，disappear 等功能。
         * 某些业务场景会先加载骨架屏占位，且占位元素和实际元素使用了相同的 id，React 在这种场景下会复用元素，会先触发 firstUpdated，
         * 在实际元素渲染的时候再触发 addEventListener。这种特殊的场景就导致 appear，disappear 功能异常，所以需要做如下兼容
         * 需要通过 isFirstUpdatedInvoked 判断元素是否已经挂载，否则调用 watchTouchMove 会报错
         */
        if (this.isFirstUpdatedInvoked) this.watchTouchMove()
        break
      }
    }
  }

  firstUpdated() {
    requestAnimationFrame(() => {
      this.isFirstUpdatedInvoked = true
      // firstUpdated 触发时，addEventListener 方法不一定会收到组件注册的 appear，disappear 事件，根据lit官方提示，做延迟处理
      if (this.needBindAppear) {
        this.watchTouchMove()
      }
    })
  }

  private scrollParent: Element = null
  getScrollParent() {
    if (this.scrollParent) return this.scrollParent

    return (this.scrollParent = findScrollParent(this))
  }

  private lastTrigger = -1 // 上次触发的是appear（1） 还是disappear（0）
  private hasAppeared = false //是否已经显示过

  watchTouchMove() {
    // 防止重复监听，导致多次触发事件
    if (this.isWatchTouchMove) return
    this.isWatchTouchMove = true

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
    this.shadowRoot.addEventListener('touchmove', preventHandle, false)
    this.shadowRoot.addEventListener('scroll', preventHandle, false)
  }

  releaseScroll() {
    this.shadowRoot.removeEventListener('touchmove', preventHandle, false)
    this.shadowRoot.removeEventListener('scroll', preventHandle, false)
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
