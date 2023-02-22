Page({
  data: {
    components: [
      {
        name: 'network',
        nameZN: '网络',
        path: './network/index'
      },
      {
        name: 'local-network',
        nameZN: '局部网络',
        path: './local-network/index'
      },
      {
        name: 'busy',
        nameZN: '服务繁忙',
        path: './busy/index'
      },
      {
        name: 'local-busy',
        nameZN: '局部服务繁忙',
        path: './local-busy/index'
      },
      {
        name: 'error',
        nameZN: '系统错误',
        path: './error/index'
      },
      {
        name: 'local-error',
        nameZN: '局部系统错误',
        path: './local-error/index'
      },
      {
        name: 'logoff',
        nameZN: '用户已注销',
        path: './log-off/index'
      },
      {
        name: 'local-logoff',
        nameZN: '局部用户已注销',
        path: './local-logoff/index'
      },
      {
        name: 'empty',
        nameZN: '页面空状态',
        path: './empty/index'
      },
      {
        name: 'local-empty',
        nameZN: '局部空状态',
        path: './local-empty/index'
      },
      {
        name: 'payment',
        nameZN: '付款失败',
        path: './payment/index'
      },
      {
        name: 'local-payment',
        nameZN: '局部付款失败',
        path: './local-payment/index'
      },
      {
        name: 'redpacket',
        nameZN: '红包领空',
        path: './redpacket/index'
      },
      {
        name: 'local-redpacket',
        nameZN: '局部红包领空',
        path: './local-redpacket/index'
      }
    ]
  },
  openPage(e) {
    my.navigateTo({
      url: e.target.dataset.url
    })
  }
})
