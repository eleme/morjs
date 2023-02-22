import { css, html } from 'lit-element'
import { BaseElement } from '../baseElement'

export default class MovableArea extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: block;
        width: 10px;
        height: 10px;
      }
    `
  }

  render() {
    return html` <slot></slot> `
  }
}
