Page({
  data: {
    longPassword: ''
  },
  onInput(e) {
    this.setData({
      longPassword: e.detail.value
    })
  },
  onClear() {
    this.setData({
      longPassword: ''
    })
  }
})
