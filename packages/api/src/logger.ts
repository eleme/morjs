const PREFIX = '[mor]'

function warn(...msgs: any[]) {
  console.warn && console.warn(PREFIX, ...msgs)
}

function log(...msgs: any[]) {
  console.log && console.log(PREFIX, ...msgs)
}

function error(...msgs: any[]) {
  console.error && console.error(PREFIX, ...msgs)
}

function info(...msgs: any[]) {
  console.info && console.info(PREFIX, ...msgs)
}

function debug(...msgs: any[]) {
  console.debug && console.debug(PREFIX, ...msgs)
}

function deprecated<T extends (...args: any[]) => any>(msg: string, fn: T): T {
  return function (...args: Parameters<T>): ReturnType<T> {
    warn(msg)
    return fn(...args)
  } as T
}

const PERFORMANCE_TIMERS: Record<string, number> = {}

/**
 * 记录时间开始
 * @param label 标签
 */
function time(label: string) {
  PERFORMANCE_TIMERS[label] = +new Date()
}

/**
 * 记录时间结束并输出耗时
 * 大于 50ms 时会输出 warn
 * @param label 标签
 */
function timeEnd(label: string) {
  const start = PERFORMANCE_TIMERS[label]
  if (start) {
    delete PERFORMANCE_TIMERS[label]
    const millis = Date.now() - start
    const msg = `${label} 耗时: ${millis}ms`
    // 超过 50 ms
    // 输出警告
    millis > 50 ? warn(msg) : debug(msg)
  }
}

export const logger = {
  warn,
  log,
  error,
  info,
  debug,
  deprecated,
  time,
  timeEnd
}
