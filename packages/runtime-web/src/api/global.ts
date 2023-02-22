let RootView: HTMLElement = document.body // 跟节点
/**
 * NOTE: 非常重要。这个是用来控制 my 所有相关api 或得 跟节点的 方法。 由宿主容器 根据实际情况调用
 */

export function updateRootView(rv: HTMLElement) {
  RootView = rv
}

export function getRootView(): HTMLElement {
  return RootView
}
