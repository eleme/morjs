import consolePng from 'console-png'
import { delimiter, dirname, relative, resolve } from 'path'
import qrImage from 'qr-image'
import slash from 'slash'
import { asArray, COLORS, esbuild, execa, logger } from 'takin'
import {
  COMMAND_TIMEOUT,
  CompileModuleKind,
  CompileModuleKindType
} from './constants'
import { ComposeModuleScriptCommand } from './hooks'
import { Changeable } from './types'

/**
 * 基于可选值生成描述信息
 * @param keys - 可选值
 * @returns 可选值为 值1, 值2
 */
export function validKeysMessage<
  M,
  U extends string,
  T extends Readonly<[U, ...U[]]>
>(keys: T | string[] | { [k: string]: string } | M): string {
  const values = (Array.isArray(keys) ? keys : Object.keys(keys)).join(', ')
  return `可选值为 ${values}`
}

/**
 * 将 16 进制的颜色值转换成 rgb 格式
 * @param hex - 16 进制的颜色值
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(
    shorthandRegex,
    (_, r: string, g: string, b: string) => `${r + r}${g + g}${b + b}`
  )
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return match
    ? {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16)
      }
    : null
}

/**
 * 是否是浅色
 * @param r - rgb 色值区域中的 red
 * @param g - rgb 色值区域中的 green
 * @param b - rgb 色值区域中的 blue
 */
export function isLightColor(r: number, g: number, b: number): boolean {
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return y >= 128
}

/**
 * 设置 NPM .bin 路径以复用 npm bin 文件
 * @param projectPath 项目路径
 * @param env 环境变量
 * @returns 添加过 NPM .bin 文件的 env
 */
export function setNPMBinPATH(
  projectPath: string,
  env: Record<string, string>
): Record<string, string> {
  const PATH = Object.keys(env)
    .filter((p) => /^path$/i.test(p) && env[p])
    .map((p) => env[p].split(delimiter))
    .reduce((set, p) => set.concat(p.filter((p) => !set.includes(p))), [])
    .join(delimiter)

  const pathArr = []

  let p = projectPath
  let pp
  do {
    pathArr.push(resolve(p, 'node_modules', '.bin'))
    pp = p
    p = dirname(p)
  } while (p !== pp)
  pathArr.push(PATH)

  const pathVal = pathArr.join(delimiter)

  for (const key of Object.keys(env)) {
    if (/^path$/i.test(key)) {
      env[key] = pathVal
    }
  }

  return env
}

/**
 * 生成二维码字符串
 *
 * @param input - 用于生成二维码的字符串
 * @return 生成可用于 console 的字符串
 */
export function generateQrcodeForTerminal(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    consolePng(
      qrImage.imageSync(input, { size: 1, margin: 2 }),
      function (err, string) {
        if (err) return reject(err)
        resolve(string)
      }
    )
  })
}

/**
 * 将普通后缀扩展为 普通后缀和带条件后缀的集合
 * 条件后缀优先级高于普通后缀
 * @param exts - 后缀列表
 * @param conditionalExts - 条件后缀
 * @returns 普通后缀和带条件后缀的集合
 */
export function expandExtsWithConditionalExt(
  exts: string[] | readonly string[],
  conditionalExts?: string | string[]
): string[] {
  if (!conditionalExts || !conditionalExts?.length) return [].concat(exts)
  const expandedExts: string[] = []

  asArray(conditionalExts).forEach((conditionalExt) => {
    exts.forEach((ext) => {
      expandedExts.push(conditionalExt + ext)
    })
  })

  return expandedExts.concat(exts)
}

/**
 * 基于 module 类型 生成引用代码
 * 规则:
 * 1. 如果没有 importName 则仅 import 或 require
 * 2. 如果只有 importName 则当做 default 引用
 * 3. 如果 importName 和 importAs 都存在 且 相等 则当做 named import 引用
 * @param moduleKind - module 类型, 用于生成 import 或 require 引用代码
 * @param importPath - 引用地址
 * @param importName - 引用名称
 * @param importAs - 引用别名
 * @param fileContent - 文件内容，用于辅助判断 commonjs 的情况
 * @returns 生成引用代码
 */
export function makeImportClause(
  moduleKind: CompileModuleKindType,
  importPath: string,
  importName?: string,
  importAs?: string,
  fileContent?: string
) {
  importPath = slash(importPath)
  // 判断是否 commonjs
  // 优先使用文件内容判断, 避免一个文件里面使用多种 module 类型
  if (isCommonJsModule(fileContent, moduleKind)) {
    const fragment = `require('${importPath}')`
    if (!importName) {
      return `${fragment};\n`
    } else if (importName && !importAs) {
      return `var ${importName} = ${fragment};\n`
    } else if (importName && importAs) {
      return `var ${importAs} = ${fragment}.${importName};\n`
    }
  } else {
    if (!importName) {
      return `import '${importPath}';\n`
    } else if (importName && !importAs) {
      return `import ${importName} from '${importPath}';\n`
    } else if (importName && importAs) {
      if (importName === importAs) {
        return `import { ${importName} } from '${importPath}';\n`
      } else {
        return `import { ${importName} as ${importAs} } from '${importPath}';\n`
      }
    }
  }
}

/**
 * 判断文件是否为 commonjs 模块
 * @param fileContent - 文件内容
 * @param moduleKind - 文件类型
 * @param recheckWhenMatched - 文件类型
 * @returns `true` or `false`
 */
export async function isCommonJsModule(
  fileContent: string,
  moduleKind: CompileModuleKindType,
  recheckWhenMatched = false,
  filePath?: string
): Promise<boolean> {
  const isCommonJs =
    (fileContent &&
      (fileContent.includes('require(') ||
        fileContent.includes('module.exports') ||
        fileContent.includes('exports.'))) ||
    moduleKind === CompileModuleKind.CommonJS
  if (recheckWhenMatched) {
    // 超过 500k 暂不处理
    if (fileContent && fileContent.length > 512000) {
      logger.debug(`文件 ${filePath} 超过 500k 暂不进行二次模块类型判断`)
      return isCommonJs
    }

    // 移除注释之后再判断一次，确保没有判断错误
    try {
      const content = (
        await esbuild.transform(fileContent, {
          loader: 'ts',
          target: 'esnext',
          legalComments: 'none'
        })
      ).code
      return await isCommonJsModule(content, moduleKind, false)
    } catch (error) {
      logger.debug(
        `模块类型二次判断失败: ${error.message}`,
        `文件路径: ${filePath}`,
        error
      )
      return isCommonJs
    }
  } else {
    return isCommonJs
  }
}

/**
 * 返回从 from 到 to 的相对路径
 * @param from - 参考路径
 * @param to - 需要转换的路径
 * @param forcePosix - 是否使用 POSIX 格式路径
 * @returns 相对路径
 */
export function getRelativePath(from, to, forcePosix = true) {
  // 获取到文件的目录，不能直接以文件路径做对比，否则获取到到的结果会多一层级
  const fromDirPath = dirname(from)
  const relativePath = relative(fromDirPath, to)
  const prefix =
    relativePath.startsWith('./') || relativePath.startsWith('../')
      ? relativePath.startsWith('.\\') || relativePath.startsWith('..\\')
        ? ''
        : '.\\'
      : './'

  if (!forcePosix) return prefix + relativePath
  return slash(prefix + relativePath)
}

/**
 * 获取 utils 的依赖地址
 * @param depName - 依赖名称
 */
export function resolveDependency(depName: string) {
  return require.resolve(depName)
}

/**
 * 运行模块脚本并标记脚本运行状态
 */
export async function execCommands({
  commands = [],
  tips = '',
  env = {},
  cwd,
  options = {},
  timeout = COMMAND_TIMEOUT,
  callbacks = {},
  throwOnError = false,
  verbose = false
}: {
  /**
   * 需要执行的脚本
   */
  commands: ComposeModuleScriptCommand[]
  /**
   * 脚本执行提示信息
   */
  tips?: string
  /**
   * 脚本执行环境变量
   */
  env?: Record<string, string>
  /**
   * 脚本执行选项，参考 execa 的 options: https://github.com/sindresorhus/execa
   */
  options?: Record<string, any>
  /**
   * 脚本执行超时时间，单位为毫秒，默认为 30000
   */
  timeout?: number
  /**
   * 当前工作区
   */
  cwd: string
  /**
   * 脚本执行回调函数
   */
  callbacks?: {
    beforeAll?: (commands: ComposeModuleScriptCommand[]) => Promise<void> | void
    /**
     * 执行每个命令之前执行的函数
     * @param command - 当前执行的脚本
     * @returns 修改后的脚本及命令执行信息
     */
    beforeEach?: (
      commandStr: string,
      command: ComposeModuleScriptCommand
    ) =>
      | Promise<{ command: string; info?: string }>
      | { command: string; info?: string }
    afterEach?: (
      result: any,
      command: ComposeModuleScriptCommand
    ) => Promise<void> | void
    afterAll?: (commands: ComposeModuleScriptCommand[]) => Promise<void> | void
    onError?: (err?: Error) => string | void
  }
  /**
   * 脚本执行失败时是否抛出异常，默认为 false
   */
  throwOnError?: boolean
  /**
   * 是否打印脚本执行日志，默认为 false
   */
  verbose?: boolean
}) {
  const message = tips || ''
  const scripts = commands || []
  const commonCommandEnv = env || {}
  const commonCommandOptions = options || {}

  await callbacks?.beforeAll?.(scripts)

  function containsError(msg: string): boolean {
    return String(msg || '').includes('Error')
  }

  function markError(msg: string): string {
    if (!msg) return ''
    return String(msg).replace(/Error/g, COLORS.error('Error'))
  }

  let execFailed = false
  let error: Error

  try {
    for await (const command of scripts) {
      let cmd: string =
        (typeof command === 'string' ? command : command?.command) || ''
      let comandInfo = `执行命令: ${cmd}`

      if (typeof callbacks?.beforeEach === 'function') {
        const res = await callbacks.beforeEach(cmd, command)
        cmd = res.command
        comandInfo = res.info || `执行命令: ${cmd}`
      }

      // 自定义命令选项和环境变量
      let commandOptions: Record<string, any> = {}
      let commandEnv: Record<string, any> = {}
      if (typeof command !== 'string') {
        commandOptions = command?.options || {}
        commandEnv = command?.env || {}
      }

      // 简单判断下是否为 shell 命令
      // 有关 shell 选项带来的执行差异, 参见: https://github.com/sindresorhus/execa#shell
      const shell =
        cmd.includes('||') ||
        cmd.includes('&&') ||
        cmd.includes('"') ||
        cmd.includes("'")

      logger.info(comandInfo)

      const stdioOptions: Record<string, string> = {}
      // 开启详细日志
      if (verbose) {
        stdioOptions.stdout = 'inherit'
        stdioOptions.stderr = 'inherit'
      } else {
        stdioOptions.stdin = 'ignore'
      }

      const execOptions: Changeable<execa.Options> = {
        cwd: cwd,
        // 追加 node_modules/.bin 路径信息
        env: setNPMBinPATH(cwd, {
          // 默认自动关闭 husky 避免 git 相关的校验
          HUSKY: '0',
          ...process.env,
          // 设置 yarn 缓存文件夹
          // 避免通过 yarn 安装 node_modules 时
          // yarn 多实例可能带来的缓存冲突问题
          // 但会增加一些构建时长
          // ...{ YARN_CACHE_FOLDER: path.join(moduleInfo.root, '.yarn') },
          ...commonCommandEnv,
          ...commandEnv
        }),
        timeout,
        shell,
        ...stdioOptions,
        // 支持自定义命令选项
        ...commonCommandOptions,
        ...commandOptions
      }

      logger.debug('命令详情:', execOptions)

      const result = await execa.command(cmd, execOptions)

      // 执行脚本后置回调
      if (typeof callbacks?.afterEach === 'function') {
        await callbacks.afterEach(result, command)
      }

      // 打印可能出现的日志, 部分脚本可能会打印错误日志但是不正常退出
      let possibleErrorMsg: string = ''
      if (containsError(result.stdout)) {
        possibleErrorMsg = markError(result.stdout)
      }
      if (containsError(result.stderr)) {
        possibleErrorMsg = possibleErrorMsg
          ? [possibleErrorMsg, markError(result.stderr)].join('\n')
          : markError(result.stderr)
      }
      if (possibleErrorMsg) {
        logger.warnOnce(
          `${comandInfo}, 日志包含异常信息, 但未正确退出, 请检查: \n${possibleErrorMsg}`
        )
        execFailed = true
      }
    }

    await callbacks?.afterAll?.(scripts)
  } catch (err) {
    error = new Error(`${message}执行失败, 原因: ${err.message}`)
    if (err.name) error.name = err.name
    error.stack = err.stack
    execFailed = true
  }

  // 提示修复手段
  if (execFailed) {
    let errorTips = ''
    if (typeof callbacks?.onError === 'function') {
      errorTips = callbacks.onError(error) || errorTips
    }
    if (throwOnError && error) throw error
    if (errorTips) logger.warnOnce(errorTips)
  }
}
