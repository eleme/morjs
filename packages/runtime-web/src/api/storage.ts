const prefix = 'TiGa-'

const setStorageFn = ({ key, data }: my.ISetStorageSyncOptions) => {
  if (key && data !== undefined) {
    const _key = `${prefix}${key}`
    localStorage.setItem(_key, JSON.stringify(data))
  }
}

const removeStorageFn = (key: string): void => {
  if (key) {
    const _key = `${prefix}${key}`
    localStorage.removeItem(_key)
  } else {
    console.error('key 为空')
  }
}

const getStorageFn = ({ key }: my.IGetStorageOptions) => {
  if (!key) {
    return {
      err: 'key 不能为空'
    }
  }
  const _key = `${prefix}${key}`
  const value = localStorage.getItem(_key)
  return {
    data: value ? JSON.parse(value) : value
  }
}

export default {
  setStorage(options: my.ISetStorageOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        setStorageFn(options)
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  },

  getStorage(
    options: my.IGetStorageOptions
  ): Promise<string | Readonly<Record<string, any>>> {
    return new Promise((resolve) => {
      const data = getStorageFn(options)
      resolve(data)
    })
  },

  removeStorage(options: my.IRemoveStorageOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (options.key) {
        removeStorageFn(options.key)
        resolve()
      } else {
        console.error('键值为空')
        reject()
      }
    })
  },

  getStorageInfo(): Promise<Record<string, any>> {
    return new Promise((resolve) => {
      const keys = []
      for (const key in localStorage) {
        if (/^TiGa-/.test(key)) {
          const _key = key.replace(/^TiGa-/, '')
          keys.push(_key)
        }
      }
      resolve({
        keys
      })
    })
  },

  clearStorage(): void {
    localStorage.clear()
  },

  setStorageSync(option: my.ISetStorageSyncOptions): void {
    setStorageFn(option)
  },

  getStorageSync(option: my.IGetStorageSyncOptions): any {
    return getStorageFn(option)
  },

  removeStorageSync({ key }: my.IRemoveStorageSyncOptions) {
    if (key) {
      removeStorageFn(key)
    } else {
      console.error('键值为空')
    }
  },

  getStorageInfoSync(): Record<string, any> {
    const keys = []
    for (const key in localStorage) {
      if (/^TiGa-/.test(key)) {
        const _key = key.replace(/^TiGa-/, '')
        keys.push(_key)
      }
    }
    return {
      keys
    }
  },

  clearStorageSync(): void {
    localStorage.clear()
  }
}
