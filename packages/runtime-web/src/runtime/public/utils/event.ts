import { my } from '../../../api/my'

export const Event = {
  emit(eventName: string, params = {}) {
    // 直接使用 api 挂载的 my 对象
    if (typeof my === 'undefined') return
    if (typeof my.$tigaEvent === 'undefined') return

    my.$tigaEvent.emit(eventName, params)
  }
}
