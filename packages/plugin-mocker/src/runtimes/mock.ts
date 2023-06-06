import { getEnv, logger } from '@morjs/api'
import Attach from './attach'
import { notNeedLog, notNeedNoMockWarn } from './constants'
import MockItem from './mockItem'
import RequireContext from './requireContext'
import {
  GlobalFunction,
  GlobalType,
  IAdapters,
  ICallItem,
  IConfig,
  IGlobal,
  IGlobalType,
  MockConfig,
  mockMapItem
} from './types'

/**
 * 禁止使用的 Api 直接使用原生接口
 * @param callItem - 发起请求的 JsApi 配置
 * @returns 是否执行原生方法 true/false
 */
export function shouldDirectRunOrigin(callItem: ICallItem) {
  const forbidApi = ['connectSocket', 'sendSocketMessage']
  return forbidApi.includes(callItem.name)
}

/**
 * Mock 实例对象
 * 1. 拦截 global 全局对象调用 mockFn 劫持所有 JsApi
 * 2. 请求是否为禁止 mock 的 api，若无则打开日志打印
 * 3. 含有 adapters 配置的 所有请求先依次运行 adapter.run
 * 4. 以上无结果的根据 api 的请求获取本地 mock 目录对应文件内容
 * 5. 兜底或报错的统一执行原生方法
 * @param context - 本地 mock 目录路径下所有文件及内容
 * @param config - mor.config 里的 mock 配置
 * @param global - 全局对象 如支付宝的 my | 微信的 wx
 * @param adapters - adapters 扩展配置(数组支持多项)
 */
export default class Mock {
  private context: RequireContext
  private config: IConfig
  private global: IGlobal
  // 提供给 adapter 的原生请求 防止递归 mock
  private originalGlobal: IGlobal
  private adapters: IAdapters

  constructor(
    mockContext: any,
    config: MockConfig,
    global: IGlobal,
    adapters: IAdapters
  ) {
    const { debug, originMap } = config
    try {
      this.context = new RequireContext(mockContext)
      const notNeedLogList = notNeedLog.join(', ')
      logger.warn(
        debug
          ? `Mock 功能已开启, Debug 功能已开启, 下列接口调用记录被隐藏: ${notNeedLogList}`
          : 'Mock 功能已开启, Debug 功能已关闭, 所有接口调用记录被隐藏'
      )
    } catch (err) {
      logger.warn('Mock 功能开启失败，JSAPI 全部使用原生')
    }

    this.config = {
      disableMock: false,
      isDebug: debug,
      context: mockContext,
      originMap,
      notNeedLog: debug ? notNeedLog : true,
      notNeedNoMockWarn: debug ? notNeedNoMockWarn : true
    }
    this.global = global
    this.originalGlobal = { ...global }
    this.adapters = adapters
  }

  public run() {
    const global = this.global

    Object.keys(global).forEach((key) => {
      if (key.startsWith('mor_modules')) return
      const origin = global[key]

      Object.defineProperty(global, key, {
        get: () => {
          // 只 mock 函数的情况，例如 .SDKVersion 暂时不进行 mock
          // TODO: .ap.xx 情况也需要处理
          if (Object.prototype.toString.call(origin) === '[object Function]') {
            return (...args: any[]) => {
              return this.mockFn(origin, key, args)
            }
          }
          return origin
        }
      })
    })
  }

  private mockFn(origin: GlobalFunction, key: string, args: any[]) {
    const originalGlobal = this.originalGlobal
    const adapters = this.adapters
    const config = this.config
    const callItem = this.getCallItem(key, args)

    // 禁止使用的 Api 直接调用原生接口
    if (shouldDirectRunOrigin(callItem)) {
      return this.runOrigin(origin, callItem)
    }

    const attach = new Attach(config, callItem)
    attach.attach()

    let result
    if (this.needMock(callItem)) {
      let mockFn

      if (Array.isArray(adapters) && adapters.length > 0) {
        // 配置了 adapters
        for (const adapter of adapters) {
          if (mockFn === undefined) {
            // key、args、context 是提供给 adapter 适配特殊逻辑及返回结果的
            // originalGlobal 是提供给 adapter 接入第三方 mock 渠道发起原生请求
            const adapterRes = adapter.run({
              apiName: key,
              apiArguments: args,
              mockContext: config.context,
              originalGlobal: originalGlobal
            })
            mockFn = adapterRes !== undefined ? adapterRes : undefined
          }
        }
      }

      if (mockFn === undefined) {
        // 获取 content 的值
        try {
          mockFn = this.context && this.context.get(callItem)
        } catch (e) {
          this.shouldWarnNoMock(callItem) && logger.warn(e.message)
        }
      }

      if (mockFn) {
        // 标记一下，供 log 使用
        attach.fromMock = true
        const mockItem = new MockItem(mockFn, callItem)
        result = mockItem.run()
      } else {
        result = this.runOrigin(origin, callItem)
      }
    } else {
      result = this.runOrigin(origin, callItem)
    }

    // 如果没有附加成功，则补偿 log
    if (attach.shouldPatchLog) {
      if (result && typeof result.then === 'function') {
        result
          .then((data: any) => {
            attach.log(data)
          })
          .catch((data: any) => {
            attach.log(data)
          })
      } else {
        attach.log(result)
      }
    }

    return result
  }

  private getCallItem(key: string, args: any[]) {
    const callItem: ICallItem = {
      name: '',
      type: IGlobalType[getEnv()]
    }

    if (key === 'call') {
      callItem.name = args[0]
      callItem.opts = args[1]
      callItem.callback = args[2]
      callItem.type = GlobalType.call
    } else {
      callItem.name = key
      callItem.opts = args[0]
      callItem.callback = args[1]
      callItem.type = IGlobalType[getEnv()]
    }

    if (typeof callItem.opts === 'function') {
      callItem._noOpts = true
      callItem.callback = callItem.opts
      callItem.opts = undefined
    }

    return callItem
  }

  // 执行原生方法
  private runOrigin(origin: GlobalFunction, callItem: ICallItem) {
    let opts = callItem.opts
    let callback = callItem.callback

    if (callItem._noOpts) {
      opts = callback
      callback = undefined
    }

    if (callItem.type === IGlobalType[getEnv()]) {
      return origin(opts, callback)
    }
    const name = callItem.name
    return origin(name, opts, callback)
  }

  private needMock(callItem: ICallItem) {
    const config = this.config
    if (config.disableMock) return false

    function findInList(list: mockMapItem) {
      const { name, opts } = callItem

      for (let i = 0; i < list.length; i++) {
        const m = list[i]
        if (m === name) return true

        if (typeof m === 'function') {
          if (m(opts)) return true
        }
      }
      return false
    }

    // 强制使用原生接口
    if (config.originMap && Object.keys(config.originMap)?.length) {
      // logger.warn('使用了 originMap');

      // 如果为空则全 mock
      const list = config.originMap[callItem.type]
      if (!list) return true

      return !findInList(list)
    }

    return true
  }

  private shouldWarnNoMock(callItem: ICallItem) {
    const notNeedWarn = this.config.notNeedNoMockWarn

    if (notNeedWarn === true) {
      return false
    }
    if (notNeedWarn && notNeedWarn.length) {
      const f = notNeedWarn.filter((d) => {
        return d === callItem.name
      })
      if (f.length > 0) return false
    }

    return true
  }
}
