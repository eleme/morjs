import * as t from '@babel/types'
import { IncludeNode } from '../../ast/types'
import Context from '../context'

export default function (node: IncludeNode, context: Context) {
  const fileName = context.options.isAtomicMode ? `${node.src}.js` : node.src
  return t.jsxExpressionContainer(
    t.callExpression(
      t.memberExpression(
        t.callExpression(t.identifier('require'), [t.stringLiteral(fileName)]),
        t.identifier('defaultRender')
      ),
      [t.identifier('$data')]
    )
  )
}
