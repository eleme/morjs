import { logger, Plugin, Runner, webpack } from '@morjs/utils'
import path from 'path'

/**
 * 实现异步 require 支持
 * 参见: https://developers.weixin.qq.com/miniprogram/dev/reference/api/require.html
 * 由于异步 require 可能请求的是分包中的文件, 会导致 webpack 无法执行静态解析的逻辑
 * 这里通过让 webpack 对 require('filepath', callback) 的调用不做处理来兼容
 * NOTE: 当前的做法有待进一步改进，目前仅仅是忽略的动态引用的处理, 需要进一步处理编译支持
 */
export class DynamicRequireSupportPlugin implements Plugin {
  name = 'DynamicRequireSupportPlugin'
  apply(runner: Runner<any>) {
    const warnDynamicRequireAndProcessRestExpression = function (
      parser: webpack.javascript.JavascriptParser,
      expressions: any,
      requireType: string
    ) {
      const fileName = parser?.state?.module?.nameForCondition?.() || ''
      if (fileName) {
        logger.warnOnce(
          `文件 ${path.relative(
            runner.userConfig?.srcPath,
            fileName
          )} 中包含异步 ${requireType}，将跳过静态解析，请自行保证引用路径的正确`
        )
      }

      // 让 webpack 继续处理函数的参数，确保后续参数中的代码可以被正确处理
      if (expressions) parser.walkExpressions(expressions)
    }
    // require('filepath', callback) 支持
    const parseDynamicRequire = (
      parser: webpack.javascript.JavascriptParser
    ) => {
      parser.hooks.call.for('require').tap(this.name, (expression) => {
        if (expression.type === 'CallExpression') {
          // 如果参数数量为 1 则跳过
          // 暂不检查第一个参数可能为三目运算的情况
          if (expression.arguments.length <= 1) return

          // 从第二个参数开始检查，发现为非 undefined 的值
          // 则认为当前 require 为异步 require
          for (let i = 1; i < expression.arguments.length; i++) {
            const argument = expression.arguments[i]
            // 如果是 void x 同样认为是 undefined
            if (
              argument.type === 'UnaryExpression' &&
              argument.operator === 'void'
            ) {
              continue
            }
            if (
              argument.type === 'Identifier' &&
              argument.name === 'undefined'
            ) {
              continue
            }

            warnDynamicRequireAndProcessRestExpression(
              parser,
              expression.arguments,
              'require'
            )

            return true
          }
        }
      })

      // require.async('filepath') 支持
      parser.hooks.callMemberChainOfCallMemberChain
        .for('require')
        .tap(this.name, (expression, calleeMembers) => {
          if (
            expression.type === 'CallExpression' &&
            calleeMembers?.includes?.('async')
          ) {
            warnDynamicRequireAndProcessRestExpression(
              parser,
              expression.arguments,
              'require.async'
            )

            return true
          }
        })
    }

    runner.hooks.compiler.tap(this.name, (compiler) => {
      compiler.hooks.normalModuleFactory.tap(this.name, (factory) => {
        factory.hooks.parser
          .for('javascript/auto')
          .tap(this.name, parseDynamicRequire)
        factory.hooks.parser
          .for('javascript/dynamic')
          .tap(this.name, parseDynamicRequire)
        factory.hooks.parser
          .for('javascript/esm')
          .tap(this.name, parseDynamicRequire)
      })
    })
  }
}
