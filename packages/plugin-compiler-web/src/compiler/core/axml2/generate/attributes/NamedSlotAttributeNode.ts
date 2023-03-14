import { babelTypes as t } from '@morjs/utils'
import { NamedSlotAttributeNode } from '../../ast/types'

export default function (_, att: NamedSlotAttributeNode) {
  return t.jsxAttribute(t.jsxIdentifier('_slot'), t.stringLiteral(att.name))
}
