Page({
  onLoad() {
    this.titleClick = my.on('titleClick', () => {
      console.log('title clicked')
      my.alert({
        title: '亲',
        content: '您刚刚点击了标题',
        buttonText: '我知道了'
      })
    })
  },
  onUnload() {
    this.titleClick.remove()
  }
})
