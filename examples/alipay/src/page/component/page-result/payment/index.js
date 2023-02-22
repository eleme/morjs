Page({
  data: {
    footer: [
      {
        text: '返回'
      }
    ]
  },
  onTapLeft() {
    my.reLaunch({
      url: '/pages/page-result/index'
    })
  }
})
