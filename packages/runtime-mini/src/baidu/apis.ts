import { getGlobalObject } from '@morjs/api/lib/env'
import { transformApis } from '@morjs/api/lib/utils'
import { needPromisfiedApis as needPromisfiedApisForWechat } from '../wechat/apis'

/**
 * 百度小程序 需要被 promisified 的接口
 */
const needPromisfiedApis = needPromisfiedApisForWechat.concat([
  'addEventOnCalendar',
  'chooseAlbum',
  'closeCommunityEditor',
  'getSwanId',
  'requestPolymerPayment',
  'navigateBackSmartProgram',
  'navigateToSmartProgram',
  'setPageInfo',
  'closeReplyEditor',
  'deleteBookShelf',
  'deleteEventOnCalendar',
  'getSystemRiskInfo',
  'insertBookshelf',
  'loadSubPackage',
  'openCommunityEditor',
  'openReplyEditor',
  'openShare',
  'setDocumentTitle',
  'setMetaDescription',
  'setMetaKeywords',
  'shareFile',
  'subscribeService',
  'updateBookshelfReadTime'
])

export function initApi(mor) {
  transformApis(mor, getGlobalObject(), {
    needPromisfiedApis
  })
}
