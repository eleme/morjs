import { my } from '../my'

/**
 * 默认是否允许覆盖全局对象中已有的 API
 */
export const DEFAULT_API_NO_CONFLICT =
  window.$MOR_APP_CONFIG?.apiNoConflict == null
    ? true
    : !!window.$MOR_APP_CONFIG?.apiNoConflict

function convertApi(api: (...args: unknown[]) => any) {
  if (typeof api !== 'function') {
    return api
  }
  return function (option: ConvertApiOptions = {}) {
    const result: Promise<any> = api(option)
    if (result && result instanceof Promise) {
      result
        .then((res) => {
          const success = option.success
          if (success) {
            success(res)
          }
          const complete = option.complete
          if (complete) {
            complete()
          }
          return res
        })
        .catch((err) => {
          const fail = option.fail
          if (fail) {
            fail(err)
          }
          const complete = option.complete
          if (complete) {
            complete()
          }
        })
    }
    return result
  }
}

export function convertApis(apis: Record<string, any>) {
  const temp = {}
  Object.keys(apis).forEach((key) => {
    const api = apis[key]
    temp[key] = convertApi(api)
  })
  return temp
}

export function appendApis(apiObj: Record<string, any>, noConflict = false) {
  const tmp = convertApis(apiObj)

  // 开启 noConflict 的情况下, 只追加新接口
  if (noConflict) {
    Object.keys(tmp).forEach(function (name) {
      if (name in my) return
      my[name] = tmp[name]
    })
  }
  // 默认直接添加并覆盖接口
  else {
    try {
      // 除了内置 api，后续添加的 api 都应添加在 window.my 上以达到共用的目的
      Object.assign(my, tmp)
    } catch (e) {
      console.error('appendApis: ', `${e}`)
    }
  }
}
