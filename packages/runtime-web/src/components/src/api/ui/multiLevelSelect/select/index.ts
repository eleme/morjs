import { html, internalProperty, property } from 'lit-element'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { Styles } from './index.style'

class MultiLevelSelect extends BaseElement {
  @internalProperty() selectList = []
  @property() title = ''
  @property({ type: Array }) list = []

  connectedCallback() {
    super.connectedCallback()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  static get styles() {
    return Styles
  }

  dispatch(eventName, data = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: data,
        bubbles: true,
        composed: true
      })
    )
  }

  handleClose(event) {
    event.stopPropagation()

    this.dispatch('cancel')
  }

  getCurrentSubList() {
    const { length } = this.selectList
    const selectList = length > 0 ? this.selectList[length - 1] : this.list

    return selectList.subList || selectList
  }

  handleClick(index) {
    const list = this.getCurrentSubList()

    // 最后一层
    if (!list[index]['subList']) {
      const result = this.selectList.map((item) => ({ name: item.name }))
      result.push({ name: list[index].name })
      this.dispatch('select', { result })
      return
    }

    this.selectList = [...this.selectList, list[index]]
  }

  handleTabClick(index) {
    this.selectList = this.selectList.slice(0, index)
  }

  render() {
    return html`
      <private-multi-select-modal
        .show=${true}
        title=${this.title}
        @close=${this.handleClose}
      >
        <div class="select-container">
          <div class="select-header">
            ${this.selectList.map(
              (item, index) =>
                html`<p
                  class="select-tab"
                  @click=${() => {
                    this.handleTabClick(index)
                  }}
                >
                  ${item.name}
                </p>`
            )}
            <p class="select-tab select-tab-active">请选择</p>
          </div>
          <div class="select-list">
            ${this.getCurrentSubList().map(
              (item, index) =>
                html`<p
                  class="select-item"
                  @click=${() => this.handleClick(index)}
                >
                  ${item.name}
                </p>`
            )}
          </div>
        </div>
      </private-multi-select-modal>
    `
  }
}

defineElement('private-multi-level-select', MultiLevelSelect)
