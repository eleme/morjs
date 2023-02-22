Page({
  data: {
    footer: [
      {
        text: '修复'
      },
      {
        text: '刷新'
      }
    ]
  },

  onTapLeft(e) {
    console.log(e, 'onTapLeft')
  },
  onTapRight(e) {
    console.log(e, 'onTapRight')
  }
})
