type OnOff = 'YES' | 'NO'

export type Func = (...args: any[]) => any

// app.json 配置
export interface IAppConfig extends IUsingComponentConfig {
  pages: string[]
  tabBar?: IAppTabBar
  subPackages?: ISubPackageConfig[]
  subpackages?: ISubPackageConfig[]
  window?: IWindowConfig
  [prop: string]: any
}

// app.json 中的 tabBar 配置信息
interface IAppTabBar {
  custom?: boolean
  textColor?: string
  selectedColor?: string
  backgroundColor?: string
  items: IAppTabBarItem[]
}

// app.json 中的 tabBar 中的 items 配置
interface IAppTabBarItem {
  pagePath: string
  name: string
  icon?: string
  activeIcon?: string
}

// app.json 中的分包配置
export interface ISubPackageConfig {
  root: string
  pages: string[]
  // 独立分包
  independent?: boolean
}

// 小程序插件的 plugin.json 配置
export interface IPluginConfig {
  // 插件所有页面
  pages?: string[]
  // 向小程序开放的自定义组件
  publicComponents?: Record<string, string>
  // 向小程序开放的页面
  publicPages?: Record<string, string>
  // 插件面向第三方小程序的 js 接口
  main?: string
}

export interface IUsingComponentConfig {
  usingComponents?: Record<string, string>
  componentPlaceholder?: Record<string, string>
  componentGenerics?: Record<string, boolean | Record<'default', string>>
}

// 页面的配置信息
export interface IPageConfig extends IWindowConfig, IUsingComponentConfig {}

// 自定义组件的配置信息
export interface IComponentConfig extends IUsingComponentConfig {
  // 是否是自定义组件
  component: boolean
  [prop: string]: any
}

// 小程序的ui及行为配置信息
interface IWindowConfig {
  defaultTitle?: string
  pullRefresh?: boolean
  allowsBounceVertical?: OnOff
  transparentTitle?: 'none' | 'always' | 'auto'
  titlePenetrate?: OnOff
  showTitleLoading?: OnOff
  titleImage?: string
  titleBarColor?: string
  backgroundColor?: string
  backgroundImageColor?: string
  backgroundImageUrl?: string
  gestureBack?: OnOff
  enableScrollBar?: OnOff
  onReachBottomDistance?: number
  responsive?: boolean

  [prop: string]: any
}
