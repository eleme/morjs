import chalk from 'chalk'
import debug from 'debug'
import _, { isString, truncate } from 'lodash'
import readline from 'readline'
import { inspect } from 'util'
import { DEFAULT_NAME } from '../constants'
import { isSupportColorModifier } from '../utils/colorModifierSupport'
import { isUnicodeSupported } from '../utils/isUnicodeSupported'
import { CliTableOptions, ConsoleCliTable } from './table'

export * from './table'

export type LogType = 'error' | 'warn' | 'info' | 'success'
export type LogLevel = LogType | 'silent'

export interface Logger {
  /**
   * 初始化 logger, 多次调用会重复初始化同一个 logger
   */
  init(level: LogLevel, options: LoggerOptions): void
  /**
   * 返回携带 特定 options 的 Logger 实例
   */
  withOptions(options: LogOptions): Logger
  /**
   * 创建 loading 日志对象
   */
  createLoading(msg: any, options?: LogOptions): LoadingLogger
  /**
   * info 日志输出
   */
  info(msg: any, options?: LogOptions): void
  /**
   * success 日志输出
   */
  success(msg: any, options?: LogOptions): void
  /**
   * warn 日志输出
   */
  warn(msg: any, options?: LogOptions): void
  /**
   * warn 日志输出, 相同信息只输出一次
   */
  warnOnce(msg: any, options?: LogOptions): void
  /**
   * error 日志输出
   */
  error(msg: any, options?: LogErrorOptions): void
  /**
   * deprecate 日志输出
   */
  deprecate(deprecatedMsg: any, hint: any, error?: Error): void
  /**
   * debug 日志输出, 基于 debug npm
   */
  debug(msg: any, ...args: any[]): void
  /**
   * table 表格输出
   */
  table(
    tableOptions: CliTableOptions,
    type?: LogType,
    options?: LogErrorOptions
  ): void
  /**
   * 耗时性能日志输出, 需要配合 timeEnd 一起使用
   */
  time(label: string): void
  /**
   * 耗时性能日志输出, 需要配合 time 一起使用
   */
  timeEnd(label: string): string
  /**
   * 是否清空当前屏幕
   */
  clearScreen(type: LogType): void
  /**
   * 当前错误是否已输出
   */
  hasErrorLogged(error: Error): boolean

  hasWarned: boolean
  hasErrored: boolean
  options: LogOptions
}

export type LoadingLogger = Pick<Logger, 'error' | 'success'> & {
  fail: Logger['error']
  /**
   * 更新 loading 信息
   */
  update: (msg: string) => LoadingLogger
  /**
   * 开始 loading
   */
  start: (msg?: string, options?: LogOptions) => LoadingLogger
  /**
   * 停止 loadding
   */
  stop: () => LoadingLogger
}

export interface LogOptions {
  // 是否清空当前窗口
  clear?: boolean
  // 是否携带时间戳
  timestamp?: boolean
  // 是否输出颜色
  color?: boolean
  // 是否对齐
  align?: boolean
  // 是否输出 symbol
  symbol?: boolean | string
  // 是否为更新
  update?: boolean
  // 对象层级
  depth?: null | number
}

export interface LogErrorOptions extends LogOptions {
  error?: Error | null
}

export interface LoggerOptions {
  /**
   * 日志前缀
   */
  prefix?: string
  /**
   * debug 前缀
   */
  debugPrefix?: string
  /**
   * 是否清空屏幕
   */
  allowClearScreen?: boolean
  /**
   * 自定义 logger 对象
   */
  customLogger?: Logger
}

export type TakinDebugScope = `${string}:${string}` | string

export type Debug = debug.Debugger['log']

/**
 * 用于过滤日志参数, 并替换为 ********
 */
export const FILTER_LOGGER_PARAMETERS = new Set<string>()

export const LogLevels: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  success: 3,
  info: 4
}

const COLOR_NAMES = {
  error: 'redBright',
  warn: 'yellowBright',
  success: 'greenBright',
  info: 'cyanBright'
} as const

export const COLORS = {
  error: chalk[COLOR_NAMES.error],
  warn: chalk[COLOR_NAMES.warn],
  success: chalk[COLOR_NAMES.success],
  info: chalk[COLOR_NAMES.info]
}

const STREAM = process.stdout

// 日志符号
const LOG_SYMBOLS = isUnicodeSupported()
  ? {
      info: 'ℹ',
      success: '✔',
      warn: '⚠',
      error: '✖'
    }
  : {
      info: 'i',
      success: '√',
      warn: '‼',
      error: '×'
    }

let currentSpinner: number = 0
const SPINNERS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/**
 * 创建 debugger
 * @param namespace - 命名空间
 * @returns debugger
 */
export function createDebugger(namespace: TakinDebugScope): debug.Debugger {
  return debug(namespace)
}

/**
 * 开启特定命名空间的 debugger
 * @param namespaces - 需要开启 debug 的命名空间
 */
export function enableDebugger(namespaces: string): void {
  debug.enable(namespaces)
}

let lastType: LogType | undefined
let lastMsg: string | undefined
let sameCount = 0
let isLastUpdate = false

function clearScreen() {
  const repeatCount = STREAM.rows - 2
  const blank = repeatCount > 0 ? '\n'.repeat(repeatCount) : ''
  console.log(blank)
  readline.cursorTo(STREAM, 0, 0)
  readline.clearScreenDown(STREAM)
}

/**
 * 清理单行, 仅当上一次 logger 为 update 的情况下
 */
function clearScreenLine() {
  if (isLastUpdate) {
    STREAM.clearLine(0)
    STREAM.cursorTo(0)
    STREAM.moveCursor(0, -1)
    STREAM.clearLine(0)
  }
}

const FILTER_PARAMETERS_REPLACER = '********'
/**
 * 过滤日志参数，替换为 ********，避免敏感信息泄露，仅支持 对象和 Map
 * @param obj - 需要过滤的对象
 * @param depth - 对象层级
 * @returns 过滤后的对象
 */
function filterParameters<T = any>(obj: T, depth = 10): T {
  if (FILTER_LOGGER_PARAMETERS.size === 0) return obj
  if (depth <= 0) return obj

  const restDepth = depth - 1

  if (_.isMap(obj)) {
    const map = new Map() as typeof obj
    obj.forEach(function (value, key) {
      if (FILTER_LOGGER_PARAMETERS.has(key)) {
        map.set(key, FILTER_PARAMETERS_REPLACER)
      } else {
        map.set(key, filterParameters(value, restDepth))
      }
    })

    return map
  }

  if (_.isPlainObject(obj)) {
    const newObj = {} as typeof obj
    for (const key in obj) {
      if (FILTER_LOGGER_PARAMETERS.has(key)) {
        newObj[key] = FILTER_PARAMETERS_REPLACER as unknown as any
      } else {
        newObj[key] = filterParameters(obj[key], restDepth)
      }
    }
    return newObj
  }

  return obj
}

/**
 * 格式化 message, 将非 string 对象转换为字符串
 */
function formatMessage(msg: any, opts?: LogOptions): string {
  return typeof msg === 'string'
    ? msg
    : inspect(
        filterParameters(msg, opts?.depth == null ? undefined : opts?.depth),
        { depth: opts?.depth }
      )
}

/**
 * 创建日志
 * @param level - 日志级别
 * @param options - 日志创建选项
 * @returns logger 实例
 */
export function createLogger(
  level: LogLevel = 'info',
  options: LoggerOptions = {}
): Logger {
  if (options.customLogger) {
    return options.customLogger
  }

  const loggedErrors = new WeakSet<Error>()
  const warnedMessages = new Set<any>()
  const loggerTimes = new Map<string, bigint>()

  let prefix: string
  let debugPrefix: string | undefined
  let allowClearScreen: boolean | undefined
  let thresh: number
  let outputDebug!: debug.Debugger
  let allowClear: boolean | undefined
  let clear: () => void
  let clearLine: () => void

  // 执行 logger 初始化
  init(level, options)

  /**
   * 初始化 logger
   * 允许重复初始化以方便使用方定制 logger 输出格式和信息
   */
  function init(level: LogLevel = 'info', options: LoggerOptions = {}): void {
    prefix = options.prefix ?? `[${DEFAULT_NAME}]`
    debugPrefix = options.debugPrefix
    allowClearScreen = options.allowClearScreen ?? true

    thresh = LogLevels[level]

    outputDebug = createDebugger(debugPrefix || prefix)

    allowClear = allowClearScreen && process.stdout.isTTY && !process.env.CI

    clear = allowClear ? clearScreen : () => {}
    clearLine = allowClear ? clearScreenLine : () => {}
  }

  function output(type: LogType, message: any, options: LogErrorOptions = {}) {
    if (thresh >= LogLevels[type]) {
      const msg = formatMessage(message, options)
      const method = type === 'info' || type === 'success' ? 'log' : type

      let symbol: string
      if (isString(options.symbol)) {
        symbol = options.symbol
      } else {
        if (options.update && type !== 'success' && type !== 'error') {
          symbol = SPINNERS[currentSpinner % SPINNERS.length]
        } else {
          symbol = LOG_SYMBOLS[type]
        }
      }

      const format = () => {
        const fullPrefix =
          options.symbol === false ? prefix : `${prefix} ${symbol}`
        const tag = isSupportColorModifier()
          ? COLORS[type].bold(fullPrefix)
          : COLORS[type](fullPrefix)
        let _msg = msg

        // 多行对齐
        if (options.align) {
          _msg = _msg
            .split('\n')
            .map(function (msgItem, index) {
              if (index === 0) return msgItem
              return ''.padStart(fullPrefix.length + 1, ' ') + msgItem
            })
            .join('\n')
        }

        if (options.update && allowClear) {
          isLastUpdate = true
          let maxLength = STREAM.columns - fullPrefix.length - 8
          maxLength = maxLength < 20 ? 20 : maxLength
          _msg = truncate(_msg, { length: maxLength, omission: '...' })
          currentSpinner++
        } else {
          isLastUpdate = false
        }

        // 是否带颜色
        _msg = options.color ? COLORS[type](_msg) : _msg

        if (options.timestamp) {
          return `${chalk.dim(new Date().toLocaleTimeString())} ${tag} ${_msg}`
        } else {
          return `${tag} ${_msg}`
        }
      }

      if (options.error) {
        loggedErrors.add(options.error)
      }

      if (type === lastType && msg === lastMsg && !options.update) {
        sameCount++
        clear()
        console[method](format(), chalk.yellow(`(x${sameCount + 1})`))
      } else {
        sameCount = 0
        lastMsg = msg
        lastType = type

        if (options.clear) {
          clear()
        } else if (options.update) {
          clearLine()
        }

        console[method](format())
      }

      // 输出 debug 错误信息
      if (options.error) outputDebug(options.error)
    }
  }

  function mergeOptions(
    originOpts?: LogOptions,
    newOpts?: LogOptions
  ): LogOptions {
    return { ...(originOpts || {}), ...(newOpts || {}) }
  }

  const logger: Logger = {
    hasWarned: false,

    hasErrored: false,

    options: {},

    init,

    createLoading(msg, opts) {
      let interval: NodeJS.Timer
      const loadingLogger = this.withOptions(
        mergeOptions(opts, { update: true })
      )

      let message = msg

      return {
        update(msg) {
          message = msg
          return this
        },
        start(msg) {
          if (msg) message = msg
          // 先输出一次正常的 info
          loadingLogger.info(message)
          this.stop()
          interval = setInterval(() => loadingLogger.info(message), 80)
          return this
        },
        stop() {
          if (interval) clearInterval(interval)
          return this
        },
        success(msg, opts) {
          this.stop()
          loadingLogger.success(msg, opts)
        },
        fail(msg, opts) {
          this.stop()
          loadingLogger.error(msg, opts)
        },
        error(msg, opts) {
          this.stop()
          loadingLogger.error(msg, opts)
        }
      }
    },

    withOptions(opts: LogOptions) {
      return { ...logger, options: mergeOptions(this.options, opts) }
    },

    info(msg, opts) {
      output('info', msg, mergeOptions(this.options, opts))
    },

    success(msg, opts) {
      output('success', msg, mergeOptions(this.options, opts))
    },

    warn(msg, opts) {
      logger.hasWarned = true
      output('warn', msg, mergeOptions(this.options, opts))
    },

    warnOnce(msg, opts) {
      if (warnedMessages.has(msg)) return
      logger.hasWarned = true
      output('warn', msg, mergeOptions(this.options, opts))
      warnedMessages.add(msg)
    },

    error(msg, opts) {
      logger.hasWarned = true
      logger.hasErrored = true
      output('error', msg, mergeOptions(this.options, opts))
    },

    deprecate(deprecatedMsg, hint, error?) {
      logger.hasWarned = true
      output(
        'warn',
        `(!) ${formatMessage(deprecatedMsg, this.options)} ${formatMessage(
          hint,
          this.options
        )}${error ? `\n${error.stack}` : ''}`
      )
    },

    debug(msg: any, ...args: any[]) {
      if (outputDebug.enabled) {
        outputDebug(
          formatMessage(msg),
          ...args.map((m) => formatMessage(m, this.options))
        )

        // 标记为非更新, 避免执行 loading 时被覆盖
        isLastUpdate = false
      }
    },

    table(tableOptions, type = 'info', opts) {
      let msg = new ConsoleCliTable({
        ...tableOptions,
        ...{
          style: {
            head: [COLOR_NAMES[type]],
            border: [COLOR_NAMES[type]],
            ...(tableOptions.style || {})
          }
        }
      }).render()

      const opt = mergeOptions(this.options, opts)

      // 如果未开启自动对齐, 则追加换行以保证表格打印正确
      if (!opt.align) {
        msg = '\n' + msg
      }

      output(type, msg, opt)
    },

    time(label) {
      loggerTimes.set(label, process.hrtime.bigint())
    },

    timeEnd(label) {
      const prev = loggerTimes.get(label)
      if (!prev) {
        outputDebug(`logger.time 缺少标识 '${label}'`)
        return ''
      }
      const time = process.hrtime.bigint()
      const result = `耗时: ${Number(time - prev) / 1000000} ms`
      loggerTimes.delete(label)
      logger.debug(`${label} ${result}`)
      return result
    },

    clearScreen(type) {
      if (thresh >= LogLevels[type]) {
        clear()
      }
    },

    hasErrorLogged(error) {
      return loggedErrors.has(error)
    }
  }

  return logger
}

/**
 * 默认 logger
 */
export const logger = createLogger('info', {
  debugPrefix: DEFAULT_NAME,
  prefix: `[${DEFAULT_NAME}]`
}).withOptions({ color: false, align: true })
