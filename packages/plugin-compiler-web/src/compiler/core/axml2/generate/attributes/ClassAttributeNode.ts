import { babelTypes as t } from '@morjs/utils'
import { isGlobalComponent } from '../../../option'
import { ClassAttributeNode } from '../../ast/types'
import Context from '../context'
import { databindingForAttribute } from '../helper-databinding'

export default function (_, att: ClassAttributeNode, context: Context) {
  context.mergeDatabindingVars(att.value)
  if (_.type === 'ElementNode' && isGlobalComponent(_.name, context.options)) {
    return t.jsxAttribute(
      t.jsxIdentifier('class'),
      databindingForAttribute(att.value)
    )
  }
  return t.jsxAttribute(
    t.jsxIdentifier('className'),
    databindingForAttribute(att.value)
  )
}
