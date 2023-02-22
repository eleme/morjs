Page({
  data: {
    title: '操作成功',
    subTitle:
      '内容详情可折行，建议不超过两内容。也可以通过 slot="tips" 插入更具有功能性的提示。',
    type: 'success',
    items: [
      { name: 'success', value: 'success', checked: true },
      { name: 'fail', value: 'fail' },
      { name: 'info', value: 'info' },
      { name: 'warn', value: 'warn' },
      { name: 'waiting', value: 'waiting' }
    ]
  },
  onLoad() {},
  goBack() {
    my.navigateBack()
  },
  radioChange(e) {
    this.setData({
      type: e.detail.value
    })
  },
  titleChange(e) {
    this.setData({
      title: e.detail.value
    })
  },
  subtitleChange(e) {
    this.setData({
      subTitle: e.detail.value
    })
  },
  onChange(e) {
    if (e.detail.value) {
      this.setData({
        mainButton: {
          buttonText: '主要操作'
        },
        subButton: {
          buttonText: '辅助操作'
        }
      })
    } else {
      this.setData({
        mainButton: null,
        subButton: null
      })
    }
  }
})
