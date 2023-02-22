Page({
  data: {
    show: true,
    items: [
      { id: 1, value: '衣服啊', selected: true },
      { id: 1, value: '橱柜' },
      { id: 1, value: '衣服' },
      { id: 1, value: '橱柜' },
      { id: 1, value: '衣服' },
      { id: 1, value: '橱柜' },
      { id: 1, value: '衣服' },
      { id: 1, value: '橱柜' },
      { id: 1, value: '橱柜' }
    ]
  },
  handleCallBack(data) {
    my.alert({
      content: data
    })
  },
  toggleFilter() {
    this.setData({
      show: !this.data.show
    })
  }
})
