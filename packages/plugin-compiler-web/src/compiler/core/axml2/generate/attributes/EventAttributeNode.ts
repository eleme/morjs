import * as t from '@babel/types'
import { EventAttributeNode } from '../../ast/types'
import Context from '../context'
import { databindingForValue } from '../helper-databinding'

export default function (_, att: EventAttributeNode, context: Context) {
  context.mergeDatabindingVars(att.value)
  let eventName = att.name
  // 首字母大写
  eventName = eventName.replace(eventName[0], eventName[0].toUpperCase())
  if (att.isCatch) {
    eventName = 'catch' + eventName
  } else {
    eventName = 'on' + eventName
  }

  const value = t.jsxExpressionContainer(
    t.callExpression(
      t.memberExpression(t.identifier('$rm'), t.identifier('getEvent')),
      [databindingForValue(att.value), t.identifier('$data')]
    )
  )
  return t.jsxAttribute(t.jsxIdentifier(eventName), value)
}
