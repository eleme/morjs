import * as t from '@babel/types'
import { DataBindingNode } from '../ast/types'

export function databindingForAttribute(databinding: DataBindingNode) {
  if (databinding.hasBinding) {
    return t.jsxExpressionContainer(databinding.getExpressionAst())
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
