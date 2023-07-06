type IAnyFunc = (...args: unknown[]) => any

const CAN_I_USE_FALSY = [
  'component.observers',
  'component.relations',
  'component.externalClass',
  'component.lifetimes'
]

export default function generateBaseAPI(api: Record<string, any>) {
  return {
    call(
      apiName: string,
      params: any,
      success: IAnyFunc,
      fail: IAnyFunc,
      complete: IAnyFunc
    ) {
      if (typeof api[apiName] !== 'function')
        return void console.warn(`my.call('${apiName}') 暂未实现`)

      api[apiName]({
        params,
        success,
        fail,
        complete
      })
    },

    canIUse(param = '') {
      console.warn('canIUse API 目前还未完全实现，仅供参考')

      if (CAN_I_USE_FALSY.indexOf(param) > -1) return false

      return true
    },

    SDKVersion: '1.0.0'
  }
}
