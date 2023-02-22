const DEFAULT_GLOBAL_OBJECT = 'my'

// 允许业务通过 window.$MOR_GLOBAL_OBJECT 来自定义需要使用的全局 API 对象
const CUSTOM_GLOBAL_OBJECT = '$MOR_GLOBAL_OBJECT'

// 支持业务自定义全局 globalObject
export function getGlobalObject() {
  let globalKey = DEFAULT_GLOBAL_OBJECT

  // 查询业务有没有自定义 globalObject
  if (window?.[CUSTOM_GLOBAL_OBJECT]) {
    globalKey = window[CUSTOM_GLOBAL_OBJECT]
  }

  return globalKey
}

const globalKey = getGlobalObject()
window[globalKey] = window[globalKey] || {
  // 这里拷贝下原始的 window.my 中提供的方法
  ...(window?.[DEFAULT_GLOBAL_OBJECT] || {})
}

export const my: Record<string, any> = window[globalKey]
