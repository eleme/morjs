import fs from 'fs-extra'
import { DownloaderError } from '../errors'

type LinkInfo = { path: string }

const LINK_URL_REGEXP = /^link:(\/?(?:[^/]+\/)*[^/]+\/?)$/

/**
 * 解析 link 链接或选项
 * @param pathOrOptions - 链接或选项
 * @returns 解析后的 link 链接或选项
 */
export function parseOptions(pathOrOptions: string | LinkInfo): LinkInfo {
  let path: string
  let options = {}

  if (typeof pathOrOptions === 'string') {
    path = pathOrOptions
  } else {
    path = pathOrOptions.path
    options = { ...options, ...pathOrOptions }
  }

  if (!path) throw new DownloaderError('解析 link 选项错误: 缺少 path')

  return { ...options, path }
}

/**
 * 判断是否支持处理当前链接
 * @param url - 链接
 * @returns 是否支持该链接
 */
export function supportProtocol(url: string): boolean {
  if (!url) return false
  return LINK_URL_REGEXP.test(url)
}

/**
 * 基于 link 链接选项获取名称
 * @param linkOptions - link 链接选项
 * @returns 名称
 */
export function getName(linkOptions: LinkInfo): string {
  return (linkOptions.path || '').trim().replace(/^\//, '')
}

/**
 * 下载 link 链接到指定目录
 * @param linkOptions - link 链接选项
 * @param dest - 指定目录地址
 */
export async function download(
  linkOptions: LinkInfo,
  dest: string
): Promise<void> {
  // 如果软链已存在, 则移除重建
  if ((await fs.pathExists(dest)) && (await fs.stat(dest)).isSymbolicLink()) {
    await fs.remove(dest)
  }

  await fs.ensureSymlink(linkOptions.path, dest)
}
