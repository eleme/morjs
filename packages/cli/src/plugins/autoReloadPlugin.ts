import { fsExtra, logger, Plugin, Takin } from '@morjs/utils'

let IS_RELOADING = false

/**
 * 用户配置文件发生修改时自动重新加载
 */
export default class MorAutoReloadOnConfigChangePlugin implements Plugin {
  name = 'MorAutoReloadOnConfigChangePlugin'

  onUse(mor: Takin) {
    mor.hooks.configLoaded.tap(this.name, function (_, commandOptions) {
      // 仅在用户配置文件存在, 且开启了 watch 的情况下自动重载
      const isWatching =
        commandOptions?.options?.watch || commandOptions?.options?.w

      if (mor.userConfigFilePath && isWatching) {
        logger.debug(`用户配置文件监听中...`, commandOptions)
        const watcher = fsExtra.watch(
          mor.userConfigFilePath,
          async function (event, fileName) {
            if (IS_RELOADING) return

            logger.debug({ fileName, event })
            logger.warn(`配置文件 ${fileName} 发生变更, 自动重启中...\n`)

            try {
              await mor.reload()
              watcher.close()
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

  apply() {
    // do nothing
  }
}
