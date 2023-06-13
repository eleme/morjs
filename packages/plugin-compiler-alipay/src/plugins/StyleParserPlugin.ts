import {
  cssProcessorFactory,
  logger,
  Plugin,
  Runner,
  SourceTypes
} from '@morjs/utils'
import { isSimilarTarget } from '../constants'

const UNSUPPORT_SELECTOR_REGEXP = /(\s+[>|+]\s+)|\*|\~/

/**
 * 支付宝 样式 文件转译
 */
export default class AlipayCompilerStyleParserPlugin implements Plugin {
  name = 'AlipayCompilerStyleParserPlugin'

  apply(runner: Runner) {
    runner.hooks.beforeRun.tap(this.name, () => {
      const { sourceType, target } = runner.userConfig

      // 仅当 样式文件 是 支付宝 源码 且 编译目标不是 支付宝小程序 时执行该插件
      if (sourceType !== SourceTypes.alipay) return
      if (sourceType === target) return
      if (isSimilarTarget(target)) return

      runner.hooks.styleParser.tap(this.name, (plugins, options) => {
        return plugins.concat(
          cssProcessorFactory(this.name, (root) => {
            root.walkRules((rule) => {
              if (
                rule.selectors.filter((selector) =>
                  UNSUPPORT_SELECTOR_REGEXP.test(selector)
                ).length
              ) {
                logger.warnOnce(
                  `当前编译目标 ${target} 中的样式 不支持 "> * + ~" 等选择器\n` +
                    `文件路径: ${options.fileInfo.path}`
                )
              }
            })
          })
        )
      })
    })
  }
}
