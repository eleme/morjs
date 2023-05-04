import { IXMLElement } from '../IXmlNode'
import { attributeNode, dataBindingNode, ElementAtrrbute } from '../types'

const EventAttributesParser = require('./event/index').default

const AttributesParseer = [
  require('./unsupport/index').default,
  EventAttributesParser,
  require('./class/index').default,
  require('./style/index').default,
  require('./ref/index').default,
  require('./slot/index').default,
  require('./two-way-binding/index').default
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

        // 双向绑定语法糖，自动补充onInput方法
        if (att.type === 'TwoWayBindingAttributeNode') {
          const inputEvent = EventAttributesParser(
            'onInput',
            att.value.bindingExpression,
            true
          )

          attributes.push(inputEvent)
        }
      } else {
        attributes.push(attributeNode(key, dataBindingNode(value)))
      }
    }
  }
  return attributes
}
