Page({
  data: {
    randomLine: 0
  },
  onShow() {
    this.setData({
      randomLine: parseInt(Math.random() * 20 + 1, 0)
    })
  },
  onChange(e) {
    console.log('collapse change', e)
  }
})
