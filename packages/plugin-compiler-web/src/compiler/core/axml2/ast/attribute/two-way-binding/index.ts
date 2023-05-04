import {
  dataBindingNode,
  twoWayBindingAttributeNode,
  TwoWayBindingAttributeNode
} from '../../types'

export default function (
  attName: string,
  value: string
): TwoWayBindingAttributeNode {
  // 微信双向绑定语法 model:value
  if (attName === 'model:value') {
    return twoWayBindingAttributeNode(dataBindingNode(value))
  }
}
