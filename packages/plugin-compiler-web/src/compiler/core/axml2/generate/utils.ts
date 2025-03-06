import {
  babelCore as babel,
  babelGenerator as generate,
  babelTypes as t
} from '@morjs/utils'

const HashChars =
  'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678oOLl9gqVvUuI1'
// 对模板名称进行编码
// NOTE: 这里的代码必须跟runtime中的代码是一致的
export function hashTemplateName(name) {
  return name
    .split('')
    .map((c) => (HashChars.indexOf(c) >= 0 ? c : '$'))
    .join('')
}

// 将引用的组件名称，转换成合乎react规范的名称
export function convertComponentName(name: string) {
  // 1. 替换 - 为 _
  name = name.replace(/-/g, '_')
  // 2. 添加一个大写的前缀
  name = `RT_${name}` // RT表示runtime
  return name
}

export function getComponentName(name) {
  if (name.includes('-')) {
    const words = name.split('-')
    if (words?.length) {
      const nodeName = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      return nodeName
    }
  }
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function uuid() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getOptionalChainCode(code) {
  // 处理 ?.[]?.
  const result = code
    .replace(/(\w\]*)(?=\[)/g, (path) => {
      if (/\w\]*/.test(path)) {
        return `${path}?.`
      }
      return path
    })
    .replace(/(?<=\])(\.)/g, (path) => {
      if (/\./.test(path)) {
        return `?${path}`
      }
      return path
    })

  const source = babel.transformSync(result, {
    configFile: false,
    babelrc: false,
    plugins: [
      {
        visitor: {
          MemberExpression: {
            enter(path) {
              if (path.node.property.type === 'Identifier') {
                const optionalExpression = t.optionalMemberExpression(
                  path.node.object as t.Expression,
                  path.node.property as t.Identifier,
                  false,
                  true
                ) as babel.types.OptionalMemberExpression
                path.replaceWith(optionalExpression)
              }
            }
          }
        }
      }
    ]
  }).code

  return source.substr(0, source.length - 1)
}

export function getOptionalChainExpression(expression) {
  let source = expression

  // ast
  if (expression.type) {
    if (
      expression.type === 'MemberExpression' ||
      expression.type === 'ConditionalExpression' ||
      expression.type === 'BinaryExpression' ||
      expression.type === 'LogicalExpression'
    ) {
      source = generate.default(expression).code
    } else {
      return expression
    }
  }

  return t.identifier(`${getOptionalChainCode(source)}`)
}

export function addBracketToIdentifier(node) {
  if (!node) return node
  if (node.type !== 'Identifier') return node

  const value = `(${node.name})`
  node.name = value

  return node
}
