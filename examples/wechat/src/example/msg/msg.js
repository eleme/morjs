Page({
  mixins: [require('../../mixin/common')],
  openSuccess() {
    wx.navigateTo({
      url: '/example/msg/msg_success'
    })
  },
  openText() {
    wx.navigateTo({
      url: '/example/msg/msg_text'
    })
  },
  openTextPrimary() {
    wx.navigateTo({
      url: '/example/msg/msg_text_primary'
    })
  },
  openCustomAreaPreview() {
    wx.navigateTo({
      url: '/example/msg/msg_custom_area_preview'
    })
  },
  openCustomAreaTips() {
    wx.navigateTo({
      url: '/example/msg/msg_custom_area_tips'
    })
  },
  openCustomAreaCell() {
    wx.navigateTo({
      url: '/example/msg/msg_custom_area_cell'
    })
  },
  openFail() {
    wx.navigateTo({
      url: '/example/msg/msg_warn'
    })
  }
})
