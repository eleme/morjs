import { html, property, query } from 'lit-element'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { Styles } from './index.style'

class Prompt extends BaseElement {
  @property() title = ''
  @property() message = '请输入内容'
  @property() placeholder = ''
  @property() align = 'center'
  @property() okButtonText = '确定'
  @property() cancelButtonText = '取消'

  @query('#prompt-input')
  promptInput

  static get styles() {
    return Styles
  }

  handleConfirmChange(event) {
    event.stopPropagation()

    const { detail = {} } = event
    const inputValue = this.promptInput.value
    const ok = detail.confirm || false
    let result: any = { ok }

    if (ok) {
      result = { ...result, inputValue }
    }

    this.dispatchEvent(
      new CustomEvent('select', {
        detail: result,
        bubbles: true,
        composed: true
      })
    )
  }

  render() {
    return html`
      <private-confirm
        @select="${this.handleConfirmChange}"
        title=${this.title}
        content=${this.message}
        align=${this.align}
        confirmButtonText=${this.okButtonText}
        cancelButtonText=${this.cancelButtonText}
      >
        <input
          slot="input"
          placeholder=${this.placeholder}
          class="private-prompt-input"
          id="prompt-input"
        />
      </private-confirm>
    `
  }
}

defineElement('private-prompt', Prompt)
