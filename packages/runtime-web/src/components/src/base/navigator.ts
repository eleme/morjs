import { css, html, property } from 'lit-element'
import { my } from '../../../api/my'
import { BaseElement } from '../baseElement'

export default class Navigator extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `
  }

  /**
   * 跳转方式。
   */
  @property({ type: String })
  ['open-type'] = 'navigate'

  /**
   * 当前小程序内的跳转链接。
   */
  @property({ type: String })
  url

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('tap', this.handleTap, { passive: true })
  }

  private handleTap = () => {
    const url = this.url

    switch (this['open-type']) {
      case 'navigate': {
        my.navigateTo({
          url
        })
        break
      }

      case 'redirect': {
        my.redirectTo({
          url
        })
        break
      }

      case 'switchTab': {
        my.switchTab({
          url
        })
        break
      }
      case 'navigateBack': {
        my.navigateBack()
        break
      }

      case 'reLaunch': {
        my.reLaunch({
          url
        })
        break
      }
    }
  }

  render() {
    return html` <slot></slot> `
  }
}
