import { css, html, property } from 'lit-element'
import { my } from '../../../api/my'
import { BaseElement } from '../baseElement'
import { defineElement } from '../utils'
class Back extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
        width: 48px;
        height: 48px;
        pointer-events: auto;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      }

      .back {
        width: 100%;
        height: 100%;
        transform-origin: center center;
        transform: rotate(-180deg) scale(0.6);
      }
    `
  }

  connectedCallback() {
    super.connectedCallback()

    this.addEventListener('tap', this.back)
  }

  back() {
    const userHook = window.__tigaBack
    const defaultBack = () =>
      typeof my === 'object' ? my.navigateBack({ delta: 1 }) : history.back()
    const isPromise = (param) =>
      typeof param === 'object' && typeof param.then === 'function'
    // 如果没有挂载tiga back事件拦截，走默认逻辑
    if (typeof userHook !== 'function') return void defaultBack()

    try {
      const result = userHook()

      if (result === true) return
      if (isPromise(result)) {
        result
          .then((res) => {
            if (res === true) return
            return defaultBack()
          })
          .catch(defaultBack)
        return
      }
    } catch (e) {}
    defaultBack()
  }

  @property({ type: String })
  color = '#FFF'

  render() {
    if (history && history.length > 0) {
      return html`
        <svg
          t="1618209269212"
          class="back"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1436"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="200"
          height="200"
        >
          <defs><style type="text/css"></style></defs>
          <path
            d="M359.21 159.353l4.583-5.048c8.332-8.331 21.84-8.331 30.17 0l312.44 312.44c24.994 24.994 24.994 65.516 0 90.51l-312.44 312.44c-7.405 7.406-18.9 8.228-27.215 2.469l-3.133-2.647c-24.896-24.896-24.897-65.26-0.003-90.156l258.272-258.31c4.996-5 4.996-13.103 0-18.103L363.58 244.608c-23.322-23.325-24.779-60.234-4.37-85.255z"
            fill="${this.color}"
            p-id="1437"
          ></path>
        </svg>
      `
    }

    return ''
  }
}

defineElement('tiga-back', Back)
