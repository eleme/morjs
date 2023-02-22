import * as t from '@babel/types'
import { defCondition, isEndIf, isIfDef } from '../../../../utils/comment'
import { BuildOptions } from '../../../option'
import { CommentNode, Element } from '../../ast/types'

export default function () {
  return t.booleanLiteral(false)
}

/**
 * 筛选过滤条件编译
 * @param node
 */
export function skipConditionalCompilation(
  node: CommentNode,
  elements: Element[],
  option: BuildOptions
) {
  const ifDefIndex = elements.indexOf(node)
  let endDefIndex = ifDefIndex
  if (isIfDef(node.comment)) {
    const conditional = defCondition(node.comment).toLowerCase()
    if (conditional !== option.platform) {
      for (const el of elements) {
        if (el.type === 'CommentNode' && isEndIf(el.comment)) {
          endDefIndex = elements.indexOf(el)
          break
        }
      }
    }
  }
  return elements.filter(
    (_, index) => index < ifDefIndex || index > endDefIndex
  )
}
