import { hasOwnProperty } from '../../../../../utils/index'
import { IXMLElement } from '../../IXmlNode'
import parser from '../../parser'
import {
  dataBindingNode,
  fragmentNode,
  templateNode,
  TemplateNode,
  useTemplateNode,
  UseTemplateNode
} from '../../types'

const UseTemplateAttributeKey = 'is'

const TemplateAttributeKey = 'name'

export default function (
  xmlElement: IXMLElement
): TemplateNode | UseTemplateNode {
  // use 的 优先级大于 模板定义
  if (isUseTemplateNode(xmlElement)) {
    const templateName = xmlElement.attributes[UseTemplateAttributeKey]
    if (xmlElement.elements) {
      throw new Error('use template:' + templateName + ',不可以添加子元素')
    }
    return useTemplateNode(
      dataBindingNode(templateName),
      dataBindingNode(xmlElement.attributes['data'])
    )
  } else if (isTemplateNode(xmlElement)) {
    const tNode = templateNode(
      xmlElement.attributes[TemplateAttributeKey],
      fragmentNode([])
    )
    parser(xmlElement, tNode.fragment)
    return tNode
  }
  return null
}

function isUseTemplateNode(xmlElement: IXMLElement) {
  if (!xmlElement.attributes) return false
  return hasOwnProperty(xmlElement.attributes, UseTemplateAttributeKey)
}

function isTemplateNode(xmlElement: IXMLElement) {
  if (!xmlElement.attributes) return false
  return hasOwnProperty(xmlElement.attributes, TemplateAttributeKey)
}
