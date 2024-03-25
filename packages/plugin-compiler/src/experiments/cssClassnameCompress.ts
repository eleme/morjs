import {
  cssProcessorFactory,
  EntryBuilderHelpers,
  EntryFileType,
  logger,
  Plugin,
  Runner,
  WebpackWrapper
} from '@morjs/utils'
import { customAlphabet } from 'nanoid'
import path from 'path'
import parser from 'postcss-selector-parser'
import { CompilerUserConfig, COMPILE_COMMAND_NAME } from '../constants'

type CompileCSSClassNameCompressOptions = Exclude<
  CompilerUserConfig['experiments']['compressCssClassName'],
  boolean
>

// ID 生成器 容量上限
const MAX_CAPACITY_PERCENTAGE = 0.8

// 默认的 ID 生成字母表
const DEFAULT_ALPHABET =
  '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// 安全字母表，无数字和_, 当无前缀的时候使用
const SAFE_DEFAULT_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * CSS 类名压缩功能
 *
 * 使用方法:
 *   1. 创建实例
 *     const cssClassNameCompress = new CSSClassNameCompress(options)
 *   2. 初始化
 *     cssClassNameCompress.init({ cwd, ignore })
 *   3. 分别在 css 和 xml 中增加对应的处理插件，并作为最后一个
 *     postHtml.use(cssClassNameCompress.postHtmlPlugin())
 *     postCss.use(cssClassNameCompress.postCssPlugin())
 *
 * 实现方案
 *
 *   实现原则：业务最小化兼容修改，同时保留配置选项对高级压缩方案的扩展支持
 *
 *   压缩时机：
 *
 *     在编译开始前搜集可以压缩类名的文件，并将相应的 CSS 插件和 XML 插件分别注入到编译流程中
 *
 *   压缩方案：
 *
 *    1. 提供轻量级(lite, 后续可以考虑更复杂的方式)的压缩方案
 *        增加 mor.config.ts 中的 配置如下👇🏻
 *        experiments.compressCssClassName: CSSClassNameCompressOptions | false
 *    2. 判断 app.acss 或 app.less 中的类名，并添加为排除名单
 *        也就是各个文件中涉及到 app.acss 中的类名，一律不做压缩
 *        原因为：不能确定业务影响，不符合最小化的修改原则
 *              这块儿的压缩可以作为后续高级压缩方案考虑的内容
 *    3. 判断所有需要跳过压缩的 wxml 文件，其同名 acss 文件也跳过压缩
 *        判断方式：class 或 自定义的 class 属性中 中是否使用了动态拼接
 *        如 class='abc-{{c ? "d" : "e"}}' 这种
 *    4. 根据前面的约束，通过一个共享的 css mapping 对象，可以不分先后的同时压缩 wxml 和 wxss
 *        因为不涉及到多进程，所以可以无视文件编译的先后顺序
 */
export class CSSClassNameCompressPlugin implements Plugin {
  name = 'CSSClassNameCompressPlugin'

  entryBuilder: EntryBuilderHelpers

  webpackWrapper: WebpackWrapper

  runner: Runner

  // CSS 类名压缩名称映射
  classNameMappings = new Map<string, string>()

  // CSS 生成类名集合，用于唯一性检查
  generatedClassNames = new Set<string>()

  // CSS 类名压缩文件白名单
  validFiles = new Set<string>()

  // 不需要重命名的列表
  exceptClassNames = new Set<string>()

  // 默认条件
  options: CompileCSSClassNameCompressOptions = {
    strategy: 'lite',
    prefix: '',
    surfix: '',
    include: [],
    exclude: [],
    except: [],
    alphabet: '',
    disableDynamicClassDetection: false
  }

  hasClassNameFilter: boolean

  includeRegexp?: RegExp

  // 优先级高于 includeRegexp
  excludeRegexp?: RegExp

  // ID 生成器
  idGenerator: () => string

  // ID 长度
  idSize = 0

  // ID 生成器长度递增阈值
  idThreshold: number

  // class 动态拼接正则，用于检测 class='{{ 动态条件 }}' 的情况
  dynamicClassRegExp: RegExp

  // 自定义属性名称
  customClassAttrs: string[]

  apply(runner: Runner) {
    this.runner = runner

    // 如果未开启, 则跳过后续
    if (!runner.userConfig?.experiments?.compressCssClassName) return

    runner.hooks.webpackWrapper.tap(this.name, (wrapper) => {
      this.webpackWrapper = wrapper
    })

    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      // 设置并发为 1 确保处理顺序
      // 当前插件受并发影响, 需要先完成 global style 的处理
      this.webpackWrapper.chain.parallelism(1)

      // 初始化配置
      const userConfig = runner.userConfig as CompilerUserConfig
      let config = userConfig?.experiments?.compressCssClassName
      config = config === true ? {} : config
      this.initialize(config as CompileCSSClassNameCompressOptions)
    })

    runner.hooks.afterBuildEntries.tapPromise(
      this.name,
      async (entries, builder) => {
        this.entryBuilder = builder
        await this.collectCompressableFiles()
        return entries
      }
    )

    // 标记结束
    runner.hooks.compiler.tap(this.name, (compiler) => {
      compiler.hooks.done.tap(this.name, () => this.done())
    })

    this.processAllXmlFiles()
    this.processAllCssFiles()
  }

  /**
   * 初始化
   * @param options 压缩选项
   */
  initialize(options: CompileCSSClassNameCompressOptions = {}) {
    this.options = { ...this.options, ...options }

    // 合并 include 正则
    if (this.options.include?.length) {
      this.includeRegexp = new RegExp(
        '\\s*(?:' +
          this.options.include.map((re) => re.source).join('|') +
          ')+\\s*',
        'g'
      )
    }

    // 合并 exclude 正则
    if (this.options.exclude?.length) {
      this.excludeRegexp = new RegExp(
        '\\s*(?:' +
          this.options.exclude.map((re) => re.source).join('|') +
          ')+\\s*',
        'g'
      )
    }

    // 将 except 中的名称添加到 exceptClassNames 中
    for (const item of this.options.except) {
      this.exceptClassNames.add(item)
    }

    // 判断是否有 class 自定义过滤函数
    this.hasClassNameFilter = typeof this.options.classNameFilter === 'function'

    // 设置默认 alphabet
    if (!this.options.alphabet) {
      this.options.alphabet = this.options.prefix
        ? DEFAULT_ALPHABET
        : SAFE_DEFAULT_ALPHABET
    }

    // 合并自定义 class 属性
    const customAttrs = this.options.customAttributeNames || []
    this.customClassAttrs = ['class', ...customAttrs]

    // 基于用户配置的自定义属性名称，生成 {{}} 检查正则
    // 默认为: /class=(("[^'=<>]*?{{[^"]*?}})|('[^'=<>]*?{{[^']*?}}))/
    let regexpStr = this.customClassAttrs.join('|')
    regexpStr = `(${regexpStr})=(("[^'=<>]*?{{[^"]*?}})|('[^'=<>]*?{{[^']*?}}))`
    this.dynamicClassRegExp = new RegExp(regexpStr)
  }

  /**
   * 处理所有的 xml 文件
   */
  processAllXmlFiles() {
    // 替换 xml 中的 className
    this.runner.hooks.templateParser.tap(this.name, (tree, options) => {
      const { fileInfo } = options

      // 不处理非 entry 的文件
      if (!fileInfo?.entryFileType) return tree
      if (!this.checkFileValid(fileInfo.path)) return tree

      tree.walk((node) => {
        if (!node.attrs) return node

        // 支持自定义属性名称替换
        for (const attr of this.customClassAttrs) {
          if (!node.attrs[attr]) continue
          if ((node.attrs[attr] as unknown as boolean) === true) continue

          const names = this.splitBySpaceAndBraces(
            ((node.attrs[attr] || '') as string).trim()
          )
          const newNames: string[] = []

          // 遍历并替换
          names.map((name) => {
            name = (name || '').trim()
            if (!name) return
            newNames.push(
              this.fetchOrGenerateShortClassName(name, fileInfo.path)
            )
          })

          // 替换属性值
          node.attrs[attr] = newNames.join(' ')
        }

        return node
      })

      return tree
    })
  }

  /**
   * 处理所有的 css 文件
   */
  processAllCssFiles() {
    // 替换 css 中的 class
    this.runner.hooks.styleParser.tap(this.name, (plugins, options) => {
      return plugins.concat(
        cssProcessorFactory(this.name, (root) => {
          const { fileInfo } = options

          // 标记全局样式中的 className 为排除项
          if (fileInfo.path === this.entryBuilder.globalStyleFilePath) {
            logger.warn(
              `文件：${this.entryBuilder.globalStyleFilePath} 将跳过类名压缩`
            )

            root.walkRules((ruleNode) => {
              parser((selectors) => {
                selectors.walkClasses((n) => {
                  // 搜集不需要缩短名称的 classname
                  this.exceptClassNames.add(n.value)
                })
              }).processSync(ruleNode)
            })
          } else {
            // 不处理非 entry 的文件
            if (!fileInfo.entryFileType) return
            if (!this.checkFileValid(fileInfo.path)) return

            root.walkRules((rule) => {
              parser((selectors) => {
                selectors.walkClasses((node) => {
                  const className = this.fetchOrGenerateShortClassName(
                    node.value,
                    fileInfo.path
                  )
                  node.value = className
                })
              }).processSync(rule, { updateSelector: true })
            })
          }
        })
      )
    })
  }

  /**
   * 根据空格和大括号将输入字符串分割成数组。
   * @param {string} input - 待分割的字符串。
   * @returns {string[]} 分割后的字符串数组。
   */
  splitBySpaceAndBraces(input) {
    // 正则表达式，匹配 {{}} 或者空格
    const regex = /{{.*?}}|\s+/g
    let match
    let lastIndex = 0
    const result = []

    // 循环匹配正则表达式
    while ((match = regex.exec(input)) !== null) {
      // 如果匹配到的不是空格，且不是字符串的开始位置，则将之前的字符串加入结果数组
      if (match.index > lastIndex) {
        result.push(input.slice(lastIndex, match.index))
      }
      // 如果匹配到的是 {{}}，则将其加入结果数组
      if (match[0].startsWith('{{')) {
        result.push(match[0])
      }
      // 更新上次匹配的最后位置
      lastIndex = match.index + match[0].length
    }

    // 如果最后一个匹配后还有剩余的字符串，将其加入结果数组
    if (lastIndex < input.length) {
      result.push(input.slice(lastIndex))
    }

    return result
  }
  /**
   * 从已知的 axml 文件列表中查找可以处理的
   */
  async collectCompressableFiles(): Promise<void> {
    // 搜集可以压缩的 文件
    for await (const [, asset] of this.entryBuilder.entries) {
      if (asset.entryFileType === EntryFileType.template) {
        const fileContent = (
          await this.webpackWrapper.promisifiedFs.readFile(asset.fullPath)
        ).toString('utf-8')
        this.tryAddFile(asset.fullPath, fileContent)
      }
    }
  }

  /**
   * 去除文件路径的后缀
   * @param {string} filePath - 要处理的文件路径
   * @returns {string} 去除后缀的文件路径
   */
  removeExtension(filePath) {
    // 使用 path.parse() 解析文件路径
    const parsedPath = path.parse(filePath)
    // 返回去除后缀的路径，它由目录和文件名组成
    return path.join(parsedPath.dir, parsedPath.name)
  }

  /**
   * 检查文件是否有效
   * @param {string} filePath 文件路径
   */
  checkFileValid(filePath: string = ''): boolean {
    if (!filePath) return false
    return this.validFiles.has(this.removeExtension(filePath))
  }

  /**
   * 尝试添加文件
   * @param {string} filePath 文件路径
   * @param {string} fileContent 文件内容
   */
  tryAddFile(filePath: string, fileContent: string): void {
    if (this.checkFileBeforeAdd(filePath, fileContent)) {
      // 不保存文件后缀名，用于同时支持判断 多种文件类型
      this.validFiles.add(this.removeExtension(filePath))
    }
  }

  /**
   * 判断文件是否符合条件
   *   基于 exclude、include、和 文件内容中是否包含 {{ }} 来判断
   * @param {string} filePath 文件路径
   * @param {string} fileContent 文件内容
   * @returns {boolean} 是否符合条件
   */
  checkFileBeforeAdd(filePath: string, fileContent: string): boolean {
    // 排除的优先级更高
    if (this.excludeRegexp && this.excludeRegexp.test(filePath)) return false

    // 检查是否符合路径要求
    if (this.includeRegexp && !this.includeRegexp.test(filePath)) return false

    // 如果 axml 为内容，则 acss 应该也不应该由内容，此处不处理
    if (!fileContent) return false

    const dynamicClassDetection = () =>
      !this.dynamicClassRegExp.test(fileContent)
    const { disableDynamicClassDetection } = this.options
    // 是否配置跳过动态类名检测，如果配置了，判断值类型进行正确处理
    if (disableDynamicClassDetection) {
      if (typeof disableDynamicClassDetection === 'function') {
        const result = disableDynamicClassDetection(filePath)
        // 返回 false，代表仍然需要检测内容中是否存在动态类名情况
        if (!result) return dynamicClassDetection()
      }

      return true
    }
    // 检查文件中是否包含动态的 class 拼接
    return dynamicClassDetection()
  }

  /**
   * 从全局样式中添加黑名单，黑名单中的 class 将不会被压缩
   * @param {string} oldName 原有 class 名称
   * @param {string} newName 新的 class 名称
   */
  addClassNameMapping(oldName: string, newName: string): void {
    this.classNameMappings.set(oldName, newName)
  }

  /**
   * 生成新的 classname
   * @param {string} className 原有 class 名称
   * @param {string} filePath 文件路径
   * @returns {string} 新的 class 名称
   */
  fetchOrGenerateShortClassName(className: string, filePath: string): string {
    // 如果是不需要重命名的 class 直接返回原值
    if (this.exceptClassNames.has(className)) return className

    // 如果存在类名过滤器，则如果返回结果为 false 则不压缩
    if (
      this.hasClassNameFilter &&
      !this.options.classNameFilter(className, filePath)
    )
      return className

    // 如果已经存在，直接返回映射
    if (this.classNameMappings.has(className))
      return this.classNameMappings.get(className)

    const id = this.generateRandomStringWithPrefixAndSurfix()

    // 设置类名映射
    this.classNameMappings.set(className, id)

    return id
  }

  /**
   * 生成带前缀和后缀的不重复字符串
   * @returns {string} 随机不重复字符串
   */
  generateRandomStringWithPrefixAndSurfix(): string {
    // 接近当前ID数量上限的时候，重新设置 IDGenerator 和 idThreshold
    if (
      !this.idGenerator ||
      this.generatedClassNames.size >= this.idThreshold
    ) {
      // 初始化 ID 长度
      this.idSize++
      // 初始化 ID 生成器
      this.idGenerator = customAlphabet(this.options.alphabet, this.idSize)
      // ID 生成器的阈值
      this.idThreshold = Math.floor(
        Math.pow(this.options.alphabet.length, this.idSize) *
          MAX_CAPACITY_PERCENTAGE
      )
    }

    // 生成 id
    const id = `${this.options.prefix}${this.idGenerator()}${
      this.options.surfix
    }`

    // 循环检查，直到不重复位置
    if (this.generatedClassNames.has(id)) {
      return this.generateRandomStringWithPrefixAndSurfix()
    } else {
      this.generatedClassNames.add(id)
      return id
    }
  }

  /**
   * 标记处理完成，如果 success 存在的情况下，调用 success 回调
   */
  done(): void {
    if (typeof this.options.success === 'function') {
      this.options.success(this.classNameMappings)
    }
  }
}
