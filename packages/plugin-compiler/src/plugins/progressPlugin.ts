import { logger, Plugin, Runner, webpack } from '@morjs/utils'
import { CompilerUserConfig, COMPILE_COMMAND_NAME } from '../constants'
import { isChildCompilerRunner } from '../utils'

const TAG = 'mor.compile.performance'

function logMemoryUsage() {
  // 打印内存占用情况
  const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024
  logger.debug(`内存占用: ${Math.round(memoryUsed * 100) / 100} MB`)
}

/**
 * 编译进度插件
 * - 显示当前编译进度
 * - 显示内存占用
 */
export class ProgressPlugin implements Plugin {
  name = 'MorProgressPlugin'

  apply(runner: Runner) {
    let isFirstCompile = true

    runner.hooks.initialize.tap(this.name, () => {
      if (isFirstCompile) runner.logger.time(TAG)
    })

    // 命令行控制关闭进度显示
    runner.hooks.cli.tap(this.name, (cli) => {
      cli.command(COMPILE_COMMAND_NAME).option('--no-progress', '关闭进度显示')
    })

    runner.hooks.compiler.tap(this.name, (compiler) => {
      const { watch } = runner.userConfig as CompilerUserConfig

      if (watch && !isChildCompilerRunner(runner))
        logger.info('启动文件监听模式')

      compiler.hooks.thisCompilation.tap(this.name, () => {
        if (!isFirstCompile) runner.logger.time(TAG)
        isFirstCompile = false
        if (!isChildCompilerRunner(runner)) logger.info('开始编译 ...')
      })

      let showProgress = !!runner.commandOptions?.progress
      // 命令行只有 --no-progress 所以 showProgress 默认就是 true
      // 这里添加 PROGRESS 环境变量支持
      // 允许通过 PROGRESS=none 来关闭进度提示
      if (showProgress !== false && runner.config.env.isFalsy('PROGRESS')) {
        showProgress = false
      }

      let isCompiling = false

      // 显示进度条
      if (showProgress && !isChildCompilerRunner(runner)) {
        const loading = logger.createLoading('编译进度: 5%')

        // 显示编译进度
        new webpack.ProgressPlugin((percentage, ...args) => {
          if (!isCompiling) return
          let msg = `正在编译, 进度: ${(percentage * 100).toFixed(2)}% `
          if (runner?.commandOptions?.verbose) {
            msg = msg + `=> ${args.join(' ')}`
          }
          loading.update(msg)
        }).apply(compiler)

        // 以 entry 构建完成为编译开始
        runner.hooks.afterBuildEntries.tap(this.name, (entries) => {
          isCompiling = true
          loading.start()
          return entries
        })

        // 标记编译结束
        compiler.hooks.done.tap(
          {
            name: this.name,
            stage: Number.MAX_SAFE_INTEGER
          },
          () => {
            isCompiling = false
            loading.success(`编译完成, ${runner.logger.timeEnd(TAG)}\n`)
            logMemoryUsage()
          }
        )
        compiler.hooks.failed.tap(this.name, () => {
          isCompiling = false
          runner.logger.timeEnd(TAG)
          loading.stop()
          logMemoryUsage()
        })
      }
      // 不显示进度
      else {
        // 标记编译结束
        compiler.hooks.done.tap(
          {
            name: this.name,
            stage: Number.MAX_SAFE_INTEGER
          },
          () => {
            if (!isChildCompilerRunner(runner)) {
              logger.success(`编译完成, ${runner.logger.timeEnd(TAG)}\n`)
            }
            logMemoryUsage()
          }
        )
        compiler.hooks.failed.tap(this.name, () => {
          runner.logger.timeEnd(TAG)
          logMemoryUsage()
        })
      }
    })
  }
}
