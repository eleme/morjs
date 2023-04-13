import { getGlobalObject, transformApis } from '@morjs/runtime-base'
import { needPromisfiedApis as needPromisfiedApisForWechat } from '../wechat/apis'

/**
 * 字节小程序 需要被 promisified 的接口
 */
const needPromisfiedApis = needPromisfiedApisForWechat.concat([
  'checkFollowState',
  'exitMiniProgram',
  'followOfficialAccount',
  'getMenuButtonLayout',
  'hideInteractionBar',
  'pay',
  'navigateToVideoView',
  'showInteractionBar',
  'openEcGood'
])

export function initApi(mor) {
  transformApis(
    mor,
    getGlobalObject(),
    {
      needPromisfiedApis
    },
    false,
    false
  )
}
