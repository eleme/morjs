import {
  CompileModuleKind,
  CompileTypes,
  EntryBuilderHelpers,
  EntryFileType,
  EntryType,
  makeImportClause,
  ModuleGroup,
  MOR_APP_FILE,
  MOR_COMMON_FILE,
  MOR_INIT_FILE,
  MOR_RUNTIME_FILE,
  MOR_VENDOR_FILE,
  Runner,
  slash,
  webpack
} from '@morjs/utils'
import path from 'path'
import { CompileModes, CompilerUserConfig } from '../constants'

const JavascriptModulesPlugin = webpack.javascript.JavascriptModulesPlugin
const SCRIPT_EXT = '.js'

/**
 * 分包编译优化插件
 * 生成如下类型的文件
 *   MOR_APP_FILE
 *   MOR_COMMON_FILE
 *   MOR_INIT_FILE
 *   MOR_RUNTIME_FILE
 *   MOR_VENDOR_FILE
 */
export class OptimizeSplitChunksPlugin {
  name = 'OptimizeSplitChunksPlugin'

  splitChunks?: webpack.optimize.SplitChunksPlugin

  userConfig: CompilerUserConfig

  runner: Runner

  entryBuilder: EntryBuilderHelpers

  // 拆分出来的文件清单
  splitFiles: Map<ModuleGroup, Record<string, string>>

  constructor() {
    this.splitFiles = new Map()
  }

  apply(runner: Runner) {
    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {
      this.runner = runner
      this.entryBuilder = entryBuilder
      this.userConfig = runner.userConfig as CompilerUserConfig

      const { compileMode, target } = this.userConfig

      // 仅 bundle 模式下生效
      if (compileMode !== CompileModes.bundle) return
      // web 模式下禁用该插件
      if (target === 'web' || target === 'web-pro') return

      // 每次 entryBuilder 完成 build 之后触发 splitChunks 选项更新
      runner.hooks.afterBuildEntries.tap(this.name, (entries) => {
        this.updateSplitChunksOptions()
        return entries
      })

      // 应用 webpack 插件
      runner.hooks.compiler.tap(this.name, (compiler) => {
        this.applyWebpackPlugin(compiler)
      })
    })
  }

  applyWebpackPlugin(compiler: webpack.Compiler) {
    const entryBuilder = this.entryBuilder

    // 应用 SplitChunksPlugin 插件
    this.splitChunks = new webpack.optimize.SplitChunksPlugin()
    this.splitChunks.apply(compiler)

    // 在生成的文件中注入相关文件的引用引用
    // NOTE: 这里需要使用 thisCompilation 以避免 childCompiler 复用 splitChunks 的问题
    compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
      // 搜集依赖信息, 将所有文件信息都汇总在 moduleGraph 中
      compilation.hooks.finishModules.tap(
        this.name,
        (modules: webpack.NormalModule[]) => {
          for (const module of modules) {
            // 添加被引用的 module
            // 没有被引用的 module 可以被认为是 Entry
            if (
              module?.resource &&
              module?.resourceResolveData?.context?.issuer
            ) {
              // 检查依赖当前 module 的其他模块并构建关系
              const incomingConnections =
                compilation.moduleGraph.getIncomingConnections(module)
              if (incomingConnections) {
                for (const { originModule } of incomingConnections) {
                  if (!originModule) continue
                  if (!originModule['resource']) continue
                  // 防止自引用
                  if (originModule['resource'] === module.resource) continue

                  entryBuilder.moduleGraph.addDependencyFor(
                    originModule['resource'],
                    module.resource
                  )
                }
              }
            }
          }
        }
      )

      // 基于 splitChunks 的结果, 检查最终生成的 vendors 和 commons
      // 并生成对应的 init 文件
      compilation.hooks.processAssets.tap(
        {
          name: this.name,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
        },
        (assets) => {
          this.generateInitFiles(assets)
        }
      )

      this.appendRequireInitFilesForRelatedEntries(compilation)
    })
  }

  // 基于 Entry 构建的分组信息调整 splitChunks 选项
  updateSplitChunksOptions(): void {
    // 每次初始化一个新的
    this.splitFiles = new Map()

    const cacheGroups: Record<string, any> = {}
    const entryBuilder = this.entryBuilder
    const { globalNameSuffix } = this.userConfig || {}

    const vendorFileEntry = MOR_VENDOR_FILE(globalNameSuffix)
    const commonFileEntry = MOR_COMMON_FILE(globalNameSuffix)
    const initFileEntry = MOR_INIT_FILE(globalNameSuffix)

    entryBuilder.moduleGraph.groups.forEach((group) => {
      function testBuilder(
        type: 'vendor' | 'common'
      ): (module: webpack.Module) => boolean {
        const isVendor = type === 'vendor'
        const isCommon = type === 'common'

        return (module: webpack.Module) => {
          const moduleName = module.nameForCondition()
          // 无名称 不处理
          if (!moduleName) return false

          // 不处理多端组件 entry 的提取
          // 避免公共代码的过度抽取导致的调试困难
          // 非多端组件库的 entry 可基于 minChunks 抽取公共方法
          // 常见于 plugin/index.js 对外方法入口的公用
          // 如果不处理 common 类型的 entry 则可能导致代码拷贝
          // 从而引发无法正常导出的问题
          if (isVendor && entryBuilder.isEntryFile(moduleName)) {
            return false
          }

          // vendors 抽取
          if (
            isVendor &&
            /[\\/](node_modules|npm_components|mock)[\\/]/.test(
              moduleName || ''
            )
          ) {
            return (
              entryBuilder.moduleGraph.getGroup(moduleName).name === group.name
            )
          }

          // commons 抽取
          if (
            isCommon &&
            /^((?![\\/](node_modules|npm_components|mock)[\\/]).)*$/.test(
              moduleName || ''
            )
          ) {
            return (
              entryBuilder.moduleGraph.getGroup(moduleName).name === group.name
            )
          }

          return false
        }
      }

      if (group.modules.size) {
        const vendorsName = slash(path.join(group.name, vendorFileEntry))
        const commonsName = slash(path.join(group.name, commonFileEntry))

        this.splitFiles.set(group, {
          [vendorFileEntry]: vendorsName,
          [commonFileEntry]: commonsName,
          [initFileEntry]: slash(path.join(group.name, initFileEntry))
        })

        const commonOptions = {
          enforce: true,
          reuseExistingChunk: true,
          chunks: 'all',
          minChunks: 1,
          priority: entryBuilder.moduleGraph.isMainGroup(group) ? 100 : 50
        }

        // 抽离 vendors
        cacheGroups[vendorsName] = {
          name: vendorsName,
          ...commonOptions,
          test: testBuilder('vendor')
        }

        // 抽离 commons
        cacheGroups[commonsName] = {
          name: commonsName,
          ...commonOptions,
          minChunks: 2,
          test: testBuilder('common')
        }
      }
    })

    // 借用 SplitChunksPlugin 实例化时对 options 的解析来获取正确的 options
    // 并完成对当前正在使用的 splitChunks 实例中 options 的替换
    const options = new webpack.optimize.SplitChunksPlugin({
      cacheGroups
    }).options

    this.splitChunks.options = options
  }

  /**
   * 生成初始化文件
   *    vendors
   *    commons
   *    init
   */
  generateInitFiles(assets: Record<string, any>) {
    const {
      compileType,
      compilerOptions: { module: defaultModuleKind },
      globalNameSuffix
    } = this.userConfig
    const moduleGraph = this.entryBuilder.moduleGraph

    const vendorFileEntry = MOR_VENDOR_FILE(globalNameSuffix)
    const commonFileEntry = MOR_COMMON_FILE(globalNameSuffix)
    const initFileEntry = MOR_INIT_FILE(globalNameSuffix)
    const appFileEntry = MOR_APP_FILE(globalNameSuffix)
    const runtimeFileEntry = MOR_RUNTIME_FILE(globalNameSuffix)

    const moduleKind =
      this.userConfig['originalCompilerModule'] || defaultModuleKind

    // 是否存在 app.js
    const hasAppFile = !!this.entryBuilder.globalScriptFilePath
    const appName = hasAppFile ? appFileEntry : null

    // 小程序可能会有多个分包, 需要为每个分包生成一个 init 文件
    // 插件和分包中不能再分包, 所以只生成一个 init 文件即可
    this.splitFiles.forEach((files, group) => {
      const existsFiles: string[] = []

      // 检查文件是否生成
      const vendorsFile = files[vendorFileEntry] + SCRIPT_EXT
      if (vendorsFile in assets) {
        existsFiles.push(`./${vendorFileEntry}${SCRIPT_EXT}`)
      }
      const commonsFile = files[commonFileEntry] + SCRIPT_EXT
      if (commonsFile in assets) {
        existsFiles.push(`./${commonFileEntry}${SCRIPT_EXT}`)
      }

      // 只在主包中引入 runtime
      if (moduleGraph.isMainGroup(group)) {
        existsFiles.unshift(`./${runtimeFileEntry}${SCRIPT_EXT}`)
      }

      if (compileType !== CompileTypes.miniprogram && hasAppFile) {
        existsFiles.push(`./${appName}${SCRIPT_EXT}`)
      }

      // 生成 init 文件内容
      let initFileContent = existsFiles
        .map((m) => makeImportClause(moduleKind, m))
        .join('')
      if (this.runner.hooks.generateInitFiles.isUsed()) {
        initFileContent = this.runner.hooks.generateInitFiles.call(
          initFileContent,
          group
        )
      }
      this.entryBuilder.setEntrySource(
        files[initFileEntry] + SCRIPT_EXT,
        initFileContent,
        'additional'
      )
    })
  }

  /**
   * 在 entry 中追加 init 文件的引用
   */
  appendRequireInitFilesForRelatedEntries(compilation: webpack.Compilation) {
    const {
      compileType,
      compilerOptions: { module: defaultModuleKind },
      globalNameSuffix
    } = this.userConfig
    const jsHooks = JavascriptModulesPlugin.getCompilationHooks(compilation)

    // 插件或分包的模拟 app 名称
    const vendorFileEntry = MOR_VENDOR_FILE(globalNameSuffix)
    const initFileEntry = MOR_INIT_FILE(globalNameSuffix)
    const appFileEntry = MOR_APP_FILE(globalNameSuffix)

    jsHooks.render.tap(this.name, (source, context) => {
      const moduleGraph = this.entryBuilder.moduleGraph
      const chunkName = context.chunk.name
      const entry = this.entryBuilder.entries.get(chunkName)

      // 兜底 regeneratorRuntime 不存在的问题
      // 小程序中不存在 globalThis 故 regenerator-runtime 初始化可能会出问题
      // 这里进行兜底
      if (chunkName.endsWith(vendorFileEntry)) {
        return new webpack.sources.ConcatSource(
          'var regeneratorRuntime;',
          source
        )
      }

      // 非 entry 文件不处理
      if (!entry) return source
      // 非 js 文件不处理
      if (entry.entryFileType !== EntryFileType.script) return source

      // 如果是插件的 main 文件, 则强制为 commonjs 引用
      const moduleKind =
        entry.entryType === EntryType.plugin
          ? CompileModuleKind.CommonJS
          : // 注入的引用以原始编译模块类型为准
            this.userConfig['originalCompilerModule'] || defaultModuleKind

      // 如果是 小程序 则将 init 追加到 app.js 中
      // 并基于分组信息, 将分包中的 init 文件分别添加到分包的 entry 中
      if (compileType === CompileTypes.miniprogram) {
        // NOTE: 这里作为一个隐藏的配置，作为对一些特殊场景的兼容，如 Weex 单页
        // 非标准能力，所以不作为对外公开的配置项
        // 用于强制在所有小程序文件中均引入「初始化文件」
        if (this.userConfig['injectInitFileToAllEntries'] === true) {
          const group = moduleGraph.getGroup(entry.fullPath)
          return new webpack.sources.ConcatSource(
            makeImportClause(
              moduleKind,
              this.resolveInitFilePath(
                group,
                entry.fullEntryName,
                initFileEntry
              )
            ),
            source
          )
        } else {
          if (chunkName === 'app') {
            return new webpack.sources.ConcatSource(
              makeImportClause(moduleKind, `./${initFileEntry}${SCRIPT_EXT}`),
              source
            )
          }
          // 处理小程序中的分包
          else {
            const group = moduleGraph.getGroup(entry.fullPath)

            // 主包中无需再引用
            if (moduleGraph.isMainGroup(group)) return source

            // 分包文件追加引用
            return new webpack.sources.ConcatSource(
              makeImportClause(
                moduleKind,
                this.resolveInitFilePath(
                  group,
                  entry.fullEntryName,
                  initFileEntry
                )
              ),
              source
            )
          }
        }
      }
      // 处理插件和分包
      // 分包和插件只有一个包, 即主包
      else {
        // 分包和插件中的 app 为模拟, 此处不做处理
        if (context.chunk.name === appFileEntry) return source

        // 分包文件追加引用
        return new webpack.sources.ConcatSource(
          makeImportClause(
            moduleKind,
            this.resolveInitFilePath(
              moduleGraph.mainGroup,
              entry.fullEntryName,
              initFileEntry
            )
          ),
          source
        )
      }
    })
  }

  resolveInitFilePath(
    group: ModuleGroup,
    relativeTo: string,
    initFileEntry: string
  ) {
    let initFile = this.splitFiles.get(group)[initFileEntry]
    initFile = path.relative(path.dirname(relativeTo), initFile)
    return initFile.startsWith('.')
      ? `${initFile}${SCRIPT_EXT}`
      : `./${initFile}${SCRIPT_EXT}`
  }
}
