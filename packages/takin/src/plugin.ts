import type { Runner } from './runner'
import type { Takin } from './takin'
import { ObjectValues } from './types'
import { objectEnum } from './utils'

export const PluginEnforceTypes = objectEnum(['pre', 'post'])

/**
 * 插件接口定义
 */
export interface Plugin {
  /**
   * 插件名称
   */
  name: string

  /**
   * 插件版本
   */
  version?: string

  /**
   * 插件执行顺序:
   * - `设置为 enforce: 'pre'` 的插件
   * - 通过 takin.use 传入的插件
   * - 普通插件
   * - 设置为 `enforce: 'post'` 的插件
   */
  enforce?: ObjectValues<typeof PluginEnforceTypes>

  /**
   * 插件回调函数: 当插件通过 takin 实例的 use 方法载入时自动触发, 并传入当前命令行的实例
   */
  onUse?: (takin: Takin) => void

  /**
   * 执行 Runner 插件逻辑, 通过 Hooks 来干预不同的阶段
   */
  apply: (runner: Runner) => void
}
