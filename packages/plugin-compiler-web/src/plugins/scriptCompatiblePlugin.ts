import { EntryFileType, EntryType, logger, Plugin, Runner } from '@morjs/utils'
import path from 'path'

const EXPORT_DEFAULT_REGEXP = /export +default/

/**
 * Script 兼容插件
 * 1. 移除页面或组件 脚本文件中的 export default，原因 转 web 需要使用这种导出方式
 */
export class ScriptCompatiblePlugin implements Plugin {
  name = 'MorWebScriptCompatiblePlugin'
  apply(runner: Runner<any>) {
    runner.hooks.preprocessorParser.tap(
      this.name,
      (content, context, options) => {
        if (
          options.fileInfo.entryFileType === EntryFileType.script &&
          (options.fileInfo.entryType === EntryType.page ||
            options.fileInfo.entryType === EntryType.component ||
            options.fileInfo.entryType === EntryType.npmComponent)
        ) {
          // NOTE: 这里的移除方式相对比较粗暴，后续可以考虑换位 ts 插件来处理
          if (EXPORT_DEFAULT_REGEXP.test(content)) {
            const filePath = path.relative(
              runner.getCwd(),
              options.fileInfo.path
            )
            logger.warnOnce(
              `已自动移除组件或页面的 export default 导出\n` +
                `原因: 该导出方式为 MorJS 转 Web 页面或组件的标准导出方式\n` +
                `文件: ${filePath}`
            )
            return content.replace(EXPORT_DEFAULT_REGEXP, '')
          }
        }

        return content
      }
    )
  }
}
