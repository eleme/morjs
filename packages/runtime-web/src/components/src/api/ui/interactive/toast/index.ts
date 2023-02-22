import { html, property } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { MAP } from './constants'
import { Styles } from './index.style'

class Toast extends BaseElement {
  @property() content = ''
  @property() type = 'none'

  static get styles() {
    return Styles
  }

  render() {
    return html`
      <div class="private-toast">
        ${MAP[this.type] ? unsafeHTML(MAP[this.type]) : null}
        <p class="private-toast-content">${this.content}</p>
      </div>
    `
  }
}

defineElement('private-toast', Toast)
