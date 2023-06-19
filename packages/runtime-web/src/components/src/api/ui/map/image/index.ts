import { css, html, internalProperty, LitElement, property } from 'lit-element'
import { uuid } from '../../../../utils'
import { handleStyleText, onCommonStyleChange } from '../style'

export default class Image extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
        font-size: 0;
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

  @property({ type: String })
  src

  @property({ type: String })
  placeholder

  @internalProperty()
  styleObject = {}

  onStyleChange(name, value) {
    onCommonStyleChange(this, name, value)
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    this.onStyleChange(name, newVal)
  }

  connectedCallback() {
    super.connectedCallback()
  }

  render() {
    const cssText = handleStyleText(this.styleObject)
    const id = this.id || uuid()

    return html` <img
      id="${id}"
      style="${cssText}"
      src="${this.src || this.placeholder}"
    />`
  }
}
