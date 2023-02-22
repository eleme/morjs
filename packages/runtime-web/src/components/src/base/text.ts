import { css, html, property } from 'lit-element'
import { BaseElement } from '../baseElement'

export default class Text extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: inline;
        white-space: pre-line;
        /* autoprefixer: ignore next */
        -webkit-box-orient: vertical;
      }
    `
  }

  /**
   * 显示的行数
   */
  @property({ type: Number })
  ['number-of-lines'] = 0

  /**
   * 是否可选择
   */
  @property({ type: Boolean })
  selectable = false

  attributeChangedCallback(name: string, oldVal: any, newVal: any) {
    super.attributeChangedCallback(name, oldVal, newVal)

    if (name === 'number-of-lines') {
      this.numberOfLinesChanged()
    } else if (name === 'selectable') {
      this.selectableChanged()
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.selectableChanged()
    this.numberOfLinesChanged()
  }

  numberOfLinesChanged() {
    const val = this['number-of-lines']
    if (val > 0) {
      this.style.setProperty('overflow', 'hidden')
      this.style.setProperty('text-overflow', 'ellipsis')
      this.style.setProperty('-webkit-line-clamp', String(val))
      this.style.setProperty('display', '-webkit-box')
    } else {
      this.style.removeProperty('overflow')
      this.style.removeProperty('text-overflow')
      this.style.removeProperty('-webkit-line-clamp')
      this.style.removeProperty('display')
    }
  }

  selectableChanged() {
    if (this.selectable) {
      this.style.setProperty('user-select', 'text')
    } else {
      this.style.setProperty('user-select', 'none')
    }
  }

  render() {
    const style = css`
      text-decoration: inherit;
    `
    return html`<span style="${style}"><slot style="${style}"></slot></span>`
  }
}
