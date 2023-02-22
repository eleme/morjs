import { getGlobalObject } from '@morjs/api/lib/env'
import { logger } from '@morjs/api/lib/logger'
import type { IAPITransformConfig } from '@morjs/api/lib/utils'
import { transformApis } from '@morjs/api/lib/utils'
import { needPromisfiedApis } from './needPromisfiedApis'

/**
 * 支付宝和微信接口的差异
 * 以微信为准
 * 微信 转 支付宝
 */
const apiTransformConfig: IAPITransformConfig = {
  showActionSheet: {
    opts: {
      c: [{ o: 'itemList', n: 'items' }]
    }
  },
  showToast: {
    fn(global, options = {}) {
      // 映射 title 为 content
      if ('title' in options) {
        options.content = options.title
        delete options.title
      }

      // 微信或其他端默认为 'success'
      // 而支付宝默认为 'none'
      // 所以这里默认返回 success 以确保行为一致
      options.type = options.icon || 'success'
      delete options.icon

      // 针对 loading 特殊处理
      if (options.type === 'loading') {
        global.showLoading(options)
      }
      // 其他类型直接使用 showToast
      else {
        if (options.type === 'error') {
          options.type = 'fail'
        }
        global.showToast(options)
      }
    }
  },
  showLoading: {
    opts: {
      c: [{ o: 'title', n: 'content' }]
    }
  },
  setNavigationBarTitle: {
    n: 'setNavigationBar'
  },
  setNavigationBarColor: {
    n: 'setNavigationBar'
  },
  saveImageToPhotosAlbum: {
    n: 'saveImage',
    opts: {
      c: [{ o: 'filePath', n: 'url' }]
    }
  },
  previewImage: {
    opts: {
      s: [
        {
          k: 'current',
          v(opts) {
            return opts.urls.indexOf(opts.current || opts.urls[0])
          }
        }
      ]
    }
  },
  getFileInfo: {
    opts: {
      c: [{ o: 'filePath', n: 'apFilePath' }]
    }
  },
  getSavedFileInfo: {
    opts: {
      c: [{ o: 'filePath', n: 'apFilePath' }]
    }
  },
  removeSavedFile: {
    opts: {
      c: [{ o: 'filePath', n: 'apFilePath' }]
    }
  },
  saveFile: {
    opts: {
      c: [{ o: 'tempFilePath', n: 'apFilePath' }]
    },
    r(res) {
      res.savedFilePath = res.apFilePath
    }
  },
  openLocation: {
    opts: {
      s: [
        {
          k: 'latitude',
          v(options) {
            return String(options.latitude)
          }
        },
        {
          k: 'longitude',
          v(options) {
            return String(options.longitude)
          }
        }
      ]
    }
  },
  uploadFile: {
    opts: {
      c: [{ o: 'name', n: 'fileName' }]
    }
  },
  getClipboardData: {
    n: 'getClipboard',
    r(res) {
      res.data = res.text
    }
  },
  setClipboardData: {
    n: 'setClipboard',
    opts: {
      c: [{ o: 'data', n: 'text' }]
    }
  },
  makePhoneCall: {
    opts: {
      c: [{ o: 'phoneNumber', n: 'number' }]
    }
  },
  scanCode: {
    n: 'scan',
    opts: {
      c: [{ o: 'onlyFromCamera', n: 'hideAlbum' }],
      s: [
        {
          k: 'type',
          v(options) {
            if (options.scanType && options.scanType.length) {
              return [].concat(options.scanType).map((v) => {
                if (v === 'pdf417') return 'pdf417Code'
                if (v === 'datamatrix') return 'dmCode'
                return v
              })
            }
          }
        }
      ]
    },
    r(res) {
      res.result = res.code
    }
  },
  setScreenBrightness: {
    opts: {
      c: [{ o: 'value', n: 'brightness' }]
    }
  },
  onBLEConnectionStateChange: {
    n: 'onBLEConnectionStateChanged'
  },
  offBLEConnectionStateChange: {
    n: 'offBLEConnectionStateChanged'
  },
  createBLEConnection: {
    n: 'connectBLEDevice'
  },
  closeBLEConnection: {
    n: 'disconnectBLEDevice'
  },
  request: {
    fn: function (global, options) {
      options = options || {}
      if (typeof options === 'string') {
        options = {
          url: options
        }
      }
      // header => headers 转换
      const defaultHeaders = {
        'content-type': 'application/json'
      }
      options['headers'] = defaultHeaders
      if (options['header']) {
        for (const k in options['header']) {
          const lowerK = k.toLocaleLowerCase()
          options['headers'][lowerK] = options['header'][k]
        }
        delete options['header']
      }

      // promisified
      const originSuccess = options.success
      const originFail = options.fail
      const originComplete = options.complete
      let requestTask: any
      const p: any = new Promise((resolve, reject) => {
        options.success = (res: any) => {
          res.statusCode = res.status
          delete res.status
          res.header = res.headers
          delete res.headers
          originSuccess?.(res)
          resolve(res)
        }
        options.fail = (res: any) => {
          originFail?.(res)
          // 如果用户传入了 fail 则代表用户自行处理错误
          // mor 不再抛出 promise 错误, 只标记完成
          if (typeof originFail === 'function') {
            resolve(null)
          } else {
            reject(res)
          }
        }

        options.complete = (res: any) => {
          originComplete?.(res)
        }

        const nativeRequest = global.canIUse('request')
          ? global.request
          : global.httpRequest

        requestTask = nativeRequest(options)
      })

      p.abort = (cb?: () => void) => {
        cb?.()
        requestTask?.abort?.()
        return p
      }

      return p
    }
  },
  getStorageSync: {
    fn(global, ...args) {
      // x 转 支付宝逻辑
      const arg1 = args[0]
      if (arg1 != null) {
        const res = global.getStorageSync({ key: arg1 })
        return res?.data
      }
      return logger.error('getStorageSync 传入参数错误')
    }
  },
  setStorageSync: {
    fn(global, ...args) {
      const arg1 = args[0]
      const arg2 = args[1]
      if (arg1 != null) {
        return global.setStorageSync({
          key: arg1,
          data: arg2
        })
      }
      return logger.error('setStorageSync 传入参数错误')
    }
  },
  removeStorageSync: {
    fn(global, ...args) {
      const arg1 = args[0]
      if (arg1 != null) {
        return global.removeStorageSync({ key: arg1 })
      }
      return logger.error('removeStorageSync 传入参数错误')
    }
  },
  createSelectorQuery: {
    fn(global) {
      const query = global.createSelectorQuery()
      query.in = function () {
        return query
      }
      return query
    }
  },
  showModal: {
    fn(global, options) {
      let apiName
      options.cancelButtonText = options.cancelText || '取消'
      options.confirmButtonText = options.confirmText || '确定'
      apiName = 'confirm'
      if (options.showCancel === false) {
        options.buttonText = options.confirmText || '确定'
        apiName = 'alert'
      }

      global[apiName](options)
    }
  },
  downloadFile: {
    r(res) {
      res.tempFilePath = res.apFilePath
    }
  },
  chooseImage: {
    r(res) {
      res.tempFilePaths = res.apFilePaths
    }
  },
  getScreenBrightness: {
    r(res) {
      res.value = res.brightness
      delete res.brightness
    }
  },
  connectSocket: {
    r(res) {
      const global = getGlobalObject()
      res.onClose = function (cb) {
        global.onSocketClose(cb)
      }

      res.onError = function (cb) {
        global.onSocketError(cb)
      }

      res.onMessage = function (cb) {
        global.onSocketMessage(cb)
      }

      res.onOpen = function (cb) {
        global.onSocketOpen(cb)
      }

      res.send = function (opt) {
        global.sendSocketMessage(opt)
      }

      res.close = function () {
        global.closeSocket()
      }
    }
  },
  login: {
    n: 'getAuthCode',
    opts: {
      s: [
        {
          k: 'scopes',
          v() {
            // 微信 login 是静默授权
            return ['auth_base']
          }
        }
      ]
    },
    r(res) {
      res.code = res.authCode
      delete res.authCode
    }
  },
  getUserInfo: {
    n: 'getOpenUserInfo',
    r: getOpenUserInfo
  },
  getUserProfile: {
    n: 'getOpenUserInfo',
    r: getOpenUserInfo
  },
  createIntersectionObserver: {
    fn: function (global, ...args: any[]) {
      const options = args?.[1] || {}
      if (options?.observeAll != null) {
        options.selectAll = options.observeAll
        delete options.observeAll
      }
      return global.createIntersectionObserver(options)
    }
  }
}

function getOpenUserInfo(res) {
  const userInfo = JSON.parse(res.response).response

  if (userInfo) {
    userInfo.avatarUrl = userInfo.avatar
    if (userInfo.gender === 'm') {
      userInfo.gender = 1
    } else if (userInfo.gender === 'f') {
      userInfo.gender = 2
    } else {
      userInfo.gender = 0
    }
    userInfo.country = userInfo.countryCode

    res.userInfo = userInfo
  }
}

export function initApi(mor) {
  transformApis(mor, getGlobalObject(), {
    needPromisfiedApis,
    apiTransformConfig
  })
}
