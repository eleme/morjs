import { hasOwnProperty } from '../../../../../utils/index'
import { attributeValueAndRemove, IXMLElement } from '../../IXmlNode'
import { SlotScopeNode, slotScopeNode } from '../../types'
import { parseElement } from '../index'

const SlotScopeAttributeKey = 'slot-scope'

export default function (xmlElement: IXMLElement): SlotScopeNode {
  if (isSlotScopeNode(xmlElement)) {
    const node = slotScopeNode(
      attributeValueAndRemove(xmlElement.attributes, SlotScopeAttributeKey),
      null
    )
    node.slot = attributeValueAndRemove(xmlElement.attributes, 'slot')
    node.element = parseElement(xmlElement)
    return node
  }
  return null
}

function isSlotScopeNode(xmlElement: IXMLElement) {
  if (!xmlElement.attributes) return false
  return hasOwnProperty(xmlElement.attributes, SlotScopeAttributeKey)
}
