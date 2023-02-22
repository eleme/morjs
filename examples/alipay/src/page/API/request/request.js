Page({
  httpRequest() {
    my.httpRequest({
      url: 'http://httpbin.org/post',
      method: 'POST',
      data: {
        from: '支付宝',
        production: 'AlipayJSAPI'
      },
      dataType: 'json',
      success: function (res) {
        my.alert({ content: JSON.stringify(res) })
      },
      fail: function (res) {
        my.alert({ content: JSON.stringify(res) })
      },
      complete: function (res) {
        // my.alert({title: 'complete'});
      }
    })
  },
  request() {
    my.request({
      url: 'https://httpbin.org/post',
      method: 'POST',
      data: {
        from: '支付宝',
        production: 'AlipayJSAPI'
      },
      dataType: 'json',
      success: function (res) {
        my.alert({ content: JSON.stringify(res) })
      },
      fail: function (res) {
        my.alert({ content: JSON.stringify(res) })
      },
      complete: function (res) {
        // my.alert({title: 'complete'});
      }
    })
  },
  requestAndAbort() {
    const task = my.request({
      url: 'https://httpbin.org/post',
      method: 'POST',
      data: {
        from: '支付宝',
        production: 'AlipayJSAPI'
      },
      dataType: 'json',
      success: function (res) {
        my.alert({ content: JSON.stringify(res) })
      },
      fail: function (res) {
        my.alert({ content: JSON.stringify(res) })
      },
      complete: function (res) {
        // my.alert({title: 'complete'});
      }
    })
    task.abort()
  }
})
