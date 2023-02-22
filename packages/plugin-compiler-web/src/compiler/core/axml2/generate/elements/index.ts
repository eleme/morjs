import { Element } from '../../ast/types'
import Context from '../context'

const ElementTransforms = {
  ElementNode: require('./ElementNode').default,
  TextNode: require('./TextNode').default,
  ForElementNode: require('./ForElementNode').default,
  IfElementNode: require('./IfElementNode').default,
  UseTemplateNode: require('./UseTemplateNode').default,
  IncludeNode: require('./IncludeNode').default,
  SlotNode: require('./SlotNode').default,
  BlockNode: require('./BlockNode').default,
  SlotScopeNode: require('./SlotScopeNode').default
}

export default function (node: Element, context: Context) {
  const func = ElementTransforms[node.type]
  if (!func) {
    throw new Error('解析器:' + node.type + ',不存在')
  }
  return func(node, context)
}
