export type mockMapItem = string[] | ((opts: object) => boolean)[]

interface IMockMap {
  [key: string]: mockMapItem
}
type IOriginMap = IMockMap

export interface MockConfig {
  debug: boolean
  path: string
  originMap?: IOriginMap
}

export interface IConfig {
  context?: any
  disableMock?: boolean
  notNeedNoMockWarn?: boolean | string[]
  isDebug?: boolean
  notNeedLog?: boolean | string[]
  originMap?: IOriginMap
}

export enum IGlobalType {
  WECHAT = 'wx',
  ALIPAY = 'my',
  QQ = 'qq',
  BAIDU = 'swan',
  DINGDING = 'dd',
  TAOBAO = 'my',
  BYTEDANCE = 'tt',
  KUAISHOU = 'ks',
  WEB = 'window'
}

export enum GlobalType {
  call = 'call',
  request = 'request'
}

// 业务中实际调用时的回调函数
export type Callback = (...arg: any[]) => void

export interface ICallItem {
  type: GlobalType
  name: string
  opts?: any
  callback?: Callback
  _noOpts?: boolean
}

// mock 方法
export type MockFn = (opts: object, callback?: Callback) => any

export type GlobalFunction = (...arg: any[]) => void

export interface IGlobal {
  [key: string]: GlobalFunction
}

export type AdapterFunction = (...arg: any[]) => void

interface IAdapter {
  [key: string]: AdapterFunction
}

export type IAdapters = IAdapter[]
