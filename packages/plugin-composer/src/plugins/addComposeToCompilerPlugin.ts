import {
  asArray,
  ComposeModuleStates,
  EntryType,
  fsExtra as fs,
  lodash as _,
  logger,
  Plugin,
  Runner,
  slash
} from '@morjs/utils'
import path from 'path'
import {
  composeHostAndModules,
  generateComposeModuleHash,
  generateTempDir,
  prepareHostAndModules
} from '../compose'
import {
  COMMAND_NAME,
  ComposerUserConfig,
  DOWNLOAD_TYPE_FOR_COMPILE
} from '../constants'
import { overrideUserConfig } from '../utils'

/**
 * 为 compile 命令提供 --compose 支持
 * 同时自动集成需要参与编译的模块
 */
export class AddComposeToCompilerPlugin implements Plugin {
  name = 'MorAddComposeToCompilerPlugin'

  runner?: Runner

  apply(runner: Runner) {
    this.runner = runner

    this.enhanceCompileCommand()
    this.runComposeAroundCompile()
  }

  isComposeEnabled() {
    // 判断是否在 compile 命令中开启的 compose 支持
    const userConfig = this.runner.userConfig || {}

    return (
      userConfig[COMMAND_NAME] === true &&
      this.runner.commandName === 'compile' &&
      (!_.isEmpty(userConfig['host']) || !_.isEmpty(userConfig['modules']))
    )
  }

  /**
   * 拓展 compile 命令的功能, 允许通过 compile 命令触发 compose 功能
   */
  enhanceCompileCommand() {
    // 添加 --compose 选项支持
    this.runner.hooks.cli.tap(
      {
        name: `${this.name}`,
        stage: 100
      },
      (cli) => {
        const compileCommand = cli.command('compile')
        compileCommand.option('--compose', '开启小程序集成功能')
      }
    )

    // 支持 --compose 覆盖 用户配置中的 compose
    this.runner.hooks.modifyUserConfig.tap(
      this.name,
      function (userConfig = {}, command) {
        const options = command?.options || {}

        return overrideUserConfig({
          optionNames: [COMMAND_NAME],
          userConfig,
          commandOptions: options
        })
      }
    )
  }

  /**
   * 执行 compose
   */
  runComposeAroundCompile() {
    const runner = this.runner
    runner.hooks.userConfigValidated.tapPromise(
      {
        name: this.name,
        // 在 compile 设置默认值之后, 以及构建 webpack 配置之前执行
        stage: -200
      },
      async (
        config: ComposerUserConfig & {
          name: string
          compileType: string
          outputPath: string
          srcPaths: string[]
          autoClean: boolean
        }
      ) => {
        if (!this.isComposeEnabled()) return

        logger.info(`小程序集成功能已开启`)

        const tempDir = runner.config.getTempDir()
        const compileType = config.compileType
        const outputPath = config.outputPath
        const srcPath = config.srcPaths[0]
        const srcPaths = config.srcPaths
        const autoClean = config.autoClean
        const cwd = runner.config.cwd
        const combineModules = config.combineModules

        const withModules = asArray(
          runner.commandOptions?.withModules
        ) as string[]

        const withoutModules = asArray(
          runner.commandOptions?.withoutModules
        ) as string[]

        const fromState =
          runner.commandOptions?.fromState == null
            ? // 如果开启了自动清理产物目录, 则自动设置 fromState 为 2
              autoClean
              ? 2
              : undefined
            : (Number(runner.commandOptions.fromState) as ComposeModuleStates)

        const toState =
          runner.commandOptions?.toState == null
            ? undefined
            : (Number(runner.commandOptions?.toState) as ComposeModuleStates)

        // 初始化 host 和 modules
        const { host, modules } = await prepareHostAndModules(
          runner,
          config,
          compileType,
          tempDir,
          outputPath,
          withModules,
          withoutModules,
          fromState,
          toState
        )

        // 检查 modules 中 mode 为 compile 的模块
        // 并通过 output.exclude 来标记无需拷贝
        // 原因: 通过外部配置直接传入的需要编译的模块产物会直接通过编译输出
        modules.forEach((module) => {
          if (module.mode === 'compile') {
            module.output.exclude = ['**/*']
          }
        })

        let projectConfigFilePath: string

        // 为 project 配置注入插件信息
        // 并重写 host 输出目录
        // 小程序存放在 output/miniprogram 中
        // 小程序插件存放在 output/plugin 中
        if (compileType === 'plugin') {
          // 重写 compile 输出目录, 修改为 outputPath/plugin 目录
          const pluginRoot = path.join(outputPath, 'plugin')
          config.outputPath = pluginRoot

          // 设置 host 的 output.to 目录为 outputPath/miniprogram 目录
          if (host) {
            host.output.to = path.relative(
              cwd,
              path.join(outputPath, 'miniprogram')
            )
          }

          runner.hooks.configParser.tap(
            {
              name: this.name,
              // 需要指定 stage 晚于 compiler 内的 configParser 执行时机
              // 避免 pluginRoot 和 miniprogramRoot 被设置为当前目录
              stage: 100
            },
            function (config, options) {
              if (options.fileInfo.entryType === EntryType.project) {
                // 取消当前文件的缓存
                options.loaderContext?.cacheable?.(false)

                config.compileType = 'plugin'
                config.miniprogramRoot = './miniprogram'
                config.pluginRoot = './plugin'

                // 项目文件地址一般在输出根目录
                projectConfigFilePath = path.join(
                  pluginRoot,
                  path.basename(options.fileInfo.path)
                )
              }
              return config
            }
          )
        }
        // 修改分包输出目录
        // 并重写 host 输出目录
        else if (compileType === 'subpackage') {
          // 设置 host 的 output.to 目录为 outputPath
          if (host) {
            host.output.to = path.relative(cwd, path.resolve(cwd, outputPath))
          }

          const subpackageName = config.name || 'miniprogram_subpacakge'
          const root = generateTempDir(
            tempDir,
            config.name,
            'subpackage',
            subpackageName
          )
          const hash = generateComposeModuleHash(
            { mode: 'compile' },
            subpackageName
          )
          const outputFrom = path.join(root, hash)

          // 重置编译输出目录
          config.outputPath = outputFrom

          // 构造编译类型的分包模块
          modules.push({
            type: 'subpackage',
            name: subpackageName,
            mode: 'compile',
            root: path.relative(cwd, root),
            source: path.relative(cwd, outputFrom),
            hash: hash,
            output: {
              from: path.relative(cwd, outputFrom)
            },
            state: ComposeModuleStates.beforeScriptsExecuted,
            download: {
              // 标记为 DOWNLOAD_TYPE_FOR_COMPILE 可跳过下载
              type: DOWNLOAD_TYPE_FOR_COMPILE,
              options: {}
            }
          })
        }

        // 如果开启了自动清理, 且 host 目标目录不为空且不等于 编译输出目录(代表目录被改写)
        // 则这里补偿清理下宿主产物目录
        if (
          autoClean &&
          host?.output?.to &&
          host?.output?.to !== config.outputPath
        ) {
          await fs.emptyDir(host.output.to)
        }

        // 执行 compose 前置逻辑
        await composeHostAndModules(
          runner,
          host,
          modules,
          tempDir,
          outputPath,
          'pre',
          toState,
          combineModules
        )

        // entries 分析完成前追加需要编译的模块
        runner.hooks.beforeBuildEntries.tapPromise(
          this.name,
          async (entryBuilder) => {
            const globalConfigEntry = entryBuilder.getEntryByFilePath(
              entryBuilder.globalConfigFilePath
            )
            const addPageEntries = []

            _.forEach(modules || [], (module) => {
              if (module.type === 'plugin') return
              if (module.mode !== 'compile') return
              if (_.isEmpty(module?.config?.pages)) return

              const isMainPackage = module.type === 'main'

              // 分包 root
              const root = module?.config?.root || ''

              // 分组信息, '' 代表 主包
              const groupName = isMainPackage || !root ? '' : root

              const pageEntries: Record<string, string> = {}
              const pages: string[] = []

              const hasCustomEntries = Array.isArray(module.config.pages)
                ? false
                : true

              // 获取模块产物根目录
              const moduleRoot = path.resolve(
                cwd,
                module?.output?.from || module.source
              )

              _.forEach(
                module.config.pages,
                function (pagePath: string, entryName: string) {
                  // mor compile 会将绝对路径限制在 srcPaths 内
                  // 所以这里使用相对路径以避免绝对路径的限制
                  const pageRelativePath = path.relative(
                    srcPath,
                    path.resolve(moduleRoot, root, pagePath)
                  )
                  if (hasCustomEntries) {
                    pageEntries[path.join(root, entryName)] = pageRelativePath
                    pages.push(slash(entryName))
                  } else {
                    pageEntries[path.join(root, pagePath)] = pageRelativePath
                    pages.push(slash(pagePath))
                  }
                }
              )

              // 添加页面
              addPageEntries.push(
                entryBuilder.addPageEntries(
                  pageEntries,
                  globalConfigEntry,
                  groupName,
                  // 集成模块里面的页面优先从 moduleRoot 中获取页面或组件
                  [moduleRoot].concat(srcPaths)
                )
              )
            })

            await Promise.all(addPageEntries)
          }
        )

        // 编译完成之后执行 compose 后置逻辑
        runner.hooks.compiler.tap(this.name, async (compiler) => {
          // 当触发变更时, 将重置需要编译模块的状态
          compiler.hooks.invalid.tap(this.name, function () {
            if (host && host.mode === 'compile') {
              host.state = ComposeModuleStates.afterScriptsExecuted
            }
            if (modules?.length) {
              modules.forEach((mod) => {
                if (mod.mode === 'compile') {
                  mod.state = ComposeModuleStates.beforeScriptsExecuted
                }
              })
            }
          })

          compiler.hooks.done.tapPromise(
            {
              name: this.name,
              stage: -1000
            },
            async () => {
              // 编译完成后执行 compose 后续逻辑
              await composeHostAndModules(
                runner,
                host,
                modules,
                tempDir,
                outputPath,
                'post',
                toState,
                combineModules
              )

              // 集成后处理插件的 项目配置文件
              if (
                compileType === 'plugin' &&
                projectConfigFilePath &&
                (await fs.pathExists(projectConfigFilePath))
              ) {
                const fileName = path.basename(projectConfigFilePath)
                await fs.move(
                  projectConfigFilePath,
                  path.join(outputPath, fileName),
                  {
                    overwrite: true
                  }
                )
              }
            }
          )
        })
      }
    )
  }
}
