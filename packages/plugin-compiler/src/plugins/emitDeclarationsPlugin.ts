import {
  EntryBuilderHelpers,
  EntryFileType,
  logger,
  Plugin,
  Runner,
  typescript as ts,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import {
  CompileModes,
  CompilerUserConfig,
  COMPILE_COMMAND_NAME,
  NODE_MODULE_REGEXP
} from '../constants'
import {
  getRelativePathToSrcPaths,
  loadUserTsCompilerOptions,
  pathWithoutExtname
} from '../utils'

// 保存不同 runner 相关的 WebpackWrapper
const wrapperMap = new WeakMap<Runner, WebpackWrapper>()

// 保存不同 runner 相关的 entryBuilder
const entryBuilderMap = new WeakMap<Runner, EntryBuilderHelpers>()

// 保存不同 runner 下面 需要输出 .d.ts 的文件信息
const jsEntriesMap = new WeakMap<
  Runner,
  Map<
    string,
    {
      filePath: string
      entryName: string
      fileContent: string
      transformers: ts.CustomTransformers
    }
  >
>()

/**
 * 用于 transform 模式下 生成 .d.ts 类型声明文件 到 outputPath 中
 */
export class EmitDeclarationsPlugin implements Plugin {
  name = 'EmitDeclarationsPlugin'

  apply(runner: Runner) {
    runner.hooks.webpackWrapper.tap(this.name, (webpackWrapper) => {
      wrapperMap.set(runner, webpackWrapper)
    })

    // 运行前修改 webpack 配置
    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      this.generateDeclarationFiles(runner)
    })
  }

  generateDeclarationFiles(runner: Runner) {
    const userConfig = (runner.userConfig || {}) as CompilerUserConfig

    // 仅在 transform 模式下支持
    if (userConfig.compileMode !== CompileModes.transform) return
    // 仅在 开启 declaration 时生效
    if (!userConfig?.compilerOptions?.declaration) return

    // 初始化
    jsEntriesMap.set(runner, new Map())

    // 删除无效的 entry
    runner.hooks.afterBuildEntries.tap(this.name, (entries, entryBuilder) => {
      const jsEntries = jsEntriesMap.get(runner)
      entryBuilderMap.set(runner, entryBuilder)

      for (const [filePath] of jsEntries) {
        if (!entryBuilder.isEntryFile(filePath)) {
          jsEntries.delete(filePath)
        }
      }

      return entries
    })

    // 获取文件内容以及 transformers
    runner.hooks.scriptParser.tap(
      {
        name: this.name,
        // 设置为最大值，确保拿到的是最终的 transformers
        stage: Number.POSITIVE_INFINITY
      },
      function (transformers, options) {
        if (options.fileInfo.entryFileType === EntryFileType.script) {
          jsEntriesMap.get(runner).set(options.fileInfo.path, {
            filePath: path.join(
              options.userConfig.outputPath,
              options.fileInfo.entryName
            ),
            entryName: options.fileInfo.entryName,
            fileContent: options.fileInfo.content,
            transformers
          })
        }
        return transformers
      }
    )

    // 输出 .d.ts 文件
    runner.hooks.compiler.tap(this.name, (compiler) => {
      compiler.hooks.compilation.tap(this.name, (compilation) => {
        compilation.hooks.finishModules.tapPromise(this.name, async () => {
          logger.info('生成类型声明文件 .d.ts 中...')

          const jsEntries = jsEntriesMap.get(runner)
          const entryBuilder = entryBuilderMap.get(runner)

          const options = {
            ...(loadUserTsCompilerOptions() || {}),
            // 覆盖用户 tsconfig.json 中的 outDir
            outDir: userConfig.outputPath,
            rootDir: userConfig.srcPath,
            rootDirs: userConfig.srcPaths,
            importHelpers: userConfig.compilerOptions.importHelpers,
            module: ts.ModuleKind[userConfig.compilerOptions.module],
            target: ts.ScriptTarget[userConfig.compilerOptions.target],
            declaration: userConfig.compilerOptions.declaration,
            // 跳过 lib 检查，以免不必要的报错
            skipLibCheck: true,
            emitDeclarationOnly: true
          }

          // dts 文件和 最终路径的映射
          const dtsMappings = new Map<
            string,
            {
              sourcePath: string
              targetPath: string
            }
          >()

          for (const [filePath, entry] of jsEntries) {
            // 无后缀的产物文件路径
            // ts 输出 .d.ts 时会基于 outDir 自动计算输出的文件路径名称
            // 为了能够仅输出有效的文件，这里需要生成相同的路径用于过滤
            const filePathWithExt = pathWithoutExtname(
              path.join(
                userConfig.outputPath,
                getRelativePathToSrcPaths(filePath, userConfig.srcPaths, false)
              )
            )

            dtsMappings.set(filePathWithExt + '.d.ts', {
              sourcePath: filePath,

              // webpack 需要生成的文件后缀
              targetPath: pathWithoutExtname(entry.entryName) + '.d.ts'
            })
          }

          // 自定义 host
          const host = ts.createCompilerHost(options)

          // 修改 host.readFile 优先从缓存中读取已被 preprocessor 处理过的文件
          const _readFile = host.readFile
          host.readFile = function (fileName: string): string | undefined {
            return jsEntries.get(fileName)?.fileContent || _readFile(fileName)
          }

          // 自定义写入文件
          // 通过原文件地址换取正确的文件地址
          function writeFile(
            fileName: string,
            data: string,
            writeByteOrderMark: boolean,
            onError?: (message: string) => void
          ): void {
            if (dtsMappings.has(fileName)) {
              try {
                entryBuilder.setEntrySource(
                  dtsMappings.get(fileName).targetPath,
                  data,
                  'additional'
                )
              } catch (error) {
                if (onError) onError(error)
              }
            }
          }

          // 批量把文件传入 createProgram
          // 如果一个一个文件传，会导致编译时间很长
          // 且造成 .d.ts 生成缺少上下文和生成多余的文件
          const program = ts.createProgram(
            Array.from(jsEntries.keys()),
            options,
            host
          )

          // 一个一个文件生成， 原因为： 需要兼容原有的 js plugin
          // 批量生成会导致 plugin 上下文中的 filePath 和 fileContent 错误
          program.getSourceFiles().forEach((sourceFile) => {
            const filePath = sourceFile.fileName

            // 跳过 node_modules 中的文件
            if (NODE_MODULE_REGEXP.test(filePath)) return

            try {
              // 生成 声明文件
              program.emit(sourceFile, writeFile, void 0, void 0)
            } catch (err) {
              logger.error(
                '生成 .d.ts 文件失败 \n' +
                  `文件路径: ${filePath} \n` +
                  `错误信息: ${err}`,
                { error: err }
              )
            }
          })

          logger.success('类型声明文件 .d.ts 生成完成')
        })
      })
    })
  }
}
