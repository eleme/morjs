const position = [
  'top',
  'topRight',
  'rightTop',
  'right',
  'rightBottom',
  'bottomRight',
  'bottom',
  'bottomLeft',
  'leftBottom',
  'left',
  'leftTop',
  'topLeft'
]
Page({
  data: {
    position: position[0],
    show: false,
    showMask: true,
    showIcon: true
  },
  onShowPopoverTap() {
    this.setData({
      show: !this.data.show
    })
  },
  onNextPositionTap() {
    let index = position.indexOf(this.data.position)
    index = index >= position.length - 1 ? 0 : index + 1
    this.setData({
      show: true,
      position: position[index]
    })
  },
  onMaskChangeTap() {
    this.setData({
      showMask: !this.data.showMask
    })
  },
  onIconChangeTap() {
    this.setData({
      showIcon: !this.data.showIcon
    })
  },
  onMaskClick() {
    this.setData({
      show: false
    })
  },
  itemTap1(e) {
    my.alert({
      content: `点击_${e.currentTarget.dataset.direction}`
    })
  },
  itemTap2(e) {
    my.alert({
      content: `点击_${e.currentTarget.dataset.index}`
    })
  }
})
