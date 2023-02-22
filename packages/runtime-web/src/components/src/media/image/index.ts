import { css, html, internalProperty, property, unsafeCSS } from 'lit-element'
import { my } from '../../../../api/my'
import queryApi from '../../../../api/ui/element-query'
import { BaseElement } from '../../baseElement'
import { rpxToRem } from '../../rpx'
import boolConverter from '../../utils/bool-converter'
import { isCancel, makeCancelPromise } from '../../utils/cancel-promise'
import { isElementVisible } from './helper'
import ScrollHelper from './scroll'
let scrollInstance = null

const STATE = {
  NO_LOAD: 0,
  SUCCESS: 1,
  ERROR: 2
}

// 优先使用 my 中的兜底使用引用的方法
const createIntersectionObserver =
  my?.createIntersectionObserver || queryApi.createIntersectionObserver

const intersectionObserver = createIntersectionObserver().relativeToViewport()
export default class ImageView extends BaseElement {
  static get styles() {
    return css`
      :host {
        background-repeat: no-repeat;
        display: inline-block;
        overflow: hidden;
        font-size: 0;
        padding: 0;
        margin: 0;
        width: ${unsafeCSS(rpxToRem(300 * 2))};
        height: ${unsafeCSS(rpxToRem(225 * 2))};
        line-height: 0;
      }
      img[src=''],
      img:not([src]) {
        opacity: 0;
      }
    `
  }

  @property({ type: String })
  src

  @property({ type: String })
  mode = 'scaleToFill'

  @internalProperty()
  cssText = ''
  @internalProperty()
  state = STATE.NO_LOAD;

  /**
   * 支持图片懒加载，不支持通过 css 来控制 image 展示隐藏的场景。
   */
  @property({
    converter: boolConverter
  })
  ['lazy-load'] = false;

  @property({ type: String })
  ['default-source'] = '';

  @property({ type: String }) ['drag-able'] = 'auto'

  private _isLazyLoad = false
  get isLazyLoad() {
    // NOTE: 确保 lazy load 只要设置过一次true，那么后续都不会再次改变。这个主要考虑到可能引起的 内存泄漏
    if (!this._isLazyLoad) {
      this._isLazyLoad = this['lazy-load']
    }
    return this._isLazyLoad
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    if (!this.isConnected) return
    switch (name) {
      case 'src': {
        if (!this.isLazyLoad || this.loadImagePromise) {
          //  如果this.loadImagePromise 存在，那么说明已经加载过了，直接重新加载即可
          this.loadImage(newVal)
        } else if (this.isLazyLoad && !oldVal && newVal) {
          this.lazyLoadImage()
        }
        break
      }

      case 'mode': {
        this.onModeChange(newVal)
        break
      }
    }
  }

  private onModeChange(mode) {
    const fillWidthHeight = 'width: 100%; height: 100%;'
    switch (mode) {
      case 'scaleToFill': {
        this.cssText = fillWidthHeight
        break
      }

      case 'aspectFit': {
        this.cssText = fillWidthHeight
        this.cssText += 'object-fit:contain;object-position:center center;'
        break
      }

      case 'aspectFill': {
        this.cssText = fillWidthHeight
        this.cssText += 'object-fit:cover;object-position:center center;'
        break
      }

      case 'widthFix': {
        this.cssText = 'width:100%;height:auto;'
        this.style.setProperty('height', 'auto')
        break
      }

      case 'heightFix': {
        this.cssText = 'width:auto;height:100%;'
        this.style.setProperty('width', 'auto')
        break
      }

      default: {
        this.cssText = fillWidthHeight
        this.cssText += `object-fit:none;object-position:${mode};`
        break
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.onModeChange(this.mode)
    if (this.isLazyLoad) {
      this.lazyLoadImage()
    } else {
      this.loadImage(this.src)
    }
  }

  lazyLoadImage() {
    const callback = () => {
      // 当图片进入屏幕后加载图片
      if (!this.loadImagePromise) {
        this.loadImage(this.src)
      }
    }

    // 很容易监听不到scroll事件导致失败
    requestAnimationFrame(() => {
      if (isElementVisible(this)) callback()
      else {
        if (!scrollInstance) scrollInstance = ScrollHelper.getInstance()
        scrollInstance.add(this, () => {
          if (isElementVisible(this)) {
            callback()
            scrollInstance.remove(this)
            intersectionObserver.unobserve(this)
          }
        })
      }
    })

    // intersectionObserver 处理不了元素fixed的场景
    intersectionObserver.observe(this, () => {
      callback()
      intersectionObserver.unobserve(this)
      scrollInstance && scrollInstance.remove(this)
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    // 解除监听
    if (this.isLazyLoad) {
      scrollInstance && scrollInstance.remove(this)
      intersectionObserver.unobserve(this)
    }
  }

  private loadImagePromise: CancelPromise

  private loadImage(src: string) {
    if (src === undefined) return
    if (this.loadImagePromise) this.loadImagePromise.cancel()

    this.loadImagePromise = makeCancelPromise<any>(
      new Promise((resolve, reject) => {
        if (src) {
          const image = new Image()
          image.src = src
          image.onload = () => {
            resolve(image)
          }
          image.onerror = (err) => {
            reject(err)
          }
        } else {
          reject('无效地址')
        }
      })
    )

    this.loadImagePromise
      .then((image) => {
        this.imageLoadSuccess(image)
        this.state = STATE.SUCCESS
      })
      .catch((err) => {
        if (isCancel(err)) return
        this.imageLoadFail()
        this.state = STATE.ERROR
      })
  }

  private imageLoadSuccess(image) {
    this.dispatchEvent(
      new CustomEvent('load', {
        detail: {
          width: image.width,
          height: image.height
        },
        bubbles: false
      })
    )
  }

  private imageLoadFail() {
    this.dispatchEvent(
      new CustomEvent('error', {
        detail: {
          errMsg: '图片加载失败'
        },
        bubbles: false
      })
    )
  }

  render() {
    return this.state === STATE.NO_LOAD
      ? this['default-source']
        ? html`<img
            src="${this['default-source']}"
            style="${this.cssText}"
            draggable=${this['drag-able'] as any}
          />`
        : ''
      : html`<img
          src="${this.src}"
          style="${this.cssText}"
          draggable=${this['drag-able'] as any}
        />`
  }
}
