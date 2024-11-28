import { html, internalProperty, property } from 'lit-element'
import { BaseElement } from '../baseElement'
import { IFormComponent } from './IFormComponent'

// interface IRadioGroup {
//   selectValues: string[];
//   myArray: string[];
// }
//
// interface IRadioItem {
//   value: string;
//   checked: boolean;
// }

export default class CheckboxGroup
  extends BaseElement
  implements IFormComponent
{
  // static get properties() {
  //   return {
  //     selectValues: [],
  //   };
  // }

  /**
   * 组件值，选中时 change 事件会携带的 value。
   */
  @property({ type: String }) onChange = ''

  @property({ type: Array }) selectValues = []

  /**
   * 当前的value
   * 内部变量，暴露给form
   */
  @internalProperty() value = ''

  reset() {
    const namedElements = this.querySelectorAll('tiga-checkbox')
    namedElements.forEach((e) => {
      ;(<any>e).checked = false
      ;(<any>e).classList.remove('a-checkbox-checked')
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

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    this.removeEventListener(
      'call-tiga-checkbox-group-event',
      this._callTigaCheckboxGroup
    )
    this.removeEventListener(
      'init-tiga-checkbox-group-event',
      this._initTigaCheckboxGroup
    )
  }

  initTapClick() {
    this.addEventListener(
      'click',
      (e) => {
        const checkboxNode = this.findCheckNode(<HTMLElement>e.target)
        if (checkboxNode && !checkboxNode.disabled) {
          this.changeValueList(checkboxNode.value)
        }
      },
      true
    )
  }

  findCheckNode(node) {
    if (
      node.tagName === 'TIGA-CHECKBOX' ||
      node.tagName === 'TIGA-CHECKBOX-GROUP'
    ) {
      return undefined
    }
    if (node.tagName === 'TIGA-LABEL') {
      const checkBoxNode = node.querySelector('tiga-checkbox')
      if (checkBoxNode) {
        return checkBoxNode
      } else {
        return undefined
      }
    } else {
      const checkboxNodeList = node.querySelectorAll('tiga-checkbox')
      if (checkboxNodeList && checkboxNodeList.length > 0) {
        return checkboxNodeList[0]
      } else if (node.parentNode) {
        const checkboxNode = node.parentNode.querySelector('tiga-checkbox')
        if (checkboxNode) {
          return checkboxNode
        } else {
          return this.findCheckNode(node.parentNode)
        }
      }
    }
    return node
  }

  _callTigaCheckboxGroup = (e) => {
    const { value = '' } = (<any>e).detail || {}
    this.changeValueList(value)
  }

  _initTigaCheckboxGroup = (e) => {
    const nodeList = this.querySelectorAll('tiga-checkbox')
    nodeList.forEach((item) => {
      const checkbox: any = item
      if (
        checkbox.checked &&
        !(<any>this).selectValues.some((val) => val === checkbox.value)
      ) {
        ;(<any>this).selectValues.push(checkbox.value)
      }
    })
  }

  addListener() {
    this.addEventListener(
      'call-tiga-checkbox-group-event',
      this._callTigaCheckboxGroup
    )

    this.addEventListener(
      'init-tiga-checkbox-group-event',
      this._initTigaCheckboxGroup
    )
  }

  changeValueList(value) {
    const valueArr = (<any>this).selectValues || []
    let newValue = []
    if (valueArr.some((item) => item === value)) {
      newValue = valueArr.filter((item) => item !== value)
    } else {
      newValue = [...valueArr, value]
    }
    ;(<any>this).selectValues = [...newValue]
    const nodeList = this.querySelectorAll('tiga-checkbox')

    nodeList.forEach((item) => {
      const checkbox: any = item
      const isChecked = (<any>this).selectValues.some(
        (val) => val === checkbox.value
      )
      checkbox.checked = isChecked
      if (isChecked) {
        checkbox.classList.add('a-checkbox-checked')
      } else {
        checkbox.classList.remove('a-checkbox-checked')
      }
      
      if (value === checkbox.value) {
          checkbox.dispatchEvent(new CustomEvent('change', {
            detail: {
                value: isChecked
            },
            bubbles: true
        }));
      }
    })

    this.value = this.selectValues.join(',')

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: (<any>this).selectValues
        },
        bubbles: true
      })
    )
  }

  render() {
    return html` <slot></slot> `
  }
}
