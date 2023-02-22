import {
  Plugin,
  Runner,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import { CompileModes, CompilerUserConfig } from '../constants'

const primitiveToTSNode = (
  factory: ts.NodeFactory,
  v: string | number | boolean
) => {
  return typeof v === 'string'
    ? factory.createStringLiteral(v)
    : typeof v === 'number'
    ? factory.createNumericLiteral(v + '')
    : typeof v === 'boolean'
    ? v
      ? factory.createTrue()
      : factory.createFalse()
    : undefined
}

const generateDefineIdentifyRegexp = (defineKeys: string[] = []) => {
  return new RegExp(
    defineKeys
      .map((key) => {
        /**
         * 兼容 typeof window 以及 process.env 场景的正则匹配
         */
        if (/typeof\s+\w/.test(key)) {
          return key.replace(/\s/g, '\\s+')
        } else if (/\./.test(key)) {
          return key.replace(/\./g, '\\.')
        }
        return key
      })
      .reduce((a, b) => (a === '' ? b : a + '|' + b), '')
  )
}

/**
 * 实现 transform 模式下 define 支持
 * define 配置参见：http://mor.eleme.io/guides/basic/config#define---%E5%8F%98%E9%87%8F%E6%9B%BF%E6%8D%A2
 *
 * 注意：define 配置仅对 EntryFileType.script 文件类型生效。
 *
 */
export class DefineSupportPlugin implements Plugin {
  name = 'DefineSupportPlugin'
  apply(runner: Runner<any>) {
    runner.hooks.userConfigValidated.tap(
      {
        name: this.name
      },
      (userConfig: CompilerUserConfig) => {
        if (userConfig.compileMode !== CompileModes.transform) return
        if (!userConfig.define) return

        const defineKeys = Object.keys(userConfig.define)
        if (!defineKeys.length) return

        const defines = userConfig.define || {}

        const matchedDefinesInfo = {}

        const definePattern = generateDefineIdentifyRegexp(defineKeys)

        runner.hooks.preprocessorParser.tapPromise(
          {
            name: this.name
          },
          async (fileContent, context, options) => {
            /**
             * 优化编译性能，存储命中 define 配置变量的文件
             */
            matchedDefinesInfo[options.fileInfo.path] =
              definePattern.test(fileContent)
            return fileContent
          }
        )

        runner.hooks.scriptParser.tap(
          {
            name: this.name,
            /**
             * 提高优先级，避免在 alias 插件后触发产生错误
             */
            stage: -99
          },
          function (transformers, options) {
            /**
             * 优化编译性能，过滤不存在 define 配置的文件
             */
            if (!matchedDefinesInfo[options.fileInfo.path]) return transformers

            transformers.before.push(
              tsTransformerFactory(function (node, context) {
                if (!node) return node

                const factory = context.factory
                /**
                 * CASE1：标识符
                 * CASE2：属性获取表达式 示例: process.env.NODE_ENV
                 * CASE3：typeof 运算符 示例: typeof window
                 */
                if (
                  Object.prototype.hasOwnProperty.call(
                    defines,
                    node.getText()
                  ) &&
                  (ts.isIdentifier(node) ||
                    ts.isPropertyAccessExpression(node) ||
                    ts.isTypeOfExpression(node))
                ) {
                  return primitiveToTSNode(factory, defines[node.getText()])
                }

                return node
              })
            )
            return transformers
          }
        )
      }
    )
  }
}
