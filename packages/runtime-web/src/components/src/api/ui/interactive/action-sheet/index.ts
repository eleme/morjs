import { html, property } from 'lit-element'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { Styles } from './index.style'
import {
  fixedBody,
  formateNum,
  getValueByIndex,
  isIos,
  looseBody,
  take
} from './utils'

class ActionSheet extends BaseElement {
  badgesIndexCache = []

  @property() title = ''
  @property({ type: Array }) items = []
  @property({ type: Array }) badges = []
  @property() cancelButtonText = '取消'
  @property() align = 'center'
  @property({ type: Number }) destructiveBtnIndex = -1

  connectedCallback() {
    super.connectedCallback()
    fixedBody(document)
    this.badgesIndexCache = take(this.badges, 'index')
  }

  disconnectedCallback() {
    looseBody(document)
    super.disconnectedCallback()
  }

  static get styles() {
    return Styles
  }

  onConfirm(index) {
    this.dispatch(index)
  }

  onCancel() {
    this.dispatch(-1)
  }

  dispatch(index) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: { index },
        bubbles: true,
        composed: true
      })
    )
  }

  handleMaskClick(event) {
    event.stopPropagation()

    this.onCancel()
  }

  renderBadges(index) {
    const hasBadges = this.badgesIndexCache.indexOf(index) > -1
    if (!hasBadges) return null

    const badge = getValueByIndex(this.badges, index)
    let { type, text } = badge
    let numResult = text

    if (type === 'num') {
      numResult = formateNum(numResult)
      // 如果 >= 100, 将类型转换成 more
      if (numResult === -1) type = 'more'
    }

    const MAP = {
      none: null,
      num: numResult
        ? html`<span class="private-sheet-badge-num">${numResult}</span>`
        : null,
      point: html`<span class="private-sheet-badge-point"></span>`,
      more: html`<span class="private-sheet-badge-more">…</span>`,
      text: html`<span class="private-sheet-badge-text">${text}</span>`
    }

    return MAP[type]
  }

  getDestructiveBtnStyle(index) {
    if (!isIos() || this.destructiveBtnIndex !== index) return null
    return 'color:#f4333c'
  }

  render() {
    return html`
      <div class="private-sheet-wrap">
        <div
          class="private-sheet-mask"
          @touchstart=${this.handleMaskClick}
        ></div>
        <div
          class="private-sheet-main ${isIos()
            ? 'private-sheet-main--ios'
            : 'private-sheet-main--android'}"
        >
          <div class="private-sheet-title">${this.title}</div>
          <div class="private-sheet-list">
            ${this.items.map((item, index) => {
              return html`
                <div
                  class="private-sheet-item"
                  @click=${() => this.onConfirm(index)}
                >
                  ${this.getDestructiveBtnStyle(index)
                    ? html`<p style=${this.getDestructiveBtnStyle(index)}>
                        ${item}
                      </p>`
                    : html`<p>${item}</p>`}
                  ${this.renderBadges(index)}
                </div>
              `
            })}
          </div>
          ${isIos()
            ? html`<div
                class="private-sheet-item private-sheet-cancel"
                @click=${this.onCancel}
              >
                ${this.cancelButtonText}
              </div>`
            : null}
        </div>
      </div>
    `
  }
}

defineElement('private-action-sheet', ActionSheet)
