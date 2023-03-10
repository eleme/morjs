import { logger } from '@morjs/api'
import { Callback, ICallItem, IConfig } from './types'

// 整体时序记录
let globalIndex = 0

interface IBooleanObject {
  [index: number]: boolean
}
const logs: IBooleanObject = {}

export default class Attach {
  public fromMock = false

  public shouldPatchLog = true

  private config: IConfig

  private callItem: ICallItem

  // 记录调用时的次序
  private index = 0

  constructor(config: IConfig, callItem: ICallItem) {
    this.config = config
    this.callItem = callItem
    if (this.shouldLog()) {
      globalIndex += 1
      this.index = globalIndex
    }
  }

  public attach() {
    const opts = this.callItem.opts

    if (opts) {
      if (opts.success) {
        opts.success = this.attachToFn(opts.success)
      }
      if (opts.fail) {
        opts.fail = this.attachToFn(opts.fail)
      }
      if (opts.complete) {
        opts.complete = this.attachToFn(opts.complete)
      }

      // 如果业务上只写了 fail，但是返回 success，此时需要另外进行 log
      if (opts.fail && !opts.success && !opts.complete) {
        this.shouldPatchLog = true
      }
    }

    if (this.callItem.callback) {
      this.callItem.callback = this.attachToFn(this.callItem.callback)
    }
  }

  public log(result: any) {
    if (!this.shouldLog()) return

    // 同一个 jsapi 调用，只能 log 一次
    if (logs[this.index]) return
    logs[this.index] = true

    const index = this.index
    const { name, type, opts } = this.callItem

    if (this.fromMock) {
      logger.warn(`${index}.${name}[Mock-${type}]`, {
        opts,
        result
      })
    } else {
      logger.warn(`${index}.${name}[原生-${type}]`)
    }
  }

  private shouldLog() {
    const notNeedLog = this.config.notNeedLog
    if (notNeedLog === true) {
      return false
    }
    if (notNeedLog && notNeedLog.length) {
      const f = notNeedLog.filter((d) => {
        return d === this.callItem.name
      })
      if (f.length > 0) return false
    }

    return true
  }

  private attachToFn(fn: Callback) {
    return this.attachDelay(this.attachLog(fn))
  }

  private attachDelay(fn: Callback) {
    const delay = this.delayTime()

    return (...args: any[]) => {
      setTimeout(() => {
        fn(...args)
      }, delay)
    }
  }

  private delayTime(): number {
    return 0
  }

  private attachLog(fn: Callback) {
    return (...args: any[]) => {
      const result = args[0]
      this.log(result)
      fn(...args)
    }
  }
}
