import { babelTypes as t } from '@morjs/utils'
import { AttributeNode, SlotNode } from '../../ast/types'
import generateAttribute from '../attributes/index'
import Context from '../context'
import { databindingForAttribute } from '../helper-databinding'
import generateElement from './index'

export default function (node: SlotNode, context: Context) {
  context.mergeDatabindingVars(node.name)

  const attributes = node.attributes.map((att) =>
    generateAttribute(node, att, context)
  )
  attributes.push(
    t.jsxAttribute(
      t.jsxIdentifier('slots'),
      t.jsxExpressionContainer(t.identifier('$children'))
    )
  )
  // NOTE: 手动添加绑定变量
  context.dataBindingVars.add('$children')
  if (node.name && node.name.express) {
    attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('name'),
        databindingForAttribute(node.name)
      )
    )
  }

  if (node.attributes.length > 0) {
    attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('$scopeKeys'),
        t.jsxExpressionContainer(
          t.arrayExpression(
            node.attributes.map((att) =>
              t.stringLiteral((att as AttributeNode).name)
            )
          )
        )
      )
    )
  }

  const children = []
  if (node.children.length > 0) {
    children.push(t.jsxText('\r\n'))
    node.children.forEach((item) =>
      children.push(generateElement(item, context))
    )
    children.push(t.jsxText('\r\n'))
  }

  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier('$rm.Slot'),
      attributes,
      children.length === 0
    ),
    t.jsxClosingElement(t.jsxIdentifier('$rm.Slot')),
    children,
    null
  )
}
