import { css, html, property } from 'lit-element'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../../../baseElement'
import boolConverter from '../../../utils/bool-converter'

export default class Canvas extends BaseElement {
  static get styles() {
    return css`
      :host {
      }
    `
  }

  /**
   * 组件唯一标识符
   */
  @property({ type: String }) id = ''

  /**
   * 样式名
   */
  @property({ type: String }) class = ''

  /**
   * 宽度 默认值：300px
   */
  @property({ type: String }) width = '300px'

  /**
   * 高度 默认值：225px
   */
  @property({ type: String }) height = '225px';

  /**
   * 禁止屏幕滚动以及下拉刷新
   */
  @property({ type: boolConverter }) ['disable-scroll'] = false

  /**
   * 组件值，选中时 change 事件会携带的 value。
   */
  @property({ type: String }) onChange = ''

  connectedCallback() {
    super.connectedCallback()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  _handleClick(e) {
    e.stopPropagation()
    this.dispatchEvent(
      new CustomEvent('tap', {
        detail: {},
        bubbles: true,
        composed: true
      })
    )
  }

  render() {
    return html`
      <div style=${styleMap({ height: '100%', width: '100%' })}><canvas /></div>
    `
  }
}
