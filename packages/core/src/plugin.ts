import { Emitter, logger } from '@morjs/api'

export type GlobalGetApp = typeof getApp

export interface CreateMorPluginResult {
  /**
   * 插件事件
   */
  $pluginEvent?: Emitter<any>
  /**
   * 宿主事件
   */
  $hostEvent?: Emitter<any>
  /**
   * mor 插件标识
   */
  $isMorPlugin: true
  /**
   * 插件的 getApp (模拟)
   */
  getApp: GlobalGetApp
  /**
   * 内部初始化
   * @param options 宿主传递的选项
   */
  internalInit(options?: { $event?: Emitter<any> }): void
  /**
   * 小程序向插件注入的能力
   * @param extend 能力对象
   */
  morInit<T extends Record<string, any>>(extend: T): void
  /**
   * 其他属性或方法
   */
  [k: string]: any
}

/**
 * 插件构造函数
 * @param options - 插件选项
 * @param options.getApp - 插件使用的 getApp 构造函数
 * @returns Mor 小程序插件对象 (用于和宿主小程序交换数据或能力)
 */
export function createPlugin(pluginOptions: {
  getApp: GlobalGetApp
  [k: string]: any
}): CreateMorPluginResult {
  const { getApp } = pluginOptions || {}

  if (typeof getApp === 'undefined') {
    logger.error('插件入口必须传 getApp')
    return
  }

  delete pluginOptions.getApp

  const app = getApp()

  const plugin: CreateMorPluginResult = {
    getApp,
    $isMorPlugin: true,
    ...pluginOptions,
    internalInit(options?: { $event?: Emitter<any> }): void {
      const { $event: $hostEvent } = options ?? {}

      // 宿主的 event
      if (!this.$hostEvent && $hostEvent) {
        this.$hostEvent = $hostEvent
        const app = this.getApp()
        app.$hostEvent = $hostEvent
      }
    },
    morInit(extend) {
      const app = this.getApp()

      if (!app.$host) app.$host = {}

      Object.keys(extend).forEach((name) => {
        app.$host[name] = extend[name]
      })
    }
  }

  if (app.$event) plugin.$pluginEvent = app.$event

  return plugin
}

/**
 * 支付宝插件构造函数
 */
export function aPlugin(
  ...args: Parameters<typeof createPlugin>
): ReturnType<typeof createPlugin> {
  return createPlugin(...args)
}

/**
 * 微信插件构造函数
 */
export function wPlugin(
  ...args: Parameters<typeof createPlugin>
): ReturnType<typeof createPlugin> {
  return createPlugin(...args)
}
