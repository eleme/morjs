import IntersectionObserver from 'intersection-observer'
import MobileDetect from 'mobile-detect'
import * as AppAPI from './app/index'
import generateBaseAPI from './base'
import DeviceClipboardAPI from './device/clipboard/index'
import DeviceMakePhoneCallAPI from './device/make-phone-call'
import DeviceNetworkAPI from './device/network'
import DeviceSystemInfoAPI from './device/systeminfo'
import FileAPI from './file/index'
import ImageAPI from './image'
import KeyboardAPI from './keyboard'
import LocationAPI from './location'
import { my } from './my'
import NetworkAPI from './network'
import PrivateAPI from './private/index'
import ReportAnalyticsAPI from './reportAnalytics'
import RouterExtensionAPI from './routerExtension'
import StorageAPI from './storage'
import UIElementQueryAPI from './ui/element-query/index'
import UITabBarAPI from './ui/tabBar/index'
import {
  appendApis,
  convertApis,
  DEFAULT_API_NO_CONFLICT
} from './utils/extendApi'
import { pageOnReadyCallApi } from './utils/index'
import VideoAPI from './video'

appendApis(
  {
    ...generateBaseAPI(my),
    ...convertApis(StorageAPI),
    ...convertApis(KeyboardAPI),
    ...convertApis(LocationAPI),
    ...convertApis(UIElementQueryAPI),
    ...convertApis(UITabBarAPI),
    ...convertApis(FileAPI),
    ...convertApis(ImageAPI),
    ...convertApis(NetworkAPI),
    ...convertApis(DeviceSystemInfoAPI),
    ...convertApis(DeviceNetworkAPI),
    ...convertApis(DeviceMakePhoneCallAPI),
    ...convertApis(DeviceClipboardAPI),
    ...convertApis(ReportAnalyticsAPI),
    ...convertApis(VideoAPI),
    ...convertApis(RouterExtensionAPI),
    ...convertApis(PrivateAPI),
    ...convertApis(AppAPI)
  },
  DEFAULT_API_NO_CONFLICT
)

// 有些 API 需要页面 didMount 后调用，但是业务中经常在 onLoad 调用，为了做适配，在 pageOnReady 中执行
pageOnReadyCallApi(my)

export default my

export {
  appendApis,
  /**
   * 暴露 MobileDetect 方便外部共用
   */
  MobileDetect,
  /**
   * 暴露 IntersectionObserver 方便外部共用
   */
  IntersectionObserver
}
