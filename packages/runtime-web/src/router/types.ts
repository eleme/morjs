export interface IPage {
  onShow: () => void
  onHide: () => void
  onUnload: () => void
  pageId: string
  // 为了向下兼容，暂时先留着
  location?: ILocation
  __location: ILocation
}

declare global {
  interface IApp {
    onLaunch: (options: any) => void
    onShow: (options: any) => void
    onHide: () => void
  }
}

export interface IRouterAction {
  location: any
  action: Action
  delta?: number
}

export enum Action {
  POP = 'POP',
  PUSH = 'PUSH',
  REPLACE = 'REPLACE'
}

export interface ILocation {
  pathname: string
  hash: string
  search: string
}

export interface IRouterConfig {
  router: {
    customRoutes: Record<string, string>[]
    mode: string
    baseName: string
  }
  routes: IRoute[]
  pages: any[]
  tabBar: ITabbarConfig
}

export interface IRoute {
  path: string
  loader: any
}

export interface IRouterApiParams {
  url: string
  delta?: number
}

export interface IRouterChangeDetail {
  action: Action
  delta: number
  location: ILocation
}

export interface ITabbarConfig {
  items: []
}
