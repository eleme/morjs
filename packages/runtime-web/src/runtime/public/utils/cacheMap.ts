class CacheMap {
  map = {}
  constructor(map = {}) {
    this.map = map
  }

  set(key, value) {
    this.map[key] = value
  }

  get(key) {
    return this.map[key]
  }

  has(key) {
    return !!this.map[key]
  }

  delete(key) {
    delete this.map[key]
  }
}

export default new CacheMap()
