import { babelTypes as t, Expression } from '@morjs/utils'
import { isEnableStyleScope } from '../../../../utils'
import { globalComponentName, randomHash } from '../../../option'
import { ElementNode, EventAttributeNode } from '../../ast/types'
import transformAttribute from '../attributes/index'
import Context from '../context'
import { databindingForValue } from '../helper-databinding'
import {
  addBracketToIdentifier,
  getComponentName,
  getOptionalChainExpression
} from '../utils'
import transformElement from './index'

export default function (node: ElementNode, context: Context) {
  const externalName = getExternalComponent(context.options, node.name)

  //  属性
  const atts: t.JSXAttribute[] = externalName
    ? node.attributes.map((att) => transformAttribute(node, att, context))
    : node.attributes
        .filter((t) => t.type !== 'EventAttributeNode')
        .map((att) => transformAttribute(node, att, context))
  const children = []
  node.children.forEach((el) => {
    children.push(t.jsxText('\r\n'))
    children.push(transformElement(el, context))
    children.push(t.jsxText('\r\n'))
  })

  const globalName = globalComponentName(node.name, context.options)
  if (globalName) {
    // 转换小程序组件名称。系统组件的名称优先级大于 自定义的
    node.name = externalName || globalName
    // atts.push(t.jsxAttribute(t.jsxIdentifier('tiga_node_id'), t.stringLiteral(node.nodeId)))
  }

  const eventAtts = node.attributes.filter(
    (t) => t.type === 'EventAttributeNode'
  )
  const classKey = externalName ? 'className' : 'class'
  if (eventAtts.length > 0) {
    if (globalName) {
      const arraryExp = t.arrayExpression(
        eventAtts.map((att: EventAttributeNode) => {
          context.mergeDatabindingVars(att.value)
          return t.objectExpression([
            t.objectProperty(
              t.identifier('name'),
              t.stringLiteral(att.name.toLowerCase())
            ),
            t.objectProperty(
              t.identifier('event'),
              databindingForValue(att.value)
            ),
            t.objectProperty(
              t.identifier('catch'),
              t.booleanLiteral(att.isCatch)
            )
          ])
        })
      )

      // for循环节点的nodeId = nodeId + index
      const isIndexDefinedExpression = t.binaryExpression(
        '!==',
        t.identifier('typeof index'),
        t.stringLiteral('undefined')
      )
      const indexConditionalExpression = t.conditionalExpression(
        isIndexDefinedExpression,
        t.identifier('index'),
        t.stringLiteral('')
      )

      if (!externalName) {
        children.push(
          t.jsxExpressionContainer(
            t.callExpression(
              t.memberExpression(
                t.identifier('$rm'),
                t.identifier('registEvents')
              ),
              [
                arraryExp,
                t.identifier('$data'),
                t.binaryExpression(
                  '+',
                  t.stringLiteral(node.nodeId),
                  indexConditionalExpression
                )
              ]
            )
          )
        )
      }

      // 添加class node.nodeId。 当然这个也可以在后续的功能迭代中直接作为公共设置。
      const classAtt = atts.filter((i) => i.name.name === 'class').pop()

      const compIdExpression = t.binaryExpression(
        '+',
        t.stringLiteral(` comp-id-`),
        t.identifier('$id')
      )
      const eventClassNameExp = t.binaryExpression(
        '+',
        t.binaryExpression(
          '+',
          t.stringLiteral(` ${node.nodeId}`),
          indexConditionalExpression
        ),
        compIdExpression
      )

      if (classAtt) {
        classAtt.name = t.jsxIdentifier(classKey)
        const attValue: t.JSXExpressionContainer = <any>classAtt.value
        attValue.expression = t.binaryExpression(
          '+',
          addBracketToIdentifier(
            getOptionalChainExpression(attValue.expression)
          ),
          eventClassNameExp
        )
      } else {
        atts.push(
          t.jsxAttribute(
            t.jsxIdentifier(classKey),
            t.jsxExpressionContainer(eventClassNameExp)
          )
        )
      }
      context.dataBindingVars.add('$id')
    } else {
      atts.push(
        ...eventAtts.map((att) => transformAttribute(node, att, context))
      )
    }
  } else {
    const classAtt = atts.filter((i) => i.name.name === 'class').pop()
    if (classAtt) {
      classAtt.name = t.jsxIdentifier(classKey)
      const attValue: t.JSXExpressionContainer = <any>classAtt.value
      attValue.expression = getOptionalChainExpression(attValue.expression)
    }
  }

  const enableStyleScope = isEnableStyleScope(context.options) // 是否启用样式隔离
  if (enableStyleScope) {
    const styleScopeHash = randomHash(context.options)
    const classAtt = atts.filter((i) => i.name.name === 'class').pop()
    if (classAtt) {
      const attValue: t.JSXExpressionContainer = <any>classAtt.value
      attValue.expression = t.binaryExpression(
        '+',
        attValue.expression as Expression,
        t.stringLiteral(` ${styleScopeHash}`)
      )
    } else {
      atts.push(
        t.jsxAttribute(
          t.jsxIdentifier(classKey),
          t.jsxExpressionContainer(t.stringLiteral(` ${styleScopeHash}`))
        )
      )
    }
  }

  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier(node.name),
      atts,
      children.length === 0
    ),
    t.jsxClosingElement(t.jsxIdentifier(node.name)),
    children,
    null
  )
}

function getExternalComponent(options, key) {
  const { externalComponents = {} } = options
  return externalComponents[key] ? getComponentName(key) : ''
}
