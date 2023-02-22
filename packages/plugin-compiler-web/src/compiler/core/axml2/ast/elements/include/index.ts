import { IXMLElement } from '../../IXmlNode'
import { includeNode, IncludeNode } from '../../types'

export default function (xmlElement: IXMLElement): IncludeNode {
  if (xmlElement.name === 'include' && xmlElement.attributes) {
    const node = includeNode(xmlElement.attributes['src'])
    return node
  }
  return null
}
