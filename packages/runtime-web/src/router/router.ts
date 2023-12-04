import React from 'react'
import ReactDOM from 'react-dom'
import UniversalRouter from 'universal-router'
import './api'
import { initLayout } from './dom'
import { history, setHistoryMode } from './history'
import { getCurPage, pageStack } from './pageStack'
import { initTabBar } from './tabbar'
import {
  Action,
  ILocation,
  IPage,
  IRoute,
  IRouterAction,
  IRouterChangeDetail,
  IRouterConfig
} from './types'
import {
  addLeadingSlash,
  getPageId,
  getPathAndOptions,
  getRelaunchOptions,
  setBaseName,
  setCustomRoutes,
  setPages
} from './url'

let routerAction: IRouterAction
let rootElement: HTMLElement

function initRouter(config: IRouterConfig) {
  const alias = config.router?.customRoutes || {}
  const routes = []

  for (let i = 0; i < config.pages.length; i++) {
    const route = config.routes?.[i] ?? ({} as IRoute)
    const path = addLeadingSlash(route?.path)

    if (i === 0) {
      routes.push({
        path: '/',
        action: route.loader
      })
    }

    if (alias[path] === '/') {
      console.error('定义路由不能是 /，必须带有路径，例/index')
    }

    routes.push({
      path: alias[path] || path,
      action: route.loader
    })
  }

  const router = new UniversalRouter(routes)

  function render(location: ILocation, action: Action) {
    router.resolve(location.pathname).then((component) => {
      location.hash = window.location.hash
      routerAction = { location, action }
      const element = component.default ? component.default : component
      if (action === Action.PUSH) {
        hidePage(getCurPage())
        loadPage(location, element)
      } else if (action === Action.REPLACE) {
        unloadPage(getCurPage())
        pageStack.pop()
        loadPage(location, element)
      } else if (action === Action.POP) {
        tigaRouterChangeHandler(
          { detail: { location, action, delta: 1 } },
          element
        )
      }
    })
  }

  render(history.location, Action.PUSH)

  window.getApp()?.onLaunch?.(getRelaunchOptions())

  window.getApp()?.onShow?.(getRelaunchOptions())

  history.listen(render)
}

function setRootElement(element: HTMLElement) {
  rootElement = element
}

function getRootElement() {
  return rootElement ? rootElement : document?.getElementById('app')
}

const pushPage = (page) => {
  const allPages = [...pageStack]
  // 移除页面中已经存在的此页面（先删除后直接将此页面推入顶栈即可）
  allPages.forEach(
    (p, index) => page.pageId === p.pageId && pageStack.splice(index, 1)
  )

  pageStack.push(page)
}

function loadPage(location: ILocation, component: string) {
  const pageId = getPageId(location)
  const pageEl = document.getElementById(pageId)
  if (pageEl) {
    const page = pageStack.find(
      (pageItem) => pageItem.pageId === pageId
    ) as IPage
    pushPage(page)
    page?.onShow?.()
    pageEl.style.display = 'block'
  } else {
    const tigaPage = document.createElement('div')
    tigaPage.classList.add('tiga-page-wrap')
    tigaPage.id = pageId
    getRootElement()?.append(tigaPage)
    const reactElement = React.isValidElement(component)
      ? component
      : React.createElement(component)
    ReactDOM.render(reactElement, document.getElementById(pageId))
  }
}

function showPage(page: IPage) {
  if (page != null) {
    const pageEl = document.getElementById(page.pageId)
    if (pageEl) {
      // 适配api中的问题：eleme 容器中history.push后history栈没变化，加上setTimeout解决问题
      setTimeout(() => page?.onShow?.())
      pageEl.style.display = 'block'
    }
  }
}

function hidePage(page: IPage) {
  if (page != null) {
    const pageEl = document.getElementById(page.pageId)
    if (pageEl) {
      page.onHide?.()
      pageEl.style.display = 'none'
    }
  }
}

function unloadPage(page: IPage) {
  if (page != null) {
    const pageEl = document.getElementById(page.pageId)
    if (pageEl) {
      ReactDOM.unmountComponentAtNode(pageEl)
      pageEl?.parentNode?.removeChild(pageEl)
    }
  }
}

const unLoadOrHidePage = (page) => {
  const existPage = pageStack.find((item) => item.pageId === page.pageId)
  if (!existPage) {
    unloadPage(page)
  } else {
    hidePage(page)
  }
}

// 批量卸载页面
export function batchUnloadPage(delta: number) {
  const lastPageIndex = pageStack.length - delta
  const deletedPages = pageStack.splice(
    lastPageIndex >= 0 ? lastPageIndex : 0,
    delta
  )
  deletedPages.forEach(unLoadOrHidePage)
}

// 按照回调结果卸载页面
export function unloadPageByCondition(callback) {
  const allPages = [...pageStack]

  allPages.forEach((page, index) => {
    const hitCondition = callback(page)
    if (hitCondition === true) {
      // 从路由栈中移除该页面
      pageStack.splice(index, 1)
      // 命中条件，说明该页面需要删除或者隐藏
      unloadPage(page)
    }
  })
}

function pageCreateHandler(e: { detail: any }) {
  const pageConfig = createPageConfig(e.detail)
  switch (routerAction.action) {
    case Action.PUSH:
      pageStack.push(pageConfig)
      break
    case Action.REPLACE:
      pageStack.push(pageConfig)
    // eslint-disable-next-line no-fallthrough
    default:
      break
  }
}

function createPageConfig(pageConfig: IPage) {
  const { location } = pageConfig
  delete pageConfig.location

  return {
    ...pageConfig,
    ...getPathAndOptions(routerAction.location),
    pageId: getPageId(routerAction.location),
    __location: location
  }
}

// history listener无法检测POP delta, 故在action:POP场景下，特殊处理
let popping = false
export function tigaRouterChangeHandler(
  e: { detail: IRouterChangeDetail },
  component?: string
) {
  const { action, delta } = e.detail || {}

  if (action === 'POP' && delta && !popping) {
    popping = true
    routerAction = e.detail as IRouterAction

    batchUnloadPage(routerAction.delta as number)

    const targetPageId = getPageId(routerAction.location)
    const targetPage = pageStack.find((item) => item.pageId === targetPageId)
    if (targetPage) {
      showPage(targetPage)
      // 矫正 手动修改url后,pageStack偏差
      if (targetPage.pageId !== getCurPage().pageId) {
        pageStack.push(targetPage)
      }
    } else {
      // 手动修改url, history action为POP, 需要特殊处理
      routerAction.action = Action.PUSH
      batchUnloadPage(1)
      loadPage(location, component)
    }

    setTimeout(() => {
      popping = false
    }, 200)
  }
}

function pageVisibilityChange() {
  if (document.hidden) {
    window.getApp()?.onHide?.()
    getCurPage()?.onHide?.()
  } else {
    window.getApp()?.onShow?.(getRelaunchOptions())
    getCurPage()?.onShow?.()
  }
}

function registerEventLister() {
  const routerChangeEvent = '__tigaRouterChange' as any
  const pageCreateEvent = 'tigaPageCreate' as any
  window.addEventListener(
    routerChangeEvent,
    (event) => {
      // 在调用 navigateBack 时，首先触发了 __tigaRouterChange 事件，然后再触发 history.back
      // 这可能会导致后续页面在消费 location 时拿到的还是上一个页面的对象
      setTimeout(() => {
        tigaRouterChangeHandler(event)
      })
    },
    false
  )
  window.addEventListener(pageCreateEvent, pageCreateHandler, false)

  document.addEventListener('visibilitychange', pageVisibilityChange, false)
}

export function createRouter(config: IRouterConfig, element: HTMLElement) {
  const { router } = config
  setRootElement(element)
  setCustomRoutes(router?.customRoutes)
  setBaseName(router?.baseName)
  setPages(config.pages)
  setHistoryMode(router?.mode, router?.baseName)
  initLayout(element)
  initTabBar(config)
  initRouter(config)
  registerEventLister()
}
