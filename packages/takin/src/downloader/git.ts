import execa from 'execa'
import fs from 'fs-extra'
import _ from 'lodash'
import path from 'path'
import { DownloaderError } from '../errors'
import { logger } from '../logger'
import * as tar from './tar'

const GIT_PROTOCOL_PREFIX = /^git:/

/**
 * 支持的链接类型:
 * - http://github.com/user/repo.git#v1.0.27
 * - https://github.com/user/repo.git#v1.0.27
 * - git@github.com:user/repo.git
 * - user/repo.git#v1.0.27
 * - github:user/repo.git#v1.0.27
 */
const GIT_URL_REGEXP =
  /^(?:(?:https?:\/\/)?([^:/]+\.[^:/]+)\/|git@([^:/]+)[:/]|([^/]+):)?([^/.~@/\s]+)\/([^/\s#]+)(?:((?:\/[^/\s#]+)+))?(?:\/)?(?:#(.+))?/

const DEFAULT_SITE = 'github.com'

export interface GitRepoInfo {
  site: string
  user: string
  name: string
  ref: string
  // 额外保存 ref 对应的 hash 信息, 实际逻辑中使用的依然是 ref
  hash?: string
  url: string
  ssh: string
  subdir?: string
  mode: GitDownloadModes
}

interface GitRefInfo {
  type: string
  name?: string
  hash: string
}

/**
 * Git 站点配置
 */
export interface GitSiteConfig {
  /**
   * 站点类型
   */
  type: GitSiteType
  /**
   * 生成 tar url 链接
   */
  generateGitTarUrl?: GenerateGitTarUrl
}

type GenerateGitTarUrl = (repo: GitRepoInfo) => Promise<{
  url: string
  strip: number
  [k: string]: any
}>

/**
 * 支持的站点
 */
const SUPPORTED_SITES = new Map<string, GitSiteConfig>([
  [
    'github.com',
    {
      type: 'github',
      generateGitTarUrl: getTarUrlByRepo
    }
  ],
  [
    'gitlab.com',
    {
      type: 'gitlab',
      generateGitTarUrl: getTarUrlByRepo
    }
  ],
  [
    'bitbucket.org',
    {
      type: 'bitbucket',
      generateGitTarUrl: getTarUrlByRepo
    }
  ]
])

export type GitDownloadModes = 'tar' | 'git'

export type GitSiteType = 'github' | 'gitlab' | 'bitbucket'

/**
 * 添加支持的 git 站点
 * @param siteUrl - 站点地址, 如 github.com
 * @param siteType - 站点类型, 如 git / gitlab / bitbucket
 */
export function addSupportGitSite(
  siteUrl: string,
  siteConfig: GitSiteConfig
): void {
  if (SUPPORTED_SITES.has(siteUrl)) {
    return logger.warn(
      `跳过添加 ${siteConfig.type} 类型的 Git 站点: ${siteUrl}, 原因: 已存在.`
    )
  }

  SUPPORTED_SITES.set(siteUrl, {
    type: siteConfig.type,
    generateGitTarUrl: siteConfig.generateGitTarUrl || getTarUrlByRepo
  })
}

function parseGitUrl(src: string): GitRepoInfo {
  const match = GIT_URL_REGEXP.exec(src)
  if (!match) {
    throw new DownloaderError(`无法解析链接: ${src}`)
  }

  const site = match[1] || match[2] || match[3] || DEFAULT_SITE

  const user = match[4]
  const name = match[5].replace(/\.git$/, '')
  const subdir = match[6]
  const ref = match[7] || 'HEAD'

  const url = `https://${site}/${user}/${name}`
  const ssh = `git@${site}:${user}/${name}`

  const mode = SUPPORTED_SITES.has(site) ? 'tar' : 'git'

  return {
    site,
    user,
    name,
    ref,
    url,
    ssh,
    subdir,
    mode
  }
}

/**
 *
 * @param repo - 仓库信息
 * @returns 生成的 tar 地址
 */
async function getTarUrlByRepo(
  repo: GitRepoInfo
): ReturnType<GenerateGitTarUrl> {
  const siteType = SUPPORTED_SITES.get(repo.site)?.type
  const hash = await getGitHash(repo)

  if (!hash) throw new DownloaderError(`${repo.url} 未解析出有效的 hash 信息`)

  // 这里保存下 hash 信息
  repo.hash = hash

  const url =
    siteType === 'gitlab'
      ? `${repo.url}/-/archive/${hash}/${repo.name}-${hash}.tar.gz`
      : siteType === 'bitbucket'
      ? `${repo.url}/get/${hash}.tar.gz`
      : `${repo.url}/archive/${hash}.tar.gz`

  const repoDir = `${repo.name}-${hash}`

  const strip = (
    repo.subdir ? path.posix.join(repoDir, repo.subdir) : repoDir
  ).split('/').length

  return {
    ..._.omit(repo, [
      'site',
      'user',
      'name',
      'ref',
      'hash',
      'ssh',
      'subdir',
      'mode'
    ]),
    url,
    strip
  }
}

/**
 * 获取仓库 ref 信息
 * @param repo - 仓库信息
 * @param type - 获取 ref 信息的方式, 支持 url 或 ssh 两种
 * @returns ref 信息数组
 */
async function fetchGitRefs(
  repo: GitRepoInfo,
  type: 'url' | 'ssh'
): Promise<GitRefInfo[]> {
  try {
    const { stdout } = await execa.command(`git ls-remote ${repo[type]}`)

    return stdout
      .split('\n')
      .filter(Boolean)
      .map((row: string): GitRefInfo => {
        const [hash, ref] = row.split('\t')

        if (ref === 'HEAD') {
          return { type: 'HEAD', hash }
        }

        const match = /refs\/([\w-]+)\/(.+)/.exec(ref)
        if (!match) {
          throw new DownloaderError(`无法解析 ${ref}`)
        }

        return {
          type:
            match[1] === 'heads'
              ? 'branch'
              : match[1] === 'refs'
              ? 'ref'
              : match[1],
          name: match[2],
          hash
        }
      })
  } catch (error) {
    throw new DownloaderError(
      `拉取 Git 信息失败 ${repo.url}, 原因: ${(error as Error).message}`
    )
  }
}

export async function getGitHash(repo: GitRepoInfo): Promise<string | void> {
  let refs: GitRefInfo[]
  try {
    // 优先从 url 拉取, 但可能没权限
    refs = await fetchGitRefs(repo, 'url')
  } catch (error) {
    logger.debug((error as Error)?.message)
    logger.debug('将使用 ssh 模式重新拉取 Git 信息')
    refs = await fetchGitRefs(repo, 'ssh')
  }

  refs = refs || []

  if (repo.ref === 'HEAD') {
    return refs.find((ref) => ref.type === 'HEAD')?.hash
  }

  for (const ref of refs) {
    if (ref.name === repo.ref) {
      logger.debug('成功匹配到 Git Hash:', repo.ref, '=>', ref.hash)
      return ref.hash
    }
  }

  if (repo.ref.length < 8) return

  for (const ref of refs) {
    if (ref.hash.startsWith(repo.ref)) return ref.hash
  }
}

async function downloadByGit(repo: GitRepoInfo, dest: string) {
  const gitDir = path.resolve(dest, '.git')
  await execa.command(`git clone ${repo.ssh} ${dest}`)

  // 强制指定 --git-dir 避免仓库套仓库时 git 识别错误
  const gitOptions = [`-C ${dest}`, `--git-dir ${gitDir}`].join(' ')
  await execa.command(`git ${gitOptions} checkout ${repo.ref} --force`)
  logger.debug(`切换仓库 ref 为: ${repo.ref}`)

  // 尝试获取 ref 对应的 hash 值并保存
  try {
    const { stdout } = await execa.command(
      `git ${gitOptions} rev-list -n 1 ${repo.ref}`
    )
    const hash = stdout.split('\n').filter(Boolean)[0]
    if (hash) repo.hash = hash
    logger.debug(`获取到当前 ref 对应的 hash 值: ${hash}`)
  } catch (error) {
    logger.debug('获取 hash 值失败', error)
  }

  // 清理 .git 文件夹
  await fs.emptyDir(gitDir)
}

async function downloadByTar(repo: GitRepoInfo, dest: string) {
  const generateGitTarUrl = SUPPORTED_SITES.get(repo.site)?.generateGitTarUrl
  if (!generateGitTarUrl) {
    throw new DownloaderError(
      `Git 站点: ${repo.site} 缺少 generateGitTarUrl 方法支持`
    )
  }
  const tarOptions = tar.parseOptions(await generateGitTarUrl(repo))
  await tar.download(tarOptions, dest)
}

/**
 * 解析 git 选项或链接
 * @param urlOrOptions - git 下载链接或选项
 * @returns git 仓库信息
 */
export function parseOptions(
  urlOrOptions:
    | string
    | (GitRepoInfo & { branch?: string; commit?: string; tag?: string })
): GitRepoInfo {
  let options: GitRepoInfo

  if (typeof urlOrOptions === 'string') {
    options = parseGitUrl(urlOrOptions)
  } else {
    const ref =
      urlOrOptions.ref ||
      urlOrOptions.commit ||
      urlOrOptions.tag ||
      urlOrOptions.branch ||
      ''
    const opts = { ..._.omit(urlOrOptions, ['commit', 'tag', 'branch']), ref }
    const url = opts.url
    delete (opts as Partial<GitRepoInfo>).url
    options = {
      ...parseGitUrl(url),
      ...opts
    }
  }

  return options
}

/**
 * 判断是否支持处理当前链接
 * @param url - 链接
 * @returns 是否支持该链接
 */
export function supportProtocol(url: string): boolean {
  if (!url) return false
  // 去除 git: 的协议头
  url = url.replace(GIT_PROTOCOL_PREFIX, '')
  const match = GIT_URL_REGEXP.exec(url)
  if (!match) return false
  const siteTypeOrHost = match[1] || match[2] || match[3]
  if (siteTypeOrHost) {
    // 检查是否为支持的站点或站点类型
    for (const [host, site] of SUPPORTED_SITES) {
      if (siteTypeOrHost === host || siteTypeOrHost === site.type) return true
      continue
    }
    return false
  }
  return true
}

/**
 * 从 git 仓库选项中获取名称
 * @param options - git 仓库选项
 * @returns 名称
 */
export function getName(options: GitRepoInfo) {
  return `${options.user}/${options.name}`
}

/**
 * 下载 git repo 到指定的目录
 * @param options - git 选项
 * @param dest - 下载目录
 * @returns 下载并解压后的目录
 */
export async function download(options: GitRepoInfo, dest: string) {
  await fs.ensureDir(dest)
  await fs.emptyDir(dest)
  logger.debug('Git 仓库信息', options)
  if (options.mode === 'git') {
    await downloadByGit(options, dest)
  } else {
    try {
      await downloadByTar(options, dest)
    } catch (error) {
      logger.debug(
        '通过 tar 方式下载',
        `${options.user}/${options.name}`,
        '失败, 原因为:',
        (error as Error)?.message,
        '尝试使用 git clone 方式下载'
      )
      // fallback 后 改写 mode 为 git
      options.mode = 'git'
      await downloadByGit(options, dest)
    }
  }
}
