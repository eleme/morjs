import { logger } from '@morjs/utils'
import { inspect } from 'util'

/**
 * 使用命令行选项覆盖用户配置提示
 */
export function overrideUserConfig<T = Record<string, any>>({
  optionNames,
  commandOptions,
  userConfig
}: {
  /**
   * 需要覆盖的选项名称列表
   */
  optionNames: string[]
  /**
   * 命令行选项
   */
  commandOptions: Record<string, any>
  /**
   * 用户配置
   */
  userConfig: T
}) {
  for (const optionName of optionNames) {
    if (commandOptions?.[optionName] != null) {
      if (
        userConfig?.[optionName] != null &&
        userConfig?.[optionName] !== commandOptions?.[optionName]
      ) {
        logger.warn(
          `用户配置 ${optionName}: ${inspect(
            userConfig[optionName]
          )}, 被命令行参数 --${optionName} 的值 ${inspect(
            commandOptions[optionName]
          )} 覆盖.`,
          {
            color: true
          }
        )
      }
      userConfig[optionName] = commandOptions[optionName]
    }
  }

  return userConfig
}

/**
 * 判断是否为 CI 环境
 */
export function isCIENV() {
  return Boolean(process.env.CI || process.env.CLOUDBUILD)
}
