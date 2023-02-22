import {
  eventOptions,
  html,
  internalProperty,
  property,
  query,
  queryAssignedNodes
} from 'lit-element'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../../baseElement'
import { rpxToRem } from '../../rpx'
import { INDICATOR_TOP, RATE } from './constants'
import { DEFAULT_ITEM_STYLES, Styles } from './index.style'
import { fixedBody, getPosition, looseBody } from './utils'

const maskStyle = 'mask-style'
const maskClass = 'mask-class'
const indicatorStyle = 'indicator-style'
const indicatorClass = 'indicator-class'

export default class PickerViewColumn extends BaseElement {
  // 起始位置，用于计算一次手指滑动距离
  startY = 0
  // 保存移动距离，用于在touchmove和touchend共享变量
  movedY = 0
  // 所有操作偏移之和
  lastMovedY = 0
  // 上次选中的下标，如果本次和上次相同，不触发change事件
  lastIndex = -1
  // 在PC端是否处于点击状态
  isTouch = false
  // 子项高度
  itemHeight;

  @property() [maskStyle] = '';
  @property() [maskClass] = '';
  @property() [indicatorStyle] = '';
  @property() [indicatorClass] = ''
  @property({ type: Number }) value = 0
  // 通过切换transform属性实现滚动效果
  @internalProperty() styles = { transform: 'translate3d(0, 0, 0)' }
  @query('.tiga-picker-column-indicator')
  $indicatorElement
  @query('.tiga-picker-column-container')
  $containerElement
  @query('.tiga-picker-column-mask')
  $maskElement
  @queryAssignedNodes()
  slotNodes

  indicatorTop = INDICATOR_TOP

  static get styles() {
    return Styles
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value') requestAnimationFrame(() => this.moveToSelectValue())

    super.attributeChangedCallback(name, oldValue, newValue)
  }

  moveToSelectValue() {
    let value = this.value
    const { length } = this.slotNodes
    this.lastIndex = value

    if (value > length) value = length

    if (value >= 0) {
      this.lastMovedY = -(value * this.itemHeight)
      this.move()
    }

    if (Math.abs(this.lastMovedY) > Math.abs((length - 1) * this.itemHeight)) {
      this.lastMovedY = -((length - 1) * this.itemHeight)
      this.move()
    }
  }

  initStyles() {
    requestAnimationFrame(() => {
      const height = (this.itemHeight = this.$indicatorElement.offsetHeight)
      const nodes = this.slotNodes
      this.indicatorTop = this.offsetHeight - height
      this.$containerElement &&
        (this.$containerElement.style.cssText = `padding-top: ${rpxToRem(
          this.indicatorTop
        )};`)
      this.$indicatorElement &&
        (this.$indicatorElement.style.cssText = `${
          this[indicatorStyle]
        };top: ${rpxToRem(this.indicatorTop)};`)
      this.$maskElement &&
        (this.$maskElement.style.cssText = `${
          this[maskStyle]
        };background-size: 100% ${rpxToRem(this.indicatorTop)};`)

      nodes.map((item) => {
        if (!item || !item.style) return
        item.style.cssText =
          DEFAULT_ITEM_STYLES +
          `height:${rpxToRem(2 * height)};line-height:${rpxToRem(2 * height)};`
      })
    })
  }

  @eventOptions({ passive: true })
  onTouchStart(event) {
    if (this.isTouch) return
    // 记录起始位置，方便后续计算滚动距离
    const { y } = getPosition(event)

    fixedBody(document)
    this.startY = y
    this.isTouch = true
  }

  @eventOptions({ passive: true })
  onTouchMove(event) {
    if (!this.isTouch) return
    const { y } = getPosition(event)
    this.movedY = y - this.startY

    this.move(this.movedY)
  }

  @eventOptions({ passive: true })
  onMouseLeave() {
    if (!this.isTouch) return
    this.onTouchEnd()
  }

  @eventOptions({ passive: true })
  onTouchEnd() {
    // 计算最新的偏移距离
    const lastMovedY = (this.lastMovedY = this.lastMovedY + this.movedY)
    // 消费完清空，否则会引起二次点击问题
    this.movedY = 0
    const height = this.itemHeight * (this.slotNodes.length - 1)

    looseBody(document)
    this.startY = 0
    // 如果滚动距离超出范围，做边界处理
    if (Math.abs(lastMovedY) > height || lastMovedY > 0) {
      this.lastMovedY = lastMovedY > 0 ? 0 : -height
      this.move()
    } else {
      // 计算当前滚动距离离哪个元素更近
      const index = this.getClosestIndex(lastMovedY)
      // 计算出下标并滚动以确保滚动距离始终为 ITEM_HEIGHT 的倍数
      this.lastMovedY = -(index * this.itemHeight)
      this.move()
    }

    this.dispatch()
    this.isTouch = false
  }

  move(moveY = 0) {
    // 将当前计算的距离转换成rem保证各分辨率的适配
    const value = rpxToRem(2 * (moveY + this.lastMovedY))

    this.styles = { transform: `translate3d(0, ${value}, 0)` }
  }

  // 根据当前滚动距离获取最近的节点
  getClosestIndex(distance) {
    // 将 rpx 单位转换成rem做计算用于适配
    const itemHeight = parseFloat(rpxToRem(2 * this.itemHeight))
    const currentHeight: number = Math.abs(parseFloat(rpxToRem(2 * distance)))

    const num = parseInt(currentHeight / itemHeight + '')
    const extra = (currentHeight - itemHeight * num) / itemHeight

    // 判断多出的距离是否大于边界因子（0.4效果比较好），如果大于就滚动到下一个元素
    if (extra >= RATE) return num + 1
    return num
  }

  dispatch() {
    const index = this.getClosestIndex(this.lastMovedY)

    if (index === this.lastIndex) return
    this.lastIndex = index
    this.dispatchEvent(
      new CustomEvent('private-change', {
        detail: { value: index },
        bubbles: true,
        composed: true
      })
    )
  }

  handleSlotChange() {
    this.initStyles()
  }

  render() {
    return html`
      <section
        class="tiga-picker-column-container"
        @mousedown=${this.onTouchStart}
        @mousemove=${this.onTouchMove}
        @mouseup=${this.onTouchEnd}
        @mouseleave=${this.onMouseLeave}
        @touchstart=${this.onTouchStart}
        @touchmove=${this.onTouchMove}
        @touchend=${this.onTouchEnd}
      >
        <p
          class="tiga-picker-column-mask ${this[maskClass] || ''}"
          style=${this[maskStyle]}
        ></p>
        <div
          class="tiga-picker-column-indicator ${this[indicatorClass] || ''}"
          style="${this[indicatorStyle]}"
        ></div>
        <section
          class="tiga-picker-column-list"
          style="${styleMap(this.styles)}"
        >
          <slot @slotchange=${this.handleSlotChange}></slot>
        </section>
      </section>
    `
  }
}
