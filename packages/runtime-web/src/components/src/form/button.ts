import { css, html, property, unsafeCSS } from 'lit-element'
import { my } from '../../../api/my'
import { BaseElement } from '../baseElement'
import { rpxToRem } from '../rpx'
import boolConverter from '../utils/bool-converter'
import TigaForm from './form'

export default class Button extends BaseElement {
  protected enableHover = true

  static get styles() {
    return css`
      :host {
        display: block;
        box-sizing: border-box;
        padding: 0;
        text-align: center;
        font-size: ${unsafeCSS(rpxToRem(36))};
        height: ${unsafeCSS(rpxToRem(94))};
        line-height: ${unsafeCSS(rpxToRem(94))};
        border-radius: ${unsafeCSS(rpxToRem(4))};
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
        white-space: nowrap;
        color: #000;
        background-color: #fff;
        border: 1px solid #eee;
      }

      :host([disabled='true']) {
        color: rgba(0, 0, 0, 0.6);
        background-color: rgba(255, 255, 255, 0.6);
      }

      :host([isHover='true']) {
        color: rgba(0, 0, 0, 0.3);
        background-color: #ddd;
      }

      /* primary */
      :host([type='primary']) {
        color: #fff;
        background-color: #108ee9;
        border-color: #108ee9;
      }

      :host([type='primary'][disabled='true']) {
        color: rgba(255, 255, 255, 0.6);
        background-color: #9fd2f6;
        border: 0;
      }

      :host([type='primary'][isHover='true']) {
        color: rgba(255, 255, 255, 0.3);
        background-color: #0b71ba;
      }

      /* ghost */
      :host([type='ghost']) {
        color: #108ee9;
        background-color: transparent;
        border-color: #108ee9;
      }
      :host([type='ghost'][disabled='true']) {
        color: #ccc;
        background-color: #ddd;
        border: 0;
      }

      :host([type='ghost'][isHover='true']) {
        color: #fff;
        background-color: #0b71ba;
      }

      /* warn */
      :host([type='warn']) {
        color: #fff;
        background-color: #e94f4f;
        border-color: #e94f4f;
      }
      :host([type='warn'][disabled='true']) {
        color: rgba(255, 255, 255, 0.6);
        background-color: rgba(233, 79, 79, 0.4);
        border-width: 0;
      }

      :host([type='warn'][isHover='true']) {
        color: rgba(255, 255, 255, 0.3);
        background-color: #ea3c3c;
      }

      /* size 相关 */
      :host([size='mini']) {
        display: inline-block;
        font-size: ${unsafeCSS(rpxToRem(28))};
        min-width: ${unsafeCSS(rpxToRem(96))};
        height: ${unsafeCSS(rpxToRem(52))};
        line-height: ${unsafeCSS(rpxToRem(48))};
        padding: 0 ${unsafeCSS(rpxToRem(8))};
      }

      /* loading 相关 */
      .loading {
        display: inline-block;
        width: 0.5em;
        height: 0.5em;
        color: inherit;
        pointer-events: none;
        border: 0.1em solid currentcolor;
        border-bottom-color: transparent;
        border-radius: 50%;
        -webkit-animation: 1s loading linear infinite;
        animation: 1s loading linear infinite;
      }
      @-webkit-keyframes loading {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      @keyframes loading {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
    `
  }

  @property({ converter: boolConverter })
  loading = false;

  @property({ type: String })
  ['form-type']

  @property({ type: String })
  formtype

  getFormType() {
    return this['form-type'] || this.formtype
  }

  @property({ type: String })
  ['open-type']

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', this.onClicked, false)
  }

  onClicked = () => {
    if (this.getFormType()) {
      const form = this.getForm()
      if (form) {
        switch (this.getFormType()) {
          case 'submit': {
            form.submit()
            break
          }

          case 'reset': {
            form.reset()
            break
          }
        }
      }
    }

    if (this['open-type']) {
      switch (this['open-type']) {
        case 'getAuthorize': {
          // 调用 getAuthCode 。相当于检查登录态
          my.getAuthCode({
            success: () => {
              this.dispatchEvent(new CustomEvent('getauthorize'))
            },
            fail: () => {
              this.dispatchEvent(
                new CustomEvent('error', {
                  detail: {}
                })
              )
            }
          })
          break
        }
      }
    }
  }

  protected getForm(): TigaForm | null {
    const forms: any = document.querySelectorAll('tiga-form')
    for (const f of forms) {
      if (f.contains(this)) {
        return f as TigaForm
      }
    }
    return null
  }

  render() {
    return html`
      ${this.loading ? html`<div class="loading"></div>` : undefined}
      <slot></slot>
    `
  }
}
