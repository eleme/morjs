import { css, html, property, query } from 'lit-element'
import { BaseElement } from '../baseElement'
import boolConverter from '../utils/bool-converter'
import { IFormComponent } from './IFormComponent'

export default class Textarea extends BaseElement implements IFormComponent {
  blurOnClick = false
  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        background-color: #fff;
        padding: 2px 5px;
        color: #000;
        font-size: 17px;
        line-height: 1.4;
      }

      .host {
        position: relative;
        height: 100%;
        width: inherit;
        line-height: inherit;
        font-family: inherit;
        min-height: inherit;
      }

      textarea {
        position: relative;
        line-height: inherit;
        min-height: inherit;
        height: inherit;
        width: 100%;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        color: inherit;
        background: 0 0;
        display: inherit;
        border: 0;
        padding: 0;
        margin: 0;
        outline: 0;
        overflow: inherit;
        text-overflow: inherit;
        -webkit-tap-highlight-color: transparent;
        resize: none;
        z-index: 2;
      }

      .count-warp {
        position: absolute;
        bottom: 0;
        right: 5px;
        color: #b2b2b2;
        font-size: 14px;
        margin: 0;
      }
    `
  }

  @property({ type: String })
  placeholder

  @property({ type: String })
  value;

  @property({ converter: boolConverter, attribute: 'focus' })
  ['is-focus'] = false;

  // 是否显示字数统计
  @property({ converter: boolConverter })
  ['show-count'] = true;

  @property({ converter: boolConverter })
  ['auto-height'] = false

  @property({ type: Number })
  maxlength = 140

  @property({ type: String })
  type = 'text'

  @property({})
  onConfirm

  @query('textarea')
  inputElement: HTMLInputElement

  @query('.count-warp')
  countWrapElement: HTMLParagraphElement

  text = ''

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    switch (name) {
      case 'show-count': {
        this.showCountChanged()
        break
      }
      case 'focus': {
        if (newVal === 'true') {
          requestAnimationFrame(() => {
            this.inputElement && this.inputElement.focus()
          })
        }
        break
      }

      case 'value': {
        if (oldVal !== newVal) {
          requestAnimationFrame(() => {
            this._updateHeight()
          })
        }
      }
    }
  }

  showCountChanged() {
    if (this['show-count']) {
      this.style.setProperty('padding-bottom', '16px')
    } else {
      this.style.removeProperty('padding-bottom')
    }
  }

  _handleInput(e) {
    e.stopPropagation()
    this._updateHeight()
    this._updateCountWrapText()
    // 处理高度事件
    const event = new CustomEvent('input', {
      detail: {
        value: this.inputElement.value,
        keyCode: e.data
      },
      bubbles: true
    })
    this.value = this.inputElement.value
    this.dispatchEvent(event)
  }

  _handleKeyDown(e) {
    e.stopPropagation()
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
    this.showCountChanged()
    setTimeout(() => {
      this._updateHeight()
      this._updateCountWrapText()
    }, 0)
  }

  /**
   * 自适应高度。参考：https://segmentfault.com/a/1190000022272721
   */
  private _updateHeight() {
    if (this['auto-height']) {
      const textArea = this.inputElement
      textArea.style.height = 'inherit'
      textArea.style.height = `${textArea.scrollHeight}px`
    }
  }

  private _updateCountWrapText() {
    const input = this.inputElement
    const text = `${
      input ? input.value.length : this.value ? this.value.length : 0
    }/${this.maxlength}`
    const countWrap = this.countWrapElement
    if (countWrap) {
      countWrap.innerText = text
    }
  }

  render() {
    return html`
      <div class="host">
        <textarea
          placeholder="${this.placeholder}"
          ?disabled="${this.disabled}"
          type="${this.type}"
          @input="${this._handleInput}"
          .value="${this.value || ''}"
          @keydown="${this._handleKeyDown}"
          maxlength="${this.maxlength}"
        ></textarea>
      </div>
      ${this['show-count'] ? html`<p class="count-warp"></p>` : undefined}
    `
  }
}
