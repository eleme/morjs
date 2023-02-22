import {
  ClassAttributeNode,
  classAttributeNode,
  dataBindingNode
} from '../../types'

export default function (attName: string, value: string): ClassAttributeNode {
  if (attName === 'class') {
    return classAttributeNode(dataBindingNode(value))
  }
  return null
}
