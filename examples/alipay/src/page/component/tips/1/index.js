Page({
  data: {
    showRectangle: true,
    showDialog: true,
    arrowPositions: [
      'bottom-left',
      'bottom-center',
      'bottom-right',
      'top-left',
      'top-center',
      'top-right',
      'left',
      'right'
    ],
    arrowPosIndex: 3,
    useButton: true
  },
  onCloseTap() {
    this.setData({
      showRectangle: false
    })
  },
  onRectangleTap() {
    my.alert({
      content: 'do something'
    })
  },
  onDialogTap() {
    this.setData({
      showDialog: false
    })
  },
  setInfo(e) {
    const { dataset } = e.target
    const { name } = dataset
    this.setData({
      [name]: e.detail.value
    })
  }
})
