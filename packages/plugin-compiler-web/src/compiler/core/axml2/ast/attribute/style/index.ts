import {
  dataBindingNode,
  styleAttributeNode,
  StyleAttributeNode
} from '../../types'

export default function (attName: string, value: string): StyleAttributeNode {
  if (attName === 'style') {
    return styleAttributeNode(dataBindingNode(value))
  }
  return null
}
