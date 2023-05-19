// 节点相关查询接口
import { getRootView, updateRootView } from '../../global'
import { wait } from '../../utils'
import IntersectionObserver from './intersection-observer'
import { FIELD_CONFIG_METHODS_MAP, mapTarget } from './utils'

export default {
  createIntersectionObserver(options?) {
    return new IntersectionObserver(options)
  },
  createSelectorQuery() {
    return new SelectorQuery()
  },
  updateRootView
}
class SelectorQuery {
  private target: HTMLElement | NodeListOf<HTMLElement>

  private execPromises: Promise<any>[] = []

  select(selector: string) {
    this.target = getRootView().querySelector(selector) as HTMLElement
    return this
  }

  selectAll(selector: string) {
    this.target = getRootView().querySelectorAll(selector)
    return this
  }

  selectViewport() {
    // TODO: 每个页面的 Viewport 是不一样的
    try {
      this.target = document
        .querySelector('tiga-page-host')
        .shadowRoot.querySelector('.content') as HTMLElement
    } catch (e) {
      this.target = getRootView()
    }

    return this
  }

  boundingClientRect() {
    const target = this.target
    this.execPromises.push(
      wait().then(() => mapTarget(target, FIELD_CONFIG_METHODS_MAP.rect))
    )

    return this
  }

  scrollOffset() {
    const target = this.target
    this.execPromises.push(
      wait().then(() =>
        mapTarget(target, FIELD_CONFIG_METHODS_MAP.scrollOffset)
      )
    )

    return this
  }

  fields(config) {
    const target = this.target

    this.execPromises.push(
      wait().then(() => {
        return mapTarget(target, (el: HTMLElement) => {
          return Object.keys(config).reduce((res, key) => {
            if (
              config[key] &&
              typeof FIELD_CONFIG_METHODS_MAP[key] === 'function'
            ) {
              const value = FIELD_CONFIG_METHODS_MAP[key](el, config[key])

              if (typeof value === 'object') res = { ...res, ...value }
              else res[key] = value
            }

            return res
          }, {})
        })
      })
    )

    return this
  }

  exec(callback) {
    Promise.all(this.execPromises).then((res) => {
      callback(res)
    })
  }
}
