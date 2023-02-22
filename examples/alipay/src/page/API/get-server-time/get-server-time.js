Page({
  getServerTime() {
    my.getServerTime({
      success: (res) => {
        my.alert({
          content: res.time
        })
      }
    })
  }
})
