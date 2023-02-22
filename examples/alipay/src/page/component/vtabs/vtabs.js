Page({
  data: {
    activeTab: 2,
    tabs: [
      { title: '选项二', anchor: 'a', number: '6' },
      { title: '选项', anchor: 'b', number: '66' },
      { title: '不超过五字', anchor: 'c', number: '99+' },
      { title: '选项四选项四选项四选项四', anchor: 'd' },
      { title: '选项五', anchor: 'e' },
      { title: '选项六', anchor: 'f' }
    ]
  },
  handleChange(index) {
    this.setData({
      activeTab: index
    })
  },
  onChange(index) {
    this.setData({
      activeTab: index
    })
  }
})
