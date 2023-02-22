import WebView from './web-view'

class WebViewContext {
  private webview: WebView
  constructor(webviewId) {
    this.webview = document.querySelector(`#${webviewId}`) as WebView
  }

  postMessage(data) {
    this.webview.sendMessage(data)
  }
}

export default {
  createWebViewContext(webviewId) {
    return new WebViewContext(webviewId)
  }
}
