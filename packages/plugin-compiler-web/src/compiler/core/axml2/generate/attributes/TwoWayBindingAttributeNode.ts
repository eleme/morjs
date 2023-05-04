import { babelTypes as t } from '@morjs/utils'
import { ClassAttributeNode } from '../../ast/types'
import Context from '../context'
import { databindingForAttribute } from '../helper-databinding'

export default function (_, att: ClassAttributeNode, context: Context) {
  context.mergeDatabindingVars(att.value)
  return t.jsxAttribute(
    t.jsxIdentifier('value'),
    databindingForAttribute(att.value)
  )
}
