import { css, html, property, query, unsafeCSS } from 'lit-element'
import { BaseElement } from '../baseElement'
import { rpxToRem } from '../rpx'
import { isIos } from '../utils'
import boolConverter from '../utils/bool-converter'
import { IFormComponent } from './IFormComponent'

export default class Input extends BaseElement implements IFormComponent {
  blurOnClick = false
  syncTimeId = null
  composition = false

  static get styles() {
    return css`
      :host {
        display: inline-block;
        background-color: #fff;
        padding: ${unsafeCSS(rpxToRem(4))} ${unsafeCSS(rpxToRem(10))};
        color: #000;
        font-size: ${unsafeCSS(rpxToRem(34))};
        height: ${unsafeCSS(rpxToRem(50))};
        box-sizing: content-box;
      }

      input {
        border: 0;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        background: 0 0;
        display: inherit;
        padding: 0;
        margin: 0;
        outline: 0;
        vertical-align: middle;
        text-overflow: inherit;
        -webkit-tap-highlight-color: transparent;
        position: relative;
        color: inherit;
        overflow: inherit;
        white-space: inherit;
        text-align: inherit;
        width: 100%;
        height: 100%;
      }

      input:disabled {
        opacity: 0.4;
      }
    `
  }

  static get properties() {
    return { value: { type: String } }
  }

  @property({ type: String })
  placeholder

  @property({ type: Boolean })
  controlled = false

  private _value = undefined
  get value() {
    return this._value
  }

  set value(v) {
    const oldValue = this._value
    this._value = v
    requestAnimationFrame(() => {
      this.requestUpdate('value', oldValue)
    })
  }

  get placeholderStyle() {
    return `
    ::-webkit-input-placeholder {${this['placeholder-style']}}
    ::-moz-placeholder {${this['placeholder-style']}}
    ::-ms-input-placeholder {${this['placeholder-style']}}
    ::placeholder {${this['placeholder-style']}}
    `
  }

  reset() {
    this.value = ''
  }

  @property({ converter: boolConverter, attribute: 'focus' })
  ['is-focus'] = false

  @property({ type: Number })
  maxlength = 140

  @property({ type: String })
  type = 'text'

  @property({ converter: boolConverter })
  password = false;

  @property({ type: String })
  ['placeholder-style'] = '';

  @property({ type: Number })
  ['selection-start'] = -1;

  @property({ type: Number })
  ['selection-end'] = -1;

  /**
   * H5定制属性，input keydown事件冒泡
   * */
  @property({ converter: boolConverter })
  ['keydown-bubbles'] = false

  @query('input')
  inputElement: HTMLInputElement

  @property({})
  onConfirm

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    if (!this.inputElement) return

    if (name === 'focus' && newVal === 'true') {
      this.inputElement.focus()
    }

    if (
      (name === 'selection-start' || name === 'selection-end') &&
      !isNaN(Number(newVal))
    ) {
      this.setSelectionRange()
    }
  }

  _inputHandler(e) {
    e.stopPropagation()

    if (this._checkNumberInputMaxLength()) return

    const value = this.inputElement.value

    // 如果组件受控，则不允许用户输入，除非用户手动设置 value
    if (this.controlled) this.syncValueToInput()

    const event = new CustomEvent('input', {
      detail: {
        value,
        keyCode: e.data
      },
      bubbles: true
    })
    this.dispatchEvent(event)
  }

  _handleInput(e) {
    // ios 系统下由于会有拼写过程自动失焦问题，所以使用 onCompositionEnd 做处理
    if (this.composition) return

    this._inputHandler(e)
  }

  _handleCompositionEnd(e) {
    if (isIos()) {
      this.composition = false
      this._inputHandler(e)
    }
  }

  _handleCompositionStart(e) {
    // 仅在 ios 系统下做拼写处理
    if (isIos()) this.composition = true
  }

  syncValueToInput() {
    if (this.syncTimeId) {
      clearTimeout(this.syncTimeId)
      this.syncTimeId = null
    }
    // 同步间隔设置 500ms，在 ios 场景下高频率同步会导致自动失焦问题
    this.syncTimeId = setTimeout(() => {
      if (this.inputElement.value !== this.value)
        this.inputElement.value = this.value
      this.syncTimeId = null
    }, 500)
  }

  // type number 限制 maxlength
  _checkNumberInputMaxLength() {
    const NUMBER = 'number'
    const { value } = this.inputElement

    if (this.type === NUMBER && value.length > this.maxlength) {
      this.value = value.slice(0, this.maxlength)
      return true
    }

    return false
  }

  _handleKeyDown(e) {
    if (!this['keydown-bubbles']) {
      e.stopPropagation()
    }

    if (e.keyCode === 13) {
      const event = new CustomEvent('confirm', {
        detail: {
          value: this.inputElement.value
        },
        bubbles: true
      })
      this.dispatchEvent(event)
    }
  }

  connectedCallback() {
    super.connectedCallback()
    // 初始化如果设置了focus，在此手动聚焦，因为 attributeChange 会在 connected 之前触发
    this['is-focus'] &&
      requestAnimationFrame(() => {
        this.inputElement && this.inputElement.focus()
      })

    requestAnimationFrame(() => this.setSelectionRange())

    this.addEventListener('blur', this.onBlur)
    this.addEventListener('focus', this.onFocus)
  }

  private setSelectionRange() {
    if (
      !this.inputElement ||
      this.type === 'number' ||
      (this['selection-start'] === -1 && this['selection-end'] === -1)
    )
      return

    this.inputElement.selectionStart = this['selection-start']
    this.inputElement.selectionEnd = this['selection-end']
  }

  private onBlur = (e: FocusEvent) => {
    if (e instanceof FocusEvent) {
      e.stopImmediatePropagation()
      this.dispatchEvent(
        new CustomEvent('blur', {
          detail: {
            value: this.inputElement.value
          }
        })
      )
    }
  }

  private onFocus = (e: FocusEvent) => {
    if (e instanceof FocusEvent) {
      e.stopImmediatePropagation()
      this.dispatchEvent(
        new CustomEvent('focus', {
          detail: {
            value: this.inputElement.value
          }
        })
      )
    }
  }

  render() {
    return html`
      <style>
        ${this.placeholderStyle}
      </style>
      <input
        placeholder="${this.placeholder || ''}"
        ?disabled="${this.disabled}"
        type="${this.password ? 'password' : this.type}"
        .value="${this.value || ''}"
        @input="${this._handleInput}"
        @compositionend="${this._handleCompositionEnd}"
        @compositionstart="${this._handleCompositionStart}"
        @keydown="${this._handleKeyDown}"
        maxlength="${this.maxlength}"
      />
    `
  }
}
