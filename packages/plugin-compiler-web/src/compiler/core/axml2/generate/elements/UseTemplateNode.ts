import { babelTypes as t } from '@morjs/utils'
import { UseTemplateNode } from '../../ast/types'
import Context from '../context'
import { checkDataBinding } from '../error'
import { databindingForValue } from '../helper-databinding'

export default function (node: UseTemplateNode, context: Context) {
  if (node.dataExpression && node.dataExpression.express) {
    checkDataBinding(node.dataExpression, 'use tempalte')
  }
  context.mergeDatabindingVars(node.dataExpression)
  context.mergeDatabindingVars(node.templateName)

  const dataExp = node.dataExpression.express
    ? node.dataExpression.getExpressionAst({ forceObject: true })
    : t.objectExpression([])
  if (!t.isObjectExpression(dataExp)) {
    throw new Error('template data 必须是 对象')
  }
  return t.jsxExpressionContainer(
    t.callExpression(
      t.memberExpression(t.identifier('$tm'), t.identifier('renderTemplate')),
      [
        databindingForValue(node.templateName),
        dataExp,
        t.memberExpression(t.identifier('$data'), t.identifier('$reactComp'))
      ]
    )
  )
}
