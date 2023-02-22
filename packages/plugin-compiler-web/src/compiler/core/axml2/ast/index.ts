import Context from './context'
import parser from './parser'
import { Document } from './types'

export default function (source): Document {
  Context.resetContext(source)
  parser(
    Context.currentContenxt.rootXml,
    Context.currentContenxt.document.fragment
  )
  return Context.currentContenxt.document
}
