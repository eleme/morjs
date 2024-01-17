import {
  dataBindingNode,
  NamedSlotAttributeNode,
  namedSlotAttributeNode
} from '../../types'

export default function (
  attName: string,
  value: string
): NamedSlotAttributeNode {
  if (attName === 'slot') {
    return namedSlotAttributeNode(dataBindingNode(value))
  }
  return null
}
