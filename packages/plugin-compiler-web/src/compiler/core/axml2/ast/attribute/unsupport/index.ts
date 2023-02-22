import {
  dataBindingNode,
  makeUnSupportAttributeNode,
  UnSupportAttribute
} from '../../types'

// attributes 过滤白名单
const attributesWhiteList = [
  'capture-catch:',
  'capture-bind:',
  'mut-bind:',
  'catch:',
  'a:key' // element 元素会先经过 parseFor 处理，走到attribute处理时只会存在 key，不会存在 a:key
]

export default function (attName: string, value: string): UnSupportAttribute {
  let attribute = null

  attributesWhiteList.forEach((key) => {
    if (attName.indexOf(key) >= 0) {
      attribute = makeUnSupportAttributeNode(attName, dataBindingNode(value))
    }
  })

  return attribute
}
