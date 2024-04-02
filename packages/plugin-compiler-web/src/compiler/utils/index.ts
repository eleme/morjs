import { BuildOptions } from '../core/option'

// 生成随机字符串
export function randomString(len = 32) {
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678oOLl9gqVvUuI1'
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

/**
 * 是否启用了样式隔离
 */
export function isEnableStyleScope(options: BuildOptions) {
  if (options.config && options.config.styleScope !== undefined) {
    return options.config.styleScope
  }
  return options.appConfig.styleScope || options.styleScope
}

export function isEnableSelectOwnerComponent(options) {
  if (
    options.userConfig &&
    options.userConfig.web &&
    options.userConfig.web.appConfig &&
    typeof options.userConfig.web.appConfig.apis === 'object'
  ) {
  }
  return !!options.userConfig.web.appConfig.apis.enableSelectOwnerComponent

  return false
}

/**
 * 获取扩展组件
 */
export function getExternalComponent(options, key) {
  const { externalComponents = {} } = options
  return externalComponents[key] || ''
}

export function hasOwnProperty(obj, property) {
  return Object.prototype.hasOwnProperty.call(obj, property)
}
