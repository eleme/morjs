import { uuid } from '../../generate/utils'
import parseAttribute from '../attribute/index'
import ParseComment from '../comment'
import Context from '../context'
import { IXMLElement } from '../IXmlNode'
import {
  dataBindingNode,
  Element,
  elementNode,
  isTemplateNode,
  isUseTemplateNode,
  TemplateNode,
  textNode,
  UseTemplateNode
} from '../types'
import parseBlock from './block'
import parseFor from './for'
import parseIfElse from './if-else/index'
import parseImport, { importSjsElment } from './import'
import parseInclude from './include'
import parseSlot from './slot'
import parseSlotScope from './slot-scope'
import parseTemplate from './template'

export function parseElement(xmlElement: IXMLElement): Element {
  xmlElement.ignor = true
  if (xmlElement.type === 'text') {
    return textNode(
      dataBindingNode(xmlElement.text.replace(/(^\s*)|(\s*$)/g, '').trim())
    )
  }

  if (xmlElement.type === 'comment') {
    // 注释
    return ParseComment(xmlElement)
  }

  // 优先处理指令
  if (xmlElement.attributes) {
    // for 的优先级大于 if
    let element: Element = parseFor(xmlElement)
    if (element) {
      return element
    }
    element = parseIfElse(xmlElement)
    if (element) {
      return element
    }
    element = parseSlotScope(xmlElement)
    if (element) {
      return element
    }
  }

  // 处理特定的节点
  switch (xmlElement.name) {
    case 'template': {
      // 模板
      const node = parseTemplate(xmlElement)
      if (node && isUseTemplateNode(node)) {
        return node as UseTemplateNode
      } else if (node && isTemplateNode(node)) {
        Context.currentContenxt.document.templates.push(node as TemplateNode)
      }
      return null
    }

    case 'import': {
      const node = parseImport(xmlElement)
      Context.currentContenxt.document.imports.push(node)
      return null
    }

    case 'import-sjs': {
      const node = importSjsElment(xmlElement)
      Context.currentContenxt.document.imports.push(node)
      return null
    }

    case 'include': {
      const node = parseInclude(xmlElement)
      return node
    }

    case 'slot': {
      const node = parseSlot(xmlElement)
      return node
    }

    case 'block': {
      const node = parseBlock(xmlElement)
      return node
    }
  }

  // 解析最简单的元素节点
  const elNode = elementNode(
    xmlElement.name,
    uuid(),
    parseAttribute(xmlElement),
    []
  )

  elNode.children = parseSubElements(xmlElement)
  return elNode
}

export function parseSubElements(xmlElement: IXMLElement) {
  if (xmlElement.elements) {
    return xmlElement.elements
      .map((el) => (el.ignor ? null : parseElement(el)))
      .filter((el) => el)
  }
  return []
}
