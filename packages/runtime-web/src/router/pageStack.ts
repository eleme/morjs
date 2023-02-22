import { my } from '../api/my'
import { IPage } from './types'

const _pageStack: IPage[] = []
export const pageStack = new Proxy(_pageStack, {
  set(target, propKey, value) {
    const _target = target.filter((item) => !!item)
    if (_target.length) {
      const rootView = document.getElementById(
        _target[_target.length - 1]?.pageId
      )
      if (rootView) my.updateRootView(rootView)
    }
    return Reflect.set(target, propKey, value)
  }
})

export function getCurrentPages() {
  return [...pageStack]
}

export function getCurPage() {
  return pageStack[pageStack.length - 1] || null
}

window.getCurrentPages = getCurrentPages
