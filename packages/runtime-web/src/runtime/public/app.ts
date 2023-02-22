let currentApp

function AppForWeb(options: tinyapp.AppOptions) {
  currentApp = options
}

function __tigaProxyApp() {
  window.App = AppForWeb
  window.getApp = function () {
    return currentApp
  }
}

if (!window.App) {
  __tigaProxyApp()
} else {
  // 之前已经挂载window.App
  const appCache = window.App

  // 判定已有的方法是不是和 function App 一致，如果一致说明是tiga挂载的，不需要重复挂载
  if (!(typeof appCache === 'function' && appCache.name === App.name)) {
    __tigaProxyApp()
  }
}

//  全局错误处理
window.onerror = function (err) {
  const { onError } = currentApp || {}
  if (onError) {
    onError.call(currentApp, err)
  }
}

window.addEventListener('unhandledrejection', (e) => {
  const { onUnhandledRejection } = currentApp || {}
  if (onUnhandledRejection) {
    onUnhandledRejection.call(currentApp, e)
  }
})
