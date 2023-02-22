import fs from 'fs-extra'
import _ from 'lodash'
import { DownloaderError } from '../errors'

type FileInfo = { path: string } & fs.CopyOptions

const FILE_URL_REGEXP =
  /^(?:(?:file:\/?)|(\.\.\/)|(\.\/)|(\/)|(~\/))((?:[^/]+\/)*[^/]+\/?)$/

/**
 * 解析 file 链接或选项
 * @param pathOrOptions - 链接或选项
 * @returns 解析后的 file 链接或选项
 */
export function parseOptions(pathOrOptions: string | FileInfo): FileInfo {
  let path: string
  let options = {}

  if (typeof pathOrOptions === 'string') {
    path = pathOrOptions
  } else {
    path = pathOrOptions.path
    options = { ...options, ...pathOrOptions }
  }

  if (!path) throw new DownloaderError('解析 file 选项错误: 缺少 path')

  return { ...options, path }
}

/**
 * 判断是否支持处理当前链接
 * @param url - 链接
 * @returns 是否支持该链接
 */
export function supportProtocol(url: string): boolean {
  if (!url) return false
  return FILE_URL_REGEXP.test(url)
}

/**
 * 基于 file 链接选项获取名称
 * @param fileOptions - file 链接选项
 * @returns 名称
 */
export function getName(fileOptions: FileInfo): string {
  return (fileOptions.path || '').trim().replace(/^\//, '')
}

/**
 * 下载 file 链接到指定目录
 * @param fileOptions - file 链接选项
 * @param dest - 指定目录地址
 */
export async function download(
  fileOptions: FileInfo,
  dest: string
): Promise<void> {
  await fs.remove(dest)
  await fs.copy(fileOptions.path, dest, _.omit(fileOptions, 'path'))
}
