import { Takin } from './takin'

/**
 * 创建 Takin 实例
 * @param name - cli 命令名称
 */
const takin = (name: string): Takin => new Takin(name)

// 为了方便引用, 将所有方法全部 export
export * from './cli'
export * from './config'
export * from './constants'
export * from './deps'
export * as downloader from './downloader'
export * from './environment'
export * from './generator'
export * from './logger'
export * from './plugin'
export * from './runner'
export * from './takin'
export * from './types'
export * from './utils'
export { takin }
export default takin

// commonjs 支持
if (typeof module !== 'undefined') {
  Object.assign(takin, module.exports)
  module.exports = takin
}
