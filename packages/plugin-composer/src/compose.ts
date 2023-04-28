import {
  asArray,
  chalk,
  COLORS,
  ComposeModuleInfo,
  ComposeModuleScriptCommand,
  ComposeModuleStates,
  downloader,
  execCommands,
  fsExtra as fs,
  isUnicodeSupported,
  lodash,
  logger,
  micromatch,
  pRetry as retry,
  QUEUE,
  RETRY_TIMES,
  Runner
} from '@morjs/utils'
import crypto from 'crypto'
import path from 'path'
import {
  BaseModuleSchemaType,
  COMMAND_NAME,
  ComposeModes,
  ComposeModuleStatesDesc,
  ComposerUserConfig,
  COMPOSE_INFO_FILE,
  DOWNLOAD_TYPE_FOR_COMPILE,
  MODULE_CONFIG_NAMES,
  MODULE_MODE_NAMES,
  MODULE_TYPE_NAMES
} from './constants'

const {
  pick,
  cloneDeep,
  isEmpty,
  forEach,
  isPlainObject,
  capitalize,
  omit,
  merge
} = lodash

/**
 * 基于 key 值对 object 进行排序
 * 以确保 key 的先后顺序不会影响 hash 的生成
 */
function sortByKeys<T = Record<string, any>>(obj: T): T {
  const newObj = {} as T

  Object.keys(obj)
    .sort()
    .forEach(function (key) {
      const value = obj[key]
      newObj[key] = isPlainObject(value) ? sortByKeys(value) : value
    })

  return newObj
}

/**
 * 为 模块配置生成 hash 信息, 用于判断是否需要重新下载
 */
export function generateComposeModuleHash(
  options: BaseModuleSchemaType,
  name: string
) {
  // 将对象按照 key 值排序，避免顺序问题导致 hash 值不一致
  const obj = sortByKeys(pick(options, ['git', 'npm', 'tar', 'dist', 'mode']))
  const content = JSON.stringify(obj)
  const hash = crypto.createHash('md5').update(content).digest('hex')

  logger.debug(`模块 ${name} 生成 hash 内容: ${content}`)
  logger.debug(`模块 ${name} 生成 hash 结果: ${hash}`)

  return hash
}

function resolveWithinDir(root: string, dir: string) {
  if (path.isAbsolute(dir)) {
    return path.join(root, dir)
  } else {
    return path.resolve(root, dir)
  }
}

type ScriptsType = Exclude<keyof ComposeModuleInfo['scripts'], 'env'>

/**
 * 用于保存脚本信息, 便于检测脚本变更状态
 */
const PREVIOUS_SCRIPTS = new Map<
  string,
  {
    /**
     * 脚本信息
     */
    scripts: ComposeModuleScriptCommand[]
    /**
     * 脚本公共选项
     */
    options: Record<string, any>
    /**
     * 脚本公共环境变量
     */
    env: Record<string, any>
  }
>()

// 保存脚本信息
function savePreviousScripts(m: ComposeModuleInfo, type: ScriptsType) {
  const scripts = cloneDeep(
    m.scripts?.[type] || []
  ) as ComposeModuleScriptCommand[]
  const options = cloneDeep(m.scripts?.options || {})
  const env = cloneDeep(m.scripts?.env || {})
  PREVIOUS_SCRIPTS.set(`${m.name}-${m.hash}-${type}`, {
    scripts,
    options,
    env
  })
  logger.debug(`已保存模块 ${m.name} 的 ${type} 脚本`, scripts)
}

// 判断脚本是否发生变化
// 脚本顺序变化也代表需要重新执行
function isScriptsChanged(m: ComposeModuleInfo, type: ScriptsType): boolean {
  const previous = PREVIOUS_SCRIPTS.get(`${m.name}-${m.hash}-${type}`) || {
    scripts: [],
    options: {},
    env: {}
  }
  const current = {
    scripts: m.scripts?.[type] || [],
    options: m.scripts?.options || {},
    env: m.scripts?.env || {}
  }
  let result: boolean
  try {
    result = JSON.stringify(previous) !== JSON.stringify(current)
  } catch (error) {
    logger.debug('判断对象是否发生变化失败, 原因:', error)
    result = false
  }

  if (result) {
    logger.debug(`模块 ${m.name} ${type} 脚本发生变化:`, { previous, current })
  }

  return result
}

function normalizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').replace(/^_+/, '')
}

/**
 * 载入或生成模块信息, 模块中的路径信息均为相对于 cwd 的路径
 * @param options - 模块基础信息
 * @param cwd - 工作目录
 * @param tempDir - 临时文件夹
 * @param type - 模块类型
 * @param configName - 当前用户配置名称，用于生成模块 root 地址
 * @param fromState - 指定开始的最大 state 状态
 * @returns Compose 模块信息
 */
async function loadOrGenerateComposeInfo(
  options: BaseModuleSchemaType,
  cwd: string,
  tempDir: string,
  type: ComposeModuleInfo['type'],
  configName: string,
  fromState?: ComposeModuleStates
): Promise<ComposeModuleInfo> {
  const downloadType = downloader.chooseDownloadType(options)

  if (!downloadType) {
    throw new Error(
      `${type} 模块 ${JSON.stringify(
        options
      )} 缺少有效的下载配置, 当前支持 ${downloader
        .getAllDownloadTypes()
        .join(', ')}`
    )
  }

  const downloadOptions = downloader.parseOptions(
    downloadType,
    options[downloadType]
  )

  // 替换非 字母、数字、- 的字符为 _ 并去除开头的 _
  const name = normalizeName(
    options.name || downloader.getModuleName(downloadType, downloadOptions)
  )

  const root = path.relative(
    cwd,
    generateTempDir(tempDir, configName || '', type, name)
  )

  let info: ComposeModuleInfo
  const infoFilePath = path.resolve(cwd, root, COMPOSE_INFO_FILE)
  try {
    if (await fs.pathExists(infoFilePath)) {
      info = await fs.readJson(infoFilePath)
    } else {
      logger.debug(`未发现模块 compose 信息 ${infoFilePath}, 尝试初始化`)
    }
  } catch (error) {
    logger.debug(
      `载入模块 compose 信息 ${infoFilePath} 失败: ${error.message}, 尝试初始化`
    )
  }

  const hash = generateComposeModuleHash(options, name)
  const isHashMatched = info?.hash === hash
  const source = path.resolve(cwd, root, hash)

  // 如果 info 存在 且 源码文件夹存在 则直接返回
  if (isHashMatched && (await fs.pathExists(source))) {
    // 当指定 fromState 时, 大于该 state 的模块会被强制回退到 fromState
    // 这个方法有助于修复一些状态错误的模块
    if (fromState != null && info.state > fromState) {
      info.state = fromState
    }

    // 如果模块状态处于配置加载之前, 则移除 config
    // 以确保不使用保存的 compose 信息中的 config 配置
    // 而是从用户配置传入或从文件中读取
    if (info.state < ComposeModuleStates.configLoaded) {
      delete info.config
    }

    // 如果配置传入了非空的 config 则写入到 info 中
    if (!isEmpty(options.config)) {
      info.config = options.config
    }

    // 保存并覆盖脚本信息
    savePreviousScripts(info, 'before')
    savePreviousScripts(info, 'after')
    info.scripts = options.scripts || {}

    logger.debug(`模块 ${name} hash 比对成功, 将跳过下载`)

    return info
  }

  // 如果上次的 hash 和 本次不相等
  // 则清理上次的文件夹, 并重新下载
  if (info?.hash && !isHashMatched) {
    logger.debug(
      `模块 ${name} hash 比对失败, 原值: ${info.hash}, 现值: ${hash}`
    )

    const prevSource = path.join(cwd, root, info.hash)

    if (await fs.pathExists(prevSource)) {
      logger.info(`模块 ${name} 发生变更, 缓存清理中...`)

      const pathStat = await fs.lstat(prevSource)

      if (pathStat.isDirectory()) {
        await fs.emptyDir(prevSource)
        await fs.remove(prevSource)
      } else {
        await fs.unlink(prevSource)
      }
    }
  }

  // 默认 产物目录
  let outputFrom: string
  if (options.dist) {
    outputFrom = path.relative(cwd, resolveWithinDir(source, options.dist))
  }

  return {
    name,
    type,
    mode: options.mode || ComposeModes.compose,
    hash,
    root,
    source: path.relative(cwd, source),
    state: ComposeModuleStates.initial,
    output: { from: outputFrom },
    scripts: options.scripts,
    download: {
      type: downloadType,
      options: downloadOptions
    },
    config: isEmpty(options.config) ? undefined : options.config
  }
}

/**
 * 保存模块信息
 * @param moduleInfo - 模块信息
 * @param cwd - 工作目录
 */
async function saveModuleComposeInfo(
  moduleInfo: ComposeModuleInfo,
  cwd: string
) {
  // 如果 root 为空或 download type 为 DOWNLOAD_TYPE_FOR_COMPILE 则不保存模块信息
  if (
    !moduleInfo.root ||
    moduleInfo?.download?.type === DOWNLOAD_TYPE_FOR_COMPILE
  ) {
    logger.debug(
      `模块 ${moduleInfo.name} 缺少根目录或下载类型为 ${DOWNLOAD_TYPE_FOR_COMPILE}, 跳过 ${COMPOSE_INFO_FILE} 保存`
    )
    return
  }

  const infoFilePath = path.resolve(cwd, moduleInfo.root, COMPOSE_INFO_FILE)
  await fs.writeJson(infoFilePath, moduleInfo, { spaces: 2 })
}

/**
 * 生成模块临时文件夹
 */
export function generateTempDir(
  baseDir: string,
  configName: string,
  type: ComposeModuleInfo['type'],
  name: string
): string {
  return path.join(
    getComposerTempRoot(baseDir),
    normalizeName(configName),
    type === 'host' ? 'hosts' : 'modules',
    name
  )
}

function getComposerTempRoot(baseDir: string): string {
  return path.join(baseDir, 'composer')
}

/**
 * 下载宿主和模块到指定目录并返回模块信息
 */
async function downloadModule(moduleInfo: ComposeModuleInfo, cwd: string) {
  logger.info(`模块 ${moduleInfo.name} 开始下载...`)

  // download 乐行
  if (moduleInfo.download?.type === DOWNLOAD_TYPE_FOR_COMPILE) {
    logger.debug(
      `模块 ${moduleInfo.name} 下载类型为 DOWNLOAD_TYPE_FOR_COMPILE(${DOWNLOAD_TYPE_FOR_COMPILE}), 跳过下载`
    )
    return
  }

  try {
    await downloader.download(
      moduleInfo.download.type,
      moduleInfo.download.options,
      path.resolve(cwd, moduleInfo.source)
    )

    moduleInfo.state = ComposeModuleStates.downloaded

    logger.success(`模块 ${moduleInfo.name} 下载成功`)
  } catch (error) {
    logger.error(`模块 ${moduleInfo.name} 下载失败, 原因: ${error.message}`, {
      error
    })
  }
}

/**
 * 运行模块脚本并标记脚本运行状态
 */
async function runScripts(
  moduleInfo: ComposeModuleInfo,
  type: 'before' | 'after' | 'composed',
  cwd: string,
  throwOnError = false,
  verbose = false
) {
  const message = `模块 ${moduleInfo.name} ${
    type === 'before' ? '前置' : type === 'after' ? '后置' : '集成完成后'
  }脚本`

  const scripts = moduleInfo?.scripts?.[type] || []
  const commonCommandEnv = moduleInfo?.scripts?.env || {}
  const commonCommandOptions = moduleInfo?.scripts?.options || {}
  const startTime = Date.now()

  // 脚本注入模块地址信息, 便于脚本通过环境变量获取模块信息
  const moduleInfoEnvs = {
    // 当前项目工作区, 绝对路径
    MOR_COMPOSER_MODULE_CWD: cwd,
    // 模块类型
    MOR_COMPOSER_MODULE_TYPE: moduleInfo.type,
    // 模块 hash 值
    MOR_COMPOSER_MODULE_HASH: moduleInfo.hash,
    // 模块根目录 (相对于 cwd 的路径)
    MOR_COMPOSER_MODULE_ROOT: moduleInfo.root,
    // 模块源码目录 (相对于 cwd 的路径)
    MOR_COMPOSER_MODULE_SOURCE: moduleInfo.source,
    // 模块实际产物路径 (相对于 cwd 的路径)
    MOR_COMPOSER_MODULE_OUTPUT_FROM: moduleInfo?.output?.from || '',
    // 模块产物输出路径 (相对于 cwd 的路径)
    MOR_COMPOSER_MODULE_OUTPUT_TO: moduleInfo?.output?.to || ''
  }

  const sourcePath = path.resolve(cwd, moduleInfo.source)

  await execCommands({
    tips: message,
    commands: scripts,
    env: {
      ...moduleInfoEnvs,
      ...commonCommandEnv
    },
    options: commonCommandOptions,
    cwd: sourcePath,
    throwOnError,
    verbose,
    callbacks: {
      beforeAll: () => {
        if (scripts.length) {
          logger.info(`${message}开始执行...`)
        }
      },
      afterAll: () => {
        // 集成完成后执行的脚本不保存状态
        if (type !== 'composed') {
          // 执行成功之后标记 state
          moduleInfo.state = ComposeModuleStates[`${type}ScriptsExecuted`]
        }

        if (scripts.length) {
          logger.success(
            `${message}执行成功, 耗时: ${(
              (Date.now() - startTime) /
              1000
            ).toFixed(3)}s`
          )
        }
      },
      beforeEach: (commandStr) => {
        // 执行路径替换
        // 如 node MOR_COMPOSER_MODULE_CWD/abc 转换为
        //    node /project-root-dir/abc
        let cmd = commandStr
        for (const moduleEnv in moduleInfoEnvs) {
          cmd = cmd.replace(
            new RegExp(moduleEnv, 'g'),
            moduleInfoEnvs[moduleEnv]
          )
        }
        return {
          command: cmd,
          info: `模块 ${moduleInfo.name} 执行命令: ${cmd}`
        }
      },
      onError: (error) => {
        const dirsShouldBeDeleted = [moduleInfo.source]
        if (moduleInfo?.output?.to) {
          dirsShouldBeDeleted.push(moduleInfo.output.to)
        }
        const tips = `可尝试删除 ${dirsShouldBeDeleted.join(
          ' 及 '
        )} 文件夹后重新运行命令`
        if (throwOnError && error) {
          error.message = `${error.message}\n${tips}`
        }
        return tips
      }
    }
  })
}

/**
 * 载入模块配置文件
 * 如果 配置已存在 则跳过载入
 * @param moduleInfo - 模块信息
 * @param outputPath - 产物输出目录
 * @param cwd - 当前工作区
 */
async function loadModuleConfig(
  moduleInfo: ComposeModuleInfo,
  outputPath: string,
  cwd: string
) {
  const configFileName = MODULE_CONFIG_NAMES[moduleInfo.type]

  let config: Record<string, any> = moduleInfo.config

  // 如果模块配置不存在, 且 模块配置文件不存在, 则报错
  if (isEmpty(moduleInfo.config)) {
    if (moduleInfo?.output?.from == null) {
      throw new Error(
        `模块 ${moduleInfo.name} 配置文件 ${configFileName} 加载失败,` +
          ` 原因: 缺少产物原始目录信息 (dist 为空)`
      )
    }

    const configFilePath = path.resolve(
      cwd,
      moduleInfo.output.from,
      configFileName
    )

    if (!(await fs.pathExists(configFilePath))) {
      throw new Error(
        `模块 ${moduleInfo.name} 配置文件 ${configFileName} 未找到, 请检查分包产物目录和 dist 配置是否一致`
      )
    }

    try {
      config = await fs.readJson(configFilePath)
    } catch (error) {
      const err = new Error(
        `模块 ${moduleInfo.name} 配置文件 ${configFileName} 加载失败,` +
          ` 原因: ${error?.message}`
      )
      err.stack = error.stack
      throw err
    }
  }

  // 检查配置
  if (config) {
    moduleInfo.config = config

    // 分包输出目录
    if (moduleInfo.type === 'subpackage') {
      if (config.root == null) {
        throw new Error(
          `模块 ${moduleInfo.name} 配置文件 ${configFileName} 缺少 \`root\` 配置`
        )
      }
      moduleInfo.output.to =
        moduleInfo.output.to ?? path.join(outputPath, config.root as string)
    }
    // 主包输出配置
    else if (moduleInfo.type === 'main') {
      moduleInfo.output.to =
        moduleInfo.output.to ??
        path.join(outputPath, (config.root || '') as string)
    }
    // 宿主输出路径
    else if (moduleInfo.type === 'host') {
      moduleInfo.output.to = moduleInfo.output.to ?? outputPath
    }
  }

  // 转换为相对目录
  if (moduleInfo.output.to) {
    moduleInfo.output.to = path.relative(
      cwd,
      path.resolve(cwd, moduleInfo.output.to)
    )
  }

  if (moduleInfo.state === ComposeModuleStates.beforeScriptsExecuted) {
    moduleInfo.state = ComposeModuleStates.configLoaded
  }
}

/**
 * 拷贝文件到指定文件夹, 并标记为已集成
 */
async function copyModuleFiles(moduleInfo: ComposeModuleInfo, cwd: string) {
  if (moduleInfo.type === 'plugin') {
    moduleInfo.state === ComposeModuleStates.copiedOrCompiled
    return
  }

  const include = moduleInfo.output.include || '**/*'
  const exclude = moduleInfo.output.exclude || []
  let copyFrom = path.resolve(cwd, moduleInfo.output.from)
  const copyTo = path.resolve(cwd, moduleInfo.output.to)

  if (!copyTo) throw new Error(`模块 ${moduleInfo.name} 缺少目标输出路径`)

  // 如果复制的源文件夹为软链, 则 fsExtra.copy 方法会抛错
  // 这里提前检查并获取软链的实际地址
  try {
    if ((await fs.lstat(copyFrom)).isSymbolicLink()) {
      const originalCopyFrom = copyFrom
      copyFrom = await fs.realpath(copyFrom)
      logger.debug(
        `获取模块 ${moduleInfo.name} 产物实际地址: ${originalCopyFrom} => ${copyFrom}`
      )
    }
  } catch (error) {
    logger.debug(`获取模块 ${moduleInfo.name} 产物实际地址失败, 原因:`, error)
  }

  await fs.copy(copyFrom, copyTo, {
    async filter(src, dest) {
      const shouldCopy = micromatch.isMatch(src, include, {
        ignore: exclude,
        dot: true
      })

      if (shouldCopy) {
        // 这里额外检查一次 src 和 dest
        // 如果目标目录是软链, 则检查目标软链和原始软链是否值相同
        // 如果相同 则跳过拷贝
        // 原因: fs-extra 未处理该问题, 参见
        //    https://github.com/jprichardson/node-fs-extra/issues/708
        //    https://github.com/jprichardson/node-fs-extra/issues/639
        // TODO: node v16.7.0 版本开始提供了原生的 cp 方法 其中 verbatimSymlinks 选项
        //       解决了 复制后的软链指向复制前文件 的问题, 参见:
        //         https://github.com/nodejs/node/issues/41693
        //         https://github.com/nodejs/node/pull/41819
        //       从而也规避了原软链和目标软链指向同一个文件从而报错的问题
        //       后面可考虑通过检查 fs.cp 方法是否存在并优先使用该方法以获得更好的复制性能

        const destStat = await fs.lstat(dest).catch((err) => {
          if (err.code === 'ENOENT') return null
          throw err
        })

        if (!destStat) return shouldCopy

        // 仅当目标文件也是软链时执行后续逻辑
        if (destStat?.isSymbolicLink?.()) {
          const resolvedSrc = await fs.readlink(src)
          let resolvedDest: string = null
          try {
            resolvedDest = await fs.readlink(dest)
          } catch (err) {
            // dest exists and is a regular file or directory,
            // Windows may throw UNKNOWN error. If dest already exists,
            // fs throws error anyway, so no need to guard against it here.
            if (err.code === 'EINVAL' || err.code === 'UNKNOWN') {
              resolvedDest = null
            } else {
              throw err
            }
          }
          // 软链指向同一个文件时, 不复制, 避免报错
          if (resolvedSrc === resolvedDest) return false
        }

        return shouldCopy
      }

      return shouldCopy
    }
  })

  moduleInfo.state = ComposeModuleStates.copiedOrCompiled
}

/**
 * 合并所有 module 配置到 host 配置中
 * - 仅处理 mode 为 compose 的模块
 * - 类型为 compile 的模块会通过编译逻辑直接处理
 */
async function composeAllModulesIntoHost(
  runner: Runner,
  host: ComposeModuleInfo,
  modules: ComposeModuleInfo[],
  combineModules = false
) {
  // 检查模块是否可以集成
  function isModuleReadyForComposing(
    mod: ComposeModuleInfo,
    logError = false
  ): boolean {
    if (mod?.state < ComposeModuleStates.afterScriptsExecuted) {
      if (logError)
        logger.error(`模块 ${mod.name} 未完成前置逻辑, 无法集成, 请检查`)
      return false
    } else {
      return true
    }
  }

  // 检查宿主状态
  if (!isModuleReadyForComposing(host)) return

  const cwd = runner.config.cwd

  const appJson = host.config || {}
  appJson.pages = appJson.pages || []
  appJson.subPackages = appJson.subPackages || appJson.subpackages || []
  delete appJson.subpackages

  const subPackages = new Map<
    // root 字段
    string,
    {
      // 页面列表
      pages: Set<string>

      // 其他字段
      [k: string]: any
    }
  >()

  appJson.subPackages.map(
    (sub: { root: string; pages: string[]; [k: string]: any }) => {
      subPackages.set(sub.root, {
        pages: new Set(sub.pages || []),
        ...omit(sub || {}, ['root', 'pages'])
      })
    }
  )

  for await (const module of modules) {
    if (!isModuleReadyForComposing(module)) continue

    const config = module.config || {}

    // 优先取用 config 中配置的 type
    const moduleType = (config.type || module.type) as ComposeModuleInfo['type']

    // 是否包含自定义 entryName
    // 适用于通过 pages: { 'abc/index': 'somewhere/index' } 指定页面名称
    const hasCustomEntryName = !Array.isArray(config.pages)

    // 处理主包
    // 主包的页面直接合并入 app.json 的 pages 字段中
    if (moduleType === 'main') {
      forEach(config?.pages || [], function (page: string, entryName: string) {
        const pagePath = path.posix.join(
          config.root || '',
          hasCustomEntryName ? entryName : page
        )

        if (!appJson.pages.includes(pagePath)) {
          appJson.pages.push(pagePath)
        }
      })
    }
    // 分包的配置合并入 app.json 的 subpackages 中
    else if (module.type === 'subpackage') {
      // 不处理 root 为空或 pages 为空的分包
      if (!config.root || isEmpty(config.pages)) {
        logger.warnOnce(
          `模块 ${module.name} 的分包配置文件中 root 或 pages 为空`
        )
      } else {
        const subPackage: {
          pages: Set<string>
          [k: string]: any
        } = subPackages.get(config.root) || { pages: new Set<string>() }
        const pages = subPackage?.pages || new Set<string>()

        forEach(config.pages || [], function (page: string, entryName: string) {
          pages.add(hasCustomEntryName ? entryName : page)
        })

        subPackages.set(config.root, {
          // 合并分包的其他配置
          ...merge(
            omit(config, ['type', 'root', 'pages']),
            omit(subPackage, ['pages'])
          ),
          pages
        })
      }
    }

    // 标记为 compose 完成
    module.state = ComposeModuleStates.composed

    await runner.hooks.moduleComposed.promise(module)

    // 保存 module 信息
    await saveModuleComposeInfo(module, cwd)
  }

  // 合并所有分包页面到主包中
  if (combineModules) {
    delete appJson.subPackages
    appJson.pages = appJson.pages || []
    subPackages.forEach((subPackage, root) => {
      subPackage.pages.forEach((page) => {
        const pagePath = path.posix.join(root, page)
        if (!appJson.pages.includes(pagePath)) {
          appJson.pages.push(pagePath)
        }
      })
    })
  }
  // 合并分包配置
  else {
    appJson.subPackages = []
    subPackages.forEach((subPackage, root) => {
      appJson.subPackages.push({
        root,
        pages: Array.from(subPackage.pages),
        ...omit(subPackage, ['pages'])
      })
    })
  }

  // 保存 appJson 到 host.config
  host.config = appJson

  // 标记为 compose 完成
  host.state = ComposeModuleStates.composed

  // 执行 composed hook
  await runner.hooks.moduleComposed.promise(host)

  // 保存 host 信息
  await saveModuleComposeInfo(host, cwd)

  // 写入到 app.json
  const appJsonPath = path.resolve(cwd, host.output.to, 'app.json')
  await fs.writeJSON(appJsonPath, host.config, { spaces: 2 })

  // 执行所有模块完成集成脚本, 仅完成集成的模块会执行且该脚本执行状态不会被保存
  for await (const module of [...modules, host]) {
    if (!isModuleReadyForComposing(module, true)) continue
    await runScripts(
      module,
      'composed',
      cwd,
      true,
      runner?.commandOptions?.verbose
    )
  }
}

/**
 * 处理模块, 拆分为 5 个阶段
 * 1. 下载模块阶段, 完成后触发 moduleDownloaded hook
 * 2. 前置脚本阶段, 完成后触发 moduleBeforeScriptsExecuted hook
 * 3. 配置载入阶段, 完成后触发 moduleConfigLoaded hook
 * 4. 复制编译阶段, 完成后触发 moduleCopiedOrCompiled hook
 * 5. 后置脚本阶段, 完成后触发 moduleAfterScriptsExecuted hook
 */
async function processModule(
  runner: Runner,
  moduleInfo: ComposeModuleInfo,
  outputPath: string,
  states: ComposeModuleStates[],
  // 用于约束模块集成编译的终态, 主要用于生产特定阶段的集成产物
  // 对于增加 state 的操作需要判断 moduleInfo.state < toState
  // 对于不改变或回退 state 的操作需要判断 moduleInfo.state <= toState
  toState: ComposeModuleStates
) {
  const cwd = runner.config.cwd
  const verbose = runner?.commandOptions?.verbose || false

  // 判断是否能触发 hook
  // 条件为:
  //   当前状态 <= 模块终态
  //   当前状态 >= 目标状态
  //   可执行状态中包含 目标状态
  function canInvokeHook(targetState: ComposeModuleStates) {
    if (
      moduleInfo.state <= toState &&
      moduleInfo.state >= targetState &&
      states.includes(targetState)
    ) {
      logger.debug(
        `模块 ${moduleInfo.name} 触发 module${capitalize(
          ComposeModuleStates[targetState]
        )} hook`
      )
      return true
    }

    return false
  }

  // 判断是否能够继续处理模块至下个状态
  // 目前仅 configLoaded 状态开启了 不严格 状态, 以确保配置始终可以被载入
  function canProcessToNextState(
    nextState: ComposeModuleStates,
    strict = true
  ) {
    if (
      moduleInfo.state < toState &&
      // 是否严格判定状态
      // 严格为 ===
      // 不严格为 >=
      (strict
        ? moduleInfo.state === nextState - 1
        : moduleInfo.state >= nextState - 1) &&
      states.includes(nextState)
    ) {
      return true
    } else {
      logger.debug(
        `模块 ${moduleInfo.name} 当前状态为: ${
          ComposeModuleStatesDesc[moduleInfo.state]
        }(状态码 ${moduleInfo.state}), 跳过状态: ${
          ComposeModuleStatesDesc[nextState]
        }(状态码${nextState})`
      )
      return false
    }
  }

  // 判断脚本是否发生变化, 如果发生变化, 则回退状态至上一个
  function rollbackToPreviousStateIfScriptsChanged(
    checkState: ComposeModuleStates,
    type: Exclude<keyof ComposeModuleInfo['scripts'], 'env'>
  ) {
    // 执行脚本之前先, 判断脚本是否发生变化
    if (
      moduleInfo.state <= toState &&
      moduleInfo.state >= checkState &&
      isScriptsChanged(moduleInfo, type)
    ) {
      const typeName =
        type === 'before' ? '前置' : type === 'after' ? '后置' : '集成'

      // 回退状态
      moduleInfo.state = checkState - 1

      logger.info(`模块 ${moduleInfo.name} ${typeName}脚本发生变化, 将重新执行`)
    }
  }

  // 下载模块
  if (canProcessToNextState(ComposeModuleStates.downloaded)) {
    await downloadModule(moduleInfo, cwd)
    await saveModuleComposeInfo(moduleInfo, cwd)
  }

  // 执行模块下载完成 hook
  if (canInvokeHook(ComposeModuleStates.downloaded)) {
    await runner.hooks.moduleDownloaded.promise(moduleInfo)
  }

  // 检查 before 脚本是否发生变化
  rollbackToPreviousStateIfScriptsChanged(
    ComposeModuleStates.beforeScriptsExecuted,
    'before'
  )

  // 执行前置脚本
  if (canProcessToNextState(ComposeModuleStates.beforeScriptsExecuted)) {
    await runScripts(moduleInfo, 'before', cwd, true, verbose)
    savePreviousScripts(moduleInfo, 'before')
    await saveModuleComposeInfo(moduleInfo, cwd)
  }

  // 执行 moduleBeforeScriptsExecuted hook
  if (canInvokeHook(ComposeModuleStates.beforeScriptsExecuted)) {
    await runner.hooks.moduleBeforeScriptsExecuted.promise(moduleInfo)
  }

  // 载入配置
  if (canProcessToNextState(ComposeModuleStates.configLoaded, false)) {
    await loadModuleConfig(moduleInfo, outputPath, cwd)
    await saveModuleComposeInfo(moduleInfo, cwd)
  }

  // 执行模块配置加载完成 hook
  if (canInvokeHook(ComposeModuleStates.configLoaded)) {
    await runner.hooks.moduleConfigLoaded.promise(moduleInfo)
  }

  // 拷贝模块产物到指定的路径, 并标记为 copiedOrCompiled
  if (canProcessToNextState(ComposeModuleStates.copiedOrCompiled)) {
    await copyModuleFiles(moduleInfo, cwd)
    await saveModuleComposeInfo(moduleInfo, cwd)
  }

  // 执行 moduleCopiedOrCompiled hook
  if (canInvokeHook(ComposeModuleStates.copiedOrCompiled)) {
    await runner.hooks.moduleCopiedOrCompiled.promise(moduleInfo)
  }

  // 检查 after 脚本是否发生变化
  rollbackToPreviousStateIfScriptsChanged(
    ComposeModuleStates.afterScriptsExecuted,
    'after'
  )

  // 执行后置脚本
  if (canProcessToNextState(ComposeModuleStates.afterScriptsExecuted)) {
    await runScripts(moduleInfo, 'after', cwd, true, verbose)
    savePreviousScripts(moduleInfo, 'after')
    await saveModuleComposeInfo(moduleInfo, cwd)
  }

  // 执行 moduleAfterScriptsExecuted hook
  if (canInvokeHook(ComposeModuleStates.afterScriptsExecuted)) {
    await runner.hooks.moduleAfterScriptsExecuted.promise(moduleInfo)
    await saveModuleComposeInfo(moduleInfo, cwd)
  }
}

/**
 * 尝试构造和载入已存在的 host
 */
function tryLoadPreCompiledHost(
  outputPath: string,
  cwd: string
): ComposeModuleInfo {
  const hostName = 'miniprogram_host'

  // 这里 hash 为固定的值, 无实际用处
  const hash = generateComposeModuleHash({ mode: 'compile' }, hostName)

  const host: ComposeModuleInfo = {
    type: 'host',
    name: 'miniprogram_host',
    mode: 'compile',
    root: cwd,
    source: cwd,
    hash,
    output: {
      from: path.relative(cwd, outputPath)
    },
    // 宿主编译模式下跳过后置脚本(含)之前的状态
    state: ComposeModuleStates.afterScriptsExecuted,
    download: {
      type: DOWNLOAD_TYPE_FOR_COMPILE,
      options: {}
    }
  }

  return host
}

/**
 * 准备 host 和 模块 信息
 * @param runner - Runner 实例
 * @param options - compose 选项
 * @param compileType - 编译类型
 * @param tempDir - 临时文件夹
 * @param outputPath - 输出文件夹
 * @param withModules - 需要指定的模块, 支持 glob 模式, 可选项
 * @param withoutModules - 需要排除的模块, 支持 glob 模式, 可选项
 * @param fromState - 指定开始的最大 state 状态
 * @param toState - 指定模块集成的最终 state 状态
 * @returns host 和 模块 信息
 */
export async function prepareHostAndModules(
  runner: Runner,
  options: ComposerUserConfig,
  compileType: string,
  tempDir: string,
  outputPath: string,
  withModules?: string[],
  withoutModules?: string[],
  fromState?: ComposeModuleStates,
  toState: ComposeModuleStates = ComposeModuleStates.composed
): Promise<{
  host?: ComposeModuleInfo
  modules: ComposeModuleInfo[]
}> {
  let host: ComposeModuleInfo
  let modules: ComposeModuleInfo[] = []

  const cwd = runner.config.cwd
  const configName = runner.userConfig?.name || ''

  // 如果是通过 compile 命令启动的 compose
  // 编译类型为 miniprogram 则忽略 host 配置
  if (runner.commandName !== COMMAND_NAME && compileType === 'miniprogram') {
    if (options.host) logger.warnOnce('当前编译类型为小程序, 将忽略 host 配置')
    host = tryLoadPreCompiledHost(outputPath, cwd)
  } else {
    if (options.host) {
      host = await loadOrGenerateComposeInfo(
        options.host,
        cwd,
        tempDir,
        'host',
        configName,
        fromState
      )
    } else {
      if (compileType === 'miniprogram') {
        host = tryLoadPreCompiledHost(outputPath, cwd)
      } else {
        // 如果不进行最终的集成, 则 host 为非必须
        if (toState === ComposeModuleStates.composed) {
          throw new Error('缺少 host 配置')
        } else {
          logger.debug(
            `toState !== ${ComposeModuleStates.composed}, 允许缺少 host 配置`
          )
        }
      }
    }
  }

  // 初始化模块信息
  if (options?.modules?.length) {
    modules = await Promise.all(
      options.modules.map(function (m) {
        return loadOrGenerateComposeInfo(
          m,
          cwd,
          tempDir,
          m.type,
          configName,
          fromState
        )
      })
    )
  }

  withModules = asArray(withModules)
  withoutModules = asArray(withoutModules)

  // 过滤模块
  modules = modules.filter((module, i) => {
    const name = module?.name || String(i)

    let shouldIncluded = withModules?.length
      ? micromatch.isMatch(name, withModules)
      : true

    const shouldNotIncluded = withoutModules?.length
      ? micromatch.isMatch(name, withoutModules)
      : false

    if (shouldNotIncluded) {
      shouldIncluded = false
    }

    return shouldIncluded
  })

  logHostAndModulesInfos(host, modules, false, toState)

  return {
    host,
    modules
  }
}

/**
 * 打印集成相关日志, 包含集成模块列表、终态信息及成功与否等
 */
function logHostAndModulesInfos(
  host: ComposeModuleInfo,
  modules: ComposeModuleInfo[],
  complete: boolean = false,
  toState: ComposeModuleStates
): void {
  let head: string[]
  let colWidths: number[]
  const count = modules?.length + (host ? 1 : 0)
  if (!complete) {
    logger.info(`即将开始集成以下模块(最大并发数: ${QUEUE.concurrency}):`)
    head = [
      `模块 (共 ${count} 个, 集成终态: ${ComposeModuleStatesDesc[toState]})`,
      '版本',
      '类型',
      '模式'
    ]
    colWidths = [46, 16, 6, 6]
  } else {
    logger.info('模块集成结果:')
    head = [
      `模块 (共 ${count} 个, 集成终态: ${ComposeModuleStatesDesc[toState]})`,
      '版本',
      '类型',
      '模式',
      '结果'
    ]
    colWidths = [46, 16, 6, 6, 6]
  }

  const table = {
    head,
    rows: [] as string[][],
    colWidths
  }

  const successSymbol = chalk.bold(
    COLORS.success(isUnicodeSupported() ? ' ✔ ' : ' √ ')
  )
  const failSymbol = chalk.bold(
    COLORS.error(isUnicodeSupported() ? ' ✖ ' : ' × ')
  )

  // 汇总模块成功状态
  let allModulesSucceeded = true

  ;(host ? [host].concat(modules) : modules).forEach((mod) => {
    // 优化编译模式下当前分包的名称提示
    const name =
      complete &&
      mod.type === 'subpackage' &&
      mod.mode === 'compile' &&
      mod.config?.root
        ? `${mod.name} (${mod.config?.root})`
        : mod.name

    // git 或 npm 额外显示 ref 或 version
    let versionOrRef: string
    if (mod?.download?.type === 'git') {
      versionOrRef = mod.download?.options?.ref || 'HEAD'
      // 如果拿到的是完整的 git ref, 则截取前 12 个显示
      if (versionOrRef.length >= 40) {
        versionOrRef = versionOrRef.slice(0, 12)
      }
    } else if (mod?.download?.type === 'npm') {
      versionOrRef = mod.download?.options?.version || 'latest'
    }
    versionOrRef = versionOrRef || '*'

    const column = [
      name,
      versionOrRef,
      MODULE_TYPE_NAMES[mod.type],
      MODULE_MODE_NAMES[mod.mode]
    ]

    if (complete) {
      const moduleSucceeded = mod.state === toState
      column.push(moduleSucceeded ? successSymbol : failSymbol)
      allModulesSucceeded = allModulesSucceeded && moduleSucceeded
    }

    table.rows.push(column)
  })

  logger.table(table)

  // 输出集成产物目录地址
  if (complete) {
    if (host?.output?.to) {
      logger[allModulesSucceeded ? 'success' : 'info'](
        `集成产物目录: ${host.output.to}`
      )
    }

    // 如果集成失败, 抛出错误
    if (!allModulesSucceeded) {
      throw new Error('小程序集成失败, 请检查日志中的模块错误信息。')
    }
  }
}

/**
 * 集成宿主和模块
 * @param runner - Runner 实例
 * @param host - 宿主信息
 * @param modules - 模块信息列表
 * @param tempDir - 临时文件夹
 * @param outputPath - 输出文件夹
 * @param executeStep - 执行步骤设置, 默认为 all, 支持配置为 pre / post / all
 * @param toState - 指定模块集成的最终 state 状态
 * @param combineModules - 是否合并模块配置（通常用于分包页面合并至主包）, 默认为 false
 * @returns host 和 模块 信息
 */
export async function composeHostAndModules(
  runner: Runner,
  host: ComposeModuleInfo,
  modules: ComposeModuleInfo[],
  tempDir: string,
  outputPath: string,
  executeStep: 'pre' | 'post' | 'all' = 'all',
  toState: ComposeModuleStates = ComposeModuleStates.composed,
  combineModules = false
): Promise<{
  host: ComposeModuleInfo
  modules: ComposeModuleInfo[]
}> {
  const cwd = runner.config.cwd

  /**
   * 添加模块处理至队列
   */
  async function addQueue(
    callback: () => Promise<void>,
    moduleInfo: ComposeModuleInfo
  ) {
    return QUEUE.add(async () => {
      await retry(callback, {
        retries: RETRY_TIMES,
        async onFailedAttempt(error) {
          // 失败重试, 可在这个阶段尝试修复
          await runner.hooks.moduleFailedAttempt.promise(moduleInfo, error)
        }
      })
    }).catch((error) => {
      let message = error.message || error.name
      if (message === 'TimeoutError') {
        message = `模块 ${moduleInfo.name} 集成超时失败`
      }
      logger.error(message, { error })
    })
  }

  const steps =
    executeStep === 'pre'
      ? [
          ComposeModuleStates.initial,
          ComposeModuleStates.downloaded,
          ComposeModuleStates.beforeScriptsExecuted
        ]
      : executeStep === 'post'
      ? [
          ComposeModuleStates.copiedOrCompiled,
          ComposeModuleStates.afterScriptsExecuted,
          ComposeModuleStates.configLoaded
        ]
      : [
          ComposeModuleStates.initial,
          ComposeModuleStates.downloaded,
          ComposeModuleStates.beforeScriptsExecuted,
          ComposeModuleStates.copiedOrCompiled,
          ComposeModuleStates.afterScriptsExecuted,
          ComposeModuleStates.configLoaded
        ]

  if (host && host.mode !== 'compile') {
    const processHost = async () => {
      await processModule(runner, host, outputPath, steps, toState)
    }
    // 如果步骤中包含 文件复制步骤(ComposeModuleStates.copiedOrCompiled)
    // 需要保证 host 中的文件最先被复制完, 以免发生模块早于 host 复制完成
    // 而 host 原本需要被覆盖的文件却覆盖了模块的文件
    if (steps.includes(ComposeModuleStates.copiedOrCompiled)) {
      await addQueue(processHost, host)
    } else {
      addQueue(processHost, host)
    }
  }

  if (modules.length) {
    for (const m of modules) {
      addQueue(async () => {
        await processModule(runner, m, outputPath, steps, toState)
      }, m)
    }
  }

  // 完成前置内容
  await QUEUE.onIdle()

  // pre 不执行后续逻辑
  if (executeStep === 'pre') {
    return {
      host,
      modules
    }
  }

  if (host && host.mode === 'compile') {
    // 载入 app.json 配置
    await loadModuleConfig(host, outputPath, cwd)
  }

  // 如果终态不是 composed 则跳过集成
  if (toState === ComposeModuleStates.composed) {
    // 合并分包配置到宿主小程序中
    await composeAllModulesIntoHost(runner, host, modules, combineModules)
  }

  // 保存 compose 的汇总结果到文件中
  await saveComposeResults(
    host,
    modules,
    tempDir,
    runner?.userConfig?.name || ''
  )

  logHostAndModulesInfos(host, modules, true, toState)

  return {
    host,
    modules
  }
}

/**
 * 保存 compose 的综合构建结果
 */
async function saveComposeResults(
  host: ComposeModuleInfo,
  modules: ComposeModuleInfo[],
  tempDir: string,
  configName: string
) {
  const composeBaseDir = path.join(
    getComposerTempRoot(tempDir),
    normalizeName(configName)
  )

  await fs.ensureDir(composeBaseDir)

  const filePath = path.join(composeBaseDir, 'compose-results.json')

  await fs.writeJson(
    filePath,
    {
      composedAt: Date.now(),
      modulesCount: modules.length,
      host,
      modules
    },
    { spaces: 2 }
  )
}

/**
 * 集成功能
 * 共分为 8 个阶段
 *   1. 模块初始阶段, 准备模块的初始信息并比对 hash
 *   2. 下载模块阶段, 完成后触发 moduleDownloaded hook
 *   3. 前置脚本阶段, 完成后触发 moduleBeforeScriptsExecuted hook
 *   4. 配置载入阶段, 完成后触发 moduleConfigLoaded hook
 *   5. 复制编译阶段, 完成后触发 moduleCopiedOrCompiled hook
 *   6. 后置脚本阶段, 完成后触发 moduleAfterScriptsExecuted hook
 *   7. 模块集成阶段, 完成后触发 moduleComposed hook, 并执行 scripts.composed 脚本
 *   8. 失败重试阶段, 以上 2 ~ 6 阶段中抛错将自动重试, 并触发 moduleFailedAttempt hook
 * @param runner - Runner 实例
 * @param options - compose 选项
 * @param compileType - 编译类型
 * @param tempDir - 临时文件夹
 * @param outputPath - 输出文件夹
 * @param executeStep - 执行步骤设置, 默认为 all, 支持配置为 pre / post / all
 * @param withModules - 需要指定的模块, 支持 glob 模式, 可选项
 * @param withoutModules - 需要排除的模块, 支持 glob 模式, 可选项
 * @param fromState - 指定开始的最大 state 状态
 * @param toState - 指定模块集成的最终 state 状态
 * @param combineModules - 是否合并模块配置（通常用于分包页面合并至主包）, 默认为 false
 * @returns host 和 模块 信息
 */
export async function compose(
  runner: Runner,
  options: ComposerUserConfig,
  compileType: string,
  tempDir: string,
  outputPath: string,
  executeStep: 'pre' | 'post' | 'all' = 'all',
  withModules?: string[],
  withoutModules?: string[],
  fromState?: ComposeModuleStates,
  toState: ComposeModuleStates = ComposeModuleStates.composed,
  combineModules = false
): Promise<{
  host?: ComposeModuleInfo
  modules: ComposeModuleInfo[]
}> {
  const { host, modules } = await prepareHostAndModules(
    runner,
    options,
    compileType,
    tempDir,
    outputPath,
    withModules,
    withoutModules,
    fromState,
    toState
  )

  return await composeHostAndModules(
    runner,
    host,
    modules,
    tempDir,
    outputPath,
    executeStep,
    toState,
    combineModules
  )
}
