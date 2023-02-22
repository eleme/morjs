import os from 'os'
import PQueue from 'p-queue'
import { COMMAND_TIMEOUT, RETRY_TIMES } from './constants'

/**
 * 基于内存的默认并发数
 */
const DEFAULT_CONCURRENCY_BY_MEM = Math.floor(os.totalmem() / 1073741824 / 2)

/**
 * 基于CPU数量的默认并发数
 */
const DEFAULT_CONCURRENCY_BY_CPUS = Math.floor(os.cpus().length / 2)

/**
 * 默认并发数, 最大允许 8 个并发
 */
export const DEFAULT_CONCURRENCY =
  Math.min(DEFAULT_CONCURRENCY_BY_MEM, DEFAULT_CONCURRENCY_BY_CPUS, 8) || 1

/**
 * 模块处理队列
 */
export const QUEUE = new PQueue({
  concurrency: DEFAULT_CONCURRENCY,
  // 过期时间设置为 2倍 x (重试次数+1) x COMMAND_TIMEOUT
  timeout: COMMAND_TIMEOUT * (RETRY_TIMES + 1) * 2,
  throwOnTimeout: true
})
