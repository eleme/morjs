import { css, html, property } from 'lit-element'
import { BaseElement } from '../baseElement'
import boolConverter from '../utils/bool-converter'
import MovableArea from './movable-area'

/**
 * 可移动的视图容器，在页面中可以拖拽滑动。
 * movable-view 必须在 movable-area 组件中，并且必须是直接子节点，否则不能移动。
 */
export default class MovableView extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `
  }

  /**
   * 定义 x 轴方向的偏移，会换算为 left 属性，如果 x 的值不在可移动范围内，会自动移动到可移动范围。
   */
  @property({ type: Number })
  x = 0

  /**
   * 定义 y 轴方向的偏移，会换算为 top 属性，如果 y 的值不在可移动范围内，会自动移动到可移动范围。
   */
  @property({ type: Number })
  y = 0;

  /**
   * 超过可移动区域后，movable-view 是否还可以移动。
   */
  @property({ converter: boolConverter })
  ['out-of-bounds'] = false

  /**
   * movable-view 的移动方向，属性值有 all、vertical、horizontal、none。
   */
  @property({ type: String })
  direction = 'none'

  connectedCallback() {
    super.connectedCallback()
    if (this.parentElement instanceof MovableArea) {
      // 可以滑动
      this.addEventListener('touchstart', this.onTouchStart, { passive: false })
      this.addEventListener('touchmove', this.onTouchMove, { passive: false })
      this.addEventListener('touchend', this.onTouchEnd, { passive: false })
    }
    this.position.x = this.x
    this.position.y = this.y
    this.updatePosition()
  }

  preventDefault(event) {
    if (this.direction !== 'horizontal') {
      event.preventDefault()
    }
  }

  onTouchStart = (e: TouchEvent) => {
    this.preventDefault(e)
    this.canMove = true
  }

  private canMove = false
  private lastPoint: { clientX; clientY }
  onMouseMove = (e: MouseEvent) => {
    this.preventDefault(e)
    if (e.buttons === 1) {
      // 只有鼠标左键处于按下状态才算
      this.onMove({ clientX: e.clientX, clientY: e.clientY })
    } else {
      if (this.canMove) {
        this.moveEnd()
      }
    }
  }

  onTouchMove = (e: TouchEvent) => {
    this.preventDefault(e)
    const currentTouch = e.touches[0]
    this.onMove({
      clientX: currentTouch.clientX,
      clientY: currentTouch.clientY
    })
  }

  onMove(point: { clientX; clientY }) {
    if (this.lastPoint && this.canMove) {
      const diffX = point.clientX - this.lastPoint.clientX
      const diffY = point.clientY - this.lastPoint.clientY
      switch (this.direction) {
        case 'all': {
          this.position.x += diffX
          this.position.y += diffY
          break
        }

        case 'vertical': {
          this.position.y += diffY
          break
        }

        case 'horizontal': {
          this.position.x += diffX
          break
        }
      }

      this.updatePosition('touch')
    }

    this.lastPoint = point
  }

  onTouchEnd = (e: TouchEvent) => {
    // e.stopPropagation();
    e.preventDefault()
    this.moveEnd()
  }

  moveEnd() {
    this.lastPoint = null
    this.canMove = false
    this.dispatchEvent(
      new CustomEvent('changeend', {
        detail: {
          x: this.position.x,
          y: this.position.y
        }
      })
    )
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
    switch (name) {
      case 'x': {
        this.position.x = newVal
        this.updatePosition()
        break
      }
      case 'y': {
        this.position.y = newVal
        this.updatePosition()
        break
      }
    }
  }

  private position = {
    x: 0,
    y: 0
  }

  private updatePosition(source = 'setData') {
    if (this.disabled) return
    if (!this['out-of-bounds'] && this.parentElement) {
      if (this.parentElement.clientWidth >= this.clientWidth) {
        this.position.x = Math.min(
          Math.max(0, this.position.x),
          this.parentElement.clientWidth - this.clientWidth
        )
      } else {
        this.position.x = Math.max(
          Math.min(0, this.position.x),
          this.parentElement.clientWidth - this.clientWidth
        )
      }

      if (this.parentElement.clientHeight >= this.clientHeight) {
        this.position.y = Math.min(
          Math.max(0, this.position.y),
          this.parentElement.clientHeight - this.clientHeight
        )
      } else {
        this.position.y = Math.max(
          Math.min(0, this.position.y),
          this.parentElement.clientHeight - this.clientHeight
        )
      }
    }
    this.style.setProperty('margin-left', this.position.x + 'px')
    this.style.setProperty('margin-top', this.position.y + 'px')

    // NOTE: 事件
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          x: this.position.x,
          y: this.position.y,
          source
        }
      })
    )
  }

  render() {
    return html` <slot></slot> `
  }
}
