import { logger, Plugin, Runner, Takin } from '@morjs/utils'
import Youch from 'youch'
import youchTerminal from 'youch-terminal'

/**
 * 错误信息格式化插件，便于用户排错
 */
export default class MorPrettyErrorPlugin implements Plugin {
  name = 'MorPrettyErrorPlugin'

  onUse(mor: Takin) {
    // 启动时也注入错误处理支持
    mor.hooks.prepare.tap(this.name, function (options) {
      options.plugins = options.plugins || []
      options.plugins.push(new MorPrettyErrorPlugin())
    })
  }

  apply(runner: Runner): void {
    runner.hooks.failed.tapPromise(this.name, async function (error: Error) {
      if (error?.stack) {
        try {
          const youch = new Youch(error, {})
          const jsonError = await youch.toJSON()
          const errorMessage = (
            youchTerminal(jsonError, {
              hideErrorTitle: true,
              hideMessage: true,
              displayShortPath: true
            }) || ''
          ).trim()
          if (errorMessage) logger.error(errorMessage)
        } catch (error) {
          logger.debug('尝试输出 pretty error log 失败, 原因:', error)
        }
      } else {
        logger.debug('缺少 stack 错误信息，跳过输出 pretty error log')
      }
    })
  }
}
