import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'

/**
 * 提取对象表达式中的value 对应 名称
 * @param exp
 */
export function takeObjectExpresionValueNames(exp) {
  if (!exp) return null
  const valueNames = []
  try {
    const ast = parser.parse(`(${exp})`)
    traverse(ast, {
      ObjectProperty(path) {
        // 检索出引用标识符
        if (t.isIdentifier(path.node.value)) {
          valueNames.push(path.node.value.name)
        }
      }
    })
  } catch (e) {}
  return valueNames
}

/**
 * 剥离jsx 表达式
 */
export function stripJsxExpresion(ast) {
  if (t.isJSXExpressionContainer(ast)) {
    return ast.expression
  }
  return ast
}
