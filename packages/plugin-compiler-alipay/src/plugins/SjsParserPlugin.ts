import {
  EntryBuilderHelpers,
  Plugin,
  Runner,
  SourceTypes,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import { getModuleExportsName, isSimilarTarget } from '../constants'

/**
 * 支付宝 sjs 文件转译
 */
export default class AlipayCompilerSjsParserPlugin implements Plugin {
  name = 'AlipayCompilerSjsParserPlugin'

  entryBuilder: EntryBuilderHelpers

  apply(runner: Runner) {
    runner.hooks.beforeRun.tap(this.name, () => {
      const { sourceType, target } = runner.userConfig

      // 仅当 sjs 是微信时执行该处理
      if (sourceType === SourceTypes.wechat)
        return this.transformCommonjsToESModule(runner)
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

  /**
   * 微信转支付宝的场景下 ，wxs 内联文件中使用 module.exports.var 在支付宝中无法正常通过 name.var 调用，
   * 需要将这种场景下的导出进行拓展，增加 module.exports = {}, 这样在 webpack 打包时就可以正确导出 export default 文件
   */
  transformCommonjsToESModule(runner: Runner) {
    runner.hooks.sjsParser.tap(
      this.name,
      (transformers: ts.CustomTransformers, options) => {
        if (
          options.fileInfo.content.includes('module.exports.') &&
          !(
            options.fileInfo.content.includes('module.exports =') ||
            options.fileInfo.content.includes('module.exports=')
          )
        ) {
          // 提取 module.exports.var 中的变量名
          const names = getModuleExportsName(options.fileInfo.content)
          if (names.length <= 0 || names.indexOf('default') > -1)
            return transformers

          transformers.after.push(
            tsTransformerFactory((node, ctx) => {
              const factory = ctx.factory

              if (ts.isSourceFile(node)) {
                return factory.updateSourceFile(node, [
                  ...node.statements,
                  factory.createExportAssignment(
                    void 0,
                    void 0,
                    void 0,
                    factory.createObjectLiteralExpression(
                      names.map((name) =>
                        factory.createShorthandPropertyAssignment(
                          factory.createIdentifier(name)
                        )
                      )
                    )
                  )
                ])
              }

              return node
            })
          )
        }

        return transformers
      }
    )
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
