import MobileDetect from 'mobile-detect'
import { my } from '../my'
const md = new MobileDetect(navigator.userAgent)

function contains(arr, needle) {
  for (const i in arr) {
    if (arr[i].indexOf(needle) > 0) return i
  }
  return -1
}

function systemInfo() {
  const info = {
    model: md.mobile(),
    pixelRatio: window.devicePixelRatio, //设备像素比。
    windowWidth: document.body.clientWidth,
    windowHeight: document.body.clientHeight, // TODO:
    language: (
      navigator.language || (navigator as any).browserLanguage
    ).toLowerCase(),
    version: (my as any).SDKVersion,
    platform: 'ios',
    system: md.os(),
    titleBarHeight: 44, // TODO:
    statusBarHeight: 0,
    screenWidth: screen.width,
    screenHeight: screen.height,
    brand: md.mobile(),
    fontSizeSetting: parseFloat(document.documentElement.style.fontSize),
    app: 'h5'
  }

  const os = md.os()
  let model = ''
  let version = ''
  if (os === 'iOS') {
    info.platform = 'iOS'
    model = md.mobile() + ' ' + md.version('iPhone')
    version = md.versionStr('iPhone')
  } else if (os === 'AndroidOS') {
    info.platform = 'Android'
    model = md.mobile() + ' ' + (md.version('iPhone') || md.version('iPad'))
    version = md.versionStr('iPhone') || md.versionStr('iPad')
    const sss = md.userAgent() && md.userAgent().split(';')
    //判断 UA 里边有没有 Build 信息，通过这个拿到安卓的具体机型
    const i = contains(sss, 'Build/')
    if (i > -1) {
      model = sss[i].substring(0, sss[i].indexOf('Build/'))
    }
  } else {
    info.platform = 'unkown'
  }

  try {
    version = version.replace(/_/g, '.')
  } catch (e) {}
  version ? (info.system = version) : null
  info.model = model

  return info
}

export default {
  // NOTE: 这里暂时以最新版本的支付宝小程序基础库为准
  SDKVersion: '2.8.9',

  getSystemInfo() {
    return new Promise((resolve) => {
      resolve(systemInfo())
    })
  },

  getSystemInfoSync() {
    return systemInfo()
  }
}
