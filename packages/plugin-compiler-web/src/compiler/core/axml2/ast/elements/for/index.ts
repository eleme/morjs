import { attributeValueAndRemove, IXMLElement } from '../../IXmlNode'
import { dataBindingNode, ForElementNode, forElementNode } from '../../types'
import { parseElement } from '../index'

const ForAttributeKey = 'a:for'
const ForItemAttributeKey = 'a:for-item'
const ForIndexAttributeKey = 'a:for-index'

const ForKeyAttributeKey = 'key'
const ForKey2AttributeKey = 'a:key'

// const aKeyAtt = findFirstAttAndRemove(node, 'a:key');
// const keyAtt = findFirstAttAndRemove(node, 'key');

export default function (xmlElement: IXMLElement): ForElementNode {
  if (isForNode(xmlElement)) {
    const forNode = forElementNode(
      dataBindingNode(
        attributeValueAndRemove(xmlElement.attributes, ForAttributeKey)
      ),
      null
    )
    forNode.item = attributeValueAndRemove(
      xmlElement.attributes,
      ForItemAttributeKey
    )
    forNode.index = attributeValueAndRemove(
      xmlElement.attributes,
      ForIndexAttributeKey
    )

    const key1 = attributeValueAndRemove(
      xmlElement.attributes,
      ForKeyAttributeKey
    )
    const key2 = attributeValueAndRemove(
      xmlElement.attributes,
      ForKey2AttributeKey
    )

    if (key1 || key2) {
      let key = (key1 || key2).trim()
      const itemName = forNode.item || 'item'
      const indexName = forNode.index || 'index'
      // 提供 *this 支持
      if (key === '*this') {
        key = `{{${itemName}}}`
      }
      // 如果是字符串且未被 {{}} 包裹, 则自动包裹一层
      // 需要区分 key 名称为 index 的情况
      else if (!/\{\{.+\}\}/.test(key)) {
        key = key === indexName ? `{{${indexName}}}` : `{{${itemName}.${key}}}`
      }
      xmlElement.attributes['key'] = key
    }

    forNode.element = parseElement(xmlElement)

    return forNode
  }
  return null
}

export function isForNode(xmlElement: IXMLElement) {
  if (!xmlElement.attributes) return false
  return Object.prototype.hasOwnProperty.call(
    xmlElement.attributes,
    ForAttributeKey
  )
}
