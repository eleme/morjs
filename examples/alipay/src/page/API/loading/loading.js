Page({
  showLoading() {
    my.showLoading({
      content: '加载中...',
      delay: '1000'
    })
    setTimeout(() => {
      my.hideLoading()
    }, 5000)
  }
})
