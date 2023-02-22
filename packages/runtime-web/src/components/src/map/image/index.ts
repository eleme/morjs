import { css, html, internalProperty, LitElement, property } from 'lit-element'
import { onCommonStyleChange, uuid } from '../property'

export default class Image extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
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

  @property({ type: String })
  src

  @property({ type: String })
  placeholder

  @internalProperty()
  cssText = ''

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
    return html`<img
      id="${this.id || uuid()}"
      style="${this.cssText}"
      src="${this.src || this.placeholder}"
    />`
  }
}
