Page({
  data: {},
  tradePay() {
    my.tradePay({
      orderStr: 'xxx', //完整的支付参数拼接成的字符串，从服务端获取，具体是方法请参考小程序开发文档
      success: (res) => {
        my.alert({
          title: res.resultCode
        })
      },
      fail: (res) => {
        my.alert({
          content: JSON.stringify(res)
        })
      }
    })
  }
})
