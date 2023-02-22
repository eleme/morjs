import parseAttribute from '../../attribute/index'
import { IXMLElement } from '../../IXmlNode'
import { BlockNode, blockNode } from '../../types'
import { parseSubElements } from '../index'

export default function (xmlElement: IXMLElement): BlockNode {
  if (xmlElement.name === 'block') {
    return blockNode(parseSubElements(xmlElement), parseAttribute(xmlElement))
  }

  return null
}
