import { IXMLElement } from '../../IXmlNode'
import {
  importNode,
  ImportNode,
  importSJSNode,
  ImportSJSNode
} from '../../types'

export default function (xmlElement: IXMLElement): ImportNode {
  if (xmlElement.name === 'import' && xmlElement.attributes) {
    const node = importNode(
      xmlElement.attributes['src'],
      xmlElement.attributes['name'],
      xmlElement.attributes['from']
    )
    return node
  }
  return null
}

export function importSjsElment(xmlElement: IXMLElement): ImportSJSNode {
  if (xmlElement.name === 'import-sjs' && xmlElement.attributes) {
    const node = importSJSNode(
      xmlElement.attributes['name'],
      xmlElement.attributes['from']
    )
    return node
  }
  return null
}
