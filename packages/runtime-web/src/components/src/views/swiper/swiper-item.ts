import { html, LitElement } from 'lit-element'

export default class SwiperItem extends LitElement {
  render() {
    return html`<slot></slot>`
  }
}
