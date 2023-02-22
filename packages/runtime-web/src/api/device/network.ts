function getNetworkType() {
  let networkType
  if (navigator.connection) {
    switch (navigator.connection.effectiveType) {
      case 'wifi':
        networkType = 'WIFI'
        break
      case '4g':
        networkType = '4G'
        break
      case '3g':
        networkType = '3G'
        break
      case '3gnet':
        networkType = '3G'
        break
      case '2g':
        networkType = '2G'
        break
      default:
        networkType = 'UNKNOWN'
    }
  } else {
    const ua = navigator.userAgent
    let networkStr = ua.match(/NetType\/\w+/)
      ? ua.match(/NetType\/\w+/)[0]
      : 'NetType/other'
    networkStr = networkStr.toLowerCase().replace('nettype/', '')

    switch (networkStr) {
      case 'wifi':
        networkType = 'WIFI'
        break
      case '4g':
        networkType = '4G'
        break
      case '3g':
        networkType = '3G'
        break
      case '3gnet':
        networkType = '3G'
        break
      case '2g':
        networkType = '2G'
        break
      default:
        networkType = 'UNKNOWN'
    }
  }
  return networkType
}

const NetworkStatusChangeCallBacks = new Set()

export default {
  getNetworkType() {
    return new Promise((resolve) => {
      resolve({
        networkAvailable: navigator.onLine,
        networkType: getNetworkType()
      })
    })
  },
  onNetworkStatusChange(callback) {
    NetworkStatusChangeCallBacks.add(callback)
    CheckNetworkStatusChange()
  },
  offNetworkStatusChange(callback) {
    if (callback) {
      NetworkStatusChangeCallBacks.delete(callback)
    } else {
      NetworkStatusChangeCallBacks.clear()
    }
    CheckNetworkStatusChange()
  }
}

function CheckNetworkStatusChange() {
  if (NetworkStatusChangeCallBacks.size === 1) {
    window.addEventListener('online', onNetworkOnline)
    window.addEventListener('offline', onNetworkOffline)
  } else if (NetworkStatusChangeCallBacks.size === 0) {
    window.removeEventListener('online', onNetworkOnline)
    window.removeEventListener('offline', onNetworkOffline)
  }
}

function onNetworkStatusChange(isConnected) {
  const networkType = getNetworkType()
  const info = {
    networkType,
    isConnected
  }
  NetworkStatusChangeCallBacks.forEach((v: any) => {
    v(info)
  })
}

function onNetworkOnline() {
  onNetworkStatusChange(true)
}

function onNetworkOffline() {
  onNetworkStatusChange(false)
}
