import xml2js from '../../libs/xml2js'
import { initParent, IXMLElement } from './IXmlNode'
import { document, Document, fragmentNode } from './types'

export default class Context {
  // 当前的上下文
  static currentContenxt: Context
  // 重置上下文。开始编译一个文件的时候调用
  static resetContext(source: string) {
    Context.currentContenxt = new Context(source)
    return Context.currentContenxt
  }

  private doc: Document = document([], [], fragmentNode([]))
  get document() {
    return this.doc
  }

  private _rootXml: IXMLElement
  get rootXml() {
    return this._rootXml
  }

  constructor(source) {
    const content = `<root>${source}</root>`
    const xml = (<any>xml2js(content, { ignoreComment: false })).elements[0]
    initParent(xml)
    this._rootXml = xml
  }
}
