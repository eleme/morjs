import { css, html, internalProperty, LitElement, property } from 'lit-element'
import { uuid } from '../../../../utils'
import {
  collectStyleObject,
  handleStyleText,
  onCommonStyleChange
} from '../style'

export default class Text extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
        vertical-align: top;
        overflow: hidden;
      }
    `
  }

  @property({ type: String })
  id

  @property({ type: Number })
  width

  @property({ type: Number })
  height

  @property({ type: Number })
  left = 0

  @property({ type: Number })
  top = 0

  @property({ type: Number })
  right

  @property({ type: Number })
  bottom;

  @property({ type: String })
  ['background-color'] = '#000000'

  @property({ type: Number })
  padding = 0;

  @property({ type: Number })
  ['padding-left'] = 0;

  @property({ type: Number })
  ['padding-top'] = 0;

  @property({ type: Number })
  ['padding-right'] = 0;

  @property({ type: Number })
  ['padding-bottom'] = 0;

  @property({ type: String })
  ['border-color'] = '#000000';

  @property({ type: Number })
  ['border-radius'] = 0;

  @property({ type: Number })
  ['border-width'] = 0

  @property({ type: Number })
  text

  @property({ type: Number })
  color;

  @property({ type: String })
  ['font-size']

  @property({ type: Boolean })
  clickable = false;

  @property({ type: Number })
  ['number-of-lines'];

  @property({ type: String })
  ['stroke-color'] = '#FFFFFFFF';

  @property({ type: Number })
  ['stroke-width'];

  @property({ type: String })
  ['text-align'] = 'left';

  @property({ type: String })
  ['font-weight'] = 'normal'

  @internalProperty()
  styleObject = {}

  @internalProperty()
  value = ''

  onStyleChange(name, value) {
    onCommonStyleChange(this, name, value)
    switch (name) {
      case 'text':
        this.value = value
        break
      case 'color':
        collectStyleObject(this, name, value)
        break
      case 'font-weight':
        collectStyleObject(this, name, value || 'normal')
        break
      case 'text-align':
        collectStyleObject(this, name, value || 'left')
        break
      case 'font-size':
        collectStyleObject(this, name, `${value}px`)
        break
      case 'stroke-color':
        collectStyleObject(this, 'text-shadow', `${value} 1px 1px`)
        break
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    this.onStyleChange(name, newVal)
  }

  connectedCallback() {
    super.connectedCallback()
  }

  _handleClick(ev) {
    if (!this.clickable) {
      ev.stopPropagation()
    }
  }

  render() {
    const cssText = handleStyleText(this.styleObject)

    return html`
      <div
        id="${this.id || uuid()}"
        style="${cssText}"
        @click="${this._handleClick}"
      >
        ${this.value}
      </div>
    `
  }
}
