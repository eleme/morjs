import * as t from '@babel/types'

export default function () {
  return {
    visitor: {
      ImportDeclaration(path) {
        const node = path.node as t.ImportDeclaration
        const source = node.source.value
        if (source[0] === '/') {
          // 将绝对路径，转换成相对路径
          node.source.value = `@${source}`
        }
      }
    }
  }
}
