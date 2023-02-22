import { css, html, property } from 'lit-element'
import { classMap } from 'lit-html/directives/class-map'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../baseElement'
import boolConverter from '../utils/bool-converter'
import { IFormComponent } from './IFormComponent'

export default class Switch extends BaseElement implements IFormComponent {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 16px;
        position: relative;
      }

      .tiga-switch {
        position: relative;
        z-index: 0;
        display: inline-block;
        vertical-align: middle;
        box-sizing: border-box;
        cursor: pointer;
        align-self: center;
      }

      .checkbox {
        width: 51px;
        height: 31px;
        border-radius: 31px;
        box-sizing: border-box;
        background: #e5e5e5;
        z-index: 0;
        margin: 0;
        padding: 0;
        border: 0;
        cursor: pointer;
        position: relative;
        transition: all 300ms;
      }

      .checkbox:before {
        content: ' ';
        position: absolute;
        left: 1px;
        top: 1px;
        width: 48px;
        height: 28px;
        border-radius: 28px;
        box-sizing: border-box;
        z-index: 1;
        transform: scale(1);
        background: #ffffff;
        transition: all 200ms;
      }

      .checkbox:after {
        content: ' ';
        height: 28px;
        width: 28px;
        border-radius: 28px;
        background: #ffffff;
        position: absolute;
        z-index: 2;
        left: 1px;
        top: 1px;
        transform: translateX(0);
        transition: all 200ms;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.21);
      }

      .checkbox.checked:after {
        transform: translateX(20px);
      }

      .checkbox.checked:before {
        transform: scale(0);
      }
    `
  }

  /**
   * 组件名字，用于表单提交获取数据。
   */
  @property({ type: String }) name = ''

  /**
   * 当前是否选中。
   * 默认值：false
   */
  @property({ converter: boolConverter }) checked = false

  /**
   * 是否禁用。
   * 默认值：6
   */
  @property({ converter: boolConverter }) disabled = false

  /**
   * 组件颜色，同 CSS 色值。
   */
  @property({ type: String }) color = '#108ee9'

  /**
   * onChange checked 改变时触发，event.detail={ value:checked}。
   */

  /**
   * controlled 是否为受控组件，为 true 时，checked 会完全受 setData 控制。
   */

  get value() {
    return this.checked
  }

  reset() {
    this.checked = false
  }

  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback()
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  _handleClick() {
    if (!this.disabled) {
      this.checked = !this.checked
    }
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: this.checked
        }
      })
    )
  }

  render() {
    const styleInfo: {
      [prop: string]: any
    } = {
      backgroundColor: this.checked ? this.color : '#e5e5e5',
      opacity: this.disabled ? 0.3 : 1
    }
    return html`
      <div class="tiga-switch" @click="${this._handleClick}">
        <div
          class=${classMap({ checkbox: true, checked: this.checked })}
          style=${styleMap(styleInfo)}
        />
      </div>
    `
  }
}
