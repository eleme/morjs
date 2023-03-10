import { getEnvDesc } from '../env'
import { logger } from '../logger'
import { hasOwnProperty } from './hasOwnProperty'

/**
 * 接口转换配置
 * 字母作为 键值 是为了稍微减少一点运行时代码量 T_T
 */
export interface IAPITransformConfig {
  /**
   * 原接口名称
   */
  [k: string]: {
    /**
     * 新接口别名, 代表 原接口调用会代理到 n 上
     */
    n?: string
    /**
     * 选项修改配置
     */
    opts?:
      | {
          /**
           * 选项名称修改 change
           */
          c?: {
            /**
             * 原有名称
             */
            o: string
            /**
             * 新名称
             */
            n: string
          }[]
          /**
           * 选项名称设置 set
           */
          s?: {
            /**
             * 选项 名称
             */
            k: string
            /**
             * 值 设置
             */
            v: (options: Record<string, any>) => any
          }[]
        }
      | ((
          /**
           * opts 函数 直接修改 args
           */
          ...args: any[]
        ) => any)
    /**
     * 结果修改
     */
    r?: (res: Record<string, any>) => any
    /**
     * 函数重写
     */
    fn?: (global, ...args: any[]) => Promise<any> | any
  }
}

export interface ITransformApisIOptions {
  needPromisfiedApis?: string[]
  apiTransformConfig?: IAPITransformConfig
}

/**
 * 获取原始小程序 request 函数
 * @param global 小程序全局对象
 * @returns request 函数
 */
function getOriginalRequest(global: Record<string, any>) {
  return function request(options: Record<string, any>) {
    options = options || {}
    if (typeof options === 'string') {
      options = {
        url: options
      }
    }
    const originSuccess = options.success
    const originFail = options.fail
    const originComplete = options.complete

    let requestTask
    const p: any = new Promise((resolve, reject) => {
      options.success = (res) => {
        originSuccess && originSuccess(res)
        resolve(res)
      }
      options.fail = (res) => {
        originFail && originFail(res)
        reject(res)
      }

      options.complete = (res) => {
        originComplete && originComplete(res)
      }

      requestTask = global.request(options)
    })

    p.abort = (cb) => {
      cb && cb()
      if (requestTask) {
        requestTask.abort()
      }
      return p
    }
    return p
  }
}

/**
 * 接口抹平转换
 * @param mor - mor 接口对象
 * @param global - 小程序目标平台全局对象
 * @param config - 接口抹平配置
 * @param installAllGlobalApis - 是否在 mor 中添加所有的 API
 * @param allowOverride - 是否允许覆盖 API
 */
export function transformApis(
  mor: Record<string, any>,
  global: Record<string, any>,
  config: ITransformApisIOptions = {},
  installAllGlobalApis = false,
  allowOverride = true
) {
  const needPromisfiedApis = config.needPromisfiedApis || []
  const apiTransformConfig = config.apiTransformConfig || {}
  const preservedApis = [
    'global',
    'env',
    'getApp',
    'getCurrentPages',
    'requirePlugin',
    'getEnv'
  ]

  // 获取所有需要抹平的接口
  const allApiNames = installAllGlobalApis ? Object.keys(global) : []

  // 合并需要处理的接口名称
  Object.keys(apiTransformConfig)
    .concat(needPromisfiedApis)
    .forEach((apiName) => {
      if (allApiNames.indexOf(apiName) === -1) {
        allApiNames.push(apiName)
      }
    })

  // 处理接口差异
  allApiNames.forEach((apiName) => {
    // 不处理 preserved 的 api
    if (preservedApis.indexOf(apiName) !== -1) return

    // 不处理 mor_ 开头的属性
    if (/^mor_/.test(apiName)) return

    // 不重复添加接口
    if (allowOverride === false && apiName in mor) return

    const apiConfig = apiTransformConfig[apiName]

    // 非函数处理
    if (global[apiName] && typeof global[apiName] !== 'function') {
      mor[apiName] = global[apiName]
      return
    }

    // 函数处理
    mor[apiName] = (options: Record<string, any>, ...args: any[]) => {
      // options 差异抹平
      if (typeof apiConfig?.opts === 'function') {
        apiConfig.opts(options, ...args)
      } else if (apiConfig?.opts) {
        const change = apiConfig.opts.c
        const set = apiConfig.opts.s

        if (options == null) options = {}

        // 替换 键值
        if (change) {
          change.forEach((item) => {
            if (item.o in options) options[item.n] = options[item.o]
          })
        }

        // 改写值
        if (set) {
          set.forEach((item) => {
            options[item.k] =
              typeof item.v === 'function' ? item.v(options) : item.v
          })
        }
      }

      // 实际接口名称
      const actualApiName = apiConfig?.n || apiName

      let task: any = null
      const obj: Record<string, any> = Object.assign({}, options)

      // 执行替换函数
      if (typeof apiConfig?.fn === 'function') {
        return apiConfig.fn(global, options, ...args)
      }

      // 处理 request
      if (actualApiName === 'request') return getOriginalRequest(global)

      // promisify 处理
      if (needPromisfiedApis.indexOf(apiName) !== -1) {
        // 新 apiName 可能不存在
        if (!hasOwnProperty(global, actualApiName)) {
          return Promise.resolve(markAsUnsupport(actualApiName)())
        }

        // Promise 化
        const p: any = new Promise((resolve, reject) => {
          obj.success = (res: Record<string, any>) => {
            apiConfig?.r?.(res)
            options?.success?.(res)
            if (actualApiName === 'connectSocket') {
              resolve(
                Promise.resolve().then(() =>
                  task ? Object.assign(task, res) : res
                )
              )
            } else {
              resolve(res)
            }
          }

          obj.fail = (res: Record<string, any>) => {
            options?.fail?.(res)

            // 如果用户传入了 fail 则代表用户自行处理错误
            // mor 不再抛出 promise 错误, 只标记完成
            if (typeof options?.fail === 'function') {
              resolve(null)
            } else {
              reject(res)
            }
            logger.error(`接口 ${actualApiName} 调用错误: `, res, `\n参数: `, [
              options,
              ...args
            ])
          }

          obj.complete = (res: Record<string, any>) => {
            options?.complete?.(res)
          }

          if (args.length) {
            task = global[actualApiName](obj, ...args)
          } else {
            task = global[actualApiName](obj)
          }
        })

        // 给 promise 对象挂载属性
        if (
          actualApiName === 'uploadFile' ||
          actualApiName === 'downloadFile'
        ) {
          p.progress = (cb?: (result: Record<string, any>) => void) => {
            task?.onProgressUpdate?.(cb)
            return p
          }
          p.abort = (cb?: () => void) => {
            cb?.()
            task?.abort?.()
            return p
          }
        }

        return p
      } else {
        // 新 apiName 可能不存在
        if (!hasOwnProperty(global, actualApiName)) {
          return markAsUnsupport(actualApiName)()
        }

        return global[actualApiName](options, ...args)
      }
    }
  })
}

/**
 * 返回暂不支持的 函数
 * @param apiName - 接口名称
 */
export function markAsUnsupport(apiName: string) {
  return function () {
    logger.warn(`${getEnvDesc()}暂不支持 ${apiName}`)
  }
}
