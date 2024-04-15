import {
  css,
  html,
  internalProperty,
  LitElement,
  property,
  query
} from 'lit-element'
import get from 'lodash.get'
import { rpxToRem } from '../rpx'
import {
  converterForPx,
  defineElement,
  getCurrentPageParams,
  getNav,
  getPageConfig,
  isUndefined,
  shouldEnableFor
} from '../utils'
import boolConverter from '../utils/bool-converter'
import { uuid } from '../utils/index'
import {
  DefualtPageConfig,
  IPageConfig,
  IPageHost,
  PullDownRefreshEventName,
  ReachBottomEventName,
  ScrollEventName
} from './IPage'

const defaultTitleBarHeight = rpxToRem(88)
const defaultStatusBarHeight = 0

enum PullRefreshState {
  Normal = 0, // 正常
  Pulling = 1, // 正在下拉
  WillRefresh = 2, // 松开即可刷新
  Refreshing = 3 // 正在刷新
}

const PullRefreshRefreshingHeight = 44
const MaxPullTop = 88

const TransparentHeaderDefaultOpacity = 0

export default class PageHost extends LitElement implements IPageHost {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        font-size: 16px;
      }

      .content {
        position: relative;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .content::-webkit-scrollbar {
        display: none; /* Chrome Safari */
      }

      .pull-header {
        text-align: center;
        color: #1890ff;
        position: absolute;
        left: 0;
        width: 100%;
        transform: translateY(-100%);
      }
    `
  }

  static get properties() {
    return {
      pullRefreshState: { type: Number }
    }
  }

  get isAutoTransparent() {
    return this.config.transparentTitle === 'auto'
  }

  private config: IPageConfig = DefualtPageConfig

  @internalProperty()
  headerOpacity = TransparentHeaderDefaultOpacity

  @query('.content')
  contentElement: HTMLDivElement;

  @property({ converter: boolConverter })
  ['show-header']: boolean = true;

  // header 上是否展示返回按钮
  @property({ converter: boolConverter })
  ['show-back']: boolean = false;

  @property({
    converter: converterForPx
  })
  ['title-bar-height']: string | number = defaultTitleBarHeight;

  @property({
    converter: converterForPx
  })
  ['status-bar-height']: string | number = defaultStatusBarHeight

  /**
   * 注意释放
   */
  private styleElement: HTMLStyleElement
  setConfig(config: IPageConfig) {
    this.config = { ...this.config, ...config }
    // 业务在页面打开时有覆盖页面配置的场景
    const updatePageConfig = get(window.$MOR_APP_CONFIG, 'updatePageConfig')
    if (updatePageConfig) {
      const { path: pagePath, options: pageOptions } = getCurrentPageParams([
        'path',
        'options'
      ])
      const resultConfig = getPageConfig(
        updatePageConfig,
        pagePath,
        pageOptions
      )

      if (typeof resultConfig === 'object')
        this.config = Object.assign(this.config, resultConfig)
    }
    // 强制渲染
    this.requestUpdate()
    // NOTE: 页面背景色
    if (
      config.backgroundColor &&
      window.getComputedStyle(this).backgroundColor === 'rgba(0, 0, 0, 0)'
    ) {
      if (!this.styleElement) {
        this.styleElement = document.createElement('style')
        this.classList.add(`page-${uuid()}`)
        document.head.appendChild(this.styleElement)
      }
      this.styleElement.innerHTML = `
      .${this.className}{
        background-color:${config.backgroundColor};
      }
       `
    }

    if (this.config.showTitleLoading) {
      this.showNavigationBarLoading()
    }

    try {
      const { defaultTitle } = this.config
      document.title = typeof defaultTitle === 'undefined' ? '' : defaultTitle
    } catch (e) {}
  }

  getConfig() {
    return this.config
  }

  connectedCallback() {
    super.connectedCallback()
    setTimeout(() => {
      this.contentElement.addEventListener('touchmove', this.onTouchMove, {
        passive: true
      })
      this.contentElement.addEventListener('touchend', this.onTouchEnd, {
        passive: true
      })
      this.contentElement.addEventListener('scroll', this.onScroll, {
        passive: true
      })
    }, 0)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.styleElement) {
      this.styleElement.remove()
    }

    this.contentElement.removeEventListener('touchmove', this.onTouchMove)
    this.contentElement.removeEventListener('touchend', this.onTouchEnd)
    this.contentElement.removeEventListener('scroll', this.onScroll)
  }

  private canHandleReachBottom = true
  private onScroll = () => {
    const content = this.contentElement
    const scrollTop = content.scrollTop
    const clientHeight = content.clientHeight
    const scrollHeight = content.scrollHeight

    // 支持onPageScroll
    this.dispatchEvent(
      new CustomEvent(ScrollEventName, { detail: { scrollTop, scrollHeight } })
    )

    if (
      scrollHeight > clientHeight &&
      scrollHeight - scrollTop - clientHeight <=
        (this.config.onReachBottomDistance || 20)
    ) {
      if (this.canHandleReachBottom) {
        this.canHandleReachBottom = false
        this.dispatchEvent(new CustomEvent(ReachBottomEventName))
      }
    } else {
      this.canHandleReachBottom = true
    }

    if (this.isAutoTransparent) {
      // 0.5：表示滚动条滚动的位置如果超过了 clientHeight 的 0.5倍，那么将header 的  opacity 设为1
      this.headerOpacity =
        TransparentHeaderDefaultOpacity +
        (1 - TransparentHeaderDefaultOpacity) *
          Math.min(1, scrollTop / (clientHeight * 0.5))
    }
  }

  /**
   * 是否启用下拉刷新功能
   */
  public enbalePullRefresh = false

  private lastTouchPoint: Touch
  private _pullRefreshState: PullRefreshState = PullRefreshState.Normal
  get pullRefreshState() {
    return this._pullRefreshState
  }

  set pullRefreshState(value) {
    if (value !== this._pullRefreshState) {
      const oldVal = this._pullRefreshState
      this._pullRefreshState = value
      this.requestUpdate('pullRefreshState', oldVal)
      if (value === PullRefreshState.Refreshing) {
        this.animationPaddingTop(PullRefreshRefreshingHeight)
        // 触发事件
        this.dispatchEvent(new CustomEvent(PullDownRefreshEventName))
      } else if (this.pullRefreshState === PullRefreshState.Normal) {
        this.animationPaddingTop(0)
      }
    }
  }

  startPullDownRefresh() {
    this.pullRefreshState = PullRefreshState.Refreshing
  }

  stopPullDownRefresh() {
    this.pullRefreshState = PullRefreshState.Normal
  }

  private animationPaddingTop(top) {
    const options = {
      iterationStart: 0,
      direction: 'alternate',
      duration: 200,
      fill: 'forwards',
      easing: 'ease-in'
    }
    const keyframes = {
      easing: 'ease-out',
      paddingTop: rpxToRem(top * 2)
    }
    const a = this.contentElement.animate(keyframes, options as any)
    a.addEventListener('finish', () => {
      // 动画结束后，删除动画，并且将属性设为最终的值
      a.cancel()
      this.contentElement.style.setProperty('padding-top', rpxToRem(top * 2))
    })
  }

  onTouchMove = (e: TouchEvent) => {
    if (!this.enbalePullRefresh) return
    const currentTouch = e.touches[0]
    const content = this.contentElement
    if (this.pullRefreshState === PullRefreshState.Refreshing) return
    if (this.lastTouchPoint) {
      const diffY = currentTouch.clientY - this.lastTouchPoint.clientY
      if (content.scrollTop <= 0) {
        const paddingTop =
          parseFloat(window.getComputedStyle(content).paddingTop) || 0
        const top = paddingTop + diffY
        content.style.setProperty(
          'padding-top',
          Math.min(
            top,
            MaxPullTop *
              (parseFloat(document.documentElement.style.fontSize) / 16)
          ) + 'px'
        )

        if (this.pullRefreshState === PullRefreshState.Normal) {
          this.pullRefreshState = PullRefreshState.Pulling
        }

        if (top >= PullRefreshRefreshingHeight) {
          this.pullRefreshState = PullRefreshState.WillRefresh
        }
      }
    }
    this.lastTouchPoint = currentTouch
  }

  onTouchEnd = () => {
    if (this.pullRefreshState !== PullRefreshState.Normal) {
      if (this.pullRefreshState === PullRefreshState.WillRefresh) {
        this.pullRefreshState = PullRefreshState.Refreshing
      } else if (this.pullRefreshState === PullRefreshState.Pulling) {
        this.pullRefreshState = PullRefreshState.Normal
      }
    }
  }

  private headerLoading: boolean = false
  public showNavigationBarLoading() {
    this.headerLoading = true
    this.requestUpdate()
  }

  public hideNavigationBarLoading() {
    this.headerLoading = false
    this.requestUpdate()
  }

  private getPullRefrehHeader() {
    let content = undefined
    const buildHtml = (content) =>
      html`
        <div
          class="pull-header"
          style="height:${this['title-bar-height']};line-height:${this[
            'title-bar-height'
          ]};"
        >
          <span>${content}</span>
        </div>
      `

    switch (this.pullRefreshState) {
      case PullRefreshState.Refreshing: {
        content = '正在刷新...'
        break
      }
      case PullRefreshState.WillRefresh: {
        content = '松开即可刷新'
        break
      }
      case PullRefreshState.Pulling: {
        content = '下拉刷新'
        break
      }
    }
    return buildHtml(content)
  }

  private getRenderHeader() {
    const {
      borderBottomColor,
      titleImage = '',
      defaultTitle,
      transparentTitle,
      titlePenetrate,
      titleBarColor
    } = this.config

    const pageHeaderConfig = get(window.$MOR_APP_CONFIG, 'pageHeaderConfig', {})
    const { path: pagePath, options: pageOptions } = getCurrentPageParams([
      'path',
      'options'
    ])

    const enableShowHeader = shouldEnableFor(
      pageHeaderConfig.showHeader,
      pagePath,
      pageOptions
    )
    // enableShowHeader 有可能为 undefined，代表用户未配置或者取数据异常
    let showHeader =
      typeof enableShowHeader === 'boolean'
        ? enableShowHeader
        : this['show-header']
    let showBack = this['show-back']

    try {
      // 通过 url 上的字段隐藏 nav bar，实现动态切换展示/隐藏的功能
      const { search } = location
      if (search && search.indexOf('hide-header=1') > -1) showHeader = false

      const enableShowBack = shouldEnableFor(
        pageHeaderConfig.showBack,
        pagePath,
        pageOptions
      )
      if (typeof enableShowBack === 'boolean') showBack = enableShowBack
    } catch (e) {}

    try {
      // 处理业务自定义导航栏高度
      const navConfig = get(window.$MOR_APP_CONFIG, 'nav', {})
      const navResult: Record<string, any> = getNav(
        navConfig,
        pagePath,
        pageOptions
      )

      if (!isUndefined(navResult.statusBarHeight))
        this['status-bar-height'] = converterForPx.fromAttribute(
          navResult.statusBarHeight
        )
      if (!isUndefined(navResult.titleBarHeight))
        this['title-bar-height'] = converterForPx.fromAttribute(
          navResult.titleBarHeight
        )
    } catch (e) {}

    if (!showHeader) return ''

    return html` <tiga-header
      default-title="${defaultTitle}"
      title-image="${titleImage}"
      border-bottom-color="${borderBottomColor}"
      title-penetrate="${titlePenetrate}"
      transparent-title="${transparentTitle}"
      title-bar-color="${titleBarColor}"
      show-back="${showBack}"
      title-bar-height="${this['title-bar-height']}"
      status-bar-height="${this['status-bar-height']}"
      header-loading="${this.headerLoading}"
      header-opacity="${this.headerOpacity}"
    />`
  }

  render() {
    return html`
      ${this.getRenderHeader()}
      <div class="content">
        ${this.getPullRefrehHeader()}
        <slot></slot>
      </div>
    `
  }
}

defineElement('tiga-page-host', PageHost)
