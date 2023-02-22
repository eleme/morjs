Page({
  data: {
    thumb:
      'https://gw.alipayobjects.com/mdn/rms_ce4c6f/afts/img/A*XMCgSYx3f50AAAAAAAAAAABkARQnAQ',
    expand3rd: false
  },
  onCardClick(ev) {
    my.alert({
      content: ev.info
    })
  },
  onActionClick() {
    my.alert({
      content: 'action clicked'
    })
  },
  onExtraActionClick() {
    my.alert({
      content: 'extra action clicked'
    })
  },
  toggle() {
    this.setData({
      expand3rd: !this.data.expand3rd
    })
  }
})
