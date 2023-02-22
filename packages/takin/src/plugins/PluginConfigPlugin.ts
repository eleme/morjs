import { PluginTypes } from '../config'
import { UserConfigSchema } from '../constants'
import type { Plugin } from '../plugin'
import type { Runner } from '../runner'

/**
 * 提供插件配置能力
 * - 提供 userConfig.plugins 配置校验
 * - 提供 `--plugins` 命令行支持
 * - 提供 `${CLI_NAME}_PLUGINS` 环境变量支持，需开启 env 支持，如 TAKIN_PLUGINS=plugin1,plugin2
 */
export default class PluginConfigPlugin implements Plugin {
  name = 'TakinPluginConfigPlugin'

  constructor(
    public options: {
      /**
       * 是否开启通过命令行或环境变量载入插件支持，默认为 false
       */
      loadCliOrEnvPlugins: boolean
      /**
       * 是否注册 plugins 的用户配置，默认为 true
       */
      registerPluginSchema: boolean
    } = { loadCliOrEnvPlugins: false, registerPluginSchema: true }
  ) {}

  apply(runner: Runner): void {
    runner.hooks.cli.tap(this.name, function (cli) {
      cli.option(
        '--plugins <plugins>',
        '指定需要运行的插件, 如: plugin1,plugin2'
      )
    })

    // 载入命令行或环境变量中指定的插件
    // 优先级：命令行 > 环境变量
    if (this.options?.loadCliOrEnvPlugins) {
      runner.hooks.loadConfig.tap(this.name, (command) => {
        const cliName = runner.config?.name?.replace?.(/[^a-zA-Z_]/g, '_') || ''
        const ENV_PLUGINS = cliName ? `${cliName.toUpperCase()}_PLUGINS` : ''
        let pluginNames = command?.options?.plugins
        if (!pluginNames && ENV_PLUGINS) {
          pluginNames = runner.config.env.get(ENV_PLUGINS)
        }
        if (!pluginNames || typeof pluginNames !== 'string') return
        const plugins = runner.config.env.arrayify(pluginNames)
        runner.config.usePlugins(plugins, PluginTypes.cli)
      })
    }

    // 注册用户配置 plugins 校验
    if (this.options?.registerPluginSchema) {
      runner.hooks.registerUserConfig.tap(this.name, function (schema) {
        return schema.extend({
          plugins: UserConfigSchema.plugins
        })
      })
    }
  }
}
