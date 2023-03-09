import { logger } from '@morjs/api'
;(function morPolyfill(): void {
  try {
    Promise.prototype.finally =
      Promise.prototype.finally ||
      function morPolyfillPromiseFinally(
        this: Promise<any>,
        onFinally?: (() => void) | undefined | null
      ): Promise<any> {
        const isFunction = typeof onFinally === 'function'

        return this.then(
          isFunction
            ? function (value) {
                return Promise.resolve(onFinally()).then(function () {
                  return value
                })
              }
            : onFinally,
          isFunction
            ? function (reason) {
                return Promise.resolve(onFinally()).then(function () {
                  throw reason
                })
              }
            : onFinally
        )
      }
  } catch (err) {
    logger.error('polyfill', err)
  }
})()
