const proxyFunctionError = (func, errorCallback) => {
  return new Proxy(func, {
    apply: (target, object, args) => {
      try {
        return Reflect.apply(target, object, args)
      } catch (e) {
        errorCallback(e)
      }
    }
  })
}

const isSupportProxy = () => typeof Proxy === 'function'

export const catchComponentMethodsError = (target, errorHandler) => {
  const componentMethods = (target && target.methods) || {}
  const methodsKeys = Object.keys(componentMethods)

  if (methodsKeys.length <= 0 || !isSupportProxy()) return target
  const proxyComponentMethods = {}

  methodsKeys.forEach(
    (key) =>
      (proxyComponentMethods[key] = proxyFunctionError(
        componentMethods[key],
        errorHandler
      ))
  )
  target.methods = proxyComponentMethods

  return target
}
