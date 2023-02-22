import { getGlobalObject } from '@morjs/api/lib/env'
import { transformApis } from '@morjs/api/lib/utils'
import { needPromisfiedApis as needPromisfiedApisForWechat } from '../wechat/apis'

/**
 * QQ 小程序需要被 promisified 的接口
 */
const needPromisfiedApis = needPromisfiedApisForWechat.concat([
  'getQQRunData',
  'requestWxPayment',
  'setAvatar',
  'shareInvite',
  'updateBookshelfReadTime'
])

export function initApi(mor) {
  transformApis(mor, getGlobalObject(), {
    needPromisfiedApis
  })
}
