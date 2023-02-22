import { html, property } from 'lit-element'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { Styles } from './index.style'

class OptionSelect extends BaseElement {
  cacheOneSelect = 0
  cacheTwoSelect = 0

  @property() title = ''
  @property({ type: Array }) optionsOne = []
  @property({ type: Array }) optionsTwo = []
  @property({ type: Number }) selectedOneIndex = 0
  @property({ type: Number }) selectedTwoIndex = 0
  @property() positiveString = '确定'
  @property() negativeString = '取消'

  connectedCallback() {
    super.connectedCallback()

    this.cacheOneSelect = this.selectedOneIndex
    this.cacheTwoSelect = this.selectedTwoIndex
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  static get styles() {
    return Styles
  }

  onConfirm() {
    this.dispatch(true)
  }

  onCancel() {
    this.dispatch(false)
  }

  buildReturnResult() {
    const result = {
      selectedOneIndex: this.selectedOneIndex,
      selectedOneOption: this.optionsOne[this.selectedOneIndex]
    }

    if (this.onlyOne()) return result

    return {
      ...result,
      selectedTwoIndex: this.selectedTwoIndex,
      selectedTwoOption: this.optionsTwo[this.selectedTwoIndex]
    }
  }

  buildCancelResult() {
    const oneResult = {
      selectedOneIndex: '',
      selectedOneOption: ''
    }
    const twoResult = {
      selectedTwoIndex: '',
      selectedTwoOption: ''
    }

    return this.onlyOne() ? oneResult : { ...oneResult, ...twoResult }
  }

  dispatch(fromCancel = false) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: fromCancel
          ? this.buildCancelResult()
          : this.buildReturnResult(),
        bubbles: true,
        composed: true
      })
    )
  }

  onlyOne() {
    const optionsTwo = this.optionsTwo

    return !Array.isArray(optionsTwo) || optionsTwo.length <= 0
  }

  handleOneChange(event) {
    const { detail } = event

    this.selectedOneIndex = detail.value
    this.dispatch()
  }

  cancelOneChange() {
    this.dispatch(true)
  }

  cacheTwoChange(event) {
    const { detail } = event
    const { value } = detail

    this.cacheOneSelect = value[0]
    this.cacheTwoSelect = value[1]
  }

  handleTwoChange() {
    this.selectedOneIndex = this.cacheOneSelect
    this.selectedTwoIndex = this.cacheTwoSelect

    this.dispatch()
  }

  renderSingleSelect() {
    return html`
      <tiga-picker
        title=${this.title}
        .range=${this.optionsOne}
        value=${this.selectedOneIndex}
        confirmText=${this.positiveString}
        cancelText=${this.negativeString}
        @change=${this.handleOneChange}
        @no-change=${this.handleOneChange}
        @cancel=${this.cancelOneChange}
        .show=${true}
      >
      </tiga-picker>
    `
  }

  renderTwoSelect() {
    return html`
      <private-modal
        .show="${true}"
        confirmText=${this.positiveString}
        cancelText=${this.negativeString}
        @confirm=${this.handleTwoChange}
        @cancel=${() => this.dispatch()}
        title=${this.title}
      >
        <tiga-picker-view
          slot="content"
          .value=${[this.selectedOneIndex, this.selectedTwoIndex]}
          @change=${this.cacheTwoChange}
          indicator-style="border-top: 1px solid #ddd;border-bottom: 1px solid #ddd;background-color:#f5f5f9;"
        >
          <tiga-picker-view-column
            >${this.optionsOne.map(
              (item) => html`<div>${item}</div>`
            )}</tiga-picker-view-column
          >
          <tiga-picker-view-column
            >${this.optionsTwo.map(
              (item) => html`<div>${item}</div>`
            )}</tiga-picker-view-column
          >
        </tiga-picker-view>
      </private-modal>
    `
  }

  render() {
    return html`${this.onlyOne()
      ? this.renderSingleSelect()
      : this.renderTwoSelect()}`
  }
}

defineElement('private-option-select', OptionSelect)
