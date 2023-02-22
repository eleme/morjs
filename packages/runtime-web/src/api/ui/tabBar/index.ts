export default {
  showTabBar() {
    return new Promise((resolve) => {
      window.dispatchEvent(new CustomEvent('__tigaShowTabBar'))
      resolve('')
    })
  },

  hideTabBar() {
    return new Promise((resolve) => {
      window.dispatchEvent(new CustomEvent('__tigaHideTabBar'))
      resolve('')
    })
  },

  showTabBarRedDot({ index }) {
    return new Promise((resolve) => {
      window.dispatchEvent(
        new CustomEvent('__tigaShowTabBarRedDot', {
          detail: { index }
        })
      )
      resolve('')
    })
  },

  hideTabBarRedDot({ index }) {
    return new Promise((resolve) => {
      window.dispatchEvent(
        new CustomEvent('__tigaHideTabBarRedDot', {
          detail: { index }
        })
      )
      resolve('')
    })
  },

  setTabBarBadge({ index, text }) {
    return new Promise((resolve) => {
      window.dispatchEvent(
        new CustomEvent('__tigaSetTabBarBadge', {
          detail: { index, text }
        })
      )
      resolve('')
    })
  },

  removeTabBarBadge({ index }) {
    return new Promise((resolve) => {
      window.dispatchEvent(
        new CustomEvent('__tigaSetTabBarBadge', {
          detail: { index }
        })
      )
      resolve('')
    })
  },

  setTabBarItem({ index, text, iconPath, selectedIconPath }) {
    return new Promise((resolve) => {
      window.dispatchEvent(
        new CustomEvent('__tigaSetTabBarItem', {
          detail: { index, text, iconPath, selectedIconPath }
        })
      )
      resolve('')
    })
  },

  setTabBarStyle({ color, selectedColor, backgroundColor, borderStyle }) {
    return new Promise((resolve) => {
      window.dispatchEvent(
        new CustomEvent('__tigaSetTabBarStyle', {
          detail: { color, selectedColor, backgroundColor, borderStyle }
        })
      )
      resolve('')
    })
  }
}
