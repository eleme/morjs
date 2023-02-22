import { SOURCE_TYPE } from '@morjs/api/lib/env'
import { compose, IAnyFunc } from '@morjs/api/lib/utils'
import { enhanceComponent, MorComponentEnhanceFeatures } from './component'
import { enhancePage, MorPageOptions } from './page'
import type { IData } from './types'
import { invokeOriginalFunction } from './utils/invokeOriginalFunction'

const COMPONENT_LIFETIME_MAPPINGS = {
  onLoad: {
    [SOURCE_TYPE.ALIPAY]: 'onInit',
    [SOURCE_TYPE.WECHAT]: 'attached'
  },
  onReady: {
    [SOURCE_TYPE.ALIPAY]: 'didMount',
    [SOURCE_TYPE.WECHAT]: 'ready'
  },
  onUnload: {
    [SOURCE_TYPE.ALIPAY]: 'didUnmount',
    [SOURCE_TYPE.WECHAT]: 'detached'
  }
}

const COMPONENT_PAGE_LIFETIME_MAPPINGS = {
  onShow: 'show',
  onHide: 'hide',
  onResize: 'resize'
}

/**
 * 将页面作为组件使用, 仅供特殊场景下的使用
 * 不保证完全的兼容性
 *
 * 转换页面配置为组件配置
 *
 * @param pageOptions - 页面配置
 * @param sourceType - 源码类型
 * @param features - 功能配置
 * @returns 组件配置
 */
export function PageToComponent<D extends IData, T extends IData>(
  pageOptions: MorPageOptions<D, T>,
  sourceType: SOURCE_TYPE,
  features: MorComponentEnhanceFeatures = {}
): IData {
  // 页面增强（含转端逻辑）
  const opts = enhancePage<D, T>(pageOptions, sourceType)

  // 直接透传的属性
  const data: Record<string, any> = opts.data || {}
  const observers: Record<string, any> = opts.observers || {}

  // 需要插入到 this 的数据
  const thisData: Record<string, any> = {}

  // 组件方法
  const methods: Record<string, IAnyFunc> = {}

  // 组件生命周期
  const lifetimes: Record<string, IAnyFunc> = {}

  // 页面生命周期
  const pageLifetimes: Record<string, IAnyFunc> = {}

  const isAlipaySource = sourceType === SOURCE_TYPE.ALIPAY

  // 兼容支付宝
  if (isAlipaySource && typeof opts?.events?.onResize === 'function') {
    pageLifetimes['resize'] = opts.events.onResize
    // 其他事件组件不支持, 直接移除
    delete opts.events
  }

  // 遍历每一个属性逐个分配
  for (const key in opts) {
    const value = opts[key]

    if (key === 'data') continue
    if (key === 'observers') continue
    if (key === 'methods') {
      Object.assign(methods, value || {})
      continue
    }
    if (key === 'pageLifetimes') {
      Object.assign(pageLifetimes, value || {})
      continue
    }
    if (key === 'lifetimes') {
      Object.assign(lifetimes, value || {})
      continue
    }

    if (typeof value === 'function') {
      switch (key) {
        // 组件生命周期对齐
        case 'onLoad':
        case 'onReady':
        case 'onUnload':
          lifetimes[COMPONENT_LIFETIME_MAPPINGS[key][sourceType]] = value
          break

        // 页面生命周期对齐
        case 'onShow':
        case 'onHide':
        case 'onResize':
          pageLifetimes[COMPONENT_PAGE_LIFETIME_MAPPINGS[key]] = value
          break

        // 支付宝或微信原生组件生命周期
        case 'onInit':
        case 'didMount':
        case 'didUnmount':
        case 'created':
        case 'attached':
        case 'ready':
        case 'detached':
          lifetimes[key] = value
          break

        // 其他函数配置为方法
        default:
          methods[key] = value
          break
      }
    }

    // 其他属性直接添加到 thisData
    else {
      thisData[key] = value
    }
  }

  // 转换出来的组件
  const componentOptions: Record<string, any> = {
    data,
    observers,
    methods,
    pageLifetimes
  }

  // 合并 lifetimes
  Object.assign(componentOptions, lifetimes)

  // 注入 thisData 到 组件 this 上下文中
  function injectThisData(this: Record<string, any>) {
    Object.assign(this, thisData)
  }

  // 挂载 thisData
  const hookByLifetime = isAlipaySource ? 'onInit' : 'created'
  componentOptions[hookByLifetime] = compose([
    injectThisData,
    invokeOriginalFunction(hookByLifetime, componentOptions)
  ])

  // 组件增强（含转端逻辑）
  return enhanceComponent(componentOptions, sourceType, {
    // 默认为 false
    invokeComponentHooks:
      features.invokeComponentHooks == null
        ? false
        : features.invokeComponentHooks
  })
}

/**
 * 支付宝 Page 转组件辅助函数
 * @param options - 小程序页面配置
 * @param features - 功能开关
 * @returns 返回组件配置
 */
export function aPageToComponent<D extends IData, T extends IData>(
  options: MorPageOptions<D, T>,
  features: MorComponentEnhanceFeatures = {}
): any {
  return PageToComponent(options, SOURCE_TYPE.ALIPAY, features)
}

/**
 * 微信 Page 页面转组件辅助函数
 * @param options - 小程序页面配置
 * @param features - 功能开关
 * @returns 返回组件配置
 */
export function wPageToComponent<D extends IData, T extends IData>(
  options: MorPageOptions<D, T>,
  features: MorComponentEnhanceFeatures = {}
): any {
  return PageToComponent(options, SOURCE_TYPE.WECHAT, features)
}
