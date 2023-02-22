import { css, html, property } from 'lit-element'
import { classMap } from 'lit-html/directives/class-map'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../baseElement'
import boolConverter from '../utils/bool-converter'

export default class Radio extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 16px;
      }

      .radio-icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }

      .icon {
        width: 20px;
        height: 20px;
        fill: #1890ff;
      }

      .checked-disabled {
        fill: #ddd;
      }

      .unchecked-disabled {
        fill: #ddd;
        background-color: #ddd;
        width: 20px;
        height: 20px;
        border-radius: 100%;
      }

      .label {
        position: relative;
        top: 1px;
      }
    `
  }

  /**
   * 组件值，选中时 change 事件会携带的 value。
   */
  @property({ type: String }) value = ''

  /**
   * 当前是否选中。
   * 默认值：false
   */
  @property({ converter: boolConverter }) checked = false

  /**
   * 是否禁用。
   */
  @property({ converter: boolConverter }) disabled = false

  /**
   * radio 的颜色，同 CSS 色值。
   */
  @property({ type: String }) color = '#1890ff'

  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback()
    this._changeClassList('checked')
    this._changeClassList('disabled')
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    this._changeClassList(name)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  _changeClassList(name) {
    if (name === 'checked' || name === 'disabled') {
      const action = this[name] ? 'add' : 'remove'
      const className = `a-radio-${name}`
      if (this.classList && this.classList[action]) {
        this.classList[action](className)
      }
    }
  }

  _handleClick() {
    if (!this.disabled) {
      window.dispatchEvent(
        new CustomEvent('call-tiga-radio-group-event', {
          detail: {
            value: this.value
          }
        })
      )
    }
  }

  renderRadio() {
    if (this.checked) {
      return html`<svg
        t="1607346454934"
        class=${classMap({ icon: true, 'checked-disabled': this.disabled })}
        style=${styleMap({ fill: this.disabled ? '#ddd' : this.color })}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="8787"
        width="200"
        height="200"
      >
        <path
          d="M512.506025 6.906294c-278.758842 0-505.57773 226.820935-505.57773 505.579777 0 278.797727 226.781026 505.576707 505.57773 505.576707 278.797727 0 505.57773-226.77898 505.57773-505.576707C1018.083755 233.727229 791.303752 6.906294 512.506025 6.906294L512.506025 6.906294zM807.507806 412.036287l-331.285149 334.883093c-0.081864 0.081864-0.246617 0.127913-0.334621 0.25378-0.12075 0.079818-0.12075 0.245593-0.246617 0.328481-2.644223 2.562359-5.915733 4.133134-8.977465 5.876847-1.527796 0.865717-2.771113 2.189875-4.387937 2.808976-4.962012 1.987261-10.213619 3.022847-15.473413 3.022847-5.296633 0-10.631128-1.035586-15.637142-3.105734-1.653663-0.700965-2.980891-2.109034-4.551666-2.978844-3.061732-1.736551-6.244214-3.269463-8.895601-5.872754-0.081864-0.079818-0.125867-0.251733-0.207731-0.333598-0.081864-0.119727-0.245593-0.119727-0.328481-0.246617l-162.930813-167.443593c-15.928784-16.383132-15.555278-42.569538 0.827855-58.499345 16.382109-15.889899 42.531676-15.597233 58.504462 0.827855l133.51076 137.193639L748.712725 353.823468c16.054651-16.257266 42.285059-16.419971 58.505485-0.327458C823.391565 369.5875 823.55427 395.782092 807.507806 412.036287L807.507806 412.036287zM807.507806 412.036287"
          p-id="8788"
        ></path>
      </svg>`
    }
    return html`<svg
      t="1607346736297"
      class=${classMap({ icon: true, 'unchecked-disabled': this.disabled })}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="14495"
      width="30"
      height="30"
    >
      <path
        d="M510.669 1011.507c-67.482 0-132.915-13.21-194.56-39.219-59.494-25.19-112.947-61.133-158.822-107.008s-81.92-99.328-107.008-158.822C24.269 644.813 11.059 579.482 11.059 512s13.21-132.813 39.219-194.458c25.19-59.494 61.133-112.947 107.008-158.822S256.614 76.8 316.109 51.712c61.645-26.01 126.976-39.219 194.458-39.219 67.379 0 132.813 13.21 194.458 39.219 59.494 25.19 112.947 61.133 158.822 107.008s81.92 99.328 107.008 158.822c26.01 61.645 39.219 126.976 39.219 194.458s-13.21 132.813-39.322 194.458c-25.088 59.494-61.133 112.947-107.008 158.822-45.875 45.875-99.226 81.92-158.72 107.008C643.482 998.298 578.048 1011.507 510.669 1011.507L510.669 1011.507M510.566 55.91c-61.542 0-121.344 12.083-177.562 35.84-54.272 22.938-103.117 55.91-144.998 97.792s-74.752 90.624-97.792 144.998c-23.757 56.218-35.84 115.917-35.84 177.562 0 61.542 12.083 121.344 35.84 177.562 22.938 54.272 55.91 103.117 97.792 144.998s90.624 74.752 144.998 97.792c56.218 23.757 115.917 35.84 177.562 35.84l0.102 0 0 0c61.542 0 121.242-12.083 177.459-35.84 54.272-22.938 103.014-55.808 144.998-97.792s74.752-90.726 97.792-144.998c23.757-56.218 35.84-115.917 35.84-177.562 0-61.542-12.083-121.344-35.84-177.562-22.938-54.272-55.808-103.117-97.792-144.998-41.882-41.984-90.726-74.854-144.998-97.792C631.91 67.994 572.109 55.91 510.566 55.91z"
        p-id="14496"
      ></path>
    </svg>`
  }

  render() {
    return html` <span class="radio-icon"> ${this.renderRadio()} </span> `
  }
}
