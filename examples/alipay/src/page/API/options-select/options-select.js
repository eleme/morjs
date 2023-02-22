Page({
  openOne() {
    my.optionsSelect({
      title: '还款日选择',
      optionsOne: [
        '每周一',
        '每周二',
        '每周三',
        '每周四',
        '每周五',
        '每周六',
        '每周日'
      ],
      selectedOneIndex: 2,
      success(res) {
        my.alert({
          content: JSON.stringify(res, null, 2)
        })
      }
    })
  },
  openTwo() {
    my.optionsSelect({
      title: '出生年月选择',
      optionsOne: [
        '2014年',
        '2013年',
        '2012年',
        '2011年',
        '2010年',
        '2009年',
        '2008年'
      ],
      optionsTwo: [
        '一月',
        '二月',
        '三月',
        '四月',
        '五月',
        '六月',
        '七月',
        '八月',
        '九月',
        '十月',
        '十一月',
        '十二月'
      ],
      selectedOneIndex: 3,
      selectedTwoIndex: 5,
      success(res) {
        my.alert({
          content: JSON.stringify(res, null, 2)
        })
      }
    })
  }
})
