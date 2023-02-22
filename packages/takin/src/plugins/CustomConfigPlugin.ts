import _ from 'lodash'
import type { Plugin } from '../plugin'
import type { Runner } from '../runner'

type ConfigLoadedCallback = (runner: Runner) => Promise<void>

/**
 * 自定义配置文件插件
 * 1. 添加 -c, --config 全局 cli option
 * 2. 添加 --ignore-config 全局 cli option
 * 3. 提供配置载入功能
 * 4. 提供插件自动载入支持
 */
export default class CustomConfigPlugin implements Plugin {
  name = 'TakinCustomConfigPlugin'

  // 是否加载用户配置文件
  shouldLoadConfig: boolean

  onConfigLoaded?: ConfigLoadedCallback

  constructor(shouldLoadConfig = false, onConfigLoaded?: ConfigLoadedCallback) {
    this.shouldLoadConfig = shouldLoadConfig
    this.onConfigLoaded = onConfigLoaded
  }

  apply(runner: Runner): void {
    const {
      optionName,
      optionNameAlias,
      supportConfigExtensions,
      supportConfigNames
    } = runner.config

    // 添加 config 命令行支持
    runner.hooks.cli.tap(this.name, function (cli) {
      // 自定义配置
      if (optionName) {
        const aliasOption = optionNameAlias ? `-${optionNameAlias}` : ''
        let option = optionName ? `--${optionName}` : ''
        if (aliasOption && option) option = `${aliasOption}, ${option}`

        const example = supportConfigNames[0] + supportConfigExtensions[0]

        // --config, -c 配置
        cli.option(
          `${option} <path>`,
          `指定自定义配置文件路径, 支持 ${supportConfigExtensions.join(
            ', '
          )} 等类型, 如 ${example}`
        )

        cli.option(`--ignore-${optionName}`, '忽略或不自动载入用户配置文件')
      }

      cli.option('--no-autoload-plugins', '关闭自动载入插件功能')
    })

    if (!this.shouldLoadConfig) return

    // 加载配置文件，并完成自动载入插件的逻辑
    runner.hooks.loadConfig.tapPromise(this.name, async (command) => {
      // 忽略配置的情况下, 不载入用户配置
      const ignoreConfigField = _.camelCase(`ignore-${optionName}`)
      const opts = command?.options || {}

      // 主动忽略配置载入
      if (optionName && opts[ignoreConfigField] === true) {
        runner.logger.debug(
          `已忽略用户配置文件载入, 原因为: 开启了 --ignore-${optionName}`
        )
        return
      }

      // 当显示版本信息或者帮助信息时, 不自动载入配置
      const isShowHelpOrVersionInfo =
        opts.v || opts.version || opts.h || opts.help
      if (isShowHelpOrVersionInfo) {
        runner.logger.debug(
          `已忽略用户配置文件载入, 原因为: 显示帮助信息或版本信息`
        )
        return
      }

      // 获取配置文件地址
      let configFile = command?.options?.[optionName]
      if (!configFile && optionNameAlias)
        configFile = command?.options?.[optionNameAlias]

      // 载入用户配置文件
      await runner.config.loadConfigFromFile(configFile)

      // 自动载入匹配规则的插件，未配置 patterns 的时候，不执行该逻辑
      // 仅当未关闭该功能时执行
      if (command?.options?.autoloadPlugins !== false) {
        await runner.config.autoLoadPlugins()
      }

      // 触发回调
      if (this.onConfigLoaded) await this.onConfigLoaded(runner)
    })
  }
}
