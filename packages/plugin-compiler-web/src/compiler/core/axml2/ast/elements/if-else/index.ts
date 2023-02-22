import { hasOwnProperty } from '../../../../../utils/index'
import {
  attributeValueAndRemove,
  findNextSibling,
  IXMLElement
} from '../../IXmlNode'
import {
  dataBindingNode,
  elseElementNode,
  elseIfElementNode,
  IfElementNode,
  ifElementNode
} from '../../types'
import { parseElement } from '../index'

const IFAttributeKey = 'a:if'
const ElseIfAttributeKey = 'a:elif'
const ElseAttributeKey = 'a:else'

export default function (xmlElement: IXMLElement): IfElementNode {
  if (isIfNode(xmlElement)) {
    const ifNode = ifElementNode(
      dataBindingNode(
        attributeValueAndRemove(xmlElement.attributes, IFAttributeKey)
      ),
      parseElement(xmlElement)
    )

    let lastElement = xmlElement
    while (lastElement) {
      lastElement = findNextSibling(lastElement)
      if (!lastElement) {
        break
      }
      if (isElseNode(lastElement)) {
        attributeValueAndRemove(lastElement.attributes, ElseAttributeKey)
        ifNode.elseElement = elseElementNode(parseElement(lastElement))
        // lastElement.ignor = true;
      } else if (isElseIfNode(lastElement)) {
        ifNode.elseIfElements.push(
          elseIfElementNode(
            dataBindingNode(
              attributeValueAndRemove(
                lastElement.attributes,
                ElseIfAttributeKey
              )
            ),
            parseElement(lastElement)
          )
        )
        // lastElement.ignor = true;
      } else {
        break
      }
    }

    return ifNode
  }
  return null
}

function isIfNode(xmlElement: IXMLElement) {
  if (!xmlElement.attributes) return false
  return hasOwnProperty(xmlElement.attributes, IFAttributeKey)
}

function isElseIfNode(xmlElement: IXMLElement) {
  if (!xmlElement.attributes) return false
  return hasOwnProperty(xmlElement.attributes, ElseIfAttributeKey)
}

function isElseNode(xmlElement: IXMLElement) {
  if (!xmlElement.attributes) return false
  return hasOwnProperty(xmlElement.attributes, ElseAttributeKey)
}
