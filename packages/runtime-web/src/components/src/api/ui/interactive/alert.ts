import { css, html, unsafeCSS } from 'lit-element'
import { BaseElement } from '../../../baseElement'
import { rpxToRem } from '../../../rpx'
import { defineElement } from '../../../utils'

class AlertModal extends BaseElement {
  [propName: string]: any

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
        background-color: rgba(0, 0, 0, 0.3);
        justify-content: center;
        align-items: center;
      }

      .host {
        width: ${unsafeCSS(rpxToRem(540))};
        background-color: white;
        border-radius: ${unsafeCSS(rpxToRem(7))};
        padding-top: ${unsafeCSS(rpxToRem(15))};
      }

      .title {
        text-align: center;
        padding: 6px 15px 15px;
        font-size: ${unsafeCSS(rpxToRem(36))};
      }

      .content {
        text-align: center;
        padding: 0 15px 15px;
        color: #888;
        word-wrap: break-word;
        font-size: ${unsafeCSS(rpxToRem(30))};
      }

      .button {
        text-align: center;
        height: ${unsafeCSS(rpxToRem(100))};
        font-size: ${unsafeCSS(rpxToRem(36))};
        line-height: ${unsafeCSS(rpxToRem(100))};
        color: rgb(16, 142, 233);
        border-top: 0.5px solid #ddd;
      }
    `
  }

  static get properties() {
    return {
      title: { type: String },
      content: { type: String },
      buttonText: { type: String }
    }
  }

  _handleClick() {
    this.dispatchEvent(new Event('close'))
  }

  render() {
    return html`
      <div class="host">
        <div class="title">${this.title}</div>
        <div class="content">${this.content}</div>
        <div class="button" @touchstart=${this._handleClick}>
          ${this.buttonText || '确定'}
        </div>
      </div>
    `
  }
}

defineElement('private-alert', AlertModal)
