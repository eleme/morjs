import * as t from '@babel/types'
import { RefAttributeNode } from '../../ast/types'
import Context from '../context'
import { databindingForValue } from '../helper-databinding'

export default function (_, att: RefAttributeNode, context: Context) {
  context.mergeDatabindingVars(att.value)

  // if (att.name === 'ref') {
  //   att.value = `{{ $rm.ref(${dealBinding(att.value, context).getTextForVar()}, $data) }}`;
  // }

  return t.jsxAttribute(
    t.jsxIdentifier('ref'),
    t.jsxExpressionContainer(
      t.callExpression(
        t.memberExpression(t.identifier('$rm'), t.identifier('ref')),
        [databindingForValue(att.value), t.identifier('$data')]
      )
    )
  )
}
