import { FileParserOptions, logger, posthtml } from '@morjs/utils'
import path from 'path'
import {
  fileType,
  target as CURRENT_TARGET,
  templateDirectives
} from './constants'

// 是否继续处理
function shouldProcess(options: FileParserOptions): boolean {
  // 目标是 百度
  // 源码为不是 百度小程序(原因为不支持解析百度DSL)
  if (
    options.userConfig.target === CURRENT_TARGET &&
    options.fileInfo.extname !== fileType.template
  ) {
    return true
  } else {
    return false
  }
}

/**
 * 自定义 template 处理
 */
export const templateProcessor = {
  onNode(node: posthtml.Node, options: FileParserOptions): void {
    if (shouldProcess(options)) {
      transformForIFDirective(node)
    }
  },

  onNodeAttr(
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions
  ): void {
    if (shouldProcess(options)) {
      tranformTwoWayBindingData(attrName, node)
    }
  },

  onNodeAttrExit(
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions
  ): void {
    if (shouldProcess(options) === false) return

    // 百度小程序 swan 中不支持组件包含 type 属性
    if (attrName === 'type') {
      logger.warnOnce(
        `${node.tag} 元素包含 \`type\` 属性，会导致百度小程序报错，请替换属性名称\n` +
          `文件路径: ${options.fileInfo.path}`
      )
    }

    // swan 不支持绝对路径，这里部分替换为相对路径
    // 只能转换静态路径，动态拼接路径不支持转换
    if (node.tag === 'image' && attrName === 'src') {
      if (!/^((\.\/)|(http))/.test(node.attrs['src'] || '')) {
        // 如果路径中包含判断逻辑，则不支持转换
        if (node.attrs['src'].indexOf('{{') === -1) {
          const relativePath = path.posix.relative(
            '/' + path.posix.dirname(options.fileInfo.entryName),
            path.resolve('/', node.attrs['src'])
          )
          node.attrs['src'] = relativePath
        }
      }
    }

    // 去掉 {{}}
    if (
      attrName === templateDirectives.if ||
      attrName === templateDirectives.elseIf ||
      attrName === templateDirectives.else ||
      attrName === templateDirectives.for
    ) {
      node.attrs[attrName] = removeBrackets(node.attrs[attrName])
    }

    // 需要处理 trackBy 的情况
    // <view s-for="persions" trackBy="item"></view> =>
    //    <view s-for="persions trackBy item"></view>
    // 参见语法: https://smartprogram.baidu.com/docs/develop/framework/view_for/
    if (attrName === templateDirectives.key) {
      // 如果 trackBy 为 *this 则替换为 forItem 的别名或默认的 item
      const trackByValue =
        node.attrs[templateDirectives.key] === '*this'
          ? node.attrs[templateDirectives.forItem] || 'item'
          : node.attrs[templateDirectives.key]
      node.attrs[templateDirectives.for] = [
        node.attrs[templateDirectives.for],
        templateDirectives.key,
        trackByValue
      ].join(' ')

      delete node.attrs[templateDirectives.key]
    }
  }
}

/**
 * for if 并存处理
 * wx:for wx:if 并存 => wx:for 高优
 * eg:
 *  <view wx:for='xx' wx:if='xx'>hello</view>  ->
 *  <block wx:for="xxx"><view wx:if="xx">hello</view></block>
 *
 * wx:for wx:elif wx:else 并存 => wx:for 高优
 * eg:
 *  <view wx:for='xx' wx:else>hello</view>  ->
 *  <block wx:else><view wx:for="xxx">hello</view></block>
 * 参见: https://smartprogram.baidu.com/docs/develop/framework/view_if/
 */
const CONDITION_DIRECTIVES = [
  templateDirectives.if,
  templateDirectives.elseIf,
  templateDirectives.else
]
const FOR_DIRECTIVES = [
  templateDirectives.for,
  templateDirectives.forItem,
  templateDirectives.forIndex
]
function curNodeTransformTwoNode(
  parentAttrs: posthtml.NodeAttributes,
  curNode: posthtml.Node
) {
  // copy curNode as new childNode
  const newChildNode = Object.assign({}, curNode)

  // curNode as parentNode
  const parentNode = Object.assign(curNode, {
    tag: 'block',
    attrs: parentAttrs
  })

  parentNode.content = [newChildNode]
}

function transformForIFDirective(node: posthtml.Node) {
  const attrs = node.attrs
  if (!attrs) return
  if (!attrs[templateDirectives.for] || !attrs[templateDirectives.if]) return

  const parentAttrs = {}

  CONDITION_DIRECTIVES.some((conditionItem) => {
    if (!attrs[conditionItem]) return false

    // wx:if 时 for 高优
    if (conditionItem === CONDITION_DIRECTIVES[0]) {
      FOR_DIRECTIVES.forEach((forItem) => {
        attrs[forItem] && (parentAttrs[forItem] = attrs[forItem])
        delete attrs[forItem]
      })
    }

    // 其他时 for 低优
    else {
      parentAttrs[conditionItem] = attrs[conditionItem]
      delete attrs[conditionItem]
    }

    return true
  })

  curNodeTransformTwoNode(parentAttrs, node)
}

/**
 * 丢掉属性值两侧的花括号
 *
 * @param {string} value 属性值
 */
function removeBrackets(value: string): string {
  // wx:else 情况排除
  if (typeof value !== 'string') return value
  value = value.trim()
  if (/^{{.*}}$/.test(value)) return value.slice(2, -2).trim()

  return value
}

/**
 * 判断是否{{}}数据绑定
 *
 * @param value 属性值
 */
function hasBrackets(value = ''): boolean {
  const trimed = value.trim()
  return /^{{.*}}$/.test(trimed)
}

/**
 * 转换数据绑定为双向绑定语法，仅百度小程序需要转换
 * 1. 部分官网上示例的双向绑定组件属性，直接替换
 * 2. 微信转百度时，替换 model:xxx='{{value}}' 为 xxx='{=value=}'
 *
 * @param {Object} node 节点对象
 * @param {String} type 构建类型
 */
const BIND_DATA_MAP = {
  'scroll-view': ['scroll-top', 'scroll-left', 'scroll-into-view'],
  input: ['value'],
  textarea: ['value'],
  'movable-view': ['x', 'y'],
  slider: ['value']
}
function tranformTwoWayBindingData(attrName: string, node: posthtml.Node) {
  if (!attrName || !node || !node.attrs) return

  const attrs = node.attrs
  const leftKeyMatchedResult = attrName?.match(/model:(.*)/)
  const attrValue = attrs[attrName]

  if (!attrValue) return

  // 替换 model:xxx='{{value}}' 为 xxx='{=value=}'
  if (leftKeyMatchedResult?.[1]) {
    attrs[leftKeyMatchedResult[1]] = `{=${removeBrackets(attrValue)}=}`
    delete attrs[attrName]
  }
  // 部分官网上示例的双向绑定组件属性，直接替换
  else {
    const recommandBindingAttrs = BIND_DATA_MAP[node.tag as string]

    if (!recommandBindingAttrs) return
    if (recommandBindingAttrs.includes(attrName) && hasBrackets(attrValue)) {
      attrs[attrName] = `{=${removeBrackets(attrValue)}=}`
    }
  }
}
