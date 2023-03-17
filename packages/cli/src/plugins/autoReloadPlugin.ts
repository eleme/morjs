import { fsExtra, logger, Plugin, Takin } from '@morjs/utils'
import { createHash } from 'crypto'

let IS_RELOADING = false
let CONFIG_FILE_HASH = ''

/**
 * 用户配置文件发生修改时自动重新加载
 */
export default class MorAutoReloadOnConfigChangePlugin implements Plugin {
  name = 'MorAutoReloadOnConfigChangePlugin'

  onUse(mor: Takin) {
    mor.hooks.configLoaded.tapPromise(this.name, async (_, commandOptions) => {
      // 仅在用户配置文件存在, 且开启了 watch 的情况下自动重载
      const isWatching =
        commandOptions?.options?.watch || commandOptions?.options?.w

      if (mor.userConfigFilePath && isWatching) {
        CONFIG_FILE_HASH = await this.computeFileHash(mor.userConfigFilePath)

        logger.debug(`用户配置文件监听中...`, commandOptions)
        const watcher = fsExtra.watch(
          mor.userConfigFilePath,
          async (event, fileName) => {
            if (IS_RELOADING) return

            const newFileHash = await this.computeFileHash(
              mor.userConfigFilePath
            )
            if (CONFIG_FILE_HASH === newFileHash) {
              logger.debug('忽略用户配置变更监听，内容未变化')
              return
            }

            CONFIG_FILE_HASH = newFileHash

            IS_RELOADING = true

            logger.debug({ fileName, event })
            logger.warn(`配置文件 ${fileName} 发生变更, 自动重启中...\n`)

            try {
              watcher.close()
              await mor.reload()
            } catch (error) {
              logger.error('自动重启失败, 请尝试手动重启。', { error })
            } finally {
              IS_RELOADING = false
            }
          }
        )
      }
    })
  }

  async computeFileHash(filePath: string) {
    const fileData = (await fsExtra.readFile(filePath)).toString()
    return createHash('md5').update(fileData).digest('hex')
  }

  apply() {
    // do nothing
  }
}
