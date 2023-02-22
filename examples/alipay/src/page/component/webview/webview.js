Page({
  data: {},
  onShareAppMessage(options) {
    my.alert({ content: JSON.stringify(options.webViewUrl) })
    return {
      title: '分享 web-View 组件',
      desc: 'View 组件很通用',
      path: 'page/component/component-pages/webview/baidu',
      'web-view': options.webViewUrl
    }
  },
  onmessage(e) {
    my.alert({
      content: '拿到数据' + JSON.stringify(e) // alert 框的标题
    })
  }
})
