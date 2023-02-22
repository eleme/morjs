import { html, property } from 'lit-element'
import { classMap } from 'lit-html/directives/class-map'
import { unsafeHTML } from 'lit-html/directives/unsafe-html'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { CLOSE_ICON } from './constants'
import { ModalStyles } from './index.style'
import { fixedBody, looseBody } from './utils'

class Modal extends BaseElement {
  @property({ type: String }) title = ''
  @property({ type: Boolean }) show = false

  connectedCallback() {
    super.connectedCallback()

    // 默认打开逻辑
    if (this.show) {
      this.toggleModal(true)
    }
  }

  static get styles() {
    return ModalStyles
  }

  toggleModal(isShow = false) {
    if (isShow) {
      // 解决滚动穿透
      fixedBody(document)
    } else {
      // picker关闭时解除滚动传动限制
      looseBody(document)
    }

    this.show = isShow
  }

  dispatch(eventName, data = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: data,
        bubbles: true,
        composed: true
      })
    )
  }

  onClose() {
    this.dispatch('close')
    this.toggleModal()
  }

  render() {
    const classes = { 'modal-container--show': this.show }

    return html`
      <div class="modal-container ${classMap(classes)}">
        <div class="modal-mask"></div>

        <div class="modal-main">
          <div class="modal-main-header">
            ${this.title
              ? html`<p class="modal-title">${this.title}</p>`
              : null}
            <p class="modal-main-close" @click=${this.onClose}>
              ${unsafeHTML(CLOSE_ICON)}
            </p>
          </div>
          <div class="modal-main-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `
  }
}

defineElement('private-multi-select-modal', Modal)
