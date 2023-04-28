import get from 'lodash.get'
import { copy } from './helper'

const isSupportNavigatorClipboard = () =>
  typeof navigator.clipboard === 'object' && window.isSecureContext
// 查询用户是否配置强制使用 command 实现
const requireUseCommand =
  get(window.$MOR_APP_CONFIG, 'apis.clipboard') === 'command'

const NOT_SUPPORT_CLIPBOARD = "Your browser doesn't support clipboard api."

const reject = (reason = NOT_SUPPORT_CLIPBOARD) => Promise.reject(reason)

export default {
  setClipboard({ text = '' }) {
    if (requireUseCommand || !isSupportNavigatorClipboard()) {
      /*
        两个使用场景：
         1. 不支持 navigator.clipboard 的兜底
         2. 某些容器虽然存在 navigator.clipboard，但是无法正常使用复制功能
      */
      return copy(text, { container: document.body })
    }

    return navigator.clipboard.writeText(text)
  },

  // 粘贴板仅通过 navigator.clipboard 实现，因为 queryCommand('paste') 方案已经废弃
  getClipboard() {
    if (!isSupportNavigatorClipboard()) return reject()

    return navigator.clipboard.readText().then((text) => ({ text }))
  }
}
