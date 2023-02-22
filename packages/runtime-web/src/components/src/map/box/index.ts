import { css, html, internalProperty, LitElement, property } from 'lit-element'
import { handleCssText, onCommonStyleChange, uuid } from '../property'

export default class Box extends LitElement {
  static get styles() {
    return css`
      :host {
        position: relative;
        display: block;
        width: max-content;
        // overflow: hidden;
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
  layout = 'relative';

  @property({ type: String })
  ['horizontal-align'] = 'middle';

  @property({ type: String })
  ['vertical-align'] = 'middle'

  @internalProperty()
  cssText = ''

  onStyleChange(name, value) {
    onCommonStyleChange(this, name, value)
    switch (name) {
      case 'width':
      case 'height': {
        const { width, height } = (this.attributes || {}) as any
        if (width && !height) {
          handleCssText(this, 'height', `${value}px`)
        }
        if (height && !width) {
          handleCssText(this, 'width', `${value}px`)
        }
        break
      }
      case 'layout':
        if (value === 'horizontal') {
          handleCssText(this, 'display', 'flex')
        }
        if (value === 'vertical') {
          handleCssText(this, 'display', 'flex')
          handleCssText(this, 'flex-direction', 'column')
        }
        handleCssText(this, 'justify-content', 'center')
        handleCssText(this, 'align-items', 'center')
        break
      // case 'horizontal-align':
      //   handleCssText(this, 'justify-content', 'center');
      //   break;
      // case 'vertical-align':
      //   handleCssText(this, 'align-items', 'center');
      //   break;
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    this.onStyleChange(name, newVal)
  }

  connectedCallback() {
    super.connectedCallback()
  }

  render() {
    return html`<div id="${this.id || uuid()}" style="${this.cssText}">
      <slot></slot>
    </div>`
  }
}
