import { appendApis, DEFAULT_API_NO_CONFLICT } from '../api/utils/extendApi'
import { history } from './history'
import { getCurrentPages } from './pageStack'
import { batchUnloadPage } from './router'
import { IPage, IRouterApiParams } from './types'
import { getCustomUrl } from './url'

interface INavigateTask {
  eventName: string
  options: any
}

const IDLE_TIME = 20
const NAVIGATE_TASKS: INavigateTask[] = []

function getTo(url: string) {
  const urlArr = getCustomUrl(url).split('?')
  return {
    pathname: urlArr[0],
    search: urlArr[1] ? `?${urlArr[1]}` : ''
  }
}

function handleNavigateTasks() {
  if (NAVIGATE_TASKS.length) {
    setTimeout(() => {
      NAVIGATE_TASKS.shift()
      if (NAVIGATE_TASKS.length) {
        routerFunctions[NAVIGATE_TASKS[0]?.eventName].call(
          null,
          NAVIGATE_TASKS[0]?.options
        )
        handleNavigateTasks()
      }
    }, IDLE_TIME)
  }
}

const routerFunctions: Record<string, any> = {
  navigateTo: _navigateTo,
  navigateBack: _navigateBack,
  redirectTo: _redirectTo,
  switchTab: _switchTab,
  reLaunch: _reLaunch
}

// 问题： 路由同时触发，导致history异常（比如back、to同时触发，会导致两次pop）
// 解决方案： 路由方法触发，间隔10ms
function navigateHandler(methodName: string, options: any) {
  return new Promise((resolve) => {
    NAVIGATE_TASKS.push({ eventName: methodName, options })

    if (NAVIGATE_TASKS.length === 1) {
      routerFunctions[methodName].call(null, options)
      handleNavigateTasks()
    }
    resolve('')
  })
}

function navigateTo(options: IRouterApiParams) {
  return navigateHandler('navigateTo', options)
}

function navigateBack(options: IRouterApiParams) {
  return navigateHandler('navigateBack', options)
}

function redirectTo(options: IRouterApiParams) {
  return navigateHandler('redirectTo', options)
}

function switchTab(options: IRouterApiParams) {
  return navigateHandler('switchTab', options)
}

function reLaunch(options: IRouterApiParams) {
  return navigateHandler('reLaunch', options)
}

appendApis(
  {
    navigateTo,
    navigateBack,
    redirectTo,
    switchTab,
    reLaunch
  },
  DEFAULT_API_NO_CONFLICT
)

function _navigateTo(options: IRouterApiParams) {
  const { url } = options || {}

  if (!url) {
    console.error('url 不能为空')
    return
  }
  // eleme 容器中history.push后history栈没变化，加上setTimeout解决问题（原因不明）
  setTimeout(() => {
    history.push(getTo(url))
  })
}

function _navigateBack(options: IRouterApiParams) {
  let { delta = 1 } = options || {}
  const pageStack = getCurrentPages()

  // 兼容：页面刷新后，页面栈仅保留当前页面，仍需支持返回。
  if (pageStack.length === 1) {
    window.history.back()
    return
  }

  if (delta < 1) delta = 1

  // delta大于页面栈长度, 返回页面第一页
  if (delta >= pageStack.length) delta = pageStack.length - 1

  const targetIndex = delta
    ? pageStack.length - delta - 1
    : pageStack.length - 2
  const targetPage = pageStack[targetIndex] || ({} as IPage)

  window.dispatchEvent(
    new CustomEvent('__tigaRouterChange', {
      detail: {
        action: 'POP',
        delta,
        location: { ...targetPage.__location }
      }
    })
  )

  if (delta) {
    // history.go(-delta);
    // 某些场景，history.go(-delta) 回调函数需要1s多才触发，故暂时循环goback函数替代实现。
    for (let i = 1; i <= delta; i++) {
      history.goBack()
    }
  }
}

function _redirectTo(options: IRouterApiParams) {
  const { url } = options || {}

  if (!url) {
    console.error('url 不能为空')
    return
  }

  history.replace(getTo(url))
}

function _switchTab(options: IRouterApiParams) {
  const { url } = options || {}

  if (!url) {
    console.error('url 不能为空')
    return
  }

  history.push(getTo(url))
}

function _reLaunch(options: IRouterApiParams) {
  const { url } = options || {}

  if (!url) {
    console.error('url 不能为空')
    return
  }

  const length = window.getCurrentPages().length
  batchUnloadPage(length - 1)
  redirectTo({ url })
  // ！！！goback replace同时触发后，history先响应了replace, 故放弃此方法！！！
  // if(length !== 1) {
  //   navigateBack({ url: '', delta: length - 1 });
  // }
  // redirectTo({ url });
}
