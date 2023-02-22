/**
 * 页面触发下拉刷新
 */
export const PullDownRefreshEventName = 'pagepulldownrefresh'
/**
 * 页面滚动到底部事件
 */
export const ReachBottomEventName = 'pagereachbottom'

/**
 * 页面滚动事件
 */
export const ScrollEventName = 'pagescroll'

export interface IPageConfig {
  defaultTitle?: string // 	页面默认标题。
  showTitleLoading?: boolean // 是否进入时显示导航栏的 loading。默认 NO，支持 YES / NO
  transparentTitle?: string // 导航栏透明设置。默认 none，支持 always 一直透明 / auto 滑动自适应 / none 不透明。
  titleImage?: string // 导航栏图片地址。
  titleBarColor?: string // 导航栏背景色。例：白色 "#FFFFFF"。
  backgroundColor?: string // 页面的背景色。例：白色 "#FFFFFF"。
  borderBottomColor?: string // 导航栏底部边框颜色，支持十六进制颜色值。
  backgroundImageColor?: string // 下拉露出显示背景图的底色。例：白色 "#FFFFFF"。
  onReachBottomDistance?: number // 页面上拉触底时触发时距离页面底部的距离，单位为 px 。默认20
  titlePenetrate?: 'YES' | 'NO'
}

/**
 * 默认的页面配置
 */
export const DefualtPageConfig: IPageConfig = {
  defaultTitle: '',
  transparentTitle: 'none',
  titleImage: '',
  titleBarColor: undefined,
  backgroundColor: '#FFFFFF',
  backgroundImageColor: '#FFFFFF',
  borderBottomColor: undefined,
  showTitleLoading: false,
  titlePenetrate: 'NO'
}

// 页面的协议
export interface IPageHost {
  // 是否启用 下拉刷新
  enbalePullRefresh: boolean

  setConfig(config: IPageConfig)

  startPullDownRefresh()

  stopPullDownRefresh()
}
