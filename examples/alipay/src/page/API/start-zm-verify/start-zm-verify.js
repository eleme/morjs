Page({
  startZMVerify() {
    if (!my.canIUse('startZMVerify')) {
      my.alert({
        title: '客户端版本过低',
        content: '请升级支付宝版本'
      })
      return
    }

    my.startZMVerify({
      bizNo: 'demo',
      success: (res) => {
        my.alert({ title: 'success:' + JSON.stringify(res) })
      },
      fail: (res) => {
        my.alert({ title: 'fail: ' + JSON.stringify(res) })
      }
    })
  }
})
