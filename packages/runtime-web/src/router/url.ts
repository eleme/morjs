import get from 'lodash.get'
import { mode } from './history'
import { ILocation } from './types'

const KEY_REFERRER = '__referrerInfo'

let pages: any[]
let referrerInfo = {}
const customRoutes: any[] = []
let baseName: string

export function setBaseName(path: string) {
  baseName = path || ''
}

export function setCustomRoutes(routes: Record<string, string>[]) {
  for (const key in routes) {
    // eslint-disable-next-line no-prototype-builtins
    if (routes.hasOwnProperty(key)) {
      customRoutes.push([addLeadingSlash(key), routes[key]])
    }
  }
  window.$customRoutes = customRoutes
}

export function setPages(pageList: any[]) {
  pages = pageList
}

export const getCustomUrl = (url: string): string => {
  const urlArr = url.split('?')

  url = urlArr[0]

  if (customRoutes) {
    const dest = customRoutes.find((route) => route[0] === url)?.[1]
    // tslint:disable-next-line:no-unused-expression
    dest ? (url = dest) : null
  }

  if (urlArr[1]) {
    return `${addLeadingSlash(url)}?${urlArr.slice(1).join('?')}`
  } else {
    return addLeadingSlash(url)
  }
}

export const addLeadingSlash = (str: string | undefined) =>
  str && str[0] === '/' ? str : `/${str}`

export const removeLeadingSlash = (str: string) =>
  str && str[0] === '/' ? str.substring(1) : str

export const getPathAndOptions = (location: ILocation) => {
  const route = getRoute(location)
  return {
    route,
    path: route,
    options: getOptions(location)
  }
}

/**
 * 小程序页面的options
 */
export const getOptions = (location: ILocation = window.location) => {
  const options = getQueryParams(location.search)

  return mode === 'hash'
    ? Object.assign(options, getQueryParams(location.hash))
    : options
}

/**
 * 获取当前url的参数
 */
export function getQueryParams(url: any) {
  const params: Record<any, any> = {}
  const searchArr = url.split('?')

  if (searchArr[1]) {
    searchArr[1].split('&').forEach((pair: any) => {
      const [key, value] = pair.split('=')
      params[key] = value
    })
  }

  return params
}

/**
 * h5 url的 pathname 和 search
 */
export const getPathNameAndSearch = (location: ILocation) => {
  let pathName: string
  let search: string

  if (mode === 'hash') {
    const hashUrl = (location.hash || '#/').substr(1)
    const pathArr = hashUrl.split('?')
    pathName = pathArr[0]
    search = pathArr[1]
  } else {
    pathName = location.pathname
    search = location.search.split('?')[1]
    // 往外暴露修改 search 的方法，有些业务中 url 上存在动态变化的参数，导致 url => page component 的映射关系混乱
    const formatSearch = get(window.$MOR_APP_CONFIG, 'router.formatSearch')
    if (typeof formatSearch === 'function') search = formatSearch(search)
  }

  return {
    pathName: stripBasename(pathName),
    search
  }
}

function stripBasename(path: string) {
  return hasBasename(path) ? path.substr(baseName.length) : path
}

function hasBasename(path: string) {
  if (!baseName) return false

  return (
    path.toLowerCase().indexOf(baseName.toLowerCase()) === 0 &&
    '/?#'.indexOf(path.charAt(baseName.length)) !== -1
  )
}

/**
 * route，小程序route,例如 pages/index/index
 */
export const getRoute = (location: ILocation = window.location) => {
  const { pathName } = getPathNameAndSearch(location)
  const customRoute = (customRoutes || window.$customRoutes).filter(
    ([url, customUrl]) => pathName === url || pathName === customUrl
  )

  const route = customRoute.length
    ? customRoute?.[0]?.[0]
    : pathName === '/' || pathName === ''
    ? pages[0]
    : pathName
  return removeLeadingSlash(route)
}

/**
 * pageId，标识唯一page
 */
export const getPageId = (location: ILocation = window.location) => {
  return getOriginUrl(location)
}

/**
 * 小程序完整地址, 例如 pages/index/index?test=1
 */
export const getOriginUrl = (location: ILocation) => {
  const { search } = getPathNameAndSearch(location)
  const route = getRoute(location)

  return search ? `${route}?${search}` : route
}

/**
 * 小程序启动参数
 */
export const getRelaunchOptions = () => {
  const lsReferrerInfo = localStorage.getItem(KEY_REFERRER)
  referrerInfo = (lsReferrerInfo && JSON.parse(lsReferrerInfo)) || referrerInfo
  localStorage.removeItem(KEY_REFERRER)

  return {
    query: getOptions(),
    referrerInfo
  }
}

/**
 * 根据页面相对路径，计算出绝对路径 '../swiper/index' => 'pages/swiper/index'
 * @param {String} relativePath 相对路径
 * @returns 绝对路径
 */
export const getAbsolutePath = (relativePath: string) => {
  const rootPath = getCurrentPages().pop()?.route

  if (rootPath && relativePath[0] === '.') {
    const rootParts = rootPath.split('/')
    const relativeParts = relativePath.split('/')
    const absoluteParts = [...relativeParts]

    relativeParts.forEach((part, index) => {
      if (part === '.') {
        rootParts.pop()
        absoluteParts.shift()
      }

      if (part === '..') {
        index === 0 ? rootParts.splice(-2, 2) : rootParts.pop()
        absoluteParts.shift()
      }
    })

    return rootParts.concat(absoluteParts).join('/')
  }

  return relativePath
}
