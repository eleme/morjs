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

// window.my = {
//   aaaa: 1,
//   bbb: () => {}
// }

const globalKey = getGlobalObject()

const morMy = window[globalKey] || {
  // 这里拷贝下原始的 window.my 中提供的方法
  ...(window?.[DEFAULT_GLOBAL_OBJECT] || {})
}

if (window[DEFAULT_GLOBAL_OBJECT]) {
  window.originalMy = {}
  const myKeys = Object.keys(window[DEFAULT_GLOBAL_OBJECT])
  for (let i = 0; i < myKeys.length; i++) {
    const key = myKeys[i]
    window.originalMy[key] = window[DEFAULT_GLOBAL_OBJECT][key]
  }
}

// 这里使用 defineProperty 来实现，避免 window[globalKey] 被覆盖
Object.defineProperty(window, globalKey, {
  get() {
    return morMy
  },
  set(value) {
    if (!window.originalMy) {
      window.originalMy = value
    }
    return
  }
})

// window[globalKey] = window[globalKey] || {
//   // 这里拷贝下原始的 window.my 中提供的方法
//   ...(window?.[DEFAULT_GLOBAL_OBJECT] || {})
// }

export const my: Record<string, any> = window[globalKey]
