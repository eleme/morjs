import { css, html, internalProperty, property } from 'lit-element'
import { my } from '../../../api/my'
import { BaseElement } from '../baseElement'
import { defineElement } from '../utils'

const STATUS = {
  SHOW: 0,
  HIDE: 1
}

export class Tabbar extends BaseElement {
  static get styles() {
    return css`
      .tiga-tabbar {
        display: flex;
        position: relative;
        z-index: 500;
        background-color: #f7f7f7;
      }

      .tiga-tabbar::before {
        content: ' ';
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        height: 1px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        color: rgba(0, 0, 0, 0.1);
        transform-origin: 0 0;
        transform: scaleY(0.5);
      }
    `
  }

  @property({ type: Object }) conf
  @internalProperty() selectedIndex = -1
  @internalProperty() tabBarList = []
  @internalProperty() status = STATUS.SHOW
  @internalProperty() homePage = ''
  @internalProperty() customRoutes = []
  @internalProperty() disableSafeAreaPadding = false

  connectedCallback() {
    super.connectedCallback()

    /* 有些容器（如钉钉）在webview层提供了小黑条适配的操作，在此向外提供配置，
      让业务选择关闭 tabbar-item 提供的小黑条适配功能，否则页面会距底部距离会出现问题
    */
    if (this.conf && this.conf.disableSafeAreaPaddingUARegex) {
      try {
        const { userAgent } = navigator
        const { disableSafeAreaPaddingUARegex } = this.conf
        const isMatch = (param) => new RegExp(param, 'gi').test(userAgent)

        if (typeof disableSafeAreaPaddingUARegex === 'string') {
          this.disableSafeAreaPadding = isMatch(disableSafeAreaPaddingUARegex)
        } else if (Array.isArray(disableSafeAreaPaddingUARegex)) {
          this.disableSafeAreaPadding = disableSafeAreaPaddingUARegex.some(
            (param) => isMatch(param)
          )
        }
      } catch (e) {}
    }
  }

  firstUpdated() {
    this.tabBarList = this.conf.items.map((item) => {
      item.pagePath = this.addLeadingSlash(item.pagePath)
      return item
    })

    this.filterCustomRoutes()

    this.bindEvent()

    this.routerChangeHandler()
  }

  addLeadingSlash = (str) => (str[0] === '/' ? str : `/${str}`)

  filterCustomRoutes() {
    const customRoutes = this.conf.customRoutes
    for (const key in customRoutes) {
      this.customRoutes.push([this.addLeadingSlash(key), customRoutes[key]])
    }
  }

  bindEvent() {
    window.addEventListener('__tigaHideTabBar', this.hideTabBarHandler, false)
    window.addEventListener('__tigaShowTabBar', this.showTabBarHandler, false)
    window.addEventListener(
      '__tigaShowTabBarRedDot',
      this.showTabBarRedDotHandler,
      false
    )
    window.addEventListener(
      '__tigaHideTabBarRedDot',
      this.hideTabBarRedDotHandler,
      false
    )
    window.addEventListener(
      '__tigaSetTabBarBadge',
      this.setTabBarBadgeHandler,
      false
    )
    window.addEventListener(
      '__tigaRemoveTabBarBadge',
      this.removeTabBarBadgeHandler,
      false
    )
    window.addEventListener(
      '__tigaSetTabBarItem',
      this.setTabBarItemHandler,
      false
    )
    window.addEventListener(
      '__tigaSetTabBarStyle',
      this.setTabBarStyleHandler,
      false
    )
    window.__history.listen(this.routerChangeHandler)
  }

  routerChangeHandler = () => {
    const pagePath = this.getCurrentPagePath()
    this.selectedIndex = this.getSelectedIndex(pagePath)
  }

  hideTabBarHandler = () => {
    this.status = STATUS.HIDE
  }

  showTabBarHandler = () => {
    this.status = STATUS.SHOW
  }

  showTabBarRedDotHandler = (e) => {
    const { index } = e.detail
    this.tabBarList[index].showRedDot = true
    this.tabBarList[index].badgeText = ''
    this.tabBarList = [...this.tabBarList]
  }

  hideTabBarRedDotHandler = (e) => {
    this.tabBarList[e.detail.index].showRedDot = false
    this.tabBarList = [...this.tabBarList]
  }

  setTabBarBadgeHandler = (e) => {
    const { index, text } = e.detail
    this.tabBarList[index].badgeText = text
    this.tabBarList[index].showRedDot = false
    this.tabBarList = [...this.tabBarList]
  }

  removeTabBarBadgeHandler = (e) => {
    const { index } = e.detail
    this.tabBarList[index].badgeText = ''
    this.tabBarList = [...this.tabBarList]
  }

  setTabBarItemHandler = (e) => {
    const {
      index,
      text: name,
      iconPath: icon,
      selectedIconPath: activeIcon
    } = e.detail
    this.tabBarList[index] = { index, name, icon, activeIcon }
    this.tabBarList = [...this.tabBarList]
  }

  setTabBarStyleHandler = (e) => {
    this.conf = { ...this.conf, ...e.detail }
  }

  getSelectedIndex(pagePath) {
    return this.tabBarList.findIndex((item) => item.pagePath === pagePath)
  }

  hasBasename = (path, prefix) =>
    new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path)

  stripBasename = (path, prefix) =>
    (this.hasBasename(path, prefix) ? path.substr(prefix.length) : path) || '/'

  getCurrentPagePath() {
    let pagePath

    if (this.conf.mode === 'hash') {
      const hashUrl = (window.location.hash || '#/').substr(1)
      const pathArr = hashUrl.split('?')
      pagePath = pathArr[0]
    } else {
      pagePath = location.pathname
    }
    return this.getOriginUrl(this.stripBasename(pagePath, this.conf.baseName))
  }

  getOriginUrl = (pathName) => {
    const customRoute = this.customRoutes.filter(
      ([url, customUrl]) => pathName === url || pathName === customUrl
    )

    return customRoute.length
      ? customRoute[0][0]
      : pathName === '/'
      ? this.addLeadingSlash(this.conf.homePage)
      : pathName
  }

  getTabQuery = () => {
    return (location.hash || location.search).split('?')[1]
  }

  switchTab = (e) => {
    // 点击当前tab，无需处理
    if (this.selectedIndex === e.detail.value) return

    this.selectedIndex = e.detail.value
    let url = this.tabBarList[this.selectedIndex].pagePath

    const query = this.getTabQuery()
    if (query) url = `${url}?${query}`

    my?.switchTab({
      url
    })
  }

  render() {
    const shouldHideTabBar =
      this.selectedIndex === -1 || this.status === STATUS.HIDE

    return html`
      <style>
        .tiga-tabbar {
          background-color: ${this.conf.backgroundColor} !important;
          display: ${shouldHideTabBar ? 'none' : 'flex'} !important;
        }
      </style>

      <div class="tiga-tabbar">
        ${this.tabBarList.map((item, index) => {
          const isSelected = this.selectedIndex === index
          const textColor = isSelected
            ? this.conf.selectedColor
            : this.conf.color
          const icon = isSelected ? item.activeIcon : item.icon

          return html` <tiga-tabbar-item
            .text="${item.name}"
            .textColor="${textColor}"
            .key="${index}"
            .icon="${icon}"
            .disableSafeAreaPadding="${this.disableSafeAreaPadding}"
            .isSelected="${isSelected}"
            .showRedDot="${item.showRedDot}"
            .badgeText="${item.badgeText}"
            @onSelect="${this.switchTab}"
          />`
        })}
      </div>
    `
  }
}

defineElement('tiga-tabbar', Tabbar)
