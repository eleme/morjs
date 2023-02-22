Page({
  data: {
    cardNo: '1234****',
    name: '',
    layerShow1: '',
    layerShow2: '垂直输入框的布局',
    layerShow3: 'disabled 状态的 input'
  },
  onExtraTap() {
    my.alert({
      content: 'extra tapped'
    })
  },
  onItemInput(e) {
    this.setData({
      [e.target.dataset.field]: e.detail.value
    })
  },
  onItemFocus() {},
  onItemBlur() {},
  onItemConfirm() {},
  onClear(e) {
    this.setData({
      [e.target.dataset.field]: ''
    })
  },
  onSend() {
    my.alert({
      title: 'verify code sent'
    })
  }
})
