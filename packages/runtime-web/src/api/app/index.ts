import { createCallbackManager } from '../utils/index'

let showManager = null
let hideManager = null
let listened = false
const getManager = (isShow = true) => {
  if (isShow) return showManager || (showManager = createCallbackManager())

  return hideManager || (hideManager = createCallbackManager())
}

function listenPageState() {
  if (listened) return
  listened = true

  let hidden, visibilityChange
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden'
    visibilityChange = 'visibilitychange'
  } else if (typeof (document as any).msHidden !== 'undefined') {
    hidden = 'msHidden'
    visibilityChange = 'msvisibilitychange'
  } else if (typeof (document as any).webkitHidden !== 'undefined') {
    hidden = 'webkitHidden'
    visibilityChange = 'webkitvisibilitychange'
  }

  document.addEventListener(visibilityChange, (state) => {
    if (document[hidden]) {
      // 隐藏了
      getManager(false).trigger()
    } else {
      getManager().trigger()
    }
  })
}

export function onAppShow(callback) {
  getManager().add(callback)

  listenPageState()
}

export function offAppShow(callback) {
  getManager().remove(callback)
}

export function onAppHide(callback) {
  getManager(false).add(callback)

  listenPageState()
}

export function offAppHide(callback) {
  getManager(false).remove(callback)
}
