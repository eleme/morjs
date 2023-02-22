import {
  dataBindingNode,
  refAttributeNode,
  RefAttributeNode
} from '../../types'

export default function (attName: string, value: string): RefAttributeNode {
  if (attName === 'ref') {
    return refAttributeNode(dataBindingNode(value))
  }
  return null
}
