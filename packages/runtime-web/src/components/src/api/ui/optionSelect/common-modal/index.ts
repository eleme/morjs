import { html, internalProperty, property } from 'lit-element'
import { classMap } from 'lit-html/directives//class-map'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { ModalStyles } from './index.style'
import { fixedBody, isIos, looseBody } from './utils'

class Modal extends BaseElement {
  @internalProperty() openAnimation = false

  // 通过切换transform属性实现滚动效果
  @internalProperty() styles = { transform: 'translate3d(0, 0, 0)' }

  @property({ type: String }) title = ''
  @property({ type: Boolean }) show = false
  @property() confirmText = '确定'
  @property() cancelText = '取消'

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
      requestAnimationFrame(() => (this.openAnimation = true))
    } else {
      // picker关闭时解除滚动传动限制
      looseBody(document)
      requestAnimationFrame(() => (this.openAnimation = false))
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

  onConfirm() {
    this.dispatch('confirm')
    this.toggleModal()
  }

  onCancel() {
    this.dispatch('cancel')
    this.toggleModal()
  }

  render() {
    const classes = { 'modal-container--show': this.openAnimation }

    return html`
      <div class="modal-container ${classMap(classes)}">
        <div class="modal-mask"></div>

        <div
          class="modal-main ${isIos()
            ? 'modal-main--ios'
            : 'modal-main--android'}"
        >
          <div class="modal-main-header">
            ${isIos()
              ? html`<p class="modal-btn" @click="${this.onCancel}">
                  ${this.cancelText}
                </p>`
              : null}
            ${this.title
              ? html`<p class="modal-title">${this.title}</p>`
              : null}
            ${isIos()
              ? html`<p class="modal-btn" @click="${this.onConfirm}">
                  ${this.confirmText}
                </p>`
              : null}
          </div>
          <div class="modal-main-content">
            <slot name="content"></slot>
          </div>
          ${!isIos()
            ? html`
                <div class="modal-footer-group">
                  <p class="modal-btn-android" @click="${this.onCancel}">
                    ${this.cancelText}
                  </p>
                  <p class="modal-btn-android" @click="${this.onConfirm}">
                    ${this.confirmText}
                  </p>
                </div>
              `
            : null}
        </div>
      </div>
    `
  }
}

defineElement('private-modal', Modal)
