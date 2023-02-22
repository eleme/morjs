import { html, property, queryAssignedNodes } from 'lit-element'
import { BaseElement } from '../../baseElement'
import { CHILDREN_NAME } from './constants'
import { DEFAULT_CHILDREN_STYLES, Styles } from './index.style'

const maskStyle = 'mask-style'
const maskClass = 'mask-class'
const indicatorStyle = 'indicator-style'
const indicatorClass = 'indicator-class'

export default class PickerView extends BaseElement {
  startY = 0
  movedY = 0
  lastMovedY = 0
  nodesCache = new WeakMap();

  @property() [maskStyle] = null;
  @property() [maskClass] = null;
  @property() [indicatorStyle] = null;
  @property() [indicatorClass] = null
  @property({ type: String, reflect: true, attribute: 'class' }) _class = ''
  @property({ type: Array, reflect: true, attribute: 'value' }) _value = []

  @queryAssignedNodes()
  slotNodes

  static get styles() {
    return Styles
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value') this.initChildrenStyles()
    super.attributeChangedCallback(name, oldValue, newValue)
  }

  disconnectedCallback() {
    this.nodesCache = null
    super.disconnectedCallback()
  }

  initChildrenStyles() {
    requestAnimationFrame(() => {
      this.mapChildNodes((item, index) => {
        item.style.cssText = DEFAULT_CHILDREN_STYLES
        if (this[maskStyle]) item.setAttribute(maskStyle, this[maskStyle])
        if (this[maskClass]) item.setAttribute(maskClass, this[maskClass])
        if (this[indicatorStyle])
          item.setAttribute(indicatorStyle, this[indicatorStyle])
        if (this[indicatorClass])
          item.setAttribute(indicatorClass, this[indicatorClass])
        if (this._value[index] >= 0)
          item.setAttribute('value', this._value[index])
        this.set(item, this._value[index])
      })
    })
  }

  mapChildNodes(callback) {
    const nodes = this.slotNodes || []
    let validIndex = 0
    nodes.map((item) => {
      // 过滤标签
      if (!item.tagName || item.tagName.toLowerCase() !== CHILDREN_NAME) return
      callback.call(this, item, validIndex)
      validIndex += 1
    })
  }

  set(node, value) {
    this.nodesCache.set(node, value)
  }

  dispatch(eventName, data) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: data,
        bubbles: true,
        composed: true
      })
    )
  }

  // 劫持子组件抛出来的change事件
  handleChange(e) {
    e.stopPropagation()

    const { target, detail } = e

    this.set(target, detail.value)
    const value = this.getSelectValue()
    this.dispatch('change', { value })
  }

  getSelectValue() {
    const result = []
    this.mapChildNodes((item) => {
      const value = this.nodesCache.get(item)
      result.push(value)
    })

    return result
  }

  render() {
    return html`
      <div
        class="tiga-picker-view ${this._class}"
        @private-change=${(e) => this.handleChange(e)}
      >
        <slot></slot>
      </div>
    `
  }
}
