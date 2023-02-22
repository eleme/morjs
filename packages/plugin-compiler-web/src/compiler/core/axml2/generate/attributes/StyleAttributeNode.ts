import * as t from '@babel/types'
import { rpxtorem } from '../../../acss'
import { isGlobalComponent } from '../../../option'
import { StyleAttributeNode } from '../../ast/types'
import Context from '../context'
import { getOptionalChainExpression } from '../utils'

const isCustomElementFunc = (type, name, options) =>
  type === 'ElementNode' && !isGlobalComponent(name, options)

export default function (_, att: StyleAttributeNode, context: Context) {
  context.mergeDatabindingVars(att.value)

  const isCustomElement = isCustomElementFunc(_.type, _.name, context.options)

  if (att.value.hasBinding) {
    return t.jsxAttribute(
      t.jsxIdentifier('style'),
      isCustomElement
        ? t.jsxExpressionContainer(
            getOptionalChainExpression(att.value.getExpressionAst())
          )
        : t.jsxExpressionContainer(
            t.callExpression(
              t.memberExpression(
                t.identifier('$rm'),
                t.identifier('createStyle')
              ),
              [getOptionalChainExpression(att.value.getExpressionAst())]
            )
          )
    )
  } else {
    return t.jsxAttribute(
      t.jsxIdentifier('style'),
      isCustomElement
        ? t.stringLiteral(att.value.express)
        : t.jsxExpressionContainer(
            t.callExpression(
              t.memberExpression(
                t.identifier('$rm'),
                t.identifier('createStyle')
              ),
              [t.stringLiteral(rpxtorem(att.value.express, context.options))]
            )
          )
    )
  }
}
