import chalk from 'chalk'

/**
 * 用于标记是否支持 color modifier 如: bold strikethrough 等
 * 主要用于 logger 内部
 */
let SUPPORT_COLOR_MODIFIER = chalk.level >= 1 ? true : false
export function disableColorModifierSupport() {
  SUPPORT_COLOR_MODIFIER = false
}
export function enableColorModifierSupport() {
  if (chalk.level >= 1) {
    SUPPORT_COLOR_MODIFIER = true
  }
}
export function isSupportColorModifier() {
  return SUPPORT_COLOR_MODIFIER
}
