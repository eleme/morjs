import {
  event,
  getEnv,
  getGlobalObject,
  logger,
  markAsUnsupport,
  transformApis
} from '@morjs/runtime-base'

// 跨端支持的接口运行时引用注入位置, '' 空字符串是为了防止该注释被移除
// prettier-ignore
/* MOR_API_POLYFILL_IMPORT_REPLACER */ ''

declare const getCurrentPages: () => any
declare const getApp: () => any
declare const requirePlugin: (pluginName: string) => any

/**
 * mor api 全局对象
 */
export interface MorAPI {
  /**
   * 小程序全局 API 对象
   */
  global: any
  /**
   * 获取小程序 env 信息
   */
  env: Record<string, any>
  /**
   * 获取全局 App 实例
   */
  getApp: typeof getApp
  /**
   * 获取小程序当前页面堆栈
   */
  getCurrentPages: typeof getCurrentPages
  /**
   * require 小程序插件
   */
  requirePlugin: typeof requirePlugin
  /**
   * 获取小程序运行环境
   * @returns 当前环境
   */
  getEnv: typeof getEnv
  /**
   * 覆盖 mor 默认 API
   */
  override: () => MorAPI

  /**
   * 其他 API 接口
   */
  [K: string]: any
}

/**
 * mor api 接口适配器
 */
export interface MorAPIAdapter {
  initApi?: (api: MorAPI, options?: Record<string, any>) => void
}

/**
 * 初始化 Mor API
 * 默认会自动初始化一个全局的 mor api
 * @example
 * 自定义 api 初始化并覆盖默认 mor api
 * createApi([adapters]).override()
 * @param adapters - 初始化 选项
 * @param adapters[x].initApi - 初始化接口方法, 接受 apiOptions 作为参数
 * @param options - 初始化选项, 默认为 {}
 * @returns Mor API
 */
export function createApi(
  adapters?: MorAPIAdapter[],
  options: Record<string, any> = {}
): MorAPI {
  // global 小程序全局对象，如微信的 wx，支付宝的 my
  const global = getGlobalObject()
  const apiOptions = {} as MorAPI

  apiOptions.global = global
  apiOptions.env = global.env || {}

  apiOptions.getApp =
    typeof getApp === 'function' ? getApp : markAsUnsupport('getApp')

  apiOptions.getCurrentPages =
    typeof getCurrentPages === 'function'
      ? getCurrentPages
      : markAsUnsupport('getCurrentPages')

  apiOptions.requirePlugin =
    typeof requirePlugin === 'function'
      ? requirePlugin
      : markAsUnsupport('requirePlugin')

  apiOptions.getEnv = getEnv

  // 跨端支持的接口运行时调用注入位置, '' 空字符串是为了防止该注释被移除
  // prettier-ignore
  /* MOR_API_POLYFILL_INVOKE_REPLACER */ ''

  // 转端适配会自动注入 转端 API 兼容性支持
  // 这里依赖 apiOptions 名称, 如修改会导致 apiOptions 不存在
  // targetAdapter.initApi(apiOptions)
  // sourceAdapter.initApi(apiOptions)

  // 执行 apiOptions 适配器初始化
  if (adapters?.length) {
    adapters.forEach(function (adapter) {
      if (typeof adapter?.initApi === 'function') {
        adapter.initApi(apiOptions, options || {})
      } else {
        logger.error(`adapter.initApi 必须是一个函数, 请检查`)
      }
    })
  }

  // 添加全局剩余的 apiOptions (不覆盖已有的接口)
  transformApis(
    apiOptions,
    global,
    {
      needPromisfiedApis: [],
      apiTransformConfig: {}
    },
    true,
    false
  )

  // 添加全局事件支持, 仅当缺少事件支持时添加
  if (!apiOptions.on) {
    apiOptions.on = function (type: string, handler: (...args: any[]) => any) {
      event.on.call(event, type, handler)
    }
  }
  if (!apiOptions.emit) {
    apiOptions.emit = function (type: string, e: Record<string, any>) {
      event.emit.call(event, type, e)
    }
  }

  // 覆盖默认的 mor apiOptions 实例
  apiOptions.override = function () {
    if (apiOptions === mor) return
    Object.assign(mor, apiOptions)
    return mor
  }

  return apiOptions
}

/**
 * 初始化 mor 接口
 */
const mor = createApi()

/**
 * 工厂函数
 */
interface IFactoryFunction {
  (this: MorAPI, options: Record<string, any>): void
}

/**
 * 工厂函数存储对象
 */
const FACTORIES: Record<string, IFactoryFunction> = {}

/**
 * 注册接口初始化工厂函数
 * @param factoryName - 接口初始化工厂函数名称
 * @param factoryFunction - 接口初始化工厂函数
 */
function registerFactory(
  factoryName: string,
  factoryFunction: IFactoryFunction
) {
  FACTORIES[factoryName] = factoryFunction
}

/**
 * 初始化一个新的 mor api 实例
 * @param options - 选项
 * @returns 新的 mor api 实例
 */
function init(options?: Record<string, any>): MorAPI {
  const newMor = Object.assign({}, mor)

  for (const factoryName of Object.keys(FACTORIES)) {
    FACTORIES[factoryName].call(newMor, options)
    logger.debug('mor api factory', `${factoryName} 初始化完成`)
  }

  return newMor
}

export { mor, registerFactory, init }
