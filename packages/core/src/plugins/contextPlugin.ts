import type { MorHooks, MorPlugin } from '@morjs/api/lib/hooks'
import { logger } from '@morjs/api/lib/logger'

export interface IAppContext {
  appQuery: Record<string, any>
}

export interface IPageContext extends IAppContext {
  pageQuery: Record<string, any>
}

/**
 * context 插件
 */
export class ContextPlugin implements MorPlugin {
  pluginName = 'MorContextPlugin'

  apply = (hooks: MorHooks): void => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $plugin = this

    hooks.appOnInit.tap(
      this.pluginName,
      function (appOptions: Record<string, any>) {
        if (appOptions.$context) {
          logger.error(
            $plugin.pluginName,
            '请去除业务代码中的对 $context 的赋值，防止出现不可预知的问题。'
          )
        }
      }
    )

    hooks.appOnLaunch.tap(
      this.pluginName,
      function (this: { $context: IAppContext }, options: Record<string, any>) {
        const query = { ...(options?.query || {}) }
        this.$context = { appQuery: query }
      }
    )

    hooks.pageOnInit.tap(
      this.pluginName,
      function (pageOptions: Record<string, any>) {
        if (pageOptions.$context) {
          logger.error(
            $plugin.pluginName,
            '请去除业务代码中的对 $context 的赋值，防止出现不可预知的问题。'
          )
        }
      }
    )

    hooks.pageOnLoad.tap(
      this.pluginName,
      function (this: { $context: IPageContext }, query: Record<string, any>) {
        let appQuery = {}
        if (typeof getApp !== 'undefined' && getApp()?.$context) {
          appQuery = getApp().$context?.appQuery || {}
        }
        this.$context = {
          pageQuery: query,
          appQuery
        }
      }
    )
  }
}
