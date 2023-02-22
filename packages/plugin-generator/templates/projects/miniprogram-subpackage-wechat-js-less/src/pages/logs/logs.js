import { wPage } from '@morjs/core'
import { formatTime } from '../../utils/util'

wPage({
  data: {
    logs: []
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log: string) => {
        return {
          date: formatTime(new Date(log)),
          timeStamp: log
        }
      })
    })
  }
})
