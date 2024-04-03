import { Plugin, Runner } from '@morjs/utils'
import { isSimilarTarget } from '../constants'

/**
 * 支付宝 <=> other 自定义 tab-bar 场景目录处理
 * 微信自定义 tab-bar：配置中开启 custom,然后在目录下创建 custom-tab-bar 目录
 * 支付宝自定义 tab-bar: 配置中开启 customize，然后在目录下创建 customize-tab-bar 目录
 */
export default class CustomTabBarPlugin implements Plugin {
  name = 'CustomTabBarPlugin'

  apply(runner: Runner) {
    const { sourceType, target } = runner.userConfig

    if (target === sourceType) return
    // 编译目标同为类支付宝小程序或者同为非类支付宝小程序，直接跳过
    if (isSimilarTarget(target) === isSimilarTarget(sourceType)) return

    const similarAlipayTabBarDir = 'customize-tab-bar'
    const otherTabBarDir = 'custom-tab-bar'
    const sourceTabBarDir = isSimilarTarget(sourceType)
      ? similarAlipayTabBarDir
      : otherTabBarDir
    const targetTabBarDir = isSimilarTarget(target)
      ? similarAlipayTabBarDir
      : otherTabBarDir
    /**
     * 替换字符串中的TabBar目录路径
     * @param {string} param - 需要进行替换操作的字符串
     * @returns {string} 替换后的字符串或原始参数
     */
    const replaceTabBarDir = (param) => {
      if (typeof param !== 'string') return param
      return param.replace(sourceTabBarDir, targetTabBarDir)
    }

    runner.hooks.addEntry.tap(this.name, (entryInfo) => {
      // 使用 startsWith 匹配，将影响范围限制在 srcPath 直接下级目录
      if (entryInfo.name && entryInfo.name.startsWith(sourceTabBarDir)) {
        entryInfo.entry.fullEntryName = replaceTabBarDir(
          entryInfo.entry.fullEntryName
        )
        entryInfo.entry.entryName = replaceTabBarDir(entryInfo.entry.entryName)
        entryInfo.entry.entryDir = replaceTabBarDir(entryInfo.entry.entryDir)
        entryInfo.name = replaceTabBarDir(entryInfo.name)
      }

      return entryInfo
    })
  }
}
