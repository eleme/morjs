import { getGlobalObject, transformApis } from '@morjs/api'
import { needPromisfiedApis as needPromisfiedApisForWechat } from '../wechat/apis'

/**
 * 快手小程序 需要被 promisified 的接口
 */
const needPromisfiedApis = needPromisfiedApisForWechat.concat(['pay'])

export function initApi(mor) {
  transformApis(mor, getGlobalObject(), {
    needPromisfiedApis
  })
}
