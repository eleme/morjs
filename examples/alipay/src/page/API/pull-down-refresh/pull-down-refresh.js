Page({
  onPullDownRefresh() {
    console.log('onPullDownRefresh', new Date())
  },
  stopPullDownRefresh() {
    my.stopPullDownRefresh({
      complete(res) {
        console.log(res, new Date())
      }
    })
  }
})
