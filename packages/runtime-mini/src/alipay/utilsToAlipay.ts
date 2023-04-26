import { getGlobalObject, markAsUnsupport } from '@morjs/runtime-base'

export function canIUse(name: string): boolean {
  return !!getGlobalObject()?.canIUse?.(name)
}

/**
 * 标记不支持的实例方法
 */
export function markUnsupportMethods(
  options: Record<string, any>,
  extraMethods?: string[]
) {
  ;[
    'setInitialRenderingCache',
    'animate',
    'clearAnimation',
    'createMediaQueryObserver',
    'getTabBar',
    'setUpdatePerformanceListener'
  ]
    .concat(extraMethods || [])
    .forEach(function (methodName) {
      if (!options[methodName]) {
        options[methodName] = markAsUnsupport(`this.${methodName} 的调用`)
      }
    })
}

/**
 * 自定义组件扩展
 * 参考文档: https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/extend.html
 */
export type DefinitionFilter = <T extends Record<string, any>>(
  /** 使用该 behavior 的 component/behavior 的定义对象 */
  defFields: T,
  /** 该 behavior 所使用的 behavior 的 definitionFilter 函数列表 */
  definitionFilterArr?: DefinitionFilter[]
) => void

export interface BehaviorOptions {
  definitionFilter?: DefinitionFilter
  behaviors?: BehaviorOptions[]
  [k: string]: any
}

/**
 * 注入 hasBehavior 方法支持
 */
export function injectHasBehaviorSupport(
  options: Record<string, any>,
  behaviors?: BehaviorOptions[]
) {
  // 保存当前页面或组件中的 behaviors
  behaviors = behaviors || []

  function hasBehavior(
    behaviors: BehaviorOptions[],
    behavior: BehaviorOptions
  ): boolean {
    if (!behavior) return false

    if (behaviors.indexOf(behavior) !== -1) return true

    for (let i = 0; i < behaviors.length; i++) {
      if (hasBehavior(behaviors[i]?.behaviors || [], behavior)) return true
    }

    return false
  }

  options.hasBehavior = function (behavior: BehaviorOptions): boolean {
    return hasBehavior(behaviors, behavior)
  }
}

const isSelectOwnerComponentSupported = canIUse(
  'component.selectOwnerComponent'
)
const isSelectComponentSupported = canIUse('component.$selectComponent')

/**
 * 注入 $morSaveRef / selectComponent / selectAllComponents / selectOwnerComponent 方法
 * 通过 支付宝小程序的 ref 来实现
 */
export function injectComponentSelectorMethodsSupport(
  pageOrComponentOptions: Record<string, any>,
  type: 'page' | 'component'
) {
  const options =
    type === 'page' ? pageOrComponentOptions : pageOrComponentOptions.methods

  // 保存当前页面或组件中使用到的组件实例
  options.$morSaveRef = function (component) {
    this.$morChildComponents = this.$morChildComponents || []

    // 记录子组件
    if (this.$morChildComponents.indexOf(component) === -1) {
      this.$morChildComponents.push(component)
    }

    // 保存引用方关联
    component.$morOwnerComponent = this

    return component
  }

  // 移除关联
  // 这个方法会在 组件或页面卸载时调用
  options.$morRemoveRef = function (component) {
    const childComponents = (this.$morChildComponents || []) as any[]
    const index = childComponents.indexOf(component)
    if (index !== -1) {
      childComponents.splice(index, 1)
    }
  }

  // 页面卸载时移除 $morChildComponents
  if (type === 'page') {
    const originalFn = options.onUnload
    options.onUnload = function () {
      this.$morChildComponents = []
      if (typeof originalFn === 'function') originalFn.call(this)
    }
  } else {
    const originalFn =
      pageOrComponentOptions?.lifetimes?.detached ||
      pageOrComponentOptions?.detached
    pageOrComponentOptions.lifetimes.detached =
      pageOrComponentOptions.detached = function () {
        this.$morChildComponents = []
        if (typeof this?.$morOwnerComponent?.$morRemoveRef === 'function') {
          this?.$morOwnerComponent?.$morRemoveRef(this)
        }
        if (typeof originalFn === 'function') originalFn.call(this)
      }
  }

  // 生成选择器
  function generateSelectFunction(
    selectType: 'selectComponent' | 'selectAllComponents'
  ) {
    return function (selector: string): any {
      const childComponents = this.$morChildComponents || []
      const matchedComponents = []
      if (!selector || typeof selector !== 'string') {
        if (selectType === 'selectComponent') {
          return
        } else {
          return matchedComponents
        }
      }

      let searchField: string
      let searchValue: string

      if (selector.indexOf('#') === 0) {
        searchField = 'morTagId'
        searchValue = selector.slice(1)
      } else if (selector.indexOf('.') === 0) {
        searchField = 'className'
        searchValue = selector.slice(1)
      } else {
        searchField = 'morTagName'
        searchValue = selector
      }

      for (let i = 0; i < childComponents.length; i++) {
        const component = childComponents[i] || {}
        const names = (component.props?.[searchField] || '').split(' ')

        if (names.indexOf(searchValue) !== -1) {
          if (selectType === 'selectComponent') {
            return component
          } else {
            matchedComponents.push(component)
          }
        }

        // 查找组件中的组件
        if (typeof component?.[selectType] === 'function') {
          const result = component[selectType](selector)
          if (result) {
            if (selectType === 'selectComponent') {
              return result
            } else {
              matchedComponents.concat(result)
            }
          }
        }
      }

      return selectType === 'selectComponent' ? undefined : matchedComponents
    }
  }

  // 如果支付宝已支持 selectComponent 或 selectAllComponents 则不注入
  if (isSelectComponentSupported && type === 'component') {
    // 选择组件支持
    options.selectComponent = function (...args: any) {
      return this.$selectComponent(...args)
    }
    // 选择组件支持(多个)
    options.selectAllComponents = function (...args: any) {
      return this.$selectAllComponents(...args)
    }
  } else {
    // 选择组件支持
    options.selectComponent = generateSelectFunction('selectComponent')
    // 选择组件支持(多个)
    options.selectAllComponents = generateSelectFunction('selectAllComponents')
  }

  // 如果支付宝已支持 selectOwnerComponent 则不注入
  if (!isSelectOwnerComponentSupported || type === 'page') {
    // 选额父组件支持
    options.selectOwnerComponent = function () {
      return this.$morOwnerComponent
    }
  }
}

/**
 * 为组件或页面注入 this.createIntersectionObserver 支持
 * 原因: 支付宝仅 2.7.4 及以上页面有该方法, 但组件无该方法
 * @param context 组件或页面上下文, 即 this 对象
 */
export function injectCreateIntersectionObserverSupport() {
  return function () {
    // 如果方法存在则不处理
    if (this?.createIntersectionObserver) return
    this.createIntersectionObserver = function (
      options: Record<string, any> = {}
    ) {
      return getGlobalObject().createIntersectionObserver(options)
    }
  }
}
