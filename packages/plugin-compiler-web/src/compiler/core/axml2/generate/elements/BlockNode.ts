import * as t from '@babel/types'
import { BlockNode } from '../../ast/types'
import transformAttribute from '../attributes/index'
import Context from '../context'
import generateElement from './index'

export default function (node: BlockNode, context: Context) {
  const children = []
  if (node.children.length > 0) {
    children.push(t.jsxText('\r\n'))
    node.children.forEach((item) =>
      children.push(generateElement(item, context))
    )
    children.push(t.jsxText('\r\n'))
  }

  const { attributes = [] } = node
  const attrs: t.JSXAttribute[] = attributes
    .filter((n: any) => n.name === 'key')
    .map((attr) => transformAttribute(node, attr, context))

  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier('$rm.Block'),
      attrs,
      children.length === 0
    ),
    t.jsxClosingElement(t.jsxIdentifier('$rm.Block')),
    children,
    null
  )
}
