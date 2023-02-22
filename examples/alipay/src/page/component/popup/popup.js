Page({
  data: {
    showLeft: false,
    showRight: false,
    showTop: false,
    showBottom: false
  },
  onTopBtnTap() {
    this.setData({
      showTop: true
    })
  },
  onRightBtnTap() {
    this.setData({
      showRight: true
    })
  },
  onLeftBtnTap() {
    this.setData({
      showLeft: true
    })
  },
  onButtomBtnTap() {
    this.setData({
      showBottom: true
    })
  },
  onPopupClose() {
    this.setData({
      showLeft: false,
      showRight: false,
      showTop: false,
      showBottom: false
    })
  }
})
