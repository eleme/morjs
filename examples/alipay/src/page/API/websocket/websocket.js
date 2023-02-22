// 获取应用实例
const app = getApp()

Page({
  data: {
    appid: 'aaaaaaaa',
    websocketServer:
      '开发者服务器接口地址，必须是 wss 协议，且域名必须是后台配置的合法域名',
    sendMessageAbility: false,
    toSendMessage: 'test',
    closeLinkAbility: false,
    log: ''
  },

  onLoad() {
    // 注意： 回调方法的注册在整个小程序启动阶段只要做一次，调多次会有多次回调
    my.onSocketClose((res) => {
      my.alert({ content: '连接已关闭！' })
      this.setData({
        sendMessageAbility: false,
        closeLinkAbility: false
      })
    })
    // 注意： 回调方法的注册在整个小程序启动阶段只要做一次，调多次会有多次回调
    my.onSocketOpen((res) => {
      my.alert({ content: '连接已打开！' })
      this.setData({
        sendMessageAbility: true,
        closeLinkAbility: true
      })
    })

    my.onSocketError(function (res) {
      my.alert('WebSocket 连接打开失败，请检查！' + res)
    })

    // 注意： 回调方法的注册在整个小程序启动阶段只要做一次，调多次会有多次回调
    my.onSocketMessage((res) => {
      my.alert({ content: '收到数据！' + JSON.stringify(res) })
    })
  },

  onServerAddressComplete(e) {
    this.setData({
      websocketServer: e.detail.value
    })
  },

  onSendMessageReady(e) {
    this.setData({
      toSendMessage: e.detail.value
    })
  },

  connect_start() {
    my.connectSocket({
      url: this.data.websocketServer, // 开发者服务器接口地址，必须是 wss 协议，且域名必须是后台配置的合法域名
      success: (res) => {
        my.showToast({
          content: 'success' // 文字内容
        })
      },
      fail: () => {
        my.showToast({
          content: 'fail' // 文字内容
        })
      }
    })
  },

  send_start() {
    my.sendSocketMessage({
      data: this.data.toSendMessage, // 需要发送的内容
      success: (res) => {
        my.alert({ content: '数据发送！' + this.data.toSendMessage })
      }
    })
  },

  close_start() {
    my.closeSocket()
  }
})
