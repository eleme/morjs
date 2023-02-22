import { html, query } from 'lit-element'
import { BaseElement } from '../baseElement'

export default class TigaForm extends BaseElement {
  @query('form')
  form: HTMLFormElement

  submit() {
    // 获取所有的设置了 name 属性的元素。
    const value = {}
    const namedElements = this.querySelectorAll('*[name]')
    namedElements.forEach((e: any) => {
      value[e.getAttribute('name')] = e.value
    })
    this.dispatchEvent(
      new CustomEvent('submit', {
        detail: {
          value
        }
      })
    )
  }

  reset() {
    const namedElements = this.querySelectorAll('*[name]')
    namedElements.forEach((e: any) => {
      // e.value = '';
      if (e.reset) {
        e.reset()
      } else {
        e.value = ''
      }
    })
    this.dispatchEvent(new CustomEvent('reset'))
  }

  render() {
    return html` <form><slot></slot></form> `
  }
}
