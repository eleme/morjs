import {
  CommandOptions,
  fsExtra as fs,
  logger,
  Plugin,
  Runner,
  Takin
} from '@morjs/utils'
import path from 'path'

function delay(callback: () => any, ms: number = 600): Promise<void> {
  return new Promise(function (resolve, reject) {
    setTimeout(async function () {
      try {
        await callback()
        resolve()
      } catch (error) {
        reject(error)
      }
    }, ms)
  })
}

const COMMAND_NAME = 'clean'

/**
 * 清理 mor 缓存文件
 */
export default class MorCleanPlugin implements Plugin {
  name = 'MorCleanPlugin'

  runner: Runner

  onUse(takin: Takin) {
    // 避免触发多配置, cache 命令只需要运行一次即可
    takin.hooks.configFiltered.tap(
      this.name,
      function (userConfigs, commandOptions) {
        if (
          commandOptions?.name === COMMAND_NAME ||
          (commandOptions?.name == null &&
            commandOptions?.args?.[0] === COMMAND_NAME)
        ) {
          return []
        } else {
          return userConfigs
        }
      }
    )
  }

  apply(runner: Runner): void {
    this.runner = runner

    // 如果是调用的当前命令, 跳过校验用户配置
    // 原因为当前命令无用户配置
    runner.hooks.shouldValidateUserConfig.tap(this.name, function () {
      if (runner.commandName === COMMAND_NAME) return false
    })

    runner.hooks.cli.tap(this.name, (cli) => {
      const command = cli.command(
        `${COMMAND_NAME} <action>`,
        '清理 mor 清理缓存/临时目录'
      )

      command.action((opts) => this.runClean(opts))
      command.usage('clean <cache|temp|all>  清理缓存/临时目录')
    })
  }

  private async runClean(command: CommandOptions) {
    const action = command?.args?.[0]

    if (action === 'cache') {
      await this.cleanCache()
    } else if (action === 'temp') {
      await this.cleanTemp()
    } else if (action === 'all') {
      await this.cleanCache()
      await this.cleanTemp()
    } else {
      logger.error('不支持的 clean 操作')
    }
  }

  /**
   * 获取相对目录 基于 cwd
   */
  private getRelativeDir(targetDir: string) {
    // 显示相对目录, 若包含 . 则代表缓存目录不在当前 cwd 内
    const dir = path.relative(this.runner.config.cwd, targetDir)
    return dir.startsWith('.') ? targetDir : dir
  }

  /**
   * 清理临时目录
   */
  private async cleanTemp() {
    const tempDir = this.runner.config.getTempDir()

    logger.info(`临时目录地址: ${this.getRelativeDir(tempDir)}`)

    const loading = logger.createLoading('清理中 ...').start()

    await delay(async () => {
      loading.stop()
      try {
        await fs.ensureDir(tempDir)
        await fs.emptyDir(tempDir)
        loading.success('临时目录清理成功!')
      } catch (error) {
        loading.fail('临时目录清理失败!', { error })
      }
    })
  }

  /**
   * 清理缓存目录
   */
  private async cleanCache() {
    const cacheDir = this.runner.config.getCacheDir()

    logger.info(`缓存目录地址: ${this.getRelativeDir(cacheDir)}`)

    const loading = logger.createLoading('清理中 ...').start()

    await delay(async () => {
      loading.stop()
      try {
        await fs.ensureDir(cacheDir)
        await fs.emptyDir(cacheDir)
        loading.success('缓存清理成功!')
      } catch (error) {
        loading.fail('缓存清理失败!', { error })
      }
    })
  }
}
