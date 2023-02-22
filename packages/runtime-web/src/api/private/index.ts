import { my } from '../my'
import Event, { getEventName, PAGE_ON_READY } from './Event'

export default {
  $tigaEvent: new Event(),
  $pageOnReadyCall: (callback) => {
    return new Promise((resolve, reject) => {
      if (typeof my !== 'object') return reject()
      if (!my.$tigaEvent) return reject()

      const handler = () => {
        try {
          callback()
          resolve('')
        } catch (e) {
          reject()
        }
      }

      my.$tigaEvent.on(getEventName(PAGE_ON_READY), handler)
    })
  }
}
