Page({
  mixins: [require('../../mixin/common')],
  openDefault() {
    wx.navigateTo({
      url: '/example/button/button_default'
    })
  },
  openBottomfixed() {
    wx.navigateTo({
      url: '/example/button/button_bottom_fixed'
    })
  }
})
