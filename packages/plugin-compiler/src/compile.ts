import {
  asArray,
  fsExtra,
  logger,
  mor,
  Runner,
  webpack,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import {
  CHILD_COMPILER_RUNNER,
  CompileModes,
  CompilerUserConfig,
  INDEPENDENT_SUBPACAKGE_JSON
} from './constants'
import type { EntryBuilder } from './entries'
import { ISubPackageConfig } from './types'
import { isChildCompilerRunner, pathWithoutExtname } from './utils'

const PLUGIN_NAME = 'MOR_WEBPACK_COMPILE_PLUGIN'

type RunnerInstanceMap = Map<string, Runner>

/**
 * 通过 runner 的单独实例来编译独立分包
 */
function compileIndependentSubpackages(
  entryBuilder: EntryBuilder,
  runner: Runner,
  compiler: webpack.Compiler
) {
  const userConfig = (runner.userConfig || {}) as CompilerUserConfig & {
    name: string
  }
  const PLUGIN_NAME_CHILD = PLUGIN_NAME + '_CHILD'

  // 仅在 bundle 模式下 以及 编译目标不是 web 时提供独立分包的编译支持
  // 非 bundle 模式可以利用, 各个小程序 IDE 本身提供的独立分包编译
  if (
    userConfig.compileMode !== 'bundle' ||
    userConfig.target === 'web' ||
    userConfig.target === 'web-pro'
  )
    return

  let independentSubpackages: Map<string, ISubPackageConfig> = new Map()
  let independentRunners: RunnerInstanceMap = new Map()

  const originalUserConfig =
    asArray(runner.config.userConfig).filter((c) => {
      return c?.name === userConfig.name
    }) || userConfig

  // 自动更新独立分包, 并清理 mor 缓存
  runner.hooks.beforeBuildEntries.tapPromise(PLUGIN_NAME_CHILD, async () => {
    const keptRunners: RunnerInstanceMap = new Map()

    for await (const [, sub] of entryBuilder.independentSubpackages) {
      if (independentRunners.has(sub.root)) {
        keptRunners.set(sub.root, independentRunners.get(sub.root))
        independentRunners.delete(sub.root)
      } else {
        // 启动分包编译
        // 组装用户配置
        const newRunner = new Runner(
          mor,
          // 定制用户配置
          {
            ...originalUserConfig,
            // 独立分包配置
            ...({
              compileType: 'subpackage',
              srcPath: path.join(userConfig.srcPath, sub.root),
              srcPaths: userConfig.srcPaths.map((s) => path.join(s, sub.root)),
              outputPath: path.join(userConfig.outputPath, sub.root),
              // 独立分包不触发集成流程
              compose: false
            } as CompilerUserConfig)
          },
          // 定制 context
          {
            ...Object.fromEntries(runner.context.entries()),
            [INDEPENDENT_SUBPACAKGE_JSON]: sub,
            [CHILD_COMPILER_RUNNER]: true
          }
        )

        keptRunners.set(sub.root, newRunner)

        // 执行 分包编译
        newRunner.hooks.compiler.tap(
          PLUGIN_NAME_CHILD,
          function (childCompiler) {
            childCompiler.hooks.thisCompilation.tap(PLUGIN_NAME_CHILD, () => {
              logger.info(`编译独立分包 ${sub.root} 中 ...`)
            })
            childCompiler.hooks.done.tap(
              {
                name: PLUGIN_NAME_CHILD,
                stage: Number.MAX_SAFE_INTEGER
              },
              () => {
                logger.info(`独立分包 ${sub.root} 编译完成`)
              }
            )
            childCompiler.hooks.failed.tap(PLUGIN_NAME_CHILD, () => {
              logger.error(`独立分包 ${sub.root} 编译失败`)
            })
          }
        )
        await newRunner.run({
          name: runner.commandName,
          args: runner.commandArgs,
          options: {
            ...(runner.commandOptions || {}),
            // 独立分包不触发集成流程
            compose: false
          }
        })
      }
    }

    // 这里关闭 runner 实例 并 清理原来的 runner map
    for await (const [, r] of independentRunners) {
      await r.hooks.shutdown.promise(r)
    }
    independentRunners.clear()

    // 保存新的实例列表
    independentRunners = keptRunners

    // 保存新的独立分包配置
    independentSubpackages = entryBuilder.independentSubpackages
  })

  // 需要保留分包产物，这里通过定制 CleanPlugin 的 hook 来完成
  compiler.hooks.emit.tap(PLUGIN_NAME_CHILD, function (compilation) {
    if (independentSubpackages.size) {
      const roots: string[] = []
      independentSubpackages.forEach((sub) => roots.push(sub.root))
      const keepDirRegExp = new RegExp(roots.join('|'))
      webpack.CleanPlugin.getCompilationHooks(compilation).keep.tap(
        PLUGIN_NAME_CHILD,
        (asset) => {
          if (keepDirRegExp.test(asset)) return true
        }
      )
    }
  })
}

/**
 * 提供 worker 编译支持
 */
function compileWorkers(
  entryBuilder: EntryBuilder,
  runner: Runner,
  compiler: webpack.Compiler
) {
  const userConfig = runner.userConfig as CompilerUserConfig

  // 仅在 bundle 模式下 以及 编译目标不是 web 且不是分包编译时提供 worker 的编译支持
  if (
    userConfig.compileMode !== 'bundle' ||
    userConfig.target === 'web' ||
    userConfig.target === 'web-pro' ||
    userConfig.compileType !== 'miniprogram'
  ) {
    return
  }

  const globalObject = userConfig.globalObject
  const srcPaths = userConfig.srcPaths

  let workerEnabled = false

  /**
   * 需要编译的 worker 文件（不带后缀）
   */
  const workerFiles: Set<string> = new Set()

  const PLUGIN_NAME_WORKER = PLUGIN_NAME + '_WORKER'
  runner.hooks.beforeBuildEntries.tap(PLUGIN_NAME_WORKER, (entryBuilder) => {
    workerEnabled = !!entryBuilder.appJson?.workers
  })

  compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME_WORKER, (factory) => {
    factory.hooks.parser
      .for('javascript/auto')
      .tap(PLUGIN_NAME_WORKER, (parser) => parse(parser))
    factory.hooks.parser
      .for('javascript/dynamic')
      .tap(PLUGIN_NAME_WORKER, (parser) => parse(parser))
    factory.hooks.parser
      .for('javascript/esm')
      .tap(PLUGIN_NAME_WORKER, (parser) => parse(parser))

    function parse(parser: webpack.javascript.JavascriptParser) {
      if (!workerEnabled) return

      type Expression = Parameters<
        ReturnType<
          webpack.javascript.JavascriptParser['hooks']['call']['for']
        >['call']
      >[0]

      // 从 createWorker 方法中获取文件引用
      // 并替换为正确的文件名称
      function parseWorker(expression: Expression) {
        if (expression.type === 'CallExpression') {
          if (expression.arguments.length < 1) return
          const argExpression = expression.arguments[0]
          const arg = parser.evaluateExpression(
            argExpression as typeof expression
          )
          if (arg && arg.isString() && arg.string) {
            const fileName = pathWithoutExtname(arg.string)
            workerFiles.add(fileName)
            const dep = new webpack.dependencies.ConstDependency(
              JSON.stringify(fileName + '.js'),
              argExpression.range
            )
            dep.loc = argExpression.loc
            parser.state.module.addPresentationalDependency(dep)
          }
        }
      }

      parser.hooks.call
        .for(`${globalObject}.createWorker`)
        .tap(PLUGIN_NAME_WORKER, parseWorker)
      parser.hooks.call.for('createWorker').tap(PLUGIN_NAME_WORKER, parseWorker)
    }
  })

  compiler.hooks.thisCompilation.tap(
    PLUGIN_NAME_WORKER,
    async (compilation) => {
      compilation.hooks.additionalAssets.tapPromise(
        PLUGIN_NAME_WORKER,
        async () => {
          if (!workerEnabled || !workerFiles.size) return

          for await (const file of workerFiles) {
            const entryName = file + '.js'
            const workerFile = await entryBuilder.tryReachFileByExts(
              file,
              entryBuilder.scriptWithConditionalExts,
              srcPaths
            )
            const workerCompiler = compilation.createChildCompiler(
              PLUGIN_NAME_WORKER,
              {
                filename: entryName,
                chunkFilename: entryName,
                globalObject: 'self'
              }
            )
            workerCompiler.context = compiler.context
            new webpack.webworker.WebWorkerTemplatePlugin().apply(
              workerCompiler
            )
            new webpack.EntryPlugin(
              compiler.context,
              workerFile,
              entryName
            ).apply(workerCompiler)

            // 确保 hash 生成正确
            workerCompiler.hooks.make.tapAsync(
              PLUGIN_NAME_WORKER,
              (childCompilation, callback) => {
                childCompilation.hooks.afterHash.tap(PLUGIN_NAME_WORKER, () => {
                  childCompilation.hash = compilation.hash
                  childCompilation.fullHash = compilation.fullHash
                })
                callback()
              }
            )

            // 执行 worker 子编译
            await new Promise((resolve) => {
              workerCompiler.runAsChild((err, entries, childCompilation) => {
                if (
                  !err &&
                  childCompilation.errors &&
                  childCompilation.errors.length
                ) {
                  err = childCompilation.errors[0]
                }

                // 检查 entry 是否存在
                const entry =
                  entries &&
                  entries[0] &&
                  entries[0].files.values().next().value

                if (!err && !entry) {
                  err = new webpack.WebpackError(
                    `编译 worker 失败，未找到文件: ${workerFile}`
                  )
                }

                if (err) {
                  compilation.errors.push(err as webpack.WebpackError)
                }
                resolve(null)
              })
            })
          }
        }
      )
    }
  )
}

/**
 * 小程序编译逻辑
 */
export async function compile(
  webpackWrapper: WebpackWrapper,
  entryBuilder: EntryBuilder,
  runner: Runner
) {
  const userConfig = runner.userConfig as CompilerUserConfig

  // 锁定配置
  const config = webpackWrapper.buildConfig()

  /* 入口解析 */
  config.entry = async () => await entryBuilder.build()

  /* 准备 webpack compiler 实例 并触发 compiler hook */
  const { compiler } = webpackWrapper.prepare()
  runner.hooks.compiler.call(compiler)

  // 打印 文件变更
  compiler.hooks.invalid.tap(PLUGIN_NAME, function (fileOrDirPath) {
    if (!isChildCompilerRunner(runner)) {
      logger.info(`触发变更: \n=> ${fileOrDirPath}`)
    }
  })

  // 尝试保存 entry 构建的结果
  // entry 缓存仅在 非 default 模式下生效
  if (
    userConfig.cache === true &&
    userConfig.compileMode === CompileModes.bundle
  ) {
    let entryCacheTimeout: NodeJS.Timeout
    compiler.hooks.done.tap(PLUGIN_NAME, () => {
      const isWatching = !!webpackWrapper.watching
      if (entryCacheTimeout) clearTimeout(entryCacheTimeout)
      entryCacheTimeout = setTimeout(
        async () => {
          await entryBuilder.trySaveToCache()
        },
        // watching 状态下 延迟 500ms 写入
        isWatching ? 500 : 0
      )
    })
  }

  // 如果开启了 autoClean 则开始编译前先清空输出目录
  if (userConfig.autoClean) {
    await fsExtra.emptyDir(userConfig.outputPath)
  }

  // 独立分包编译支持
  compileIndependentSubpackages(entryBuilder, runner, compiler)

  // workers 编译支持
  compileWorkers(entryBuilder, runner, compiler)

  // 执行 webpack 编译
  await webpackWrapper.run()
}
