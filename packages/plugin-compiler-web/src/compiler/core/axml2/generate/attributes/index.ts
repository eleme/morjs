// export function

import { Element, ElementAtrrbute } from '../../ast/types'
import Context from '../context'

const ElementAtrrbuteTransforms = {
  AttributeNode: require('./AttributeNode').default,
  EventAttributeNode: require('./EventAttributeNode').default,
  ClassAttributeNode: require('./ClassAttributeNode').default,
  StyleAttributeNode: require('./StyleAttributeNode').default,
  RefAttributeNode: require('./RefAttributeNode').default,
  NamedSlotAttributeNode: require('./NamedSlotAttributeNode').default,
  TwoWayBindingAttributeNode: require('./TwoWayBindingAttributeNode').default
}

export default function (
  node: Element,
  att: ElementAtrrbute,
  context: Context
) {
  const func = ElementAtrrbuteTransforms[att.type]
  if (!func) {
    throw new Error('属性解析器:' + att.type + ',不存在')
  }
  return func(node, att, context)
}
