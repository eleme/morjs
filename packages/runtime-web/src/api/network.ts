import 'whatwg-fetch'
import { appendQueryToUrl, convertBlobToBase64 } from './utils/index'

export default {
  closeSocket(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  },

  connectSocket(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  },

  downloadFile(): Promise<my.IDownloadFileSuccessResult> {
    return new Promise((resolve) => {
      const res: my.IDownloadFileSuccessResult = {
        apFilePath: ''
      }
      resolve(res)
    })
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  offSocketClose(): void {},

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  offSocketMessage(): void {},

  request(options: any): Promise<Record<string, any>> {
    const METHOD_GET = 'GET'

    const {
      method = METHOD_GET,
      headers = {},
      data = {},
      timeout = 30000,
      dataType = 'json'
    } = options
    let url = options.url

    if (METHOD_GET === method && Object.keys(data).length > 0) {
      url = appendQueryToUrl(url, data)
    }

    const params: any = {
      method,
      headers
    }

    // 允许透传 credentials 和 mode
    if (options.credentials) params.credentials = options.credentials
    if (options.mode) params.mode = options.mode

    if (METHOD_GET !== method) params.body = JSON.stringify(data)

    return new Promise((resolve, reject) => {
      return fetch(url, params)
        .then((res) => {
          const getData = () => {
            const TYPE = {
              json: 'json',
              text: 'text',
              arraybuffer: 'arrayBuffer',
              base64: 'blob'
            }
            const type = TYPE[(dataType || '').toLowerCase()]

            if (dataType === 'base64')
              return res[type]().then(convertBlobToBase64)

            return res[type]()
          }

          const getHeaders = () => {
            const headers = {}
            const resHeaders = res.headers
            let headerKeys = resHeaders && (resHeaders as any).keys()

            if (!headerKeys) return headers
            headerKeys = Array.from(headerKeys)

            headerKeys.map((key) => {
              headers[key] = resHeaders.get(key)
            })

            return headers
          }

          if (res && res.status >= 200 && res.status < 400) {
            return getData()
              .then((data) => {
                resolve({ data, status: res.status, headers: getHeaders() })
              })
              .catch(reject)
          } else {
            return reject(new Error(`HTTP 错误`))
          }
        })
        .catch(reject)
    })
  }
}
