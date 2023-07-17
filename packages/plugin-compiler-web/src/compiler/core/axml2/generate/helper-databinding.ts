import { babelTypes as t } from '@morjs/utils'
import { DataBindingNode } from '../ast/types'

export function databindingForAttribute(databinding: DataBindingNode) {
  if (databinding.hasBinding) {
    const ast = databinding.getExpressionAst()
    if (ast) return t.jsxExpressionContainer(databinding.getExpressionAst())
    return null
  } else {
    if (databinding.express === undefined) {
      return null
    }
    return t.jsxExpressionContainer(t.stringLiteral(databinding.express))
  }
}

export function databindingForValue(databinding: DataBindingNode) {
  if (databinding.hasBinding) {
    return databinding.getExpressionAst()
  } else {
    return t.stringLiteral(databinding.express)
  }
}
