Page({
  data: {
    condition: false
  },
  onReady() {
    my.onUserCaptureScreen(() => {
      my.alert({
        content: '收到用户截图'
      })
    })
  },
  offUserCaptureScreen() {
    my.offUserCaptureScreen()
    this.setData({
      condition: false
    })
  },
  onUserCaptureScreen() {
    my.onUserCaptureScreen(() => {
      my.alert({
        content: '收到用户截图'
      })
    })
    this.setData({
      condition: true
    })
  }
})
