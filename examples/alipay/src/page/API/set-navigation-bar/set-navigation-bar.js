Page({
  setNavigationBar(e) {
    var title = e.detail.value.title
    var backgroundColor = e.detail.value.backgroundColor
    var borderBottomColor = e.detail.value.borderBottomColor
    var image = e.detail.value.image
    console.log(title)
    my.setNavigationBar({
      title,
      backgroundColor,
      borderBottomColor,
      image
    })
  },
  resetNavigationBar() {
    my.setNavigationBar({
      reset: true,
      title: '重置导航栏样式'
    })
  }
})
