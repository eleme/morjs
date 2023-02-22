import { CachedInputFileSystem } from 'enhanced-resolve'
import EventEmitter from 'events'
import { createFsFromVolume, IFs, Volume } from 'memfs'
import { asArray, fsExtra, Plugin, Runner, zod as z } from 'takin'
import webpack, { Compiler, Configuration, Watching } from 'webpack'
// webpack-chain 官方还未支持 webpack 5 先拿 webpack-5-chain 代替下
import globToRegExp from 'glob-to-regexp'
import WebpackChain from 'webpack-chain-5'
import NodeWatchFileSystem from 'webpack/lib/node/NodeWatchFileSystem'
import { logger } from './logger'

export type InputFileSystem = Compiler['inputFileSystem']

/**
 * Webpack 相关用户配置
 */
const WebpackConfigSchema = z.object({
  /**
   * webpack chain 支持, 允许定制 webpack 配置
   */
  webpackChain: z
    .function()
    .args(z.instanceof(WebpackChain))
    .returns(z.promise(z.void()).or(z.void()))
    .optional(),

  /**
   * 允许额外 watch 一些被 ignore 的目录或文件
   */
  watchNodeModules: z
    .string()
    .or(z.instanceof(RegExp))
    .or(z.array(z.string()))
    .optional()
})

// copy from watchpack for logically consistent
const stringToRegexp = (ignored: string) => {
  const source = globToRegExp(ignored, {
    globstar: true,
    extended: true
  }).source
  const matchingStart = source.slice(0, source.length - 1) + '(?:$|\\/)'
  return matchingStart
}
const ignoredToFunction = (
  ignored: string | string[] | RegExp | ((x: string) => boolean)
) => {
  if (Array.isArray(ignored)) {
    const regexp = new RegExp(ignored.map((i) => stringToRegexp(i)).join('|'))
    return (x: string) => regexp.test(x.replace(/\\/g, '/'))
  } else if (typeof ignored === 'string') {
    const regexp = new RegExp(stringToRegexp(ignored))
    return (x: string) => regexp.test(x.replace(/\\/g, '/'))
  } else if (ignored instanceof RegExp) {
    return (x: string) => ignored.test(x.replace(/\\/g, '/'))
  } else if (ignored instanceof Function) {
    return ignored
  } else if (ignored) {
    throw new Error(`Invalid option for 'ignored': ${ignored}`)
  } else {
    return () => false
  }
}

/**
 * webpackChain 配置类型支持
 */
export type WebpackUserConfig = z.infer<typeof WebpackConfigSchema>

const WebpackWrapperMap = new WeakMap<Runner, WebpackWrapper>()

// universalified type
type Universalify<T> = T extends (
  arg0: infer A,
  arg1: (arg0: null | NodeJS.ErrnoException, arg1: infer B) => void
) => void
  ? ((arg0: A) => Promise<B>) & T
  : never

function universalify<T extends (...args: any[]) => any>(
  fn: T
): Universalify<T> {
  return Object.defineProperty(
    function (...args: unknown[]) {
      if (typeof args[args.length - 1] === 'function') {
        fn(...args)
      } else {
        return new Promise((resolve, reject) => {
          fn(...args, (err: unknown, res: unknown) =>
            err != null ? reject(err) : resolve(res)
          )
        })
      }
    },
    'name',
    { value: fn.name }
  ) as unknown as Universalify<T>
}

function combinedFn<T extends (...args: any[]) => any>(fn1: T, fn2: T): T {
  return Object.defineProperty(
    function (...args: unknown[]): unknown {
      const callback = args[args.length - 1]
      if (typeof callback === 'function') {
        const _args = Array.from(args)
        _args[args.length - 1] = (err: unknown, result: unknown) => {
          // 这里需要额外判断 result 是否为空
          // 原因是: enhanced-resolve 5.11.0 版本中写入了 { throwIfNoEntry: false }
          //        导致 stat 方法调用失败后，不抛错，而是返回空值
          // 参见： https://github.com/webpack/enhanced-resolve/commit/96be62de9ca9cd1fd6f79f0036a3cf5c3a6ef0b7
          //       https://github.com/webpack/enhanced-resolve/issues/362
          err != null || result == null ? fn2(...args) : callback(err, result)
        }
        return fn1(..._args)
      } else {
        try {
          const result = fn1(...args)
          if (result != null) return result
        } catch (err) {
          /* do nothing */
        }
        return fn2(...args)
      }
    },
    'name',
    { value: fn2.name }
  ) as unknown as T
}

export type UniversalifiedInputFileSystem = {
  readFile: Universalify<InputFileSystem['readFile']>
  readJson: Universalify<InputFileSystem['readJson']>
  readlink: Universalify<InputFileSystem['readlink']>
  readdir: Universalify<InputFileSystem['readdir']>
  stat: Universalify<InputFileSystem['stat']>
  lstat: Universalify<InputFileSystem['lstat']>
  realpath?: Universalify<InputFileSystem['realpath']>
  fileExists: (arg: string) => Promise<boolean>
  pathExists: (arg: string) => Promise<boolean>
  purge?: (arg0?: string) => Promise<void>
  join?: (arg0: string, arg1: string) => Promise<string>
  relative?: (arg0: string, arg1: string) => Promise<string>
  dirname?: (arg0: string) => Promise<string>
  mem: IFs
}

type CallbackFunction = Parameters<Compiler['run']>[0]

/**
 * 创建自定义 fs
 * 用于提供模拟文件以及
 */
function createCustomFS(): {
  inputFileSystem: InputFileSystem
  fs: UniversalifiedInputFileSystem
} {
  const fileDataStore = new Map<string, string | Buffer>()
  const fileJsonStore = new Map<string, string | Buffer>()
  const fileLinkStore = new Map<string, string>()

  const memFs = createFsFromVolume(new Volume())

  /**
   * 生成 fs 的 promisified 实例
   */
  function universalifyInputFileSystem(
    fs: InputFileSystem
  ): UniversalifiedInputFileSystem {
    const pstat = universalify(fs.stat)

    return {
      readFile: universalify(fs.readFile),
      readJson: universalify(fs.readJson),
      readlink: universalify(fs.readlink),
      readdir: universalify(fs.readdir),
      stat: pstat,
      lstat: universalify(fs.lstat),
      fileExists: async (arg) => {
        try {
          const stat = await pstat(arg)
          if (stat.isFile()) return true
          return false
        } catch (error) {
          return false
        }
      },
      pathExists: async (arg) => {
        try {
          await pstat(arg)
          return true
        } catch (error) {
          return false
        }
      },
      realpath: fs.realpath ? universalify(fs.realpath) : undefined,
      purge: (what: string) => Promise.resolve(fs.purge(what)),
      join: (arg: string, arg1: string) => Promise.resolve(fs.join(arg, arg1)),
      relative: (arg: string, arg1: string) =>
        Promise.resolve(fs.relative(arg, arg1)),
      dirname: (arg: string) => Promise.resolve(fs.dirname(arg)),
      mem: memFs
    }
  }

  const _readFile = combinedFn(memFs.readFile, fsExtra.readFile)
  type IReadJSONArgs = Parameters<typeof fsExtra.readJson>
  const inputFileSystem = new CachedInputFileSystem(
    {
      ...fsExtra,
      ...{
        readFile: _readFile,
        readJson: function (
          filePath: IReadJSONArgs[0],
          callback: IReadJSONArgs[2]
        ) {
          _readFile(filePath, function (err, content) {
            if (err) return callback(err, undefined)
            try {
              callback(null, JSON.parse(String(content)))
            } catch (error) {
              callback(error, undefined)
            }
          })
        },
        readlink: combinedFn(memFs.readlink, fsExtra.readlink),
        /**
         * 定制 readdir
         * 优先从内存中读取文件夹列表，并与真实的文件夹列表合并
         */
        readdir(path: string, ...args: unknown[]) {
          type DIRS_TYPE = (string | Buffer)[] | fsExtra.Dirent[]
          const callback = args.pop() as (err: Error, dirs: DIRS_TYPE) => void
          const options = args[0]
          memFs.readdir(path, options, function (err1: Error, memDirs: any[]) {
            if (err1) {
              fsExtra.readdir(path, ...args.concat(callback))
            } else {
              fsExtra.readdir(
                path,
                ...args.concat(function (err2: Error, dirs: DIRS_TYPE) {
                  if (err2)
                    return callback(err2, dirs)
                    // 简单去重
                  ;(memDirs || []).forEach(function (dir) {
                    if (dirs.includes(dir)) return
                    dirs.push(dir)
                  })
                  callback(err2, dirs)
                })
              )
            }
          })
        },
        stat: combinedFn(memFs.stat, fsExtra.stat),
        lstat: combinedFn(memFs.lstat, fsExtra.lstat),
        realpath: combinedFn(memFs.realpath, fsExtra.realpath)
      }
    },
    60000
  ) as unknown as InputFileSystem

  // 追加清理内容
  const originalPurge = inputFileSystem.purge
  inputFileSystem.purge = function (what?: string): void {
    if (what) {
      fileDataStore.delete(what)
      fileJsonStore.delete(what)
      fileLinkStore.delete(what)
    } else {
      fileDataStore.clear()
      fileJsonStore.clear()
      fileLinkStore.clear()
    }

    return originalPurge.call(this, what)
  }

  return {
    inputFileSystem,
    fs: universalifyInputFileSystem(inputFileSystem)
  }
}

/**
 * 替换 webpack compiler 中的 inputFileSystem 为定制的 fs
 */
class ReplaceInputFileSystemPlugin {
  name = 'ReplaceInputFileSystemPlugin'
  inputFileSystem: InputFileSystem

  constructor(inputFileSystem: InputFileSystem) {
    this.inputFileSystem = inputFileSystem
  }

  apply(compiler: webpack.Compiler) {
    const inputFileSystem = this.inputFileSystem
    compiler.inputFileSystem = inputFileSystem
    compiler.watchFileSystem = new NodeWatchFileSystem(compiler.inputFileSystem)
    compiler.hooks.beforeRun.tap(this.name, (compiler) => {
      if (compiler.inputFileSystem === inputFileSystem) {
        compiler.fsStartTime = Date.now()
        inputFileSystem.purge()
      }
    })
  }
}

/**
 * webpack 封装
 * 主要目的是 共用 webpack 的能力
 */
export class WebpackWrapper extends EventEmitter {
  /**
   * webpack 实例, 初始化的时机为完成所有配置之后
   */
  compiler?: Compiler

  /**
   * webpack 中的 带缓存 inputFileSystem, 共用这部分，以节省性能
   */
  private inputFileSystem: InputFileSystem

  /**
   * webpack 中的 带缓存 fs, 共用这部分，以节省性能
   * 支持 promise 方式调用
   */
  fs: UniversalifiedInputFileSystem
  /**
   * @deprecated
   * 请替换为直接使用 webpackWrapper.fs
   */
  promisifiedFs: UniversalifiedInputFileSystem

  /**
   * webpack 配置
   * 该配置在 buildConfig 调用前 通过 webpackChain 生成
   */
  config?: Configuration

  /**
   * webpack watcher 实例
   */
  watching?: Watching

  /**
   * 提供 webpack chain 支持
   */
  private webpackChain: WebpackChain

  /**
   * watch 参数
   */
  private watchOptions?: Configuration['watchOptions']

  /**
   * 是否开启 watch
   */
  watch?: boolean

  /**
   * 需要额外 watch 文件或文件夹
   */
  public watchNodeModules?: WebpackUserConfig['watchNodeModules']

  constructor() {
    super()

    this.webpackChain = new WebpackChain()
    const { inputFileSystem, fs } = createCustomFS()
    this.inputFileSystem = inputFileSystem
    this.promisifiedFs = this.fs = fs
  }

  /**
   * 合并当前配置到 webpack 配置中
   * @param cnf 需要合并的配置
   */
  merge(cnf: Configuration): this {
    this.webpackChain.merge(cnf)
    return this
  }

  /**
   * 获取 webpackChain 实例, 用于修改 webpack 配置
   */
  get chain(): WebpackChain {
    return this.webpackChain
  }

  /**
   * @private
   * 准备 webpack 的 config
   * 该方法调用之后 基于 chain 的修改不再生效
   * NOTE: 该方法为 编译插件内部调用, 如无特别需要请勿自行调用
   */
  buildConfig(): Configuration {
    if (this.config) return this.config

    const config = this.webpackChain.toConfig()

    this.config = config
    this.watchOptions = config.watchOptions
    this.watch = config.watch

    delete this.config.watchOptions
    delete this.config.watch

    return this.config
  }

  /**
   * @private
   * 准备 webpack 相关实例
   * NOTE: 该方法为 编译插件内部调用, 如无特别需要请勿自行调用
   */
  prepare(): this {
    const config = this.buildConfig()
    const plugins = [
      // 替换 inputFileSystem
      new ReplaceInputFileSystemPlugin(this.inputFileSystem),
      ...asArray(config.plugins)
    ]
    this.compiler = webpack({ ...config, plugins })
    return this
  }

  /**
   * 运行 webpack
   * @param callback 回调函数
   */
  async run(callback?: CallbackFunction): Promise<webpack.Stats> {
    if (!this.compiler) this.prepare()

    // 判断 watch 状态下第一次编译结束, 用于标记 promise 完成
    let firstCompilation = true

    callback = callback || this.makeDefaultCallback()

    // 这里额外保存一次 stats
    // 原因是，某些 done hook 中提前抛错时, callback 中拿不到 stats
    // 无法更加清晰的显示所有错误
    let compileStats: webpack.Stats
    this.compiler.hooks.done.tap(
      {
        name: `MorWebpackWrapperBaseErrorHandlerPlugin`,
        stage: Number.NEGATIVE_INFINITY
      },
      function (stats) {
        compileStats = stats
      }
    )

    return await new Promise((resolve, reject) => {
      const cb: CallbackFunction = (err, stats) => {
        if (callback) callback(err, stats || compileStats)

        // 首次编译完成后, 确保 promise 可以正常结束
        if (firstCompilation) {
          err ? reject(err) : resolve(stats || compileStats)
        }

        firstCompilation = false
      }

      if (this.watch) {
        const ignored = ignoredToFunction(this.watchOptions?.ignored)
        const shouldWatch = ignoredToFunction(this.watchNodeModules)
        const watchOptions = {
          ...(this.watchOptions || {}),
          // watchpack 实际上是支持传入函数
          // 但 webpack 本身的配置只允许传入 RegExp 或 string 或 string[]
          // 所以这里在实际启动 watch 时通过替换 ignored 配置来实现额外监听
          // 一些 node_modules 的手段
          ignored(x: string) {
            const shouldIgnore = ignored(x)
            if (shouldIgnore === true) {
              if (shouldWatch(x)) return false
            }
            return shouldIgnore
          }
        }

        this.compiler.watch(watchOptions as unknown, cb)

        // 触发 watch 事件
        this.emit('watch', watchOptions)

        this.watching = this.compiler.watching
      } else {
        this.compiler.run((err, stats) => {
          this.compiler.close((err2) => {
            let error = err || err2

            // 如果无 fatal 错误, 则检查是否有编译错误
            // 并抛错出来
            if (stats && stats.hasErrors()) {
              error = error || new Error('编译错误, 请检查相关报错信息')
            }

            cb(error, stats)
          })
        })
      }
    })
  }

  /**
   * 生成默认回调函数, 用于优化 stats 信息显示
   * @returns 默认回调函数
   */
  private makeDefaultCallback(): CallbackFunction {
    return function (_, stats) {
      if (!stats) return
      if (!stats.hasErrors()) return

      const info = stats.toJson()
      const listedErrors = new Set<string>()

      info.errors.forEach((errMsg) => {
        const moduleName = errMsg?.moduleName || errMsg?.moduleId
        const message = moduleName
          ? `编译 ${moduleName} 失败:\n=> ${errMsg.message}`
          : errMsg.message

        // 避免相同错误重复打印
        if (!listedErrors.has(message)) {
          listedErrors.add(message)
          logger.error(message, { error: errMsg as Error })
        }
      })
    }
  }
}

/**
 * Webpack 插件, 提供如下能力
 * 1. hooks.webpackWrapper 的 hook 触发
 * 2. 提供 webpackChain 配置支持
 */
export class WebpackPlugin implements Plugin {
  name = 'MorWebpackPlugin'

  apply(runner: Runner): void {
    // 在插件完成加载之后触发 webpackWrapper hook
    runner.hooks.initialize.tap(this.name, function () {
      const webpackWrapper = new WebpackWrapper()
      WebpackWrapperMap.set(runner, webpackWrapper)
      runner.hooks.webpackWrapper.call(webpackWrapper)
    })

    // 注册 webpackChain 方法支持
    runner.hooks.registerUserConfig.tap(this.name, (schema) => {
      return schema.merge(WebpackConfigSchema)
    })

    runner.hooks.modifyUserConfig.tap(
      {
        name: this.name,
        stage: Number.MAX_SAFE_INTEGER
      },
      (userConfig: WebpackUserConfig & { cache?: boolean }) => {
        if (userConfig.watchNodeModules && userConfig.cache === true) {
          logger.warnOnce(`已开启 watchNodeModules 配置, 自动禁用 cache`)
          userConfig.cache = false
        }
        return userConfig
      }
    )

    runner.hooks.beforeRun.tapPromise(this.name, async () => {
      const userConfig = runner.userConfig as WebpackUserConfig
      const webpackWrapper = WebpackWrapperMap.get(runner)
      if (typeof userConfig?.webpackChain === 'function') {
        await userConfig.webpackChain(webpackWrapper.chain)
      }

      if (userConfig?.watchNodeModules) {
        webpackWrapper.watchNodeModules = userConfig.watchNodeModules
      }
    })

    // 关闭时自动清理 compiler 和 watching
    runner.hooks.shutdown.tapPromise(this.name, async () => {
      const wrapper = WebpackWrapperMap.get(runner)

      await Promise.all([
        // 关闭 compiler
        new Promise<void>(function (resolve, reject) {
          if (wrapper?.compiler) {
            wrapper.compiler.close(function (err) {
              if (err) return reject(err)
              resolve()
            })
          } else {
            resolve()
          }
        }),

        // 关闭 watching
        new Promise<void>(function (resolve, reject) {
          if (wrapper?.watching) {
            wrapper.watching.close(function (err) {
              if (err) return reject(err)
              resolve()
            })
          } else {
            resolve()
          }
        })
      ])
    })
  }
}
