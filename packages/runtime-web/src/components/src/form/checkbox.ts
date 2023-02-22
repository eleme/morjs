import { css, html, property } from 'lit-element'
import { classMap } from 'lit-html/directives/class-map'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../baseElement'
import boolConverter from '../utils/bool-converter'

export default class Checkbox extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .check-icon {
        margin-right: 8px;
        display: flex;
        flex-direction: column;
      }

      .icon {
        width: 20px;
        height: 20px;
        fill: #1890ff;
      }

      .checked-disabled {
        fill: #ddd;
      }

      .unchecked-disabled {
        fill: #ddd;
        background-color: #ddd;
        width: 20px;
        height: 20px;
        border-radius: 2px;
      }

      .label {
        position: relative;
      }
    `
  }

  /**
   * 组件值，选中时 change 事件会携带的 value。
   */
  @property({ type: String }) value = ''

  /**
   * 当前是否选中。
   * 默认值：false
   */
  @property({ converter: boolConverter }) checked = false

  /**
   * 线的粗细，单位 px
   * 默认值：6
   */
  @property({ converter: boolConverter }) disabled = false

  /**
   * radio 的颜色，同 CSS 色值。
   */
  @property({ type: String }) color = '#1890ff'

  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.checked) {
      window.dispatchEvent(
        new CustomEvent('init-tiga-checkbox-group-event', {
          detail: {
            value: this.value
          }
        })
      )
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  _emitEvent(e) {
    window.dispatchEvent(new CustomEvent('call-tiga-checkbox-group-event', e))
  }

  _handleClick() {
    if (!this.disabled) {
      this._emitEvent({
        detail: {
          value: this.value
        }
      })
    }
  }

  renderCheckbox() {
    if (this.checked) {
      return html` <svg
        t="1607411135079"
        class=${classMap({ icon: true, 'checked-disabled': this.disabled })}
        style=${styleMap({ fill: this.disabled ? '#ddd' : this.color })}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="27107"
        width="30"
        height="30"
      >
        <path
          d="M896 0H128C57.344 0 0 57.344 0 128v768c0 70.656 57.344 128 128 128h768c70.656 0 128-57.344 128-128V128c0-70.656-57.344-128-128-128z m64 896c0 35.38944-28.60544 64-64 64H128c-35.328 0-64-28.61056-64-64V128c0-35.328 28.672-64 64-64h768c35.38944 0 64 28.672 64 64v768z"
          p-id="27108"
        ></path>
        <path
          d="M402.2016 751.76448a44.032 44.032 0 0 1-33.43872-15.37536L139.62752 469.05344a44.03712 44.03712 0 0 1 66.87232-57.3184l200.23296 233.60512 415.2576-362.24512a44.04224 44.04224 0 0 1 57.90208 66.37056L431.1552 740.9152a44.0832 44.0832 0 0 1-28.9536 10.84928z"
          p-id="27109"
        ></path>
      </svg>`
    }
    return html` <svg
      t="1607411322249"
      class=${classMap({ icon: true, 'unchecked-disabled': this.disabled })}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="30242"
      width="30"
      height="30"
    >
      <path
        d="M896 0H128C57.344 0 0 57.344 0 128v768c0 70.656 57.344 128 128 128h768c70.656 0 128-57.344 128-128V128c0-70.656-57.344-128-128-128z m64 896c0 35.38944-28.60544 64-64 64H128c-35.328 0-64-28.61056-64-64V128c0-35.328 28.672-64 64-64h768c35.38944 0 64 28.672 64 64v768z"
        p-id="30243"
      ></path>
    </svg>`
  }

  render() {
    return html`
      <span class="check-icon" @click="${this._handleClick}">
        ${this.renderCheckbox()}
      </span>
    `
  }
}
