import { babelTypes as t } from '@morjs/utils'
import { ForElementNode } from '../../ast/types'
import Context from '../context'
import { checkDataBinding } from '../error'
import { getOptionalChainExpression } from '../utils'
import transformElement from './index'

export default function (node: ForElementNode, context: Context) {
  checkDataBinding(node.expresion)
  context.mergeDatabindingVars(node.expresion)

  const contentElement = transformElement(node.element, context)
  const body = t.isJSXExpressionContainer(contentElement)
    ? contentElement.expression
    : contentElement
  return t.jsxExpressionContainer(
    t.callExpression(
      t.memberExpression(
        t.callExpression(
          t.memberExpression(t.identifier('$rm'), t.identifier('getForValue')),
          [getOptionalChainExpression(node.expresion.bindingExpression)]
        ),
        t.identifier('map')
      ),
      [
        t.arrowFunctionExpression(
          [
            t.identifier(node.item || 'item'),
            t.identifier(node.index || 'index')
          ],
          body
        )
      ]
    )
  )
}
