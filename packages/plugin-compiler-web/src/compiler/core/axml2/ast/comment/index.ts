import { IXMLElement } from '../IXmlNode'
import { commentNode } from '../types'

export default function ParseComment(xmlElement: IXMLElement) {
  if (xmlElement.type === 'comment') {
    return commentNode(xmlElement.comment)
  }
  return null
}
