import { ICallItem, MockFn } from './types'

interface IMockResult {
  _fail?: boolean
}

export default class MockItem {
  private mockFn: MockFn

  private callItem: ICallItem

  constructor(mockFn: MockFn, callItem: ICallItem) {
    this.mockFn = mockFn
    this.callItem = callItem
  }

  public run() {
    let result =
      typeof this.mockFn === 'function'
        ? this.mockFn(this.callItem.opts, this.callItem.callback)
        : this.mockFn

    // 兼容 ESModule 写法
    if (result.__esModule === true && result.default != null)
      result = result.default

    // on 在初次调用的时候，不需要执行 callback
    if (this.callItem.name !== 'on') {
      if (result && typeof result.then === 'function') {
        this.handlePromise(result)
      } else {
        this.handleOptsCallback(result)
        this.callItem.callback && this.callItem.callback(result)
      }
    }

    return result
  }

  private handlePromise(fn: Promise<any>) {
    const opts = this.callItem.opts

    fn.then((result) => {
      if (opts) {
        opts.success && opts.success(result)
        opts.complete && opts.complete(result)
      }

      this.callItem.callback && this.callItem.callback(result)
    }).catch((result) => {
      if (opts) {
        opts.fail && opts.fail(result)
        opts.complete && opts.complete(result)
      }

      this.callItem.callback && this.callItem.callback(result)
    })
  }

  // 处理 opts 中的回调
  private handleOptsCallback(result: IMockResult) {
    const opts = this.callItem.opts

    if (!result) return
    if (!opts) return

    if (result._fail) {
      delete result._fail
      opts.fail && opts.fail(result)
    } else {
      opts.success && opts.success(result)
    }

    opts.complete && opts.complete(result)
  }
}
