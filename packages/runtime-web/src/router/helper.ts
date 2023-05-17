import cache from './cache'

export const TAB_BAR_PATH_CACHE_KEY = 'tabBarPath'

const isUsefulArray = (param) => Array.isArray(param) && param.length > 0

export const cacheTabBarPath = (config) => {
  const hadTabBarItems =
    typeof config === 'object' && isUsefulArray(config.items)

  if (!hadTabBarItems) return

  const { items } = config
  const result = []

  items.forEach((item) => result.push(item.pagePath))
  cache.set(TAB_BAR_PATH_CACHE_KEY, result)
}

const complementPath = (path: string) => (path[0] === '/' ? path : `/${path}`)

export const isTabBarPage = (path) => {
  if (!path) return false

  const tabBarPaths = cache.get(TAB_BAR_PATH_CACHE_KEY)

  if (!isUsefulArray(tabBarPaths)) return false
  return tabBarPaths.some((p) => complementPath(p) === complementPath(path))
}
