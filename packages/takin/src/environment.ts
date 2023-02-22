import dotenv from 'dotenv'
import { omit } from 'lodash'
import { logger } from './logger'
import { asArray } from './utils'

export type EnvironmentOptions = dotenv.DotenvConfigOptions & {
  /**
   * false 值配置，用于判断哪些值等同于 false，默认为 ['', 'none', 'false', '0', 'undefined', 'null']
   */
  falsyValues?: string[]
  /**
   * 数组分隔符，用于将特定环境变量分割为字符串数组，默认为 [',', ' ']
   */
  arraySeparators?: string[]
}

/**
 * 环境变量支持，用于统一环境变量的获取、解析和值判断
 */
export class Environment {
  public options: EnvironmentOptions = {
    override: true,
    falsyValues: ['', 'none', 'false', '0', 'undefined', 'null'],
    arraySeparators: [',', ' ']
  }

  private parsedEnv: Record<string, string | undefined> = {}

  /**
   * 是否已开启 env 支持
   */
  private enabled = false

  /**
   * 开启 env 支持
   */
  enable() {
    this.enabled = true
    return this
  }

  /**
   * 关闭 env 支持
   */
  disable() {
    this.enabled = false
    return this
  }

  /**
   * 载入 .env 文件
   */
  load() {
    if (!this.enabled) return
    try {
      this.parsedEnv = {
        ...process.env,
        ...(dotenv.config(
          omit(this.options, ['falsyValues', 'arraySeparators'])
        )?.parsed || {})
      }
    } catch (error) {
      logger.error(`环境变量载入失败，原因: ${error}`, {
        error: error as Error
      })
    }
    return this
  }

  /**
   * 是否包含某个环境变量
   * @param name - 环境变量名称
   * @returns 是否包含环境变量
   */
  has(name: string) {
    return this.get(name) != null
  }

  /**
   * 获取环境变量的值
   * @param name - 环境变量名称
   * @returns 环境变量的值
   */
  get(name: string) {
    return this.parsedEnv?.[name]
  }

  /**
   * 判断环境变量是否为 false，基于 falsyValues 配置
   * @param name - 环境变量名称
   * @returns 返回 `true` 或 `false`
   */
  isFalsy(name: string) {
    const value = this.get(name)
    if (value == null) return false
    if ((this.options?.falsyValues || []).includes(value)) return true
    return false
  }

  /**
   * 判断环境变量是否为 true，基于 falsyValues 配置，当环境变量未配置时为 false
   * @param name - 环境变量名称
   * @returns 返回 `true` 或 `false`
   */
  isTruthy(name: string) {
    return this.has(name) && !this.isFalsy(name)
  }

  /**
   * 将环境变量的值解析为数组并返回，基于 arraySeparators 配置
   * @param name - 环境变量名称
   * @returns 解析后的数组
   */
  array(name: string) {
    return this.arrayify(this.get(name))
  }

  /**
   * 将值解析为数组，基于 arraySeparators 配置
   * @param value - 需要解析的值
   * @returns 解析后的数组
   */
  arrayify(value?: string) {
    if (!this.options?.arraySeparators?.length || value == null)
      return asArray(value) as string[]
    const seperatorPattern = new RegExp(
      `[${this.options.arraySeparators.join('')}]+`,
      'g'
    )
    return value.split(seperatorPattern)
  }
}
