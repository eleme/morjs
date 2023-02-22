Page({
  data: {
    list: [
      {
        url: 'https://gw.alipayobjects.com/mdn/rms_ce4c6f/afts/img/A*XMCgSYx3f50AAAAAAAAAAABkARQnAQ',
        x: '150rpx',
        y: '200rpx',
        width: '200px',
        height: '200px'
      },
      {
        url: 'https://gw.alipayobjects.com/mdn/rms_ce4c6f/afts/img/A*whN9RZGSym8AAAAAAAAAAABkARQnAQ',
        x: '250rpx',
        y: '150rpx',
        width: '200px',
        height: '100px'
      },
      {
        url: 'https://gw.alipayobjects.com/mdn/rms_ce4c6f/afts/img/A*XMCgSYx3f50AAAAAAAAAAABkARQnAQ',
        x: '350rpx',
        y: '300rpx',
        width: '100px',
        height: '100px'
      },
      {
        url: 'https://gw.alipayobjects.com/mdn/rms_ce4c6f/afts/img/A*whN9RZGSym8AAAAAAAAAAABkARQnAQ',
        x: '400rpx',
        y: '400rpx',
        width: '200rpx',
        height: '300rpx'
      }
    ],
    guideShow: false,
    guideJump: true
  },
  onLoad() {},
  closeGuide() {
    this.setData({
      guideShow: false
    })
  },
  onShowJumpGuide() {
    this.setData({
      guideShow: true,
      guideJump: true
    })
  },
  onShowGuide() {
    this.setData({
      guideShow: true,
      guideJump: false
    })
  }
})
