import {
  Plugin,
  Runner,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'

/**
 * SJS 兼容插件
 * 1. wxs 或 sjs 的 constructor 返回的是对象的类型, 不符合 web 规范, 这里做自动转换
 * 2. 提供 getRegExp 和 getDate 方法转换支持
 */
export class SjsCompatiblePlugin implements Plugin {
  name = 'MorWebSjsCompatiblePlugin'
  apply(runner: Runner<any>) {
    runner.hooks.sjsParser.tap(this.name, (transformers) => {
      transformers.before.push(
        tsTransformerFactory(function (node, context) {
          if (!node) return node

          const factory = context.factory

          // 替换 abc.constructor 表达式为
          // Object.prototype.toString.call(abc).slice(8, -1)
          if (
            ts.isPropertyAccessExpression(node) &&
            node.name &&
            node.name.escapedText === 'constructor'
          ) {
            return factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createCallExpression(
                  factory.createPropertyAccessExpression(
                    factory.createPropertyAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier('Object'),
                        factory.createIdentifier('prototype')
                      ),
                      factory.createIdentifier('toString')
                    ),
                    factory.createIdentifier('call')
                  ),
                  undefined,
                  [node.expression]
                ),
                factory.createIdentifier('slice')
              ),
              undefined,
              [
                factory.createNumericLiteral('8'),
                factory.createPrefixUnaryExpression(
                  ts.SyntaxKind.MinusToken,
                  factory.createNumericLiteral('1')
                )
              ]
            )
          }

          // 替换 getRegExp 或 getDate 方法分别为
          // new RegExp 或 new Date
          if (
            ts.isCallExpression(node) &&
            node.expression &&
            ts.isIdentifier(node.expression)
          ) {
            if (node.expression.getText() === 'getRegExp') {
              return factory.createParenthesizedExpression(
                factory.createNewExpression(
                  factory.createIdentifier('RegExp'),
                  undefined,
                  node.arguments
                )
              )
            } else if (node.expression.getText() === 'getDate') {
              return factory.createParenthesizedExpression(
                factory.createNewExpression(
                  factory.createIdentifier('Date'),
                  undefined,
                  node.arguments
                )
              )
            }
          }

          return node
        })
      )

      return transformers
    })
  }
}
