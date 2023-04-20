import {
  logger,
  Plugin,
  Runner,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import { CompilerUserConfig, COMPILE_COMMAND_NAME } from '../constants'

const SOURCETYPE_CORE_CORRESPONDENCE = {
  origin: { app: 'App', page: 'Page', component: 'Component' },
  alipay: { app: 'aApp', page: 'aPage', component: 'aComponent' },
  wechat: { app: 'wApp', page: 'wPage', component: 'wComponent' }
}

/**
 * 进行编译的相关检查，对不符合要求的进行警告
 * 1. 运行时 core 和 配置的 sourceType 类型是否一致
 */
export class PreCheckPlugin implements Plugin {
  name = 'PreCheckPlugin'
  apply(runner: Runner<any>) {
    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
        const { sourceType } = runner.userConfig as CompilerUserConfig
        const { entryName, entryType, content: fileContent } = options.fileInfo

        const rightCore =
          SOURCETYPE_CORE_CORRESPONDENCE[sourceType]?.[entryType]
        // 与配置 DSL 不一致的运行时
        const oppositeCore =
          SOURCETYPE_CORE_CORRESPONDENCE[this.oppositeSourceType(sourceType)]?.[
            entryType
          ]

        if (rightCore && oppositeCore && fileContent.includes(oppositeCore)) {
          this.isCoreSameSourceType({
            transformers,
            sourceType,
            entryName,
            rightCore,
            oppositeCore
          })
        }

        return transformers
      })
    })
  }

  oppositeSourceType(sourceType) {
    return sourceType === 'alipay'
      ? 'wechat'
      : sourceType === 'wechat'
      ? 'alipay'
      : null
  }

  /**
   * 运行时 core 和 配置的 sourceType 类型是否一致
   * @param transformers
   */
  isCoreSameSourceType({
    transformers,
    sourceType,
    entryName,
    rightCore,
    oppositeCore
  }) {
    transformers.before.push(
      tsTransformerFactory((node) => {
        if (!node) return node

        if (
          ts.isExpressionStatement(node) &&
          ts.isCallExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression)
        ) {
          const { escapedText } = node.expression.expression

          if (escapedText && oppositeCore === escapedText) {
            logger.warn(
              `检测到运行时与用户配置 sourceType 类型 ${sourceType} 不匹配\n` +
                `文件路径：${entryName} \n` +
                `建议修改 ${escapedText} 为 ${rightCore}，否则可能引发非预期的问题`
            )
          }
        }

        return node
      })
    )
  }
}
