import { html, internalProperty, property } from 'lit-element'
import { classMap } from 'lit-html/directives//class-map'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../../baseElement'
import { rpxToRem } from '../../rpx'
import { ITEM_HEIGHT, RATE } from './constants'
import { PickerStyles } from './index.style'
import { fixedBody, getPosition, isIos, looseBody } from './utils'

export default class Picker extends BaseElement {
  startY = 0
  movedY = 0
  lastMovedY = 0
  lastIndex = 0

  @internalProperty() showPicker = false

  // 通过切换transform属性实现滚动效果
  @internalProperty() styles = { transform: 'translate3d(0, 0, 0)' }

  @property({ type: String }) title = ''
  @property({ type: Boolean }) show = false

  @property({ type: Array })
  range = [];

  @property({ type: String }) ['range-key'] = ''

  @property({ type: Number, reflect: true }) value = 0

  @property({ type: Boolean }) disabled = false

  @property() confirmText = '确定'
  @property() cancelText = '取消'

  connectedCallback() {
    super.connectedCallback()

    // 默认打开逻辑
    if (this.show) {
      this.togglePicker(true)
    }
    this.lastIndex = this.value
  }

  static get styles() {
    return PickerStyles
  }

  onPickerClick() {
    if (this.disabled) return

    this.togglePicker(true)
  }

  togglePicker(isShow = false) {
    if (isShow) {
      // 解决滚动穿透
      fixedBody(document)

      // 计算传入的index所在位置，提前记录位置并滚动到该区域
      this.lastMovedY = -((this.value * ITEM_HEIGHT) / 2)
      this.move()
    } else {
      // picker关闭时解除滚动传动限制
      looseBody(document)
    }

    this.showPicker = isShow
  }

  onTouchStart(event) {
    // 记录起始位置，方便后续计算滚动距离
    const { y } = getPosition(event)

    this.startY = y
  }

  onTouchMove(event) {
    const { y } = getPosition(event)
    this.movedY = y - this.startY

    this.move(this.movedY)
  }

  onTouchEnd() {
    this.startY = 0
    // 计算最新的偏移距离
    const lastMovedY = (this.lastMovedY = this.lastMovedY + this.movedY)
    const height = (ITEM_HEIGHT / 2) * (this.range.length - 1)

    // 如果滚动距离超出范围，做边界处理
    if (Math.abs(lastMovedY) > height || lastMovedY > 0) {
      this.lastMovedY = lastMovedY > 0 ? 0 : -height
      this.move()
    } else {
      // 计算当前滚动距离离哪个元素更近
      const index = this.getClosestIndex(lastMovedY)
      // 计算出下标并滚动以确保滚动距离始终为 ITEM_HEIGHT 的倍数
      this.lastMovedY = -((index * ITEM_HEIGHT) / 2)
      this.move()
    }
  }

  move(moveY = 0) {
    // 将当前计算的距离转换成rem保证各分辨率的适配
    const value = rpxToRem(2 * (moveY + this.lastMovedY))

    this.styles = { transform: `translate3d(0, ${value}, 0)` }
  }

  // 根据当前滚动距离获取最近的节点
  getClosestIndex(distance) {
    // 将 rpx 单位转换成rem做计算用于适配
    const itemHeight = parseFloat(rpxToRem(ITEM_HEIGHT))
    const currentHeight: number = Math.abs(parseFloat(rpxToRem(2 * distance)))

    const num = parseInt(currentHeight / itemHeight + '')
    const extra = (currentHeight - itemHeight * num) / itemHeight

    // 判断多出的距离是否大于边界因子（0.4效果比较好），如果大于就滚动到下一个元素
    if (extra >= RATE) return num + 1
    return num
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

  onConfirm() {
    const index = this.getClosestIndex(this.lastMovedY)

    if (index === this.lastIndex) {
      this.dispatch('no-change', { value: index })
      return
    }

    this.value = index
    this.lastIndex = index
    this.dispatch('change', { value: index })
    this.togglePicker()
  }

  onCancel() {
    this.dispatch('cancel', { value: this.value })
    this.togglePicker()
  }

  getName(item) {
    return typeof item === 'object' ? item[this['range-key']] : item
  }

  render() {
    const classes = { 'picker-container--show': this.showPicker }

    return html`
      <slot @click="${this.onPickerClick}"></slot>
      <slot name="picker"> </slot>
      <div class="picker-container ${classMap(classes)}">
        <div class="picker-mask"></div>

        <div
          class="picker-main ${isIos()
            ? 'picker-main--ios'
            : 'picker-main--android'}"
        >
          <div class="picker-main-header">
            ${isIos()
              ? html`<p class="picker-btn" @click="${this.onCancel}">
                  ${this.cancelText}
                </p>`
              : null}
            ${this.title
              ? html`<p class="picker-title">${this.title}</p>`
              : null}
            ${isIos()
              ? html`<p class="picker-btn" @click="${this.onConfirm}">
                  ${this.confirmText}
                </p>`
              : null}
          </div>
          <div
            class="picker-main-content"
            @touchstart="${this.onTouchStart}"
            @touchmove="${this.onTouchMove}"
            @touchend="${this.onTouchEnd}"
          >
            <div class="picker-content-mask"></div>
            <div class="picker-content-indicator"></div>
            <div class="picker-content-list" style="${styleMap(this.styles)}">
              ${this.range.map(
                (item) => html`
                  <div class="picker-content-item">${this.getName(item)}</div>
                `
              )}
            </div>
          </div>

          ${!isIos()
            ? html`
                <footer class="picker-footer-group">
                  <p class="picker-btn-android" @click="${this.onCancel}">
                    取消
                  </p>
                  <p class="picker-btn-android" @click="${this.onConfirm}">
                    确定
                  </p>
                </footer>
              `
            : null}
        </div>
      </div>
    `
  }
}
