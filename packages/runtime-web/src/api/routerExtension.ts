import queryString from 'query-string'

export default {
  // https://yuque.antfin.com/tb-miniapp/api/gwg8m1
  navigateToOutside(options) {
    const { params, success, fail, complete } = options
    try {
      location.href = queryString.stringifyUrl({
        url: params.url,
        query: params.params
      })
      if (success) {
        success()
      }
      if (complete) {
        complete()
      }
    } catch (e) {
      if (fail) {
        fail()
      }
    }
  },
  // http://jsapi.alipay.net/jsapi/util/get-startup-params.html
  getStartupPrams(options) {
    const { success, params = {} } = options || {}
    const searchStr =
      location.search.split('?')[1] || location.hash.split('?')[1] || ''
    const query = queryString.parse(searchStr)
    if (params.key?.length) {
      const queryByKey = {}
      params.key.forEach((keyItem) => (queryByKey[keyItem] = query[keyItem]))
      success(queryByKey)
    } else {
      success(query)
    }
  }
}
