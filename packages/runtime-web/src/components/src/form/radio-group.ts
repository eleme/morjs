import { html, internalProperty, property } from 'lit-element'
import { BaseElement } from '../baseElement'
import boolConverter from '../utils/bool-converter'
import { IFormComponent } from './IFormComponent'

export default class RadioGroup extends BaseElement implements IFormComponent {
  @property({ type: String }) selectVal = ''

  /**
   * 组件值，选中时 change 事件会携带的 value。
   */
  @property({ type: String }) onChange = ''

  /**
   * 当前的value
   * 内部变量，暴露给form
   */
  @internalProperty() value = ''

  /**
   * 私有属性，当前组件是否受控
   * 默认值：false
   */
  @property({ converter: boolConverter }) controlled = false

  reset() {
    const namedElements = this.querySelectorAll('tiga-radio')
    namedElements.forEach((e) => {
      ;(<any>e).checked = false
      ;(<any>e).classList.remove('a-radio-checked')
    })
  }

  constructor() {
    super()
    ;(<any>this).selectVal = ''
  }

  connectedCallback() {
    super.connectedCallback()
    this.addListener()
    this.initTapClick()
  }

  initStatus() {
    const nodeList = this.querySelectorAll('tiga-radio')
    nodeList.forEach((item) => {
      const radio: any = item
      if (radio.checked) {
        radio.classList.add('a-radio-checked')
      } else {
        radio.classList.remove('a-radio-checked')
      }
    })
  }

  initTapClick() {
    this.addEventListener(
      'click',
      (e) => {
        if (!this.controlled) {
          const checkboxNode = this.findCheckNode(<HTMLElement>e.target)
          if (checkboxNode && !checkboxNode.disabled) {
            this.changeRadioValue(checkboxNode.value)
          }
        }
      },
      false
    )
  }

  findCheckNode(node) {
    if (node.tagName === 'TIGA-RADIO-GROUP') {
      return undefined
    }
    if (node.tagName === 'TIGA-RADIO') {
      return node
    }
    if (node.tagName === 'TIGA-LABEL') {
      const checkBoxNode = node.querySelector('tiga-radio')
      if (checkBoxNode) {
        return checkBoxNode
      } else {
        return undefined
      }
    } else {
      const radioNodeList = node.querySelectorAll('tiga-radio')
      if (radioNodeList && radioNodeList.length > 0) {
        return radioNodeList[0]
      } else if (node.parentNode) {
        const radioNode = node.parentNode.querySelector('tiga-radio')
        if (radioNode) {
          return radioNode
        } else {
          return this.findCheckNode(node.parentNode)
        }
      }
    }
    return node
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  changeRadioValue(value) {
    ;(<any>this).selectVal = value
    const nodeList = this.querySelectorAll('tiga-radio')
    nodeList.forEach((item) => {
      const radio: any = item
      if (radio.value === value) {
        radio.checked = true
      } else {
        radio.checked = false
      }
    })

    this.value = value
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value
        },
        bubbles: true
      })
    )
  }

  _callTigaRadioGroup = (e) => {
    const { value = '' } = (<any>e).detail || {}
    this.changeRadioValue(value)
  }

  _initTigaRadioGroup = (e) => {
    const value = (<any>e).detail.value || ''
    const nodeList = this.querySelectorAll('tiga-radio')
    nodeList.forEach((item) => {
      const radio: any = item
      if (radio.value === value) {
        radio.checked = true
        radio.classList.add('a-radio-checked')
      } else {
        radio.checked = false
        radio.classList.remove('a-radio-checked')
      }
    })
  }

  addListener() {
    window.addEventListener(
      'call-tiga-radio-group-event',
      this._callTigaRadioGroup
    )

    window.addEventListener(
      'init-tiga-radio-group-event',
      this._initTigaRadioGroup
    )
  }

  render() {
    return html` <slot></slot> `
  }
}
