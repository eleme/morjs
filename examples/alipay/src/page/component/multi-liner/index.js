Page({
  data: {
    value: '内容',
    controlled: true
  },
  onInput(e) {
    this.setData({
      value: e.detail.value
    })
  }
})
