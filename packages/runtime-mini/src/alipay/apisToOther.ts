import {
  ENV_TYPE,
  getEnv,
  getGlobalObject,
  IAPITransformConfig,
  logger,
  transformApis
} from '@morjs/runtime-base'
import { needPromisfiedApis } from './needPromisfiedApis'

/**
 * 将 16 进制的颜色值转换成 rgb 格式
 * @param hex - 16 进制的颜色值
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(
    shorthandRegex,
    (_, r: string, g: string, b: string) => `${r + r}${g + g}${b + b}`
  )
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return match
    ? {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16)
      }
    : null
}

/**
 * 是否是浅色
 * @param r - rgb 色值区域中的 red
 * @param g - rgb 色值区域中的 green
 * @param b - rgb 色值区域中的 blue
 */
function isLightColor(r: number, g: number, b: number): boolean {
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return y >= 128
}

const changeToHex = (buffer) => {
  const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
    return ('00' + bit.toString(16)).slice(-2)
  })
  return hexArr.join('')
}

/**
 * 支付宝和微信接口的差异
 * 以支付宝为准
 * 支付宝 转 微信
 */
const apiTransformConfig: IAPITransformConfig = {
  showActionSheet: {
    opts: {
      c: [{ o: 'items', n: 'itemList' }]
    }
  },
  showToast: {
    opts: {
      c: [{ o: 'content', n: 'title' }],
      s: [
        {
          k: 'icon',
          v(options = {}) {
            // exception 映射
            if (options.type === 'exception') {
              switch (getEnv()) {
                case ENV_TYPE.WECHAT:
                case ENV_TYPE.QQ:
                  return 'error'
                case ENV_TYPE.BYTEDANCE:
                  return 'fail'
                default:
                  return 'none'
              }
            } else {
              // 支付宝默认为 'none'
              // 而微信及其他端默认为 'success'
              // 所以这里默认返回 none 以确保行为一致
              return options.type || 'none'
            }
          }
        }
      ]
    }
  },
  showLoading: {
    opts: {
      c: [{ o: 'content', n: 'title' }]
    }
  },
  setNavigationBar: {
    fn(global, options = {}) {
      const success = options?.success
      const fail = options?.fail
      const complete = options?.complete
      if (options.title) {
        global.setNavigationBarTitle({
          title: options.title,
          success,
          fail,
          complete
        })
      }
      if (options.backgroundColor) {
        // 支付宝小程序没有前景色
        // 这里默认设置为黑色
        // 同时基于背景色来自动选择前景色
        let frontColor = '#000000'
        try {
          const rgb = hexToRgb(options.backgroundColor)
          if (rgb) {
            if (isLightColor(rgb.r, rgb.g, rgb.b)) {
              frontColor = '#000000'
            } else {
              frontColor = '#ffffff'
            }
          }
        } catch (e) {}

        global.setNavigationBarColor({
          frontColor: options.frontColor || frontColor,
          backgroundColor: options.backgroundColor,
          success,
          fail,
          complete
        })
      }
    }
  },
  saveImageToPhotosAlbum: {
    n: 'saveImage',
    opts: {
      c: [{ o: 'url', n: 'filePath' }]
    }
  },
  getFileInfo: {
    opts: {
      c: [{ o: 'apFilePath', n: 'filePath' }]
    }
  },
  getSavedFileInfo: {
    opts: {
      c: [{ o: 'apFilePath', n: 'filePath' }]
    }
  },
  removeSavedFile: {
    opts: {
      c: [{ o: 'apFilePath', n: 'filePath' }]
    }
  },
  saveFile: {
    opts: {
      c: [{ o: 'apFilePath', n: 'tempFilePath' }]
    },
    r(res) {
      res.apFilePath = res.savedFilePath
    }
  },
  openLocation: {
    opts: {
      s: [
        {
          k: 'latitude',
          v(options) {
            return Number(options.latitude)
          }
        },
        {
          k: 'longitude',
          v(options) {
            return Number(options.longitude)
          }
        }
      ]
    }
  },
  uploadFile: {
    opts: {
      c: [{ o: 'fileName', n: 'name' }]
    }
  },
  getClipboard: {
    n: 'getClipboardData',
    r(res) {
      res.text = res.data
    }
  },
  setClipboard: {
    n: 'setClipboardData',
    opts: {
      c: [{ o: 'text', n: 'data' }]
    }
  },
  makePhoneCall: {
    opts: {
      c: [{ o: 'number', n: 'phoneNumber' }]
    }
  },
  scan: {
    n: 'scanCode',
    opts: {
      c: [{ o: 'hideAlbum', n: 'onlyFromCamera' }],
      s: [
        {
          k: 'scanType',
          v(options) {
            if (options.type && options.type.length) {
              return [].concat(options.type).map((v) => {
                if (v === 'pdf417Code') return 'pdf417'
                if (v === 'dmCode') return 'datamatrix'
                if (v === 'narrowCode' || v === 'hmCode') {
                  logger.warn(`scanCode.scanType 不支持 ${v} 类型`)
                }
                return v
              })
            }
          }
        }
      ]
    },
    r(res) {
      res.code = res.result
    }
  },
  setScreenBrightness: {
    opts: {
      c: [{ o: 'brightness', n: 'value' }]
    }
  },
  onBLEConnectionStateChanged: {
    n: 'onBLEConnectionStateChange'
  },
  offBLEConnectionStateChanged: {
    n: 'offBLEConnectionStateChange'
  },
  connectBLEDevice: {
    n: 'createBLEConnection'
  },
  disconnectBLEDevice: {
    n: 'closeBLEConnection'
  },
  getBLEDeviceCharacteristics: {
    fn: function (global, options) {
      global.getBLEDeviceCharacteristics({
        ...options,
        success: (res) => {
          const _res = res
          if (_res.characteristics) {
            _res.characteristics.forEach((item) => {
              item.characteristicId = item.uuid
              delete item.uuid
            })
          }
          options.success && options.success(_res)
        }
      })
    }
  },
  getBLEDeviceServices: {
    fn: function (global, options) {
      global.getBLEDeviceServices({
        ...options,
        success: (res) => {
          const _res = res
          if (_res.services) {
            _res.services.forEach((item) => {
              item.serviceId = item.uuid
              delete item.uuid
            })
          }
          options.success && options.success(_res)
        }
      })
    }
  },
  onBLECharacteristicValueChange: {
    fn: function (global, callabck) {
      global.onBLECharacteristicValueChange((res) => {
        res.value = changeToHex(res.value)
        callabck && callabck(res)
      })
    }
  },
  request: {
    fn: function (global, options) {
      options = options || {}
      if (typeof options === 'string') {
        options = {
          url: options
        }
      }
      options['header'] = {}
      if (options['headers']) {
        for (const k in options['headers']) {
          const lowerK = k.toLocaleLowerCase()
          options['header'][lowerK] = options['headers'][k]
        }
        delete options['headers']
      }

      // promisified
      const originSuccess = options.success
      const originFail = options.fail
      const originComplete = options.complete
      let requestTask: any
      const p: any = new Promise((resolve, reject) => {
        options.success = (res) => {
          res.status = res.statusCode
          delete res.statusCode
          res.headers = res.header
          delete res.header
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

        requestTask = global.request(options)
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
      // 支付宝 转 x 逻辑
      const arg1 = args[0]
      if (arg1?.key != null) {
        const res = global.getStorageSync(arg1?.key)
        return { data: res }
      }
      // 如果是走到了这里, 代表调用了原生方法
      else if (typeof arg1 === 'string') {
        return global.getStorageSync(arg1)
      }
      return logger.error('getStorageSync 传入参数错误')
    }
  },
  setStorageSync: {
    fn(global, ...args) {
      const arg1 = args[0]
      if (arg1?.key != null) {
        return global.setStorageSync(arg1.key, arg1?.data)
      }
      return logger.error('setStorageSync 传入参数错误')
    }
  },
  removeStorageSync: {
    fn(global, ...args) {
      const arg1 = args[0]
      if (arg1?.key != null) {
        return global.removeStorageSync(arg1.key)
      }
      return logger.error('removeStorageSync 传入参数错误')
    }
  },
  confirm: {
    n: 'showModal',
    opts: {
      c: [
        { o: 'cancelButtonText', n: 'cancelText' },
        { o: 'confirmButtonText', n: 'confirmText' }
      ]
    }
  },
  alert: {
    n: 'showModal',
    opts: {
      c: [{ o: 'buttonText', n: 'confirmText' }],
      s: [
        {
          k: 'showCancel',
          v() {
            return false
          }
        }
      ]
    }
  },
  downloadFile: {
    r(res) {
      res.apFilePath = res.tempFilePath
    }
  },
  chooseImage: {
    r(res) {
      res.apFilePaths = res.tempFilePaths
    }
  },
  getScreenBrightness: {
    r(res) {
      res.brightness = res.value
      delete res.value
    }
  },
  getAuthCode: {
    n: 'login',
    r(res) {
      res.authCode = res.code
      delete res.code
    }
  },
  getOpenUserInfo: {
    n: 'getUserProfile',
    r: getUserProfile
  },
  createIntersectionObserver: {
    fn: function (global, ...args: any[]) {
      const options = args?.[0] || {}
      if (options?.selectAll != null) {
        options.observeAll = options.selectAll
        delete options.selectAll
      }
      return global.createIntersectionObserver(void 0, options)
    }
  }
}

function getUserProfile(res: Record<string, any>) {
  const userInfo = res.userInfo

  if (userInfo) {
    userInfo.avatar = userInfo.avatarUrl
    if (userInfo.gender === 1) {
      userInfo.gender = 'm'
    } else if (userInfo.gender === 2) {
      userInfo.gender = 'f'
    } else {
      userInfo.gender = ''
    }
    userInfo.countryCode = userInfo.country

    res.response = JSON.stringify({ response: userInfo })
  }
}

export function initApi(mor: Record<string, any>) {
  transformApis(mor, getGlobalObject(), {
    needPromisfiedApis,
    apiTransformConfig
  })
}
