Page({
  data: {
    status: false,
    brightness: 1
  },
  onLoad() {
    my.getScreenBrightness({
      success: (res) => {
        this.setData({
          brightness: res.brightness
        })
      }
    })
  },
  sliderChange(e) {
    my.setScreenBrightness({
      brightness: e.detail.value,
      success: (res) => {
        this.setData({
          brightness: e.detail.value
        })
      }
    })
  },
  switchKeepScreenOn(e) {
    my.setKeepScreenOn({
      keepScreenOn: e.detail.value,
      success: (res) => {
        this.setData({
          status: e.detail.value
        })
      }
    })
  },
  getBrightness() {
    my.getScreenBrightness({
      success: (res) => {
        my.alert({
          content: `当前屏幕亮度：${res.brightness}`
        })
      }
    })
  }
})
