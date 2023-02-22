export interface IXMLElement {
  type: string
  name?: string
  text?: string
  attributes?: IXMLAttrubute
  elements?: IXMLElement[]
  parent?: IXMLElement
  comment?: string
  ignor?: boolean //标记为忽略，那么编译的时候不会再对改节点进行编译操作
}

export function initParent(rootXml: IXMLElement) {
  if (rootXml.elements) {
    rootXml.elements.forEach((el) => {
      setParent(el, rootXml)
    })
  }
}

function setParent(xmlEle: IXMLElement, parent: IXMLElement) {
  xmlEle.parent = parent
  if (xmlEle.elements) {
    xmlEle.elements.forEach((el) => {
      setParent(el, xmlEle)
    })
  }
}

export interface IXMLAttrubute {}

export function attributeValueAndRemove(
  attributes: IXMLAttrubute,
  attName: string
): string | undefined {
  const value = attributes[attName]
  delete attributes[attName]
  return value
}

export function findNextSibling(node: IXMLElement) {
  const parent = node.parent
  if (parent) {
    for (
      let i = parent.elements.indexOf(node) + 1;
      i < parent.elements.length;
      i++
    ) {
      const sub = parent.elements[i]
      if (sub.type === 'element') {
        return sub
      }

      if (sub.type === '#text' && sub.text.trim().replace(/[\r\n]/g, '')) {
        return sub
      }
    }
  }
  return null
}
