import { IXMLElement } from '../IXmlNode'
import { attributeNode, dataBindingNode, ElementAtrrbute } from '../types'

const AttributesParser = [
  require('./unsupport/index').default,
  require('./event/index').default,
  require('./class/index').default,
  require('./style/index').default,
  require('./ref/index').default,
  require('./slot/index').default
]

function parserAttribute(
  xmlElement: IXMLElement,
  parser = AttributesParser
): ElementAtrrbute[] {
  const attributes: ElementAtrrbute[] = []
  if (xmlElement.attributes) {
    for (const key of Object.keys(xmlElement.attributes)) {
      const value = xmlElement.attributes[key]
      let att: ElementAtrrbute
      for (const func of parser) {
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

export default function (xmlElement: IXMLElement): ElementAtrrbute[] {
  return parserAttribute(xmlElement, AttributesParser)
}

const SlotAttributesParser = [
  require('./unsupport/index').default,
  require('./event/index').default,
  require('./ref/index').default,
  require('./slot/index').default
]

export function parseSlotAttribute(xmlElement: IXMLElement): ElementAtrrbute[] {
  return parserAttribute(xmlElement, SlotAttributesParser)
}
