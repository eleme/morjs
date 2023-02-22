const banks = ['网商银行', '建设银行', '工商银行', '浦发银行']

Page({
  data: {
    bank: ''
  },
  onPickerTap() {
    my.showActionSheet({
      title: '选择发卡银行',
      items: banks,
      success: (res) => {
        this.setData({
          bank: banks[res.index]
        })
      }
    })
  }
})
