import { Node } from '../ast/types'

export interface ITraverNode {
  node: Node
  parent?: Node
}

function traverseNode(node: Node, opts: object, parent?: Node) {
  if (typeof node === 'object' && node.type) {
    const func = opts[node.type]
    if (func) {
      func({
        node,
        parent
      })
    }
    Object.keys(node).forEach((key) => {
      const value = node[key]
      if (key !== 'type' && value) {
        if (value instanceof Array) {
          ;[...value].forEach((sub) => {
            traverseNode(sub, opts, node)
          })
        } else {
          traverseNode(value, opts, node)
        }
      }
    })
  }
}

export default traverseNode
