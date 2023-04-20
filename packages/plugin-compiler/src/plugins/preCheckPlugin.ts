import {
  EntryType,
  logger,
  Plugin,
  Runner,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import { CompilerUserConfig, COMPILE_COMMAND_NAME } from '../constants'

const SOURCETYPE_CORE_CORRESPONDENCE = {
  origin: ['App', 'Page', 'Component'],
  alipay: ['aApp', 'aPage', 'aComponent'],
  wechat: ['wApp', 'wPage', 'wComponent']
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
        const { path, entryType } = options.fileInfo

        if (
          [EntryType.app, EntryType.page, EntryType.component].includes(
            entryType
          )
        ) {
          this.isCoreSameSourceType(transformers, sourceType, path)
        }

        return transformers
      })
    })
  }

  // 运行时 core 和 配置的 sourceType 类型是否一致
  isCoreSameSourceType(
    transformers: ts.CustomTransformers,
    sourceType: string,
    path: string
  ) {
    transformers.before.push(
      tsTransformerFactory((node) => {
        if (!node) return node

        if (
          ts.isExpressionStatement(node) &&
          ts.isCallExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression)
        ) {
          const { escapedText } = node.expression.expression
          if (
            escapedText &&
            !SOURCETYPE_CORE_CORRESPONDENCE.origin.includes(escapedText) &&
            !SOURCETYPE_CORE_CORRESPONDENCE[sourceType].includes(escapedText)
          ) {
            logger.warn(
              `文件 ${path} 运行时使用的 ${escapedText} 与配置项中 DSL 类型 ${sourceType} 不匹配，请检查并更改`
            )
          }
        }

        return node
      })
    )
  }
}
