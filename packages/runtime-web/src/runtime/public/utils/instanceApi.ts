import { my } from '../../../api/my'
import { IntersectionObserverOptions } from '../../../api/ui/element-query/intersection-observer'

export function mountIntersectionObserver(
  options: IntersectionObserverOptions,
  root: Element | Text | null
) {
  const intersectionObserver = my.createIntersectionObserver(options)
  // 保存一份引用，且固定 this 绑定
  const observe = intersectionObserver.observe.bind(intersectionObserver)

  intersectionObserver.observe = (targetSelector, callback) => {
    try {
      let element = null
      if (root) {
        // 查看要遍历的组件是不是自定义节点最外层的节点
        if (
          typeof (root as HTMLElement).matches === 'function' &&
          (root as HTMLElement).matches(targetSelector)
        )
          element = root
        else if (root.parentNode)
          element = root.parentNode.querySelector(targetSelector)
      }

      // 在这种场景下，查找元素要从当前自定义节点下查找，不能从全局角度查找
      if (element) {
        return observe(element, callback)
      }
    } catch (e) {}
    // 处理报错了，或者没有正确的获取到 element 元素，走兜底逻辑，全局查询节点
    return observe(targetSelector, callback)
  }
  return intersectionObserver
}
