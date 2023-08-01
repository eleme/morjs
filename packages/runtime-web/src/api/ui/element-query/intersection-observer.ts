import IO from 'intersection-observer'
import { getRootView } from '../../global'
import { getDataSet } from './utils'

export interface IntersectionObserverOptions {
  thresholds?: any
  initialRatio?: number
  selectAll?: boolean
  dataset?: boolean
}

// 兼容不支持 IntersectionObserver 的浏览器
const IntersectionObserver = window.IntersectionObserver || IO

// export default intersectionObserver;
/**
 * doc: https://opendocs.alipay.com/mini/api/intersectionobserver
 */
class LocalIntersectionObserver {
  /**
   * 初始的相交比例，如果调用时检测到的相交比例与这个值不相等且达到阈值，则会触发一次监听器的回调函数。默认值为 0。
   */
  readonly initialRatio: number
  /**
   * 一个数值数组，包含所有阈值。默认值为 [0]。
   */
  readonly thresholds: number | number[]
  /**
   * 是否同时观测多个目标节点（而非一个），如果设为 true ，observe 的 targetSelector 将选中多个节点（注意：同时选中过多节点将影响渲染性能）。默认值为 false。
   */
  readonly selectAll: boolean

  /** 目标节点的 dataset 信息。当 dataset 为 true 时，IntersectionObserver.observe 回调中的 res 对象，
   * 会携带目标节点的 dataset 属性。
   */
  readonly dataset: boolean

  private intersectionObserver: IntersectionObserver

  private callBackInfos: WeakMap<HTMLElement, any> = new WeakMap()

  private targetAppearedInfos: WeakMap<HTMLElement, boolean> = new WeakMap()

  private sortedThresholds: number[]

  constructor({
    thresholds = 0.0,
    initialRatio = 0,
    selectAll = false,
    dataset = false
  }: IntersectionObserverOptions = {}) {
    this.initialRatio = initialRatio
    this.thresholds = thresholds
    this.selectAll = selectAll
    this.dataset = dataset
    this.sortedThresholds = (
      Array.isArray(thresholds) ? thresholds : [thresholds]
    )
      .slice()
      .sort()
  }

  get root() {
    return this.intersectionObserver.root
  }

  private _observerCallBack = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entity) => {
      if (!this.targetAppearedInfos.get(entity.target as HTMLElement)) {
        this.targetAppearedInfos.set(entity.target as HTMLElement, true)
        // 如果首次检测到相交但比例不满足条件则退出
        if (
          !(
            this.initialRatio < entity.intersectionRatio &&
            this.sortedThresholds[0] <= entity.intersectionRatio
          ) &&
          !(
            entity.intersectionRatio < this.initialRatio &&
            entity.intersectionRatio <=
              this.sortedThresholds[this.sortedThresholds.length - 1]
          )
        ) {
          return
        }
      }
      const callback = this.callBackInfos.get(entity.target as HTMLElement)
      if (callback) {
        const dataset = this.dataset
          ? getDataSet(entity.target as HTMLElement)
          : {}

        const callbackInfo: Record<string, any> = {
          intersectionRatio: entity.intersectionRatio,
          intersectionRect: entity.intersectionRect,
          boundingClientRect: entity.boundingClientRect,
          relativeRect: entity.rootBounds,
          time: new Date().valueOf(),
          id: entity.target.id,
          ...dataset
        }
        callback(callbackInfo)
      }
    })
  }

  relativeToViewport(margins?: any) {
    if (this.intersectionObserver) return
    this.intersectionObserver = new IntersectionObserver(
      this._observerCallBack,
      {
        threshold: this.thresholds,
        rootMargin: this.convertToRootMargin(margins),
        root: getRootView()
      }
    )
    return this
  }

  private convertToRootMargin(margins?: any) {
    let rootMargin = undefined
    if (margins) {
      const { left = 0, right = 0, top = 0, bottom = 0 } = margins
      rootMargin = `${top}px ${right}px ${bottom}px ${left}px`
    }
    return rootMargin
  }

  relativeTo(selector: string | HTMLElement, margins?: any) {
    if (this.intersectionObserver) return
    this.intersectionObserver = new IntersectionObserver(
      this._observerCallBack,
      {
        threshold: this.thresholds,
        root:
          selector instanceof HTMLElement
            ? selector
            : getRootView().querySelector(selector),
        rootMargin: this.convertToRootMargin(margins)
      }
    )
    return this
  }

  observe(target: string | HTMLElement | HTMLElement[], callback: () => void) {
    let elements: HTMLElement[] = []
    if (typeof target === 'string') {
      elements = getRootView().querySelectorAll(target) as any
    } else if (target instanceof HTMLElement) {
      elements.push(target)
    } else if (target instanceof Array) {
      elements = target
    }

    if (elements.length > 0) {
      elements.forEach((el) => {
        this.callBackInfos.set(el as HTMLElement, callback)
        this.intersectionObserver.observe(el)
      })
    }
    return this
  }

  unobserve(target: string | HTMLElement | HTMLElement[]) {
    let elements: HTMLElement[] = []
    if (typeof target === 'string') {
      elements = getRootView().querySelectorAll(target) as any
    } else if (target instanceof HTMLElement) {
      elements.push(target)
    } else if (target instanceof Array) {
      elements = target
    }
    if (elements.length > 0) {
      elements.forEach((el) => {
        if (this.callBackInfos.has(el)) {
          this.callBackInfos.delete(el)
        }
      })
    }
  }

  /**
   * 停止监听。回调函数将不再触发。
   */
  disconnect() {
    this.intersectionObserver.disconnect()
  }
}

export default LocalIntersectionObserver
