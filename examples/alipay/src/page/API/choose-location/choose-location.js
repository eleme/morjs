Page({
  data: {
    longitude: '120.126293',
    latitude: '30.274653',
    name: '黄龙万科中心',
    address: '学院路77号'
  },
  chooseLocation() {
    var that = this
    my.chooseLocation({
      success: (res) => {
        console.log(JSON.stringify(res))
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          name: res.name,
          address: res.address
        })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      }
    })
  }
})
