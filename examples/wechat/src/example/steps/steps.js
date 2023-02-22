Page({
  mixins: [require('../../mixin/common')],
  openStepsHorizonal() {
    wx.navigateTo({
      url: '/example/steps/steps_horizonal'
    })
  },
  openStepsVertical() {
    wx.navigateTo({
      url: '/example/steps/steps_vertical'
    })
  }
})
