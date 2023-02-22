import {
  EntryFileType,
  fsExtra as fs,
  logger,
  Plugin,
  Runner
} from '@morjs/utils'
import path from 'path'
import { target, WebCompilerUserConfig } from '../constants'

/**
 * Web 相关通用配置支持
 */
export class EmitIntermediateAssetsPlugin implements Plugin {
  name = 'MorWebEmitIntermediateAssetsPlugin'

  apply(runner: Runner<any>) {
    runner.hooks.cli.tap(this.name, function (cli) {
      cli
        .command('compile')
        .option(
          '--emit-web-intermediate-assets',
          '生成 web 转端中间产物 (方便调试)'
        )
    })

    // 命令行选项覆盖用户配置
    runner.hooks.modifyUserConfig.tap(
      this.name,
      function (
        userConfig: WebCompilerUserConfig & {
          name: string
          target: string
        },
        command
      ) {
        if (command.options?.emitWebIntermediateAssets) {
          if (userConfig.target === target) {
            userConfig.web = userConfig.web || {}
            userConfig.web.emitIntermediateAssets =
              command.options.emitWebIntermediateAssets
          } else {
            logger.warnOnce(
              `仅在 target 为 web 时支持 --emit-web-intermediate-assets 选项`
            )
          }
        }

        return userConfig
      }
    )

    runner.hooks.userConfigValidated.tapPromise(
      this.name,
      async (
        userConfig: WebCompilerUserConfig & {
          name: string
          target: string
        }
      ) => {
        if (userConfig.web?.emitIntermediateAssets) {
          const intermediateAssetsDir = path.join(
            runner.config.getTempDir(),
            'compiler',
            'intermediate-assets',
            userConfig.name || userConfig.target
          )

          // 自动清空中间产物目录
          if (await fs.pathExists(intermediateAssetsDir)) {
            fs.emptyDir(intermediateAssetsDir)
          }

          const cwd = runner.getCwd()

          logger.info(
            `已开启 web 转端中间产物输出: ${path.relative(
              cwd,
              intermediateAssetsDir
            )}`
          )

          // 介入到 postprocessor 阶段用于输出中间产物
          runner.hooks.postprocessorParser.tapPromise(
            {
              name: this.name,
              // 确保最终产物拿到的是最后处理完成的内容
              stage: Number.POSITIVE_INFINITY
            },
            async function (source, options) {
              // 优先使用 entry 名称作为中间产物文件路径
              let filePath =
                options?.fileInfo?.entryName ||
                path.relative(cwd, options.fileInfo.path)

              switch (options?.fileInfo.entryFileType) {
                case EntryFileType.sjs:
                case EntryFileType.template:
                  filePath = filePath + '.js'
                  break
              }

              await fs.outputFile(
                path.join(intermediateAssetsDir, path.resolve('/', filePath)),
                source
              )

              return source
            }
          )
        }
      }
    )
  }
}
