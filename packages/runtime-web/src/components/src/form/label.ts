import { css, html, property } from 'lit-element'
import { BaseElement } from '../baseElement'

export default class Label extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
    `
  }

  /**
   * 绑定组件的 ID。
   */
  @property({ type: String }) for = ''

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

  render() {
    return html` <slot></slot> `
  }
}
