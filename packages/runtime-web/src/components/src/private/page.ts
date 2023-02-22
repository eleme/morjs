import { css, html, LitElement } from 'lit-element'
// import { rpxToRem } from '../rpx';
import { defineElement } from '../utils'

// const HeaderHeight = unsafeCSS(rpxToRem(88));

export default class Page extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        box-sizing: content-box;
      }

      :host::-webkit-scrollbar {
        display: none; /* Chrome Safari */
      }
    `
  }
  render() {
    return html` <slot></slot> `
  }
}

defineElement('tiga-page', Page)
