Page({
  data: {
    show: true,
    items: [
      { id: 1, value: '衣服', selected: true },
      { id: 1, value: '橱柜' },
      { id: 1, value: '衣架' },
      { id: 3, value: '数码产品' },
      { id: 4, value: '防盗门' },
      { id: 5, value: '椅子' },
      { id: 7, value: '显示器' },
      { id: 6, value: '某最新款电子产品' },
      { id: 8, value: '某某某某某牌电视游戏底座' }
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
