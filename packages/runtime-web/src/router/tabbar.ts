import { cacheTabBarPath } from './helper'
import { IRouterConfig } from './types'
import { getOptions } from './url'

export function initTabBar(config: IRouterConfig) {
  // 支持业务配置多种TabBar，并且可以在运行阶段通过链接中的自定义的tabbarKey切换tabBar配置
  const { customTabBarKey = 'tabBarKey' } = window.$MOR_APP_CONFIG || {}
  const tabBarKey = getOptions()?.[customTabBarKey] || 'tabBar'

  // 缓存 tabBar 路径，方便后续实现 switchTab 取值使用
  cacheTabBarPath(config.tabBar)

  if (!config[tabBarKey]) return

  const tabBar = document.createElement('tiga-tabbar') as any

  tabBar.conf = config[tabBarKey]
  tabBar.conf.mode = config.router?.mode ?? 'browser'
  tabBar.conf.homePage = config.pages?.[0]
  tabBar.conf.customRoutes = config.router?.customRoutes ?? {}
  tabBar.conf.baseName = config.router?.baseName ?? ''

  const container = document.getElementById('container')
  if (container) container.appendChild(tabBar)
}
