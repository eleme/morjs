import { parseSubElements } from './elements/index'
import { IXMLElement } from './IXmlNode'
import { FragmentNode } from './types'

export default function (xmlElement: IXMLElement, fragmentNode: FragmentNode) {
  xmlElement.elements &&
    xmlElement.elements.forEach((el) => {
      if (!el.ignor) {
        fragmentNode.body = parseSubElements(xmlElement)
      }
    })
}
