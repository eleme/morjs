import { getEnv, logger } from '@morjs/api'
import { GlobalType, ICallItem, IGlobalType } from './types'

export default class RequireContext {
  private isValid = true
  private context: any
  private contextCache: Record<string, any>

  constructor(context: any) {
    this.context = context
    if (!context) {
      logger.error('context 必须配置')
      this.isValid = false
      return
    }

    if (typeof context !== 'function' || typeof context.keys !== 'function') {
      logger.error('context 配置有问题')
      this.isValid = false
      return
    }

    this.checkHasType()

    // 处理 mockContext 使其适配多文件类型
    try {
      const contextCache = {}
      context.keys().forEach((key: string) => {
        const keyNew = key.replace(/.(cjs|js|json|json5|jsonc|mjs|ts)$/, '')
        // 取值优先级倒序 ts > mjs > jsonc > json5 > json > js > cjs
        contextCache[keyNew] = context(key)
      })
      this.contextCache = contextCache
    } catch (e) {}
  }

  public get(callItem: ICallItem) {
    if (!this.isValid) return
    const {
      type,
      name,
      opts: { url }
    } = callItem
    const mockFn = this.findMockFn(type, name, url)
    return mockFn
  }

  private findMockFn(type: string, name: string, url: string) {
    // const context = this.context
    const contextCache = this.contextCache
    let keyList = []

    if (type === IGlobalType[getEnv()] && name === 'request') {
      keyList = this.getRequestApi(url)
    } else {
      keyList = [`./${type}/${name}`, `./${type}/${name}/index`]
    }

    for (let i = 0; i < keyList.length; i++) {
      try {
        // return context(keyList[i])
        return contextCache[keyList[i]]
      } catch (ex) {} // eslint-disable-line
    }
  }

  // 针对 .request 做特殊处理
  private getRequestApi(url: string) {
    let href = url
    if (url.includes('http://') || url.includes('https://')) {
      href = href.replace('http://', '').replace('https://', '')
    }
    if (url.includes('?')) {
      href = href.split('?')[0]
    }
    const pathArr = href.split('/')
    pathArr.shift()
    if (!pathArr[pathArr.length - 1]) {
      pathArr.pop()
    }
    const normalPath = pathArr.join('/')
    return [`./request/${normalPath}`, `./request/${normalPath}/index`]
  }

  // 没有找到任何 Type 相关的路径，说明 context 路径整个错了
  private checkHasType() {
    const context = this.context

    const types = Object.keys(GlobalType)
    const reg = new RegExp(`^\.\/(${types.join('|')})\/`) // eslint-disable-line
    const f = context.keys().filter((k: string) => {
      return reg.test(k)
    })

    if (f.length === 0) {
      logger.error(
        `context 指定的目录有问题，没有找到任何子目录 ${types.join(
          '、'
        )}，或者子目录中没有 js 文件`
      )
      this.isValid = false
    }
  }
}
