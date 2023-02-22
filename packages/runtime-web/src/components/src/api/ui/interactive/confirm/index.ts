import { html, property } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { Styles } from './index.style'
import { fixedBody, looseBody } from './utils'

class Confirm extends BaseElement {
  @property() title = ''
  @property() content = ''
  @property() confirmButtonText = '确定'
  @property() cancelButtonText = '取消'
  @property() align = 'center'

  connectedCallback() {
    super.connectedCallback()
    fixedBody(document)
  }

  disconnectedCallback() {
    looseBody(document)
    super.disconnectedCallback()
  }

  static get styles() {
    return Styles
  }

  onConfirm() {
    this.dispatch(true)
  }

  onCancel() {
    this.dispatch(false)
  }

  dispatch(value) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: { confirm: value },
        bubbles: true,
        composed: true
      })
    )
  }

  transformContent(content) {
    if (!content) return content

    return content.replace(/\n/g, '<br />')
  }

  onPreventTouch(e) {
    e.stopPropagation()
    e.preventDefault()

    return false
  }

  render() {
    return html`
      <div class="private-confirm-wrap">
        <div class="private-confirm-mask"></div>

        <div class="private-confirm-main">
          <div class="private-confirm-title">${this.title}</div>
          <div
            class="private-confirm-content"
            style="text-align:${this.align};"
          >
            <p>${unsafeHTML(this.transformContent(this.content))}</p>
            <slot name="input"></slot>
          </div>
          <div class="private-confirm-footer">
            <p @click=${this.onCancel}>${this.cancelButtonText}</p>
            <p @click=${this.onConfirm} class="private-confirm-ok">
              ${this.confirmButtonText}
            </p>
          </div>
        </div>
      </div>
    `
  }
}

defineElement('private-confirm', Confirm)
