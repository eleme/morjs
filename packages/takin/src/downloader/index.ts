import _ from 'lodash'
import { DownloaderError } from '../errors'
import { logger } from '../logger'
import * as file from './file'
import * as git from './git'
import * as link from './link'
import * as npm from './npm'
import * as tar from './tar'

export type Downloader = {
  /**
   * 用于判断下载器可支持的 链接或协议
   */
  supportProtocol: (url: string) => boolean
  /**
   * 下载模块
   */
  download: (...args: any[]) => Promise<void>
  /**
   * 解析 url 或 下载选项
   */
  parseOptions: (urlOrOptions: any) => Record<string, any>
  /**
   * 获取名称
   */
  getName: (options: any) => string
}

const DOWNLOADERS = new Map<string, Downloader>()

export { file, link, git, tar, npm }

/**
 * 注册新的下载器
 * @param type - 下载器类型
 * @param downloader - 下载器
 */
export function registerDownloader(type: string, downloader: Downloader) {
  DOWNLOADERS.set(type, downloader)
}

/**
 * 获取下载模块名称
 * @param type - 下载类型
 * @param options - 下载配置
 * @returns 模块名称
 */
export function getModuleName(
  type: string,
  options: Record<string, any>
): string {
  return getDownloader(type).getName(options)
}

function getDownloader(type: string): Downloader {
  const downloader = DOWNLOADERS.get(type)

  if (!downloader) throw new DownloaderError(`不支持的下载类型: ${type}`)

  return downloader
}

/**
 * 基于下载配置选择下载方式
 * @param options - 下载配置
 * @returns 下载类型
 */
export function chooseDownloadType(
  options: Record<string, any>
): string | void {
  for (const [type] of DOWNLOADERS) {
    if (_.isEmpty(options?.[type])) continue
    return type
  }
}

/**
 * 获取所有下载类型
 */
export function getAllDownloadTypes(): string[] {
  return Array.from(DOWNLOADERS.keys())
}

/**
 * 解析下载链接或选项
 * @param type - 下载类型
 * @param options -  下载链接或选项
 * @returns 解析后的下载配置
 */
export function parseOptions(
  type: string,
  options: string | Record<string, any>
): Record<string, any> {
  return getDownloader(type).parseOptions(options)
}

/**
 * 尝试通过不同的方式下载模块
 * @param type - 下载方式
 * @param options - 下载配置
 * @param dest - 下载地址
 */
export async function download(
  type: string,
  options: Record<string, any>,
  dest: string
): Promise<void> {
  await getDownloader(type).download(options, dest)
}

/**
 * 基于不同的下载方式解析下载链接或选项，并下载
 * @param type - 下载方式
 * @param urlOrOptions - 下载链接或选项
 * @param dest - 下载地址
 */
export async function parseAndDownload(
  type: string,
  urlOrOptions: string | Record<string, any>,
  dest: string
): Promise<void> {
  const downloader = getDownloader(type)
  await downloader.download(downloader.parseOptions(urlOrOptions), dest)
}

/**
 * 基于 url 自动判断支持的下载器类型及下载选项
 * @param url - 下载链接或地址
 * @returns 下载器类型及下载选项
 */
export function autoDetectDownloaderTypeAndOptions(url: string): {
  type: string
  options: Record<string, any>
} {
  const protocalsRegExp = new RegExp(
    `^(${Array.from(DOWNLOADERS.keys()).join('|')}):`
  )

  // 尝试直接抽取协议头
  let type: string | void = protocalsRegExp.exec(url)?.[1]
  let opts: Record<string, any> | void

  if (type) {
    opts = parseOptions(
      type,
      // 移除链接的协议头
      url.replace(new RegExp(`^${type}:`), '')
    )
  } else {
    for (const [downloaderType, downloader] of DOWNLOADERS) {
      if (downloader.supportProtocol(url)) {
        type = downloaderType
        opts = downloader.parseOptions(
          // 移除链接的协议头
          url.replace(new RegExp(`^${downloaderType}:`), '')
        )
        break
      }
    }
  }
  if (!type || !opts) throw new DownloaderError(`不支持的下载链接: ${url}`)

  logger.debug(`匹配到下载器: ${type} => ${url}`, `下载选项:`, opts)

  return {
    type,
    options: opts
  }
}

/**
 * 自动基于不同的协议来下载模块
 * @param url - 下载链接
 * @param dest - 下载地址
 */
export async function tryDownloadByUrl(
  url: string,
  dest: string
): Promise<void> {
  const { type, options } = autoDetectDownloaderTypeAndOptions(url)
  await download(type, options, dest)
}

// 注册默认下载器
// 注册的顺序会影响 tryDownloadByUrl 的协议解析逻辑
registerDownloader('npm', npm)
registerDownloader('git', git)
registerDownloader('tar', tar)
registerDownloader('link', link)
registerDownloader('file', file)
