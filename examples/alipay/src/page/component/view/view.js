Page({
  data: {
    pageName: 'component/view'
  },
  onLoad() {
    this.setData({
      returnIndex: getCurrentPages().length === 1
    })
  },
  returnIndex() {
    my.switchTab({ url: '/page/tabBar/component/index' })
  }
})
