import fs from 'fs-extra'
import getNpmTarballUrl from 'get-npm-tarball-url'
import got from 'got'
import registryUrl from 'registry-url'
import { logger } from '../logger'
import * as tar from './tar'

const NPM_URL_REGEXP =
  /^(?:npm:)?(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(?:@[~^]?([\dvx*]+(?:[-.](?:[\dx*]+|alpha|beta))*))?$/

// 保存 npm registry
let REGISTRY_URL: string

interface NpmInfo {
  name: string
  version?: string
  registry?: string
}

/**
 * 设置自定义 npm registry 地址
 * @param url - 自定义 npm registry 地址
 */
export function setRegistryUrl(url: string): void {
  if (!url) return
  REGISTRY_URL = url
}

/**
 * 返回 特定 scope 的 npm registry 地址
 * @param scope - npm 分组
 * @returns npm registry
 */
function getRegistryUrl(scope?: string): string {
  if (REGISTRY_URL) return REGISTRY_URL
  return registryUrl(scope)
}

function parseNpmUrl(url: string): NpmInfo {
  let npmOptions: NpmInfo
  const npmArgs = url.split('/')

  if (npmArgs.length === 1) {
    const [name, version] = npmArgs[0].split('@')
    npmOptions = { name, version }
  } else {
    const scope = npmArgs[0]
    const [name, version] = npmArgs[1].split('@')
    npmOptions = { name: `${scope}/${name}`, version }
  }

  return npmOptions
}

async function getNpmVersion(
  name: string,
  registry: string,
  version?: string
): Promise<string> {
  const url = new URL(`-/package/${name}/dist-tags`, registry)
  return got(url.toString())
    .json<Record<string, any>>()
    .then((distTags) => {
      const distVersion = version ? distTags[version] : undefined
      const latestVersion = distTags['latest']
      const selectedVersion = distVersion || version || latestVersion
      logger.debug('NPM dist-tags 信息: ', distTags)
      logger.debug('用户版本: ', version || '未指定')
      logger.debug(
        '选择版本: ',
        selectedVersion,
        selectedVersion === latestVersion ? '最新版' : ''
      )

      return selectedVersion
    })
}

/**
 * 解析 npm 链接或选项
 * @param urlOrOptions npm 链接或选项
 * @returns npm 选项
 */
export function parseOptions(urlOrOptions: string | NpmInfo): NpmInfo {
  let npm: NpmInfo
  if (typeof urlOrOptions === 'string') {
    npm = parseNpmUrl(urlOrOptions)
  } else {
    npm = urlOrOptions
  }
  return npm
}

/**
 * 判断是否支持处理当前链接
 * @param url - 链接
 * @returns 是否支持该链接
 */
export function supportProtocol(url: string): boolean {
  if (!url) return false
  return NPM_URL_REGEXP.test(url)
}

/**
 * 从 npm 选项中获取名称
 * @param options - npm 选项
 * @returns 名称
 */
export function getName(npmOptions: NpmInfo): string {
  return `${npmOptions.name}@${npmOptions.version || 'latest'}`
}

/**
 * 下载 npm 到指定的目录
 * @param npmOptions - npm 下载链接或选项
 * @param dest - 下载目录
 * @returns 下载并解压后的目录
 */
export async function download(npmOptions: NpmInfo, dest: string) {
  await fs.ensureDir(dest)
  await fs.emptyDir(dest)
  const npmScope = npmOptions.name?.startsWith?.('@')
    ? npmOptions.name.split('/')[0]
    : undefined
  const registry = npmOptions.registry ?? getRegistryUrl(npmScope)
  const version = await getNpmVersion(
    npmOptions.name,
    registry,
    npmOptions.version
  )
  const url = getNpmTarballUrl(npmOptions.name, version, { registry })

  logger.debug(`NPM 下载链接: ${url}`)

  await tar.download(tar.parseOptions({ url: url, strip: 1 }), dest)
}
