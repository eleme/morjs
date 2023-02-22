class ForInfoObject {
  private value: any
  constructor(value) {
    this.value = value
  }
  map(func) {
    return Object.keys(this.value).map((key) => {
      return func(this.value[key], key)
    })
  }
}

class ForInfoEmpty {
  protected value: any
  constructor(value) {
    this.value = value
  }
  map() {
    return []
  }
}

class ForInfoMap {
  private value: any
  constructor(value) {
    this.value = value
  }
  map(func) {
    return [...this.value].map(([key, value]) => {
      return func(value, key)
    })
  }
}

export default function getForValue(value) {
  if (!value) return []
  if (value instanceof Array) return value
  let res
  switch (typeof value) {
    // 如果是numer，那么就动态创建一个数组
    case 'number': {
      res = []
      if (Number.isFinite(value)) {
        for (let i = 1; i <= value; i++) res.push(i)
      }
      break
    }
    // 如果是对象，那么创建一个ForInfoObject，主要是提供map 方法。之所以没有在prototype中添加，是因为避免污染全局。
    case 'object': {
      if (Map && value instanceof Map) {
        res = new ForInfoMap(value)
      } else if (Set && value instanceof Set) {
        res = Array.from(value) // set 直接转成数组
      } else {
        res = new ForInfoObject(value)
      }
      break
    }
    default: {
      res = new ForInfoEmpty(value)
    }
  }
  return res
}
