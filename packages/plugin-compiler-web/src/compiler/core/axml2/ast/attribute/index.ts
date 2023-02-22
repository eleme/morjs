import { IXMLElement } from '../IXmlNode'
import { attributeNode, dataBindingNode, ElementAtrrbute } from '../types'

const AttributesParseer = [
  require('./unsupport/index').default,
  require('./event/index').default,
  require('./class/index').default,
  require('./style/index').default,
  require('./ref/index').default,
  require('./slot/index').default
]

export default function (xmlElement: IXMLElement): ElementAtrrbute[] {
  const attributes: ElementAtrrbute[] = []
  if (xmlElement.attributes) {
    for (const key of Object.keys(xmlElement.attributes)) {
      const value = xmlElement.attributes[key]
      let att: ElementAtrrbute
      for (const func of AttributesParseer) {
        att = func(key, value)
        if (att) {
          break
        }
      }

      if (att) {
        if (att.type !== 'UnSupportAttributeNode') attributes.push(att)
      } else {
        attributes.push(attributeNode(key, dataBindingNode(value)))
      }
    }
  }
  return attributes
}
