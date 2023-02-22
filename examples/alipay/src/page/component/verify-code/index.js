Page({
  data: {
    verifyCode: ''
  },
  onSend() {
    my.alert({
      title: 'verify code sent'
    })
  },
  onInput(e) {
    this.setData({
      verifyCode: e.detail.value
    })
  },
  onClear() {}
})
