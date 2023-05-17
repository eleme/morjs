class CustomCache {
  _cache = {}

  set(key, value) {
    // 覆盖式，暂不支持以队列维护多数值
    this._cache[key] = value
  }

  get(key) {
    return this._cache[key]
  }
}

export default new CustomCache()
