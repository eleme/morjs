import formatLocation from './format-location.js'

Page({
  data: {
    hasLocation: false
  },
  getLocation() {
    var that = this
    my.showLoading()
    my.getLocation({
      success(res) {
        my.hideLoading()
        console.log(res)
        that.setData({
          hasLocation: true,
          location: formatLocation(res.longitude, res.latitude)
        })
      },
      fail() {
        my.hideLoading()
        my.alert({ title: '定位失败' })
      }
    })
  },
  clear() {
    this.setData({
      hasLocation: false
    })
  }
})
