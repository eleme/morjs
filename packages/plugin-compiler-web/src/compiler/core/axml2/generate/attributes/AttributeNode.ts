import * as t from '@babel/types'
import { isGlobalComponent } from '../../../option'
import { AttributeNode, Element } from '../../ast/types'
import Context from '../context'
import { databindingForAttribute } from '../helper-databinding'
import { getOptionalChainExpression } from '../utils'

const isBlockNode = (type) => type === 'BlockNode'
const isElementAndInGlobal = (type, name, options) =>
  type === 'ElementNode' && isGlobalComponent(name, options)

export default function (_: Element, att: AttributeNode, context: Context) {
  context.mergeDatabindingVars(att.value)
  const ast = databindingForAttribute(att.value)

  let attName = att.name

  if (!att.value.hasBinding)
    return t.jsxAttribute(t.jsxIdentifier(attName), ast)

  if (
    ast &&
    (isElementAndInGlobal(_.type, _.name, context.options) ||
      isBlockNode(_.type))
  ) {
    // 这种处理是为了解决 dataset传对象的问题
    ast.expression = t.callExpression(
      t.memberExpression(t.identifier('$rm'), t.identifier('toJsonString')),
      [
        getOptionalChainExpression(ast.expression),
        t.booleanLiteral(att.name.startsWith('data-'))
      ]
    )
  } else {
    // 自定义组件的属性，自动将- 转换成驼峰命名
    if (!att.name.startsWith('data-')) {
      attName = attName.replace(/[-\s]+(.)?/g, (m, w) =>
        w ? w.toUpperCase() : ''
      )
    }
    if (ast && ast.expression)
      ast.expression = getOptionalChainExpression(ast.expression)
  }
  return t.jsxAttribute(t.jsxIdentifier(attName), ast)
}
