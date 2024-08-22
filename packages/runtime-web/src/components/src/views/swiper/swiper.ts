import { html, internalProperty, LitElement } from 'lit-element'
import { classMap } from 'lit-html/directives/class-map'
import { styleMap } from 'lit-html/directives/style-map'
import get from 'lodash.get'
import boolConverter from '../../utils/bool-converter'
import { attributes, properties } from './property'
import { styles } from './style'

let SWIPER_ID = 0

export default class TigaSwiper extends LitElement {
  swiperId = SWIPER_ID++

  elementChildren = []

  static get properties() {
    return {
      /**
       * 是否显示指示点
       */
      [properties.INDICATOR_DOTS]: {
        converter: boolConverter,
        attribute: attributes.INDICATOR_DOTS
      },
      /**
       * 指示点颜色
       */
      [properties.INDICATOR_COLOR]: {
        type: String,
        attribute: attributes.INDICATOR_COLOR
      },
      /**
       * 当前选中指示点颜色
       */
      [properties.INDICATOR_ACTIVE_COLOR]: {
        type: String,
        attribute: attributes.INDICATOR_ACTIVE_COLOR
      },
      /**
       * 是否自动切换
       */
      [properties.AUTOPLAY]: {
        converter: boolConverter,
        attribute: attributes.AUTOPLAY
      },
      /**
       * 当前页面的index
       */
      [properties.CURRENT]: { type: Number, attribute: attributes.CURRENT },
      /**
       * 滑动动画时长（ms）
       */
      [properties.DURATION]: { type: Number, attribute: attributes.DURATION },
      /**
       * 自动切换时间间隔（ms）
       */
      [properties.INTERVAL]: { type: Number, attribute: attributes.INTERVAL },
      /**
       * 是否启动无限滑动（ms）
       */
      [properties.CIRCULAR]: {
        converter: boolConverter,
        attribute: attributes.CIRCULAR
      },
      /**
       * 滑动方向是否为纵向
       */
      [properties.VERTICAL]: {
        converter: boolConverter,
        attribute: attributes.VERTICAL
      },
      /**
       * 前边距 px
       */
      [properties.PREVIOUS_MARGIN]: {
        type: String,
        attribute: attributes.PREVIOUS_MARGIN
      },
      /**
       * 后边距 px
       */
      [properties.NEXT_MARGIN]: {
        type: String,
        attribute: attributes.NEXT_MARGIN
      },
      [properties.CLASS]: { type: String, attribute: attributes.CLASS },
      /**
       * 是否禁止用户touch 操作
       */
      [properties.DISABLE_TOUCH]: {
        converter: boolConverter,
        attribute: attributes.DISABLE_TOUCH
      },
      /**
       * 用户滑动角度
       */
      [properties.TOUCH_ANGLE]: {
        type: Number,
        attribute: attributes.TOUCH_ANGLE
      },
      /**
       * 滑动距离阈值
       */
      [properties.SWIPE_RATIO]: {
        type: Number,
        attribute: attributes.SWIPE_RATIO
      }
    }
  }

  @internalProperty() swiper = null

  @internalProperty() swiperWrapper = null

  @internalProperty() realIndex

  @internalProperty() updating = false

  @internalProperty() slideWrapperObserver: MutationObserver

  constructor() {
    super()

    this.initProperties()
  }

  initProperties() {
    this[properties.INDICATOR_DOTS] = false
    this[properties.INDICATOR_COLOR] = 'rgba(0,0,0,.3)'
    this[properties.INDICATOR_ACTIVE_COLOR] = '#108ee9'
    this[properties.AUTOPLAY] = false
    this[properties.CURRENT] = 0
    this[properties.DURATION] = 500
    this[properties.INTERVAL] = 5000
    this[properties.CIRCULAR] = false
    this[properties.VERTICAL] = false
    this[properties.DISABLE_TOUCH] = false
    this[properties.TOUCH_ANGLE] = 45
  }

  createRenderRoot() {
    return this
  }

  connectedCallback() {
    this.elementChildren = Array.from(this.children)
    this.elementChildren.forEach((node) => node.classList.add('swiper-slide'))
    super.connectedCallback()
  }

  firstUpdated = async () => {
    this.overwriteDomOperation()
    try {
      await this.loadScript()
    } catch (e) {
      console.error(e)
      return
    }

    const container = this.querySelector(
      `.tiga-swiper-${this.swiperId} > .swiper-container`
    )
    const pagination = this.querySelector(
      `.tiga-swiper-${this.swiperId} > .swiper-container > .swiper-pagination`
    )

    const options: any = {
      pagination: { el: pagination },
      direction: this[properties.VERTICAL] ? 'vertical' : 'horizontal',
      loop: this[properties.CIRCULAR],
      initialSlide: this[properties.CURRENT],
      threshold: 5,
      speed: this[properties.DURATION],
      observer: true,
      touchStartPreventDefault: false,
      touchStartForcePreventDefault: false,
      allowTouchMove: !this[properties.DISABLE_TOUCH],
      touchAngle: this[properties.TOUCH_ANGLE],
      on: {
        transitionEnd: () => {
          const event = new CustomEvent('animationEnd', {
            detail: {
              current: (this.swiper && this.swiper.realIndex) || 0,
              source: ''
            },
            bubbles: true
          })
          this.dispatchEvent(event)
        },
        slideChangeTransitionStart: () => {
          if (!this.swiper || !this.swiper.initialized) return

          const $wrapperEl = this.swiper.$wrapperEl
          const params = this.swiper.params
          // 替换duplicate slide，避免duplicate slide不更新
          $wrapperEl
            .children(
              '.' + params.slideClass + '.' + params.slideDuplicateClass
            )
            .each(function () {
              const idx = this.getAttribute('data-swiper-slide-index')
              this.innerHTML = $wrapperEl
                .children(
                  '.' +
                    params.slideClass +
                    '[data-swiper-slide-index="' +
                    idx +
                    '"]:not(.' +
                    params.slideDuplicateClass +
                    ')'
                )
                .html()
            })
        },
        slideChangeTransitionEnd: () => {
          if (!this.swiper || !this.swiper.initialized) return

          const event = new CustomEvent('change', {
            detail: {
              current: this.swiper.realIndex,
              source: ''
            },
            bubbles: true
          })

          this.dispatchEvent(event)
        },
        observerUpdate: (e) => {
          if (this.updating) return

          this.updating = true

          if (e.addedNodes.length > 0 || e.removedNodes.length > 0) {
            if (this[properties.CIRCULAR]) {
              this.swiper.loopDestroy()
              this.swiper.loopCreate()
            }
          }

          setTimeout(() => (this.updating = false), 100)
        }
      }
    }

    if (this[properties.SWIPE_RATIO]) {
      options.touchRatio = this[properties.SWIPE_RATIO]
    }

    if (this[properties.AUTOPLAY]) {
      options.autoplay = {
        delay: this[properties.INTERVAL],
        disableOnInteraction: false
      }
    }

    this.swiper = new window.Swiper(container, options)
    this.observeSlideWrapper()
  }

  observeSlideWrapper = () => {
    const wrapperEl = this.swiper.$wrapperEl?.[0]
    if (!wrapperEl) return

    this.slideWrapperObserver = new MutationObserver(this.handleAutoPlayListen)
    this.slideWrapperObserver.observe(wrapperEl, { childList: true })
  }

  handleAutoPlayListen = () => {
    const slides = this.swiperWrapper?.querySelectorAll('.swiper-slide') || []
    // loop状态下，有3个silde时表示仅一个有效slide，无需autoplay
    if (
      this[properties.CIRCULAR] &&
      slides.length === 3 &&
      this[properties.AUTOPLAY]
    ) {
      this.swiper.autoplay && this.swiper.autoplay.stop()
    } else if (this[properties.AUTOPLAY]) {
      if (this.swiper.params.autoplay.disableOnInteraction === true) {
        this.swiper.params.autoplay.disableOnInteraction = false
      }
      this.swiper.params.autoplay.delay = this[properties.INTERVAL]
      this.swiper.autoplay && this.swiper.autoplay.start()
    }
  }

  loadScript = () =>
    new Promise((resolve, reject) => {
      if (window.Swiper) {
        resolve('')
        return
      }
      const defaultCdnUrl =
        'https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.4.2/js/swiper.min.js'
      const cndUrl = get(
        window.$MOR_APP_CONFIG,
        'components.swiper.cdnUrl',
        defaultCdnUrl
      )

      const scriptElement = document.createElement('script')
      scriptElement.src = cndUrl
      scriptElement.onload = () => resolve('')
      scriptElement.onerror = () => reject(new Error('failed to load swiper'))
      document.getElementsByTagName('head')[0].appendChild(scriptElement)
    })

  isElementNode = (element: HTMLElement) => {
    return element && element.nodeType === 1
  }

  overwriteDomOperation() {
    this.swiperWrapper = this.querySelector(
      `.tiga-swiper-${this.swiperId} > .swiper-container > .swiper-wrapper`
    ) as any
    ;(this as any).appendChild = (newChild: HTMLElement) => {
      if (!this.isElementNode(newChild)) return

      newChild.classList.add('swiper-slide')
      return this.swiperWrapper.appendChild(newChild)
    }
    ;(this as any).insertBefore = (
      newChild: HTMLElement,
      refChild: HTMLElement
    ) => {
      if (!this.isElementNode(newChild) || !this.isElementNode(refChild)) return

      newChild.classList.add('swiper-slide')
      return this.swiperWrapper.insertBefore(newChild, refChild)
    }
    ;(this as any).replaceChild = (
      newChild: HTMLElement,
      oldChild: HTMLElement
    ) => {
      if (!this.isElementNode(newChild) || !this.isElementNode(oldChild)) return

      newChild.classList.add('swiper-slide')
      return this.swiperWrapper.replaceChild(newChild, oldChild)
    }
    ;(this as any).removeChild = (oldChild: HTMLElement) => {
      if (!this.isElementNode(oldChild)) return

      return this.swiperWrapper.removeChild(oldChild)
    }
  }

  updated(changedProperties) {
    changedProperties.has(properties.AUTOPLAY) &&
      changedProperties.get(properties.AUTOPLAY) !== undefined &&
      this.watchAutoPlay()
    changedProperties.has(properties.DURATION) &&
      changedProperties.get(properties.DURATION) !== undefined &&
      this.watchDuration()
    changedProperties.has(properties.CURRENT) &&
      changedProperties.get(properties.CURRENT) !== undefined &&
      this.watchCurrent()
    changedProperties.has(properties.INTERVAL) &&
      changedProperties.get(properties.INTERVAL) !== undefined &&
      this.watchInterval()
  }

  watchAutoPlay() {
    if (
      !this.swiper?.autoplay ||
      this.swiper.autoplay.running === this[properties.AUTOPLAY]
    )
      return

    if (this[properties.AUTOPLAY]) {
      if (this.swiper.params.autoplay.disableOnInteraction === true) {
        this.swiper.params.autoplay.disableOnInteraction = false
      }
      this.swiper.params.autoplay.delay = this[properties.INTERVAL]
      this.swiper.autoplay && this.swiper.autoplay.start()
    } else {
      this.swiper.autoplay && this.swiper.autoplay.stop()
    }
  }

  watchCurrent() {
    if (!this.swiper || isNaN(this[properties.CURRENT])) return

    if (this[properties.CIRCULAR]) {
      if (!this.swiper.isBeginning && !this.swiper.isEnd) {
        this.swiper.slideToLoop(this[properties.CURRENT])
      }
    } else {
      this.swiper.slideTo(this[properties.CURRENT])
    }
  }

  watchDuration() {
    if (!this.swiper) return

    this.swiper.params.speed = this[properties.DURATION]
  }

  watchInterval() {
    if (!this.swiper) return

    this.swiper.params.autoplay.delay = this[properties.INTERVAL]
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    this.slideWrapperObserver?.disconnect()
    this.swiper.destroy()
    this.swiper = null
  }

  render() {
    const indicatorDots = this[properties.INDICATOR_DOTS]
    const indicatorColor = this[properties.INDICATOR_COLOR]
    const indicatorActiveColor = this[properties.INDICATOR_ACTIVE_COLOR]
    const tigaSwiperCls = `tiga-swiper-${this.swiperId}`
    const paginationCls = {
      'swiper-pagination': true,
      'swiper-pagination-hidden': !indicatorDots,
      'swiper-pagination-bullets': indicatorDots
    }
    const [, previousMargin] =
      /^(\d+(\.\d+)?)(rpx|px)/.exec(this[properties.PREVIOUS_MARGIN]) || []
    const [, nextMargin] =
      /^(\d+(\.\d+)?)(rpx|px)/.exec(this[properties.NEXT_MARGIN]) || []
    const pM = parseInt(previousMargin) || 0
    const nM = parseInt(nextMargin) || 0

    const swiperContainerStyle = {
      overflow: 'visible',
      height: 'inherit'
    } as any

    // host style
    // this.style.cssText.split(';').forEach(style => {
    //   const styleSplited = style.split(':')
    //   swiperContainerStyle[styleSplited[0]] = styleSplited[1];
    // })

    if (this[properties.VERTICAL]) {
      swiperContainerStyle.marginTop = `${pM}px`
      swiperContainerStyle.marginBottom = `${nM}px`
    } else {
      swiperContainerStyle.width = 'auto'
      swiperContainerStyle.marginLeft = `${pM}px`
      swiperContainerStyle.marginRight = `${nM}px`
    }

    return html`
      <style>
        tiga-swiper {
          display: block;
        }
        ${styles}
          .tiga-swiper-${this.swiperId}
          > .swiper-container
          > .swiper-pagination
          > .swiper-pagination-bullet {
          background: ${indicatorColor} !important;
        }
        .tiga-swiper-${this.swiperId}
          > .swiper-container
          > .swiper-pagination
          > .swiper-pagination-bullet-active {
          background: ${indicatorActiveColor} !important;
        }
        .tiga-swiper {
          overflow: hidden;
          height: inherit;
          width: inherit;
        }
      </style>
      <div class="${tigaSwiperCls} tiga-swiper">
        <div
          class="${this[properties.CLASS]} swiper-container"
          style=${styleMap(swiperContainerStyle)}
        >
          <div class="swiper-wrapper">${this.elementChildren}</div>
          <div class=${classMap(paginationCls)}></div>
        </div>
      </div>
    `
  }
}
