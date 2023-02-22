Page({
  vibrate() {
    my.vibrate({
      success: () => {
        my.alert({ title: '振动起来了' })
      }
    })
  },
  vibrateLong() {
    if (my.canIUse('vibrateLong')) {
      my.vibrateLong((res) => {})
    } else {
      my.alert({
        title: '客户端版本过低',
        content: 'my.vibrateLong() 需要 10.1.35 及以上版本'
      })
    }
  },
  vibrateShort() {
    if (my.canIUse('vibrateShort')) {
      my.vibrateShort((res) => {})
    } else {
      my.alert({
        title: '客户端版本过低',
        content: 'my.vibrateShort() 需要 10.1.35 及以上版本'
      })
    }
  }
})
