import {
  css,
  eventOptions,
  html,
  internalProperty,
  property
} from 'lit-element'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../baseElement'
import boolConverter from '../utils/bool-converter'
import { IFormComponent } from './IFormComponent'

export default class Slider extends BaseElement implements IFormComponent {
  static get styles() {
    return css`
      :host {
        display: flex;
        position: relative;
      }

      .tiga-slider {
        display: flex;
        flex: 1;
        align-items: center;
        flex-direction: row;
      }

      .tiga-slider-wrapper {
        flex: 1;
        padding: 0;
      }
      .tiga-slider-content {
        position: relative;
        margin: 0;
        padding: 10px 0;
      }

      .tiga-slider-rail {
        position: absolute;
        width: 100%;
        background-color: #ddd;
        height: 2px;
        box-sizing: border-box;
      }

      .tiga-slider-track {
        position: absolute;
        visibility: visible;
        left: 0;
        height: 2px;
        border-radius: 2px;
        background-color: #ff0000;
      }

      .tiga-slider-handle {
        position: absolute;
        margin-left: -12px;
        margin-top: -12px;
        width: 22px;
        height: 22px;
        cursor: pointer;
        border-radius: 50%;
        border: 2px solid #108ee9;
        background-color: #fff;
        box-sizing: border-box;
        transform-origin: left center;
      }

      .tiga-slider-presentation {
        min-width: 5px;
        font-size: 14px;
        color: #111111;
        width: 40px;
        text-align: right;
      }
    `
  }

  /**
   * 组件名字，用于表单提交获取数据。
   */
  @property({ type: String }) name = ''

  /**
   * 最小值。
   * 默认值：0
   */
  @property({ type: Number }) min = 0

  /**
   * 最大值。
   * 默认值：1
   */
  @property({ type: Number }) max = 100

  /**
   * 步长，值必须大于 0，并可被(max - min)整除。
   * 默认值：1
   */
  @property({ type: Number }) step = 1

  /**
   * 是否禁用。
   * 默认值：false
   */
  @property({ converter: boolConverter }) disabled = false

  /**
   * 当前取值。。
   * 默认值：false
   */
  @property({ type: Number }) value = 0;

  /**
   * 是否显示当前 value。
   * 默认值：false
   */
  @property({ converter: boolConverter }) ['show-value'] = false;

  /**
   * 已选择的颜色，同 CSS 色值。
   * 默认值：#108ee9
   */
  @property({ type: String }) ['activeColor'] = '#108ee9';

  /**
   * 背景条颜色，同 CSS 色值。
   * 默认值：#ddd
   */
  @property({ type: String }) ['backgroundColor'] = '#dddddd';

  /**
   * 轨道线条高度。
   * 默认值：4
   */
  @property({ type: Number }) ['track-size'] = 1;

  /**
   * 滑块大小。
   * 默认值：22
   */
  @property({ type: Number }) ['handle-size'] = 22;

  /**
   * 滑块填充色，同 CSS 色值。
   * 默认值：#fff
   */
  @property({ type: Number }) ['handle-color'] = '#ffffff'

  /**
   * onChange EventHandle 完成一次拖动后触发，event.detail = {value: value}。
   */

  /**
   * onChanging EventHandle 拖动过程中触发的事件，event.detail = {value: value}。
   */

  /**
   * 起始位置
   */
  @internalProperty() startX = 0

  /**
   * 线条长度
   * 私有变量
   */
  @internalProperty() lineLength = 0

  /**
   * 百分比
   * 私有变量
   */
  @internalProperty() percent = 0

  /**
   * 手柄位置
   * 私有变量
   */
  @internalProperty() handlePox = 0

  reset() {
    this.value = 0
    this._init()
  }

  constructor() {
    super()
  }

  @eventOptions({ passive: true })
  private _handleTouchStart() {
    if (this.disabled) return
  }

  @eventOptions({ passive: true })
  private _handleTouchEnd() {
    if (this.disabled) return
    this.tapChangeEvent()
  }

  @eventOptions({ passive: true })
  private parsePercentVal(percent) {
    if (this.disabled) return
    const range = this.max - this.min
    const _value = Math.ceil(this.min + (range * percent) / 100) - this.min
    this.handlePox = Math.ceil((_value / range) * this.lineLength)
    this.percent = Math.ceil((this.handlePox / this.lineLength) * 100)
    this.value = _value - (_value % this.step) + this.min
    this.tapChangingEvent()
  }

  @eventOptions({ passive: true })
  private _handleTouchMove(event) {
    const position = event.touches[0].pageX
    const value = this.checkBoundingRectPox(position - this.startX)
    const percent = Math.ceil((value / this.lineLength) * 100)
    this.parsePercentVal(percent)
  }

  private getClientRect(className) {
    const nodes = this.shadowRoot.querySelectorAll(className) || []
    if (nodes && nodes.length > 0) {
      const handle = nodes[0]
      return handle.getBoundingClientRect() || {}
    }
    return {}
  }

  checkBoundingRectPox(position) {
    const start = 0
    let pox = position
    if (position < start) pox = 0
    if (position > this.lineLength) pox = this.lineLength
    return pox
  }

  tapChangingEvent() {
    this.dispatchEvent(
      new CustomEvent('changing', {
        detail: {
          value: this.value
        }
      })
    )
  }

  tapChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: this.value
        }
      })
    )
  }

  connectedCallback() {
    super.connectedCallback()
    setTimeout(() => {
      this._init()
    }, 0)
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)

    if (name === 'value' && oldVal !== newVal) {
      this._init()
    }
  }

  _init() {
    const { left = 0, right = 350 } =
      this.getClientRect('.tiga-slider-rail') || {}
    this.startX = left
    this.lineLength = right - left
    if (this.value < this.min) {
      this.value = this.min
    }
    const range = this.max - this.min
    this.handlePox = Math.ceil(
      ((this.value - this.min) / range) * this.lineLength
    )
    this.percent = Math.ceil((this.handlePox / this.lineLength) * 100)
  }

  render() {
    const railStyleInfo = {
      backgroundColor: this['backgroundColor'], //this.checked ? this.color : '#e5e5e5',
      height: `${this['track-size']}px`,
      marginTop: `-${this['track-size'] / 2}px`
    }
    const trackStyleInfo = {
      backgroundColor: this['activeColor'],
      height: `${this['track-size']}px`,
      marginTop: `-${this['track-size'] / 2}px`,
      width: `${this.percent}%`
    }
    const handleStyleInfo = {
      transform: `translate(${this.handlePox}px, 0)`,
      width: `${this['handle-size']}px`,
      height: `${this['handle-size']}px`,
      marginTop: `-${this['handle-size'] / 2}px`,
      marginLeft: `-${this['handle-size'] / 2}px`
    }
    return html`
      <div
        class="tiga-slider"
        style="{${styleMap({ opacity: this.disabled ? '0.3' : '1' })}}"
      >
        <div class="tiga-slider-wrapper">
          <div class="tiga-slider-content">
            <div
              class="tiga-slider-rail"
              style=${styleMap(railStyleInfo)}
            ></div>
            <div
              class="tiga-slider-track"
              style=${styleMap(trackStyleInfo)}
            ></div>
            <div
              class="tiga-slider-handle"
              style=${styleMap(handleStyleInfo)}
              @touchstart=${this._handleTouchStart}
              @touchmove=${this._handleTouchMove}
              @touchend=${this._handleTouchEnd}
            ></div>
          </div>
        </div>
        ${this['show-value']
          ? html`<div class="tiga-slider-presentation">${this.value}</div>`
          : undefined}
      </div>
    `
  }
}
