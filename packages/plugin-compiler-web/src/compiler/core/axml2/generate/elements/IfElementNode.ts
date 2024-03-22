import { babelTypes as t } from '@morjs/utils'
import { ElseIfElementNode, IfElementNode } from '../../ast/types'
import { stripJsxExpresion } from '../../babel-helper'
import Context from '../context'
import { checkDataBinding } from '../error'
import { addBracketToIdentifier, getOptionalChainExpression } from '../utils'
import transformElement from './index'

export default function (node: IfElementNode, context: Context) {
  checkDataBinding(node.expresion, 'if')
  context.mergeDatabindingVars(node.expresion)

  const ifExp = getOptionalChainExpression(node.expresion.getExpressionAst())
  const ifConditionalExpression = t.conditionalExpression(
    addBracketToIdentifier(ifExp),
    stripJsxExpresion(transformElement(node.ifElement, context)),
    t.booleanLiteral(false)
  )
  let lastConditionalExpression = ifConditionalExpression
  if (node.elseIfElements.length > 0) {
    node.elseIfElements.forEach((el) => {
      const exp = elseIfElementNode(el, context)
      lastConditionalExpression.alternate = exp
      lastConditionalExpression = exp
    })
  }

  if (node.elseElement) {
    lastConditionalExpression.alternate = stripJsxExpresion(
      transformElement(node.elseElement.element, context)
    )
  }

  return t.jsxExpressionContainer(ifConditionalExpression)
}

function elseIfElementNode(node: ElseIfElementNode, context: Context) {
  checkDataBinding(node.expresion, 'else if')
  context.mergeDatabindingVars(node.expresion)

  const ifExp = getOptionalChainExpression(node.expresion.getExpressionAst())
  return t.conditionalExpression(
    addBracketToIdentifier(ifExp),
    stripJsxExpresion(transformElement(node.element, context)),
    t.booleanLiteral(false)
  )
}
