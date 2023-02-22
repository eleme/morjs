interface ParameterOptions {
  name?: string
  para?: string
  wrong: object
  correct: string
}

function upperCaseFirstLetter(str: string) {
  if (typeof str !== 'string') return str
  str = str.replace(/^./, (match) => match.toUpperCase())
  return str
}

export function getParameterError({
  name = '',
  para,
  correct,
  wrong
}: ParameterOptions) {
  const parameter = para ? `parameter.${para}` : 'parameter'
  const errorType = upperCaseFirstLetter(wrong == null ? 'Null' : typeof wrong)
  return `${name}:fail parameter error: ${parameter} should be ${correct} instead of ${errorType}`
}

export function shouldBeObject(target: any) {
  if (target && typeof target === 'object') return { res: true }
  return {
    res: false,
    msg: getParameterError({
      correct: 'Object',
      wrong: target
    })
  }
}

export const createCallbackManager = () => {
  const callbacks = []

  const add = (opt) => {
    callbacks.push(opt)
  }

  const remove = (opt) => {
    const index = callbacks.indexOf(opt)
    if (index < 0) return

    callbacks.splice(index, 1)
  }

  const trigger = (...args) => {
    callbacks.forEach((opt) => {
      if (typeof opt === 'function') {
        opt(...args)
      } else {
        const { callback, ctx } = opt
        callback.call(ctx, ...args)
      }
    })
  }

  return {
    add,
    trigger,
    remove
  }
}

export const pageOnReadyCallApi = (my: Record<string, any>) => {
  // 有些 api 是 后续 components 中挂载的，为了能正确代理，做异步处理
  setTimeout(() => {
    // 维护需要做pageOnReady处理的列表
    const apiList = ['setNavigationBar']

    apiList.forEach((api) => {
      const func = my[api]

      my[api] = (...params: unknown[]) => {
        my.$pageOnReadyCall(() => {
          func.apply(my, params)
        })

        return func.apply(my, params)
      }
    })
  })
}

export const getPageAsKey = () => {
  if (typeof getCurrentPages !== 'function') return ''

  const pages = getCurrentPages()
  const { length } = pages
  if (length <= 0) return ''

  return pages[length - 1].route
}

export const appendQueryToUrl = (url = '', query = {}) => {
  const hadQuery = url.indexOf('?') > -1
  const keys = Object.keys(query)
  const { length: keysLength } = keys

  let queryString = ''
  if (keysLength > 0) {
    keys.map((key, index) => {
      queryString += `${key}=${query[key]}`

      if (index !== keysLength - 1) queryString += '&'
    })
  }

  if (!hadQuery) return `${url}?${queryString}`

  const hadParams = url.indexOf('=') > -1
  if (!hadParams) return url + queryString

  const endWithSeparator = url[url.length - 1] === '&'
  if (endWithSeparator) return url + queryString

  return `${url}&${queryString}`
}

export const convertBlobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(blob)
  })

export const wait = (millisecond = 67) => {
  return new Promise((resolve) => {
    setTimeout(resolve, millisecond)
  })
}
