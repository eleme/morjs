import { LitElement, property } from 'lit-element'
import { TiGaEvent } from './TigaEvent'
import { addFocusToInputTypeElement, isMobile } from './utils'
import { autoRun, KEY_ANIMATION, parseAnimation2Style } from './utils/animation'
import boolConverter from './utils/bool-converter'

const LongTapTimeStamp = 500 // 处理长按事件的超时时间

export class BaseElement extends LitElement {
  private hoverTouchStartHandler: OmitThisParameter<() => void>
  private hoverTouchEndHandler: OmitThisParameter<() => void>

  constructor() {
    super()
    this.hoverTouchStartHandler = this._onTouchStart.bind(this)
    this.hoverTouchEndHandler = this._onTouchEnd.bind(this)
  }
  private eventListenerMap = new Map()
  /* 长按time，用于清除 */
  private longTimeId = null
  /**
   * 点击的时候是否执行blue
   */
  protected blurOnClick = true
  /**
   * 是否启用hover功能
   */
  protected enableHover = false

  @property({ converter: boolConverter })
  disabled = false;

  @property({ type: String })
  ['hover-class'] = ''

  @property({ type: Object, attribute: KEY_ANIMATION }) customAnimation

  /**
   * tag获得焦点，与tabindex配合使用，为避免与focus方法重名，取名tigaFocus
   */
  @property({ type: boolConverter }) tigaFocus = false

  attributeChangedCallback(name, oldvalue, newvalue) {
    if (name === KEY_ANIMATION && oldvalue !== newvalue) {
      autoRun(
        () => parseAnimation2Style(newvalue, this),
        (value) => {
          this.setAttribute('style', value)
        }
      )
    }

    super.attributeChangedCallback(name, oldvalue, newvalue)

    if (name === 'tigafocus' && newvalue === 'true') {
      requestAnimationFrame(() => this.focus())
    }
  }

  /**
   * 触摸事件
   */
  private handleTouchEvent(eventName: string, e: TouchEvent) {
    if (e instanceof TouchEvent) {
      ;(e as any).other = {
        touches: e.touches,
        changedTouches: e.changedTouches
      }
      // 参考文档： https://w3c.github.io/touch-events/#mouse-events
      // 在既支持touch 事件，又支持mouce事件的设备上，同时绑定 touch 和mouse 事件。然后在 touchend 的事件中调用 preventDefault 。那么就不会触发 mouse 事件
      if (eventName === 'touchend') {
        addFocusToInputTypeElement(e.target)
        e.preventDefault()
      }
    }
  }

  private handleTouchEventMobile(e: TouchEvent) {
    if (e instanceof TouchEvent) {
      ;(e as any).other = {
        touches: e.touches,
        changedTouches: e.changedTouches
      }
    }
  }
  /**
   * 鼠标事件
   * @param e
   */
  private handleMouseEvent(eventName: string, e: MouseEvent) {
    if (e instanceof MouseEvent) {
      switch (eventName) {
        case 'touchmove':
        case 'touchstart': {
          if (e.buttons !== 1 || !this.contains(e.target as any)) {
            return
          }
          break
        }
      }
      e.stopImmediatePropagation()
      const touches = [
        {
          pageX: e.pageX,
          pageY: e.pageY,
          clientX: e.clientX,
          clientY: e.clientY
        }
      ]
      this.dispatchEvent(
        new TiGaEvent(eventName, {
          bubbles: true,
          composed: false,
          other: {
            touches,
            changedTouches: touches
          }
        })
      )
    }
  }

  // _handleClicked = (e) => {
  //   e.stopPropagation();
  //   this.dispatchEvent(new CustomEvent('tap', {
  //     detail: {},
  //     bubbles: true,
  //     composed: true
  //   }));
  // }
  /**
   * 防止因为setData 导致多次注册事件。
   */
  private mobileTouchEventCache = new Map()
  addEventListener(type, callback, options?) {
    if (isMobile()) {
      switch (type) {
        case 'touchmove':
        case 'touchend':
        case 'touchstart': {
          const cache = this.mobileTouchEventCache.get(callback) || {}
          if (!cache[type]) {
            cache[type] = true
            this.mobileTouchEventCache.set(callback, cache)
            const mobileTouchEventHandler = this.mergeFunc(
              this.handleTouchEventMobile,
              callback
            )
            this.eventListenerMap.set(type, mobileTouchEventHandler)
            super.addEventListener(type, mobileTouchEventHandler)
          }
          return
        }
      }
    }
    switch (type) {
      case 'touchstart': {
        const touchEventHandler = this.mergeFunc(
          this.handleTouchEvent.bind(this, 'touchstart'),
          callback
        )
        const mouseEventHandler = this.handleMouseEvent.bind(this, 'touchstart')

        this.eventListenerMap.set(type, touchEventHandler)
        this.eventListenerMap.set('mousedown', mouseEventHandler)

        super.addEventListener(type, touchEventHandler)
        super.addEventListener('mousedown', mouseEventHandler)
        break
      }

      case 'touchmove': {
        const touchEventHandler = this.mergeFunc(
          this.handleTouchEvent.bind(this, 'touchmove'),
          callback
        )
        const mouseEventHandler = this.handleMouseEvent.bind(this, 'touchmove')

        this.eventListenerMap.set(type, touchEventHandler)
        this.eventListenerMap.set('mousemove', mouseEventHandler)

        super.addEventListener(type, touchEventHandler)
        super.addEventListener('mousemove', mouseEventHandler)
        break
      }

      case 'touchend': {
        const touchEventHandler = this.mergeFunc(
          this.handleTouchEvent.bind(this, 'touchend'),
          callback
        )
        const mouseEventHandler = this.handleMouseEvent.bind(this, 'touchend')

        this.eventListenerMap.set(type, touchEventHandler)
        this.eventListenerMap.set('mouseup', mouseEventHandler)

        super.addEventListener(type, touchEventHandler)
        super.addEventListener('mouseup', mouseEventHandler)
        break
      }
      default: {
        this.eventListenerMap.set(type, callback)
        super.addEventListener(type, callback, options)
        break
      }
    }
  }
  private mergeFunc(func1, func2) {
    return function (...args) {
      typeof func1 === 'function' && func1(...args)
      typeof func2 === 'function' && func2(...args)
    }
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.enableHover) {
      // 本身的事件监听是无需考虑remove的。除非window 全局的事件才需要考虑 remove
      super.addEventListener('touchstart', this.hoverTouchStartHandler)
      super.addEventListener('touchend', this.hoverTouchEndHandler)
    }

    // 添加tap longtap 事件的处理代码
    this.addEventListener('touchstart', this._handleClickedStart)
    this.addEventListener('touchmove', this._handleClickedMove)
    this.addEventListener('touchend', this._handleClickedEnd)
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    /** 如果dom节点在react事件didMount或者didUpdate之后发生移动，
     * 即会触发卸载动作，进而解绑事件，引发bug。例如swiper组件，暂时先去除此处的优化 */

    // if (this.enableHover) {
    //   super.removeEventListener('touchstart', this.hoverTouchStartHandler);
    //   super.removeEventListener('touchend', this.hoverTouchEndHandler);
    // }
    // this.eventListenerMap.forEach((value, key) => {
    //   super.removeEventListener(key, value);
    // });

    this.eventListenerMap.clear()
  }

  private canHandleTap = false
  private startTouch: Touch
  private moveTouch: Touch
  _handleClickedStart = (e: TouchEvent) => {
    if (e.target === e.currentTarget) {
      this.startTouch = e.touches[0]
      this.moveTouch = undefined
      this.canHandleTap = true
      this.longTimeId = setTimeout(() => {
        this.riaseTapEvent(true)
        this.longTimeId = null
      }, LongTapTimeStamp)
    }
  }

  _handleClickedMove = (e: TouchEvent) => {
    if (e.target === e.currentTarget) {
      this.moveTouch = e.touches[0]
    }
  }

  private riaseTapEvent(isLongTap) {
    if (this.canHandleTap) {
      this.canHandleTap = false
      if (this.moveTouch) {
        const diffX = this.moveTouch.clientX - this.startTouch.clientX
        const diffY = this.moveTouch.clientY - this.startTouch.clientY
        if (Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)) > 5) {
          return
        }
      }

      if (this.disabled) return

      if (this.blurOnClick) {
        ;(<any>document.activeElement).blur()
      }

      if (isLongTap) {
        this.dispatchEvent(
          new TiGaEvent('longtap', {
            detail: {},
            bubbles: true,
            composed: false
          })
        )
      } else {
        this.dispatchEvent(
          new TiGaEvent('tap', {
            detail: {},
            bubbles: true,
            composed: false
          })
        )
      }
    }
  }

  _handleClickedEnd = (e: Event) => {
    if (e.target === e.currentTarget) {
      this.riaseTapEvent(false)
    }

    // 如果此时还有值，说明不足以触发长按事件，则直接清除
    if (this.longTimeId) {
      clearTimeout(this.longTimeId)
      this.longTimeId = null
    }
  }

  private _onTouchStart() {
    if (!this.disabled) {
      this.onHoverIn()
    }
  }

  private _onTouchEnd() {
    if (!this.disabled) {
      this.onHoverOut()
    }
  }

  /**
   * 进入hover 状态
   */
  protected onHoverIn() {
    this.setAttribute('isHover', 'true')
    const hoverClass = this['hover-class']
    if (hoverClass) {
      hoverClass.split(' ').forEach((item) => {
        if (item) this.classList.add(item)
      })
    }
  }

  /**
   * 离开hover 状态
   */
  protected onHoverOut() {
    this.removeAttribute('isHover')
    const hoverClass = this['hover-class']
    if (hoverClass) {
      hoverClass.split(' ').forEach((item) => {
        if (item) this.classList.remove(item)
      })
    }
  }
}
