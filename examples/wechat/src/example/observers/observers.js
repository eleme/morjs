Page({
  data: {
    count: 9
  },
  updateCompProps() {
    this.setData({
      count: this.data.count + 1
    })
  }
})
