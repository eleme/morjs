import { babelTypes as t } from '@morjs/utils'
import { TextNode } from '../../ast/types'
import Context from '../context'

export default function (node: TextNode, context: Context) {
  context.mergeDatabindingVars(node.text)

  if (node.text.hasBinding) {
    return t.jsxExpressionContainer(node.text.getExpressionAstForText())
  }
  return t.jsxText(node.text.express.replace(/\\n/g, '&#10;'))
}
