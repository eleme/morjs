import crypto from 'crypto'
import glob from 'fast-glob'
import fs from 'fs-extra'
import { template } from 'lodash'
import os from 'os'
import path, { dirname, extname, join, relative, resolve } from 'path'
import prompts from 'prompts'
import { DEFAULT_ROOT, SupportConfigExtensions } from './constants'
import * as utils from './deps'
import { autoDetectDownloaderTypeAndOptions, download } from './downloader'
import { logger } from './logger'
import { Json } from './types'
import { importJsOrMjsOrTsFromFile, lookupFile } from './utils'

const TEMPLATE_EXTNAME = '.tpl'
const TEMPLATE_FILE_REGEXP = new RegExp(`\\${TEMPLATE_EXTNAME}$`)
const DEFAULT_CUSTOM_GENERATOR_NAME = 'custom-generator'

/**
 * 生成器回调函数
 */
export type GeneratorCallbackFunction = (
  generator: Generator
) => Promise<void> | void

/**
 * 生成器支持的 callback 名称
 */
export type GeneratorCallbackNames =
  | 'downloaded'
  | 'customized'
  | 'prompted'
  | 'written'

/**
 * 生成器 callback 对象
 */
export type GeneratorCallbacks = {
  [callback in GeneratorCallbackNames]?: GeneratorCallbackFunction
}

/**
 * 生成器选项(含 callback)
 */
export type GeneratorOptions = {
  /**
   * 模版地址, 支持 本地目录、Git、Npm、Tar 等
   */
  from: string
  /**
   * 目标目录地址
   */
  to: string
  /**
   * 基础目录, 默认为 process.cwd()
   */
  baseDir?: string
  /**
   * 模版解析选项默认值
   */
  defaults?: Record<string, any>
  /**
   * 问题列表, 用于获取用户选择
   */
  questions?: prompts.PromptObject[]
  /**
   * 拷贝文件的 glob 配置
   */
  globOptions?: glob.Options
  /**
   * 自定义生成器文件名称, 默认为 custom-generator.js
   */
  customGeneratorName?: string
} & GeneratorCallbacks

/**
 * 生成器拷贝选项
 */
export interface GeneratorCopyOptions {
  path: string
  context: Record<string, any>
  to: string
}

export type GeneratorConstructor = typeof Generator

/**
 * 自定义生成器工厂函数
 */
export interface CustomGeneratorFactory {
  (Generator: GeneratorConstructor): GeneratorConstructor
}

export class Generator implements Required<GeneratorOptions> {
  from: string
  to: string
  baseDir: string
  defaults: Record<string, any>
  questions: prompts.PromptObject<string>[]
  globOptions: glob.Options
  customGeneratorName: string
  /**
   * 用户选项结果
   */
  answers: Record<string, any>
  /**
   * 工具方法, 包含:
   *  - chalk
   *  - debug
   *  - execa
   *  - esbuild
   *  - fastGlob
   *  - fsExtra
   *  - got
   *  - json5
   *  - jsoncParser
   *  - lodash
   *  - prompts
   *  - tapable
   *  - tarFs
   *  - zod
   */
  utils = utils

  /**
   * 日志工具
   */
  logger = logger

  static async run(options: GeneratorOptions) {
    await new this(options).run()
  }

  constructor(options: GeneratorOptions) {
    const {
      from,
      to,
      defaults = {},
      questions = [],
      baseDir = DEFAULT_ROOT,
      globOptions,
      customGeneratorName = DEFAULT_CUSTOM_GENERATOR_NAME
    } = options
    this.baseDir = baseDir
    this.defaults = defaults
    this.answers = {}
    this.from = from
    this.to = resolve(baseDir, to)
    this.questions = questions || []
    this.globOptions = globOptions || {
      dot: true,
      ignore: ['**/node_modules/**']
    }
    this.customGeneratorName = customGeneratorName

    if (options.downloaded) this.downloaded = options.downloaded
    if (options.customized) this.customized = options.customized
    if (options.prompted) this.prompted = options.prompted
    if (options.written) this.written = options.written
  }

  /**
   * 下载完成后执行
   * @param generator - 当前 generator 实例
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  downloaded(generator: Generator): ReturnType<GeneratorCallbackFunction> {
    // do nothing
  }

  /**
   * 获取并初始化自定义 Generator 之后执行
   * @param generator - 当前 generator 实例
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customized(generator: Generator): ReturnType<GeneratorCallbackFunction> {
    // do nothing
  }

  /**
   * 终端交互问答提示后执行
   * @param generator - 当前 generator 实例
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prompted(generator: Generator): ReturnType<GeneratorCallbackFunction> {
    // do nothing
  }

  /**
   * 写入到目标文件夹之后执行
   * @param generator - 当前 generator 实例
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  written(generator: Generator): ReturnType<GeneratorCallbackFunction> {
    // do nothing
  }

  /**
   * 运行生成器, 步骤为
   * 1. 下载模版, 完成后执行 downloaded 回调
   * 2. 获取自定义生成器, 完成后执行 customized 回调
   * 3. 获取问题并在终端交互, 完成后执行 prompted 回调
   * 4. 写入模版到目标文件夹, 完成后执行 written 回调
   */
  async run() {
    await this.downloading()
    await this?.downloaded?.(this)

    const generator = (await this.customizing()) || this
    await generator?.customized?.(generator)

    await generator.prompting()
    await generator?.prompted?.(generator)

    await generator.writing()
    await generator?.written?.(generator)
  }

  /**
   * 下载模版内容
   * @returns 自定义 Generator 或 空
   */
  async downloading() {
    const from = resolve(this.baseDir, this.from)

    // 这里和 downloader 协议做一下区分
    // 优先判断 xxx/xxx 是否为本地路径
    if (await fs.pathExists(from)) {
      this.from = from
    } else {
      const { type, options } = autoDetectDownloaderTypeAndOptions(this.from)
      const tempDir = join(
        os.tmpdir(),
        'generator-' + crypto.createHash('md5').update(this.from).digest('hex')
      )
      await fs.ensureDir(tempDir)
      await download(type, options, tempDir)
      this.from = tempDir
    }
  }

  /**
   * 尝试获取自定义生成器
   * @returns 自定义生成器 或 空
   */
  async customizing(): Promise<Generator | void> {
    // 载入自定义 Generator
    try {
      const generatorPath = lookupFile(
        this.from,
        [this.customGeneratorName],
        [
          SupportConfigExtensions.js,
          SupportConfigExtensions.mjs,
          SupportConfigExtensions.ts
        ],
        {
          pathOnly: true
        }
      )
      if (!generatorPath) return

      const packageJsonFile = join(this.from, 'package.json')
      let isMjs: boolean = false
      const ext = extname(generatorPath)

      // 通过 package.json 判断是否是 mjs
      try {
        if (await fs.pathExists(packageJsonFile)) {
          const pkg = (await fs.readJSON(packageJsonFile)) as Json
          // 检查 package.json 中 "type" 字段 是否为 "module" 并设置 `isMjs` 为 true
          if (pkg?.type === 'module') isMjs = true
        }
      } catch (e) {}

      // 载入并替换自定义生成器
      if (await fs.pathExists(generatorPath)) {
        const tempFilePath = path.join(
          this.from,
          [
            this.customGeneratorName,
            crypto.createHash('md5').update(this.from).digest('hex'),
            'temp'
          ].join('-') + '.js'
        )

        const factory = (await importJsOrMjsOrTsFromFile({
          cwd: this.baseDir,
          filePath: generatorPath,
          isMjs: isMjs || ext === SupportConfigExtensions.mjs,
          isTs: ext === SupportConfigExtensions.ts,
          tempFilePath,
          autoDeleteTempFile: true
        })) as CustomGeneratorFactory

        const G = factory(Generator)

        // 这里不传入 GeneratorCallbacks 允许自定义生成通过定制 callbacks
        // 及 覆盖函数实现来自定义逻辑和流程
        const g = new G({
          from: this.from,
          to: this.to,
          defaults: this.defaults,
          questions: this.questions,
          baseDir: this.baseDir,
          globOptions: this.globOptions,
          customGeneratorName: this.customGeneratorName
        })

        logger.debug(`载入自定义 Generator 成功: ${generatorPath}`)

        return g
      }
    } catch (err) {
      const error = err as Error
      logger.error(`自定义生成器载入失败: ${error.message}`, { error })
    }
  }

  /**
   * 生成终端的 prompts 问题
   */
  async prompting() {
    this.answers = await prompts(this.questions, {
      onCancel() {
        // 用户取消时自动退出
        process.exit(0)
      }
    })
  }

  /**
   * 写入逻辑
   */
  async writing() {
    const context = {
      ...this.defaults,
      ...this.answers
    }
    if ((await fs.stat(this.from)).isDirectory()) {
      await this.copyDirectory({
        context,
        path: this.from,
        to: this.to
      })
    } else {
      if (this.from.endsWith(TEMPLATE_EXTNAME)) {
        await this.copyTemplate({
          path: this.from,
          to: this.to,
          context
        })
      } else {
        const absTarget = this.to
        logger.success(`拷贝: ${path.relative(this.baseDir, absTarget)}`)
        await fs.mkdirp(dirname(absTarget))
        await fs.copyFile(this.from, absTarget)
      }
    }
  }

  /**
   * 拷贝模版文件
   * @param opts - 拷贝选项
   */
  async copyTemplate(opts: GeneratorCopyOptions) {
    const tpl = await fs.readFile(opts.path, 'utf-8')
    const content = template(tpl)(opts.context)
    await fs.mkdirp(dirname(opts.to))
    logger.success(`写入: ${relative(this.baseDir, opts.to)}`)
    await fs.writeFile(opts.to, content, 'utf-8')
  }

  /**
   * 拷贝目录
   * @param opts - 拷贝选项
   */
  async copyDirectory(opts: GeneratorCopyOptions) {
    for await (const f of glob.stream('**/*', {
      ...this.globOptions,
      cwd: opts.path
    })) {
      const file = f.toString()
      const absFile = join(opts.path, file)

      if ((await fs.stat(absFile)).isDirectory()) return

      if (file.endsWith(TEMPLATE_EXTNAME)) {
        await this.copyTemplate({
          path: absFile,
          to: join(opts.to, file.replace(TEMPLATE_FILE_REGEXP, '')),
          context: opts.context
        })
      } else {
        const absTarget = join(opts.to, file)
        logger.success(`拷贝: ${path.relative(this.baseDir, absTarget)}`)
        await fs.mkdirp(dirname(absTarget))
        await fs.copyFile(absFile, absTarget, fs.constants.COPYFILE_FICLONE)
      }
    }
  }
}
