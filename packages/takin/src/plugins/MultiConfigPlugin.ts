import chalk from 'chalk'
import type { ConfigFilterType } from '../config'
import { NAME_REGEXP, UserConfigSchema } from '../constants'
import { ConfigError } from '../errors'
import type { Plugin } from '../plugin'
import type { Runner } from '../runner'

type ConfigFilteringCallback = (
  runner: Runner,
  filters?: ConfigFilterType
) => Promise<void>

/**
 * 多配置支持插件
 * 1. 注入全局多配置名称 option
 * 2. 命令行多配置指定校验及过滤
 */
export default class MultiConfigPlugin implements Plugin {
  name = 'TakinMultiConfigPlugin'

  // 开启多配置支持的情况下，是否检查配置名称有效性
  shouldCheckConfigNameField: boolean

  // 配置过滤回调
  onFiltering?: ConfigFilteringCallback

  constructor(
    shouldCheckConfigNameField = true,
    onFiltering?: ConfigFilteringCallback
  ) {
    this.shouldCheckConfigNameField = shouldCheckConfigNameField
    this.onFiltering = onFiltering
  }

  apply(runner: Runner): void {
    const {
      name: cliName,
      multipleConfigEnabled,
      multipleConfigNameField
    } = runner.config

    const { shouldCheckConfigNameField } = this

    // 开启多配置支持的情况
    if (multipleConfigEnabled) {
      // 检查是否指定了配置名称对应的字段值
      if (!multipleConfigNameField) {
        throw new ConfigError(
          `缺少有效的配置名称字段, 请通过 ${cliName}.enableMultipleConfig 方法指定`
        )
      }

      // 添加 config 命令行支持
      runner.hooks.cli.tap(this.name, function (cli) {
        cli.option(
          `--${multipleConfigNameField} <configName>`,
          '指定配置名称, 如不指定则代表选择所有配置'
        )
      })

      // 检查名称是否有效
      // 并执行 onFiltering 回调
      runner.hooks.modifyUserConfig.tapPromise(
        this.name,
        async (userConfig, command) => {
          const filters = command?.options?.[multipleConfigNameField]

          const rawConfig = runner.config.userConfig || []
          const allFilters = runner.config.parseFilter(filters)

          // 仅当存在多配置且有筛选条件时检查
          if (rawConfig?.length && allFilters?.size) {
            const validNames: string[] = []

            // 遍历并移除有效的筛选项
            rawConfig.forEach((conf, i) => {
              const name = conf?.[multipleConfigNameField]
              if (name != null && NAME_REGEXP.test(String(name))) {
                validNames.push(name)
              }

              allFilters.delete(name)
              allFilters.delete(String(i))
            })

            // 如果筛选项有剩余, 则代表为无效的筛选项
            if (allFilters.size) {
              const errorMessage = validNames.length
                ? `可选的配置名称有 ${chalk.bold(validNames.join(', '))}`
                : '请检查.'

              throw new ConfigError(
                chalk.red(
                  `未找到配置: ${Array.from(allFilters).join(
                    ', '
                  )}, ${errorMessage}`
                )
              )
            }
          }

          // 触发配置过滤回调
          if (this.onFiltering) await this.onFiltering(runner, filters)

          return userConfig
        }
      )

      // 校验配置字段
      if (shouldCheckConfigNameField) {
        runner.hooks.registerUserConfig.tap(this.name, function (schema) {
          return schema.extend({
            [multipleConfigNameField as string]: UserConfigSchema.name
          })
        })
      }
    }

    // 未开启多配置支持的情况下仅确保 onFiltering 回调的执行即可
    else {
      runner.hooks.modifyUserConfig.tapPromise(
        this.name,
        async (userConfig) => {
          // 触发配置过滤回调
          if (this.onFiltering) await this.onFiltering(runner)
          return userConfig
        }
      )
    }
  }
}
