declare const wx: any
declare const my: any
declare const qq: any
declare const swan: any
declare const dd: any
declare const tt: any
declare const ks: any
declare const window: any

/**
 * 支持的 env 类型
 * 用于 运行时判断
 */
export enum ENV_TYPE {
  /**
   * 微信小程序
   */
  WECHAT = 'WECHAT',
  /**
   * 支付宝小程序
   */
  ALIPAY = 'ALIPAY',
  /**
   * QQ 小程序
   */
  QQ = 'QQ',
  /**
   * 百度小程序
   */
  BAIDU = 'BAIDU',
  /**
   * 钉钉小程序
   */
  DINGDING = 'DINGDING',
  /**
   * 淘宝小程序
   */
  TAOBAO = 'TAOBAO',
  /**
   * 字节小程序
   */
  BYTEDANCE = 'BYTEDANCE',
  /**
   * 快手小程序
   */
  KUAISHOU = 'KUAISHOU',
  /**
   * Web 应用
   */
  WEB = 'WEB'
}

/**
 * 支持的 env 类型描述
 */
export enum ENV_TYPE_DESC {
  /**
   * 微信小程序
   */
  WECHAT = '微信小程序',
  /**
   * 支付宝小程序
   */
  ALIPAY = '支付宝小程序',
  /**
   * QQ 小程序
   */
  QQ = 'QQ 小程序',
  /**
   * 百度小程序
   */
  BAIDU = '百度小程序',
  /**
   * 钉钉小程序
   */
  DINGDING = '钉钉小程序',
  /**
   * 淘宝小程序
   */
  TAOBAO = '淘宝小程序',
  /**
   * 字节小程序
   */
  BYTEDANCE = '字节小程序',
  /**
   * 字节小程序
   */
  KUAISHOU = '快手小程序',
  /**
   * Web 应用
   */
  WEB = 'Web 应用'
}

export enum SOURCE_TYPE {
  /**
   * 微信小程序 DSL 支持
   */
  WECHAT = 'w',
  /**
   * 支付宝小程序 DSL 支持
   */
  ALIPAY = 'a'
}

let _ENV = null

/**
 * 获取小程序运行环境
 * @returns 当前环境
 */
export function getEnv(): ENV_TYPE | 'Unknown environment' {
  if (_ENV) return _ENV
  // 此处 tt 的判断需要在 wx 之前，因为在字节小程序中同时支持调用 tt 和 wx 对象
  if (typeof tt !== 'undefined' && tt.getSystemInfo) {
    _ENV = ENV_TYPE.BYTEDANCE
    return _ENV
  }
  // 此处 swan 的判断需要在 my 之前，因为在百度小程序初始化阶段含有 my 对象
  if (typeof swan !== 'undefined' && swan.getSystemInfo) {
    _ENV = ENV_TYPE.BAIDU
    return _ENV
  }
  if (typeof wx !== 'undefined' && wx.getSystemInfo) {
    _ENV = ENV_TYPE.WECHAT
    return _ENV
  }
  if (typeof dd !== 'undefined' && dd.getSystemInfo) {
    _ENV = ENV_TYPE.DINGDING
    return _ENV
  }
  if (
    typeof my !== 'undefined' &&
    typeof my?.tb !== 'undefined' &&
    my.getSystemInfo
  ) {
    _ENV = ENV_TYPE.TAOBAO
    return _ENV
  }
  if (typeof my !== 'undefined' && my.getSystemInfo) {
    _ENV = ENV_TYPE.ALIPAY
    return _ENV
  }
  if (typeof qq !== 'undefined' && qq.getSystemInfo) {
    _ENV = ENV_TYPE.QQ
    return _ENV
  }
  if (typeof ks !== 'undefined' && ks.getSystemInfo) {
    _ENV = ENV_TYPE.KUAISHOU
    return _ENV
  }
  if (typeof window !== 'undefined') {
    _ENV = ENV_TYPE.WEB
    return _ENV
  }

  return 'Unknown environment'
}

/**
 * 获取当前环境描述信息
 * @returns 当前环境描述信息
 */
export function getEnvDesc(): string {
  return ENV_TYPE_DESC[getEnv()]
}

/**
 * 获取全局对象
 * @returns 全局对象
 */
export function getGlobalObject() {
  const env = getEnv()

  if (env === ENV_TYPE.WECHAT) return wx
  if (env === ENV_TYPE.ALIPAY) return my
  if (env === ENV_TYPE.TAOBAO) return my
  if (env === ENV_TYPE.QQ) return qq
  if (env === ENV_TYPE.BYTEDANCE) return tt
  if (env === ENV_TYPE.BAIDU) return swan
  if (env === ENV_TYPE.DINGDING) return dd
  if (env === ENV_TYPE.KUAISHOU) return ks
  if (env === ENV_TYPE.WEB) return window

  return null
}
