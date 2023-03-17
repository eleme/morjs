import { babelTypes as t } from '@morjs/utils'
import { SlotScopeNode } from '../../ast/types'
import Context from '../context'
import transformElement from './index'

export default function (node: SlotScopeNode, context: Context) {
  const contentElement = transformElement(node.element, context)

  const f = t.functionExpression(
    null,
    [t.identifier(node.value)],
    t.blockStatement([t.returnStatement(contentElement)])
  )

  return t.jsxExpressionContainer(
    t.callExpression(
      t.memberExpression(t.identifier('$rm'), t.identifier('slotScope')),
      [f, t.stringLiteral(node.slot || '')]
    )
  )
}
