Page({
  data: {
    value: '这是一个输入框',
    currentSwiperItem: 0,
    scrollTop1: 40
  },
  onInput(event) {
    console.log(event)
  },
  customInput() {
    this.setData({
      value: this.data.value + 1
    })
  }
})
