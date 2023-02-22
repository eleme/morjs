import { css, html, property, unsafeCSS } from 'lit-element'
import { BaseElement } from '../../../../baseElement'
import '../../../../loadable/swiper'
import '../../../../loadable/swiper-item'
import { rpxToRem } from '../../../../rpx'
import { defineElement } from '../../../../utils'
import boolConverter from '../../../../utils/bool-converter'

class PreviewImage extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        z-index: 999999999999;
        justify-content: center;
        align-items: center;
      }

      .host {
        width: 100%;
        height: 100vh;
        background-color: white;
        border-radius: ${unsafeCSS(rpxToRem(7))};
        padding-top: ${unsafeCSS(rpxToRem(15))};
      }

      .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 1;
      }

      .container {
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
      }

      .back-btn {
        position: absolute;
        top: 40px;
        left: 10px;
        z-index: 9999;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
      }

      .page-num {
        text-align: left;
        width: 100px;
        color: #fff;
        margin-left: 5px;
        font-size: 15px;
        letter-spacing: 2px;
      }

      .s-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-height: 100vh;
        overflow: auto;
      }

      #tiga-image-swiper .tiga-swiper-0 {
        height: 100vh;
      }

      #tiga-image-swiper .swiper-container {
        height: 100vh;
      }

      #tiga-image-swiper .tiga-swiper-0 .swiper-container {
        height: 100%;
      }

      #tiga-image-swiper .s-img {
        width: 100%;
      }
    `
  }

  @property({ type: String }) urls = '[]'
  @property({ type: Number }) current = 0
  @property({ type: boolConverter }) show = false
  @property({ type: boolConverter }) indicatorDots = false
  @property({ type: Number }) index = 1

  connectedCallback() {
    super.connectedCallback()
    setTimeout(() => {
      this.init()
    }, 10)
  }

  init = () => {
    this.current =
      this.current < this.parseUrls().length
        ? this.current
        : this.parseUrls().length - 1
    this.current = this.current > 0 ? this.current : 0
    this.index = this.current + 1
    this.show = true
    this.initEvent()
  }

  initEvent = () => {
    const nodes = this.shadowRoot.querySelectorAll('tiga-swiper')
    if (nodes && nodes.length > 0) {
      const node = nodes[0]
      node.addEventListener('change', (e: any) => {
        const index = e.detail && e.detail.current
        this.index = index + 1
      })
    }
  }

  _handleClick() {
    this.dispatchEvent(new Event('close'))
  }

  parseUrls = () => {
    try {
      const urls = JSON.parse(this.urls)
      return urls
    } catch (error) {
      console.error('urls 参数不正确')
      return []
    }
  }

  renderSwiperItem() {
    const urls = this.parseUrls()
    return html`
      ${urls.map(
        (img) => html`
          <tiga-swiper-item class="s-item">
            <img class="s-img" src="${img}" />
          </tiga-swiper-item>
        `
      )}
    `
  }

  renderPagination() {
    return html`
      <div class="page-num">${this.index}/${this.parseUrls().length}</div>
    `
  }

  renderExitIcon() {
    return html`
      <div class="back-btn" @click=${this._handleClick}>
        <svg
          t="1611890815185"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1731"
          width="14"
          height="14"
        >
          <path
            fill="#ffffff"
            d="M724.48 960L275.84 555.52C263.04 544 256 528 256 512s7.04-32 19.84-43.52L724.48 64l43.52 48.64L325.12 512 768 911.36l-43.52 48.64z"
            p-id="1732"
          ></path>
        </svg>
        ${this.renderPagination()}
      </div>
    `
  }

  render() {
    return html`
      <div class="host">
        ${this.show
          ? html`<div class="mask" @click=${this._handleClick} />`
          : undefined}
        ${this.renderExitIcon()}
        <div class="container">
          <tiga-swiper
            id="tiga-image-swiper"
            current="${this.current}"
            indicator-dots="${this.indicatorDots}"
          >
            ${this.renderSwiperItem()}
          </tiga-swiper>
        </div>
      </div>
    `
  }
}

defineElement('private-preview-image', PreviewImage)
