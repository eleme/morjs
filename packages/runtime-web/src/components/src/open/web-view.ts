import { css, html, property, query } from 'lit-element'
import { my } from '../../../api/my'
import { BaseElement } from '../baseElement'

let webviewId = 1
export default class WebView extends BaseElement {
  timeId: any
  maxTimeCount: number

  static get styles() {
    return css`
      :host {
        display: block;
      }

      iframe {
        margin: 0;
        padding: 0;
        border-width: 0;
        width: 100%;
        min-height: 100vh;
      }
    `
  }

  @property({ type: String })
  src

  @query('iframe')
  iFrame: HTMLIFrameElement

  webviewId: number

  constructor() {
    super()
    webviewId++
    this.webviewId = webviewId

    this.timeId = 0
    this.maxTimeCount = 10 // 最大重试发送次数
  }

  connectedCallback() {
    super.connectedCallback()
    this.setAttribute('webviewid', this.webviewId + '')
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    this.clearTimeout()
  }

  onFrameLoad() {
    this.sendWebviewId()
    this.syncWebviewTitleToHeader()
  }

  sendWebviewId() {
    // 递归终止条件
    if (this.timeId === undefined || this.maxTimeCount <= 0) return

    this.timeId = setTimeout(() => {
      this.postMessage({ tigaWebviewId: this.webviewId })
      this.sendWebviewId()
      this.maxTimeCount -= 1
    }, 150)
  }

  stopSendWebviewIdRecycle() {
    this.clearTimeout()
  }

  clearTimeout() {
    if (this.timeId) {
      clearTimeout(this.timeId)
      this.timeId = undefined
    }
  }

  // webview 内容 title 同步到 header
  syncWebviewTitleToHeader() {
    // 由于同源策略限制，目前仅支持同源页面title获取
    try {
      const { title = '' } = this.iFrame.contentWindow.document

      typeof my === 'object' &&
        typeof my.setNavigationBar === 'function' &&
        my.setNavigationBar({ title })
    } catch (e) {
      // 获取失败，多半是因为跨域
      // 跨域的场景需要webview加载的H5通过postMessage与Webview交互设置title
    }
  }

  private postMessage(data) {
    this.iFrame.contentWindow.postMessage(data, '*')
  }

  sendMessage(data) {
    this.iFrame.contentWindow.postMessage(
      { type: 'tiga_api_postMessage', data },
      '*'
    )
  }

  onRecivedMessgae(data) {
    let result = data

    try {
      result = JSON.parse(result)
    } catch (e) {}

    this.dispatchEvent(
      new CustomEvent('message', {
        detail: result
      })
    )
  }

  render() {
    return html`<iframe
      src="${this.src || ''}"
      @load="${this.onFrameLoad}"
      id="${this.webviewId}"
    />`
  }
}

window.onmessage = function (e: MessageEvent) {
  const { data } = e
  if (data) {
    if (data.type === 'tiga_api') {
      const { name: apiName, params, callbackId, tigaWebviewId } = data
      const isReceiveWebviewId = apiName === 'receiveWebviewId'
      let result
      if (apiName === 'postMessage' || isReceiveWebviewId) {
        //  postMessage  需要特殊处理
        result = new Promise((resolve) => {
          const webview: WebView = document.querySelector(
            `tiga-web-view[webviewid="${tigaWebviewId}"]`
          )
          if (webview) {
            isReceiveWebviewId
              ? webview.stopSendWebviewIdRecycle()
              : webview.onRecivedMessgae(params)
          }
          resolve(undefined)
        })
      } else {
        if (!my[apiName]) {
          console.error(`api: ${apiName} 暂不支持`)
        }
        result = my?.[apiName]?.(params && JSON.parse(params))
      }
      if (result && result instanceof Promise) {
        result
          .then((res) => {
            ;(e.source as any).postMessage(
              {
                type: 'tiga_api_callback',
                name: apiName,
                isSuccess: true,
                result: res,
                callbackId
              },
              '*'
            )
          })
          .catch((err) => {
            ;(e.source as any).postMessage(
              {
                type: 'tiga_api_callback',
                name: apiName,
                isSuccess: false,
                result: err,
                callbackId
              },
              '*'
            )
          })
      }
    }
  }
}
