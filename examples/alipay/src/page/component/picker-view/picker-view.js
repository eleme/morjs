Page({
  data: {},
  onChange(e) {
    console.log(e.detail.value)
    this.setData({
      value: e.detail.value
    })
  }
})
