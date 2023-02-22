Page({
  reportAnalytics() {
    my.reportAnalytics('demo_click', {})
    my.alert({
      content: '数据上报成功，请到小程序管理后台-数据分析中查看'
    })
  }
})
