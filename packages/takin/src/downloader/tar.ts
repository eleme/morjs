import fs from 'fs-extra'
import got, { Options as GotOptions } from 'got'
import _ from 'lodash'
import tar from 'tar-fs'
import zlib from 'zlib'
import { DownloaderError } from '../errors'
import { logger } from '../logger'

const SUPPORT_PROTOCOLS = ['https:', 'http:', 'ftp:']

type TarInfo = GotOptions & {
  url: string
  /**
   * 用于缩减解压后的文件路径
   * 默认为 1
   */
  strip?: number
}

/**
 * 解析 tar 链接或选项
 * @param urlOrOptions - 链接或选项
 * @returns 解析后的 tar 链接或选项
 */
export function parseOptions(urlOrOptions: string | TarInfo): TarInfo {
  let url: string
  let options: GotOptions = {
    followRedirect: true,
    timeout: 120 * 1000,
    method: 'get'
  }
  let strip = 1

  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions
  } else {
    url = urlOrOptions.url
    strip = urlOrOptions.strip ?? strip
    options = { ...options, ...urlOrOptions }
  }

  if (!url) throw new DownloaderError('解析 tar 选项错误: 缺少 url')

  return { ...options, url, strip }
}

/**
 * 判断是否支持处理当前链接
 * @param url - 链接
 * @returns 是否支持该链接
 */
export function supportProtocol(url: string): boolean {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    if (SUPPORT_PROTOCOLS.includes(urlObj.protocol)) return true
    return false
  } catch (error) {
    return false
  }
}

/**
 * 基于 tar 压缩包选项获取名称
 * @param tarOptions - tar 压缩包选项
 * @returns 名称
 */
export function getName(tarOptions: TarInfo): string {
  const url = new URL(tarOptions.url)
  return (url.pathname || '').trim().replace(/^\//, '') || url.hostname
}

/**
 * 下载 tar 压缩包到指定目录
 * @param tarOptions - tar 压缩包选项
 * @param dest - 指定目录地址
 */
export async function download(
  tarOptions: TarInfo,
  dest: string
): Promise<void> {
  // 这里只确保文件夹存在
  // 因为支持 strip, 所以如果删除文件夹可能会导致解压缩的外层文件夹被删
  await fs.ensureDir(dest)

  await new Promise((resolve, reject) => {
    const url = tarOptions.url
    const strip = tarOptions.strip

    logger.debug('Tar 下载信息: ', tarOptions)

    got
      .stream(
        url,
        _.omit(tarOptions, ['url', 'strip']) as GotOptions & { isStream?: true }
      )
      .on('error', reject)
      .pipe(zlib.createGunzip())
      .pipe(
        tar.extract(dest, {
          strip
        })
      )
      .on('finish', resolve)
  })
}
