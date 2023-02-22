Page({
  onLoad() {
    this.callback = (res) => {
      var levelString = 'iOS 设备, 无 level 传入.'
      switch (res.level) {
        case 10:
          levelString = 'Android 设备, level = TRIM_MEMORY_RUNNING_LOW'
          break
        case 15:
          levelString = 'Android 设备, level = TRIM_MEMORY_RUNNING_CRITICAL'
          break
      }
      my.alert({
        title: '收到内存不足告警',
        content: levelString
      })
    }
    this.isApiAvailable = my.canIUse('onMemoryWarning')
  },
  onMemoryWarning() {
    if (this.isApiAvailable) {
      my.onMemoryWarning(this.callback)
    } else {
      my.alert({
        title: '客户端版本过低',
        content:
          'my.onMemoryWarning() 和 my.offMemoryWarning() 需要 10.1.35 及以上版本'
      })
    }
  },
  onUnload() {
    if (this.isApiAvailable) {
      my.offMemoryWarning(this.callback)
    }
  }
})
