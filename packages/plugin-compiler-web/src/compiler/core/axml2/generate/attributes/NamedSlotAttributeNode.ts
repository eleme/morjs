import { babelTypes as t } from '@morjs/utils'
import { NamedSlotAttributeNode } from '../../ast/types'
import Context from '../context'
import { databindingForAttribute } from '../helper-databinding'

export default function (_, att: NamedSlotAttributeNode, context: Context) {
  context.mergeDatabindingVars(att.name)

  return t.jsxAttribute(
    t.jsxIdentifier('_slot'),
    databindingForAttribute(att.name)
  )
}
