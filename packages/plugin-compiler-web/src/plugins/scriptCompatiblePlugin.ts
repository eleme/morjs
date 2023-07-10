import {
  EntryFileType,
  EntryType,
  logger,
  Plugin,
  Runner,
} from '@morjs/utils'
import path from 'path'

const EXPORT_DEFAULT_REGEXP = /export +default/

/**
 * Script 兼容插件
 * 1. 移除页面或组件 脚本文件中的 export default，原因 转 web 需要使用这种导出方式
 */
export class ScriptCompatiblePlugin implements Plugin {
  name = 'MorWebScriptCompatiblePlugin'
  apply(runner: Runner<any>) {
    runner.hooks.preprocessorParser.tap(this.name, (content, context, options) => {
      if (
        options.fileInfo.entryFileType === EntryFileType.script && (
          options.fileInfo.entryType === EntryType.page ||
          options.fileInfo.entryType === EntryType.component ||
          options.fileInfo.entryType === EntryType.npmComponent
        )
      ) {
        if (EXPORT_DEFAULT_REGEXP.test(content)) {
          const filePath = path.relative(runner.getCwd(), options.fileInfo.path)
          logger.warnOnce(`文件: ${filePath} 中使用了 export default\n` + `该导出方式为 MorJS 转 Web 页面或组件的标准导出方式，已自动移除`)
          return content.replace(EXPORT_DEFAULT_REGEXP, '')
        }
      }

      return content
    })
  }
}
