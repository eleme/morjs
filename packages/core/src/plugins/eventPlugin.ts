import { createEvent, event, logger, MorHooks, MorPlugin } from '@morjs/api'

// 默认 event 使用标记
let IS_DEFAULT_EVENT_USED = false

/**
 * event 插件
 */
export class EventPlugin implements MorPlugin {
  pluginName = 'MorEventPlugin'

  apply = (hooks: MorHooks): void => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $plugin = this

    // 优先使用全局 event
    const $event = IS_DEFAULT_EVENT_USED
      ? createEvent('createByMorEventPlugin')
      : event

    IS_DEFAULT_EVENT_USED = true

    // app 注入 $event
    hooks.appOnInit.tap(
      this.pluginName,
      function (appOptions: Record<string, any>) {
        if (appOptions.$event) {
          logger.error(
            $plugin.pluginName,
            '请去除业务代码中的对 $event 的赋值，防止出现不可预知的问题。'
          )
        }

        appOptions.$event = $event
      }
    )

    // 由于存在非 createApp 初始化的情况，appOnLaunch 的时候补偿加一下
    hooks.appOnLaunch.tap(
      this.pluginName,
      function (this: Record<string, any>) {
        if (!this.$event) this.$event = $event
      }
    )

    // 页面注入 $event
    hooks.pageOnInit.tap(
      this.pluginName,
      function (pageOptions: Record<string, any>) {
        if (pageOptions.$event) {
          logger.error(
            $plugin.pluginName,
            '请去除业务代码中的对 $event 的赋值，防止出现不可预知的问题。'
          )
        }

        pageOptions.$event = $event
      }
    )
  }
}
