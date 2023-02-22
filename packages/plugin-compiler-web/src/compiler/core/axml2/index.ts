import DslAst from './ast/index'
import DslTransform from './generate/index'
import { AXMLOptions } from './options'

export default function (source: string, options: AXMLOptions) {
  const doc = DslAst(source)
  return DslTransform(doc, options)
}
