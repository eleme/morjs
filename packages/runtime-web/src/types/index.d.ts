/// <reference types="mini-types" />
type PromiseOptions<O> = Omit<O, 'success' | 'fail' | 'complete'>

type IGetLocationFailErrorType = 11 | 12 | 13 | 14

interface PhoneOptions {
  [number: string]: string
}

interface Window {
  my: any
  getApp: () => IApp
  getCurrentPages: any
  $customRoutes: any[]
  $getRoute: () => string
  $getPageId: () => string
  __history: any
  $$options$$: any
  $rpxToRem: any
  Swiper: any
  __tigaBack?: any
  Plyr?: any
  AMap?: any
  __TIGA_MAP?: any
  /**
   * 用户运行时自定义配置
   */
  $MOR_APP_CONFIG?: any
  _AMapSecurityConfig?: any
}

interface ConvertApiOptions {
  [prop: string]: any
}

interface NetworkInformation extends EventTarget {
  readonly type: ConnectionType
  effectiveType: string
}

declare namespace my {
  interface IUploadFileOptions {
    name: string
    withCredentials: string
  }

  let $tigaEvent
}

interface CancelPromise extends Promise<any> {
  cancel?: () => void
  __cancelpromise__?: boolean
}
