import {
  EntryBuilderHelpers,
  Plugin,
  Runner,
  SourceTypes,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import { isSimilarTarget } from '../constants'

/**
 * 支付宝 sjs 文件转译
 */
export default class AlipayCompilerSjsParserPlugin implements Plugin {
  name = 'AlipayCompilerSjsParserPlugin'

  entryBuilder: EntryBuilderHelpers

  apply(runner: Runner) {
    runner.hooks.beforeRun.tap(this.name, () => {
      const { sourceType, target } = runner.userConfig

      // 仅当 sjs 是 支付宝 源码 且 编译目标不是 支付宝小程序 时执行该插件
      if (sourceType !== SourceTypes.alipay) return
      if (sourceType === target) return
      if (isSimilarTarget(target)) return

      runner.hooks.beforeBuildEntries.tap(this.name, (entryBuilder) => {
        this.entryBuilder = entryBuilder
      })

      runner.hooks.sjsParser.tap(this.name, (transformers, options) => {
        this.removeEsModuleMarkAndFixVoidZeroExpression(transformers)

        if (
          options.fileInfo.content.includes('import') ||
          options.fileInfo.content.includes('export')
        ) {
          this.transformESModuleToCommonjs(transformers)
        }

        return transformers
      })
    })
  }

  transformESModuleToCommonjs(transformers: ts.CustomTransformers) {
    transformers.before.push(
      tsTransformerFactory((node, ctx) => {
        const factory = ctx.factory

        /**
         * export {} 替换为 module.exports
         */
        if (ts.isExportAssignment(node)) {
          const expression = node.expression

          return factory.createExpressionStatement(
            factory.createBinaryExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier('module'),
                factory.createIdentifier('exports')
              ),
              factory.createToken(ts.SyntaxKind.EqualsToken),
              expression
            )
          )
        }

        /**
         * 处理 export default function name() {} 的情况
         * 原因： 微信不支持 exports.default = name 这种语法，会报错
         * 这里转换为 module.exports = function name() {}
         */
        if (ts.isFunctionDeclaration(node) && node.modifiers?.length) {
          const exportKeyword = node.modifiers[0]
          const exportDefaultKeyword = node.modifiers[1]
          if (
            ts.isToken(exportKeyword) &&
            exportKeyword.kind === ts.SyntaxKind.ExportKeyword &&
            ts.isToken(exportDefaultKeyword) &&
            exportDefaultKeyword.kind === ts.SyntaxKind.DefaultKeyword
          ) {
            return factory.createExpressionStatement(
              factory.createBinaryExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('module'),
                  factory.createIdentifier('exports')
                ),
                factory.createToken(ts.SyntaxKind.EqualsToken),
                factory.createFunctionExpression(
                  undefined,
                  node.asteriskToken,
                  node.name,
                  node.typeParameters,
                  node.parameters,
                  node.type,
                  node.body
                )
              )
            )
          }
        }

        return node
      })
    )
  }

  /**
   * 支付宝小程序的 sjs 是 esmodule
   * 这里主要是用于处理 esmodule 转换为 commonjs 之后的兼容性问题
   */
  removeEsModuleMarkAndFixVoidZeroExpression(
    transformers: ts.CustomTransformers
  ) {
    transformers.after.push(
      tsTransformerFactory((node, ctx) => {
        /**
         * 移除表达式:
         *   Object.defineProperty(exports, "__esModule", { value: true })
         */
        if (
          ts.isExpressionStatement(node) &&
          ts.isCallExpression(node.expression) &&
          ts.isPropertyAccessExpression(node.expression.expression) &&
          ts.isIdentifier(node.expression.expression.expression) &&
          node.expression.expression.expression.escapedText === 'Object' &&
          ts.isIdentifier(node.expression.expression.name) &&
          node.expression.expression.name.escapedText === 'defineProperty' &&
          node.expression.arguments.length &&
          ts.isIdentifier(node.expression.arguments[0]) &&
          node.expression.arguments[0].escapedText === 'exports'
        ) {
          return undefined
        }

        /*
         * 在微信的 wxs 中, 存在如下 BUG
         * x = a === void 0 ? [] : a 这样的三目运算符会返回 true 而不是表达式中的值
         * 经过测试是 void 0 引起的，为了兼容这个问题，统一改为 undefined
         */
        if (
          ts.isVoidExpression(node) &&
          ts.isNumericLiteral(node.expression) &&
          node.expression.text === '0'
        ) {
          return ctx.factory.createIdentifier('undefined')
        }

        return node
      })
    )
  }
}
