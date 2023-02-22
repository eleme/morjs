import ReactDOM from 'react-dom'
// eslint-disable-next-line node/no-missing-import
import { KBComponent } from './component'
import { Event } from './utils/event'

const PageCreate = 'tigaPageCreate'
const PageDestroy = 'tigaPageDestroy'

// 获取当前页面的参数
export function getQueryParams(url) {
  const encodeEqual = encodeURIComponent('=')
  // 说明url被encode过
  if (url && url.indexOf(encodeEqual) >= 0 && url.indexOf('=') < 0) {
    url = decodeURIComponent(url)
  }

  const params = {}
  if (url.indexOf('?') !== -1) {
    const str = url.substr(url.indexOf('?') + 1)
    const strs = str.split('&')
    for (let i = 0; i < strs.length; i++) {
      params[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1])
    }
  }
  return params
}

export class PageComponent extends KBComponent {
  private pageConfigJson
  constructor(props, componentConfig, pageConfigJson, options) {
    // 對events進行綁定 this 指針
    // NOTE: 不支持events
    // if (componentConfig.events) {
    //   Object.keys(componentConfig.events).forEach(key => {
    //     if (typeof componentConfig.events[key] === 'function') {
    //       componentConfig.events[key] = componentConfig.events[key].bind(componentConfig);
    //     }
    //   })
    // }
    super(props, componentConfig, options)
    this.pageConfigJson = pageConfigJson
  }

  override onInit() {
    // 控制时序，onLoad前，触发PageCreate事件，getCurrentPages才可用
    window.dispatchEvent(
      new CustomEvent(PageCreate, {
        detail: {
          ...this.componentConfig,
          __tigaPage: this,
          location: { ...window.location }
        }
      })
    )

    // 组件生命周期函数，组件创建时触发
    if (this.componentConfig.onLoad) {
      const query = getQueryParams(location.search)
      if (location.hash) {
        Object.assign(query, getQueryParams(location.hash))
      }
      this.componentConfig.onLoad(query)
    }

    this.didShow()
  }

  didShow() {
    const originOnShow = this.componentConfig.onShow

    const callOnShow = () =>
      typeof originOnShow === 'function' && originOnShow()

    callOnShow() // 第一次手动调用

    this.componentConfig.onShow = () => {
      // 重置页面的配置（防止页面间相互影响）
      if (this._isMounted) this.setPageConfig()

      // 同步pageOnReady事件，用于一些依赖 didMount 执行之后才可调用的api
      Event.emit('pageOnReady')
      callOnShow()
    }
  }

  override didMount() {
    // 这里其实是会耦合。但是其实已经定义有IPage了 ,具体定义地址在 组件的 page中定义
    const pageElement = (ReactDOM.findDOMNode(this) || {}).parentElement // 页面宿主
    if (pageElement) {
      this.setPageConfig(pageElement)
      pageElement.addEventListener(
        'pagepulldownrefresh',
        this.onPagePullDownRefresh.bind(this)
      )
      pageElement.addEventListener(
        'pagereachbottom',
        this.onPageReachBottom.bind(this)
      )
      pageElement.addEventListener('pagescroll', this.onPageScroll.bind(this))
    }

    this.onReady()
  }

  setPageConfig(page = null) {
    try {
      const pageElement =
        page || (ReactDOM.findDOMNode(this) || {}).parentElement // 页面宿主

      if (pageElement && this.pageConfigJson) {
        if (this.pageConfigJson.pullRefresh) {
          pageElement.enbalePullRefresh = true
        }
        // 页面配置 优先级高于 全局配置
        const config = { ...this.pageConfigJson.window, ...this.pageConfigJson }

        if (this.pageConfigJson.defaultTitle) {
          config.defaultTitle = this.pageConfigJson.defaultTitle
        }

        if (pageElement.setConfig) pageElement.setConfig(config)
      }
    } catch (e) {}
  }

  onReady() {
    Event.emit('pageOnReady')

    if (this.componentConfig.onReady) {
      this.componentConfig.onReady()
    }
  }

  onPagePullDownRefresh() {
    if (this.componentConfig.onPullDownRefresh) {
      this.componentConfig.onPullDownRefresh()
    }
  }

  onPageReachBottom() {
    if (this.componentConfig.onReachBottom) {
      this.componentConfig.onReachBottom()
    }
  }

  onPageScroll(e) {
    if (this.componentConfig.onPageScroll) {
      this.componentConfig.onPageScroll(e.detail)
    }
  }

  // TODO:
  // didHide() {
  //   if (this.componentConfig.onHide) {
  //     this.componentConfig.onHide();
  //   }
  // }

  override didUnmount() {
    // 移除之前页面绑定的api回调，以免影响到下个页面
    Event.emit('clearPageOnReadyCallback')

    window.dispatchEvent(
      new CustomEvent(PageDestroy, {
        detail: this.componentConfig
      })
    )
    if (this.componentConfig.onUnload) {
      this.componentConfig.onUnload()
    }
  }
}
