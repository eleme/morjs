import { DefualtPageConfig, IPageConfig } from './IPage'
import { getPage } from './pulldown-api'

export default {
  setNavigationBar({
    title,
    image,
    backgroundColor,
    borderBottomColor,
    reset
  }) {
    return new Promise((resolve) => {
      const page = getPage()
      const config: IPageConfig = {}
      if (reset) {
        Object.assign(config, DefualtPageConfig)
      } else {
        title !== undefined && (config.defaultTitle = title)
        image !== undefined && (config.titleImage = image)
        backgroundColor !== undefined &&
          (config.titleBarColor = backgroundColor)
        borderBottomColor !== undefined &&
          (config.borderBottomColor = borderBottomColor)
      }
      page.setConfig(config)
      resolve(undefined)
    })
  },
  getTitleColor() {
    return new Promise((resolve) => {
      const page = getPage()
      resolve({ color: page.getConfig().titleBarColor || '#ffffff' })
    })
  },
  showNavigationBarLoading() {
    return new Promise((resolve) => {
      const page = getPage()
      page.showNavigationBarLoading()
      resolve
    })
  },
  hideNavigationBarLoading() {
    return new Promise((resolve) => {
      const page = getPage()
      page.hideNavigationBarLoading()
      resolve
    })
  },
  hideBackHome() {
    // 隐藏左上角导航栏的 home 键和返回键（目前只有返回键）
    const hostElement = document.querySelector('tiga-page-host')
    if (!hostElement) return

    try {
      const backElement = hostElement.shadowRoot.querySelector('tiga-back')

      if (backElement) backElement.remove()
    } catch (e) {}
  }
}
