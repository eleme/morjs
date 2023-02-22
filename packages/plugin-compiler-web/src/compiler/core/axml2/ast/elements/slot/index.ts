import parseAttribute from '../../attribute/index'
import { attributeValueAndRemove, IXMLElement } from '../../IXmlNode'
import { dataBindingNode, slotNode, SlotNode } from '../../types'
import { parseSubElements } from '../index'

export default function (xmlElement: IXMLElement): SlotNode {
  if (xmlElement.name === 'slot') {
    const node = slotNode([], [])
    if (xmlElement.attributes) {
      node.name = dataBindingNode(
        attributeValueAndRemove(xmlElement.attributes, 'name')
      )
      node.attributes = parseAttribute(xmlElement)
    }
    node.children = parseSubElements(xmlElement)
    return node
  }
  return null
}
