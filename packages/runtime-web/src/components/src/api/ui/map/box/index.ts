import { css, html, internalProperty, LitElement, property } from 'lit-element'
import { uuid } from '../../../../utils'
import {
  collectStyleObject,
  handleStyleText,
  onCommonStyleChange
} from '../style'

export default class Box extends LitElement {
  static get styles() {
    return css`
      :host {
        position: relative;
        display: block;
        width: max-content;
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
  styleObject = {}

  onStyleChange(name, value) {
    onCommonStyleChange(this, name, value)
    collectStyleObject(this, 'display', 'flex')

    switch (name) {
      case 'width':
      case 'height': {
        const { width, height } = (this.attributes || {}) as any
        if (width && !height) {
          collectStyleObject(this, 'height', `${value}px`)
        }
        if (height && !width) {
          collectStyleObject(this, 'width', `${value}px`)
        }
        break
      }
      case 'layout':
        if (value === 'vertical') {
          collectStyleObject(this, 'flex-direction', 'column')
        }
        break
      // 支付宝小程序有效值只有middle
      case 'horizontal-align':
        if (this.layout === 'vertical' || this.layout === 'relative')
          collectStyleObject(this, 'align-items', 'center')
        else collectStyleObject(this, 'justify-content', 'center')
        break
      case 'vertical-align':
        if (this.layout === 'horizontal')
          collectStyleObject(this, 'align-items', 'center')
        else collectStyleObject(this, 'justify-content', 'center')
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

  get _slottedChildren() {
    const slot = this.shadowRoot.querySelector('slot')
    return slot.assignedElements({ flatten: true })
  }

  handleSlotChange(e) {
    const childNodes = e.target.assignedNodes({ flatten: true })
    let width = 0,
      height = 0

    if (this.layout !== 'relative') return
    if (!(Array.isArray(childNodes) && childNodes.length > 0)) return

    childNodes.forEach((child) => {
      if (child && typeof child.getAttribute === 'function') {
        const cWidth = child.getAttribute('width')
        const cHeight = child.getAttribute('height')

        if (cWidth) width = Math.max(width, cWidth)
        if (cHeight) height = Math.max(height, cHeight)
      }
    })

    if (width) collectStyleObject(this, 'width', `${width}px`)
    if (height) collectStyleObject(this, 'height', `${height}px`)
  }

  render() {
    const cssText = handleStyleText(this.styleObject)

    return html`<div id="${this.id || uuid()}" style="${cssText}">
      <slot @slotchange=${this.handleSlotChange}></slot>
    </div>`
  }
}
