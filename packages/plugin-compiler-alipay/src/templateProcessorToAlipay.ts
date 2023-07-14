import { FileParserOptions, posthtml } from '@morjs/utils'
import {
  sjsModuleAttrName,
  sjsTagName,
  twoWayBindingComponents
} from './constants'
import { isNativeTag } from './templateTags'

type NodeAttributes = Record<string, string | number | boolean>

// 标签属性映射
const TAG_SPECIFIC_PROP_NAME_MAPPINGS = {
  slider: {
    backgroundColor: 'background-color',
    activeColor: 'active-color',
    'block-size': 'handle-size',
    'block-color': 'handle-color'
  }
}

// 通过 支付宝小程序的 ref 来实现
// selectComponent/selectAllComponents/selectOwnComponent 方法
const MOR_REF_METHOD_NAME = '$morSaveRef'

// 双向绑定dataset
const TWO_WAY_BINDING_DATASET = {
  morTwoWayBindingMethod: 'data-mortwbmethod',
  morTwoWayBindingEventKey: 'data-mortwbkey',
  morTwoWayBindingValue: 'data-mortwbvalue'
}

/**
 * 自定义 template 处理
 */
export const templateProcessorToAlipay = {
  onNode(node: posthtml.Node): void {
    processComponentCompatible(node)
  },

  onNodeExit(
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ): void {
    if (!node) return

    if (node.attrs) {
      const usingComponentNames: string[] = context.usingComponentNames || []

      // 检查当前节点是否为自定义组件标签, 如果是则需要通过 ref 注入组件实例到页面或组件
      if (usingComponentNames.includes(node.tag as string)) {
        node.attrs.ref = MOR_REF_METHOD_NAME
        // 支付宝小程序自定义组件设置 id 无效
        // 在这里单独保存下
        if (node.attrs.id) node.attrs.morTagId = node.attrs.id
        // 保存 tag 标签名称
        node.attrs.morTagName = node.tag
      }

      // 检查 block 的 hidden 属性
      // 并替换为 a:if
      // 原因为: 支付宝不支持, 小程序IDE编译过程中会输出警告
      if (node.tag === 'block' && node.attrs['hidden']) {
        const blockIf = {
          ...node,
          ...{
            attrs: {
              'a:if':
                (node.attrs as NodeAttributes)['hidden'] === true
                  ? '{{true}}'
                  : node.attrs['hidden']
            },
            content: []
          }
        }
        const blockElse = { ...node, ...{ attrs: {} } }
        ;(blockElse.attrs as NodeAttributes)['a:else'] = true
        node.content = [blockIf, blockElse]

        delete node.attrs['hidden']
      }

      // 检查 同一个 node 中是否同时存在 a:if 和 a:key
      // 如果同时存在 则 将 a:key 替换为 key
      if (node.attrs['a:if'] && node.attrs['a:key']) {
        if (!node.attrs['key']) {
          node.attrs['key'] = node.attrs['a:key']
          delete node.attrs['a:key']
        }
      }
    }

    // 支付宝不支持 大写的标签名, 需要全部转换为小写
    if (node.tag) node.tag = node.tag.toLowerCase()

    /**
     * 如果 sjs name 存在 this，会被转换成 thisSjs，此时如果 node content 中存在 this 调用，
     * 将 this 调用转换成  thisSjs 调用
     */
    if (
      context.sharedContext &&
      context.sharedContext.hasSjsModuleAttrNameAsThis
    ) {
      const { content } = node
      if (node.content) {
        node.content = content.map((c) => {
          if (typeof c === 'string') return c.replace(/this\./g, 'thisSjs.')
          return c
        })
      }
    }

    // 处理双向绑定支持
    processTwoWayBinding(node, context)
  },

  onNodeAttr(attrName: string, node: posthtml.Node): void {
    if (!node.tag) return

    // polyfills
    // 针对 native tags
    if (node.attrs[attrName] === '' && isNativeTag(node.tag)) {
      ;(node.attrs as NodeAttributes)[attrName] = true
    }

    // 修复所有 a:else
    if (attrName === 'a:else' && node.attrs[attrName] === '') {
      ;(node.attrs as NodeAttributes)[attrName] = true
    }

    // 事件处理
    processEventsAttributes(attrName, node)

    // 处理标签属性替换
    if (
      node.tag &&
      node.tag in TAG_SPECIFIC_PROP_NAME_MAPPINGS &&
      TAG_SPECIFIC_PROP_NAME_MAPPINGS[node.tag]
    ) {
      // 属性映射及替换
      const replaceAttrName =
        TAG_SPECIFIC_PROP_NAME_MAPPINGS[node.tag][attrName]
      if (replaceAttrName && replaceAttrName !== attrName) {
        node.attrs[replaceAttrName] = node.attrs[attrName]
        delete node.attrs[attrName]
      }
    }
  },

  onNodeAttrExit(
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ): void {
    // 支付宝不支持将 sjs 模块的名称命名为 this
    // 这里需要将其转换为 thisSjs
    if (!context.sharedContext) context.sharedContext = {}
    if (
      node.tag === sjsTagName &&
      attrName === sjsModuleAttrName &&
      node.attrs[attrName] === 'this'
    ) {
      node.attrs[attrName] = 'thisSjs'
      // 标记当前页面模版中存在 sjs 模块名称为 this
      context.sharedContext.hasSjsModuleAttrNameAsThis = true
    }

    // 如果当前页面有 this 作为 sjs 模块名称
    // 则替换为 thisSjs
    if (
      context.sharedContext.hasSjsModuleAttrNameAsThis &&
      node.tag !== sjsTagName &&
      typeof node.attrs[attrName] === 'string' &&
      node.attrs[attrName].includes('this.')
    ) {
      node.attrs[attrName] = node.attrs[attrName].replace(/this\./g, 'thisSjs.')
    }
  }
}

/**
 * 原生小程序组件事件在当前小程序环境中对应的事件
 */
const TAG_SPECIFIC_EVENT_MAPPINGS = {
  'scroll-view': {
    scrolltoupper: 'scrollToUpper',
    scrolltolower: 'scrollToLower',
    dragstart: 'touchStart',
    dragging: 'touchMove',
    dragend: 'touchEnd'
  },
  checkbox: {
    tap: 'change'
  },
  map: {
    regionchange: 'regionChange',
    markertap: 'markerTap',
    callouttap: 'calloutTap',
    controltap: 'controlTap'
  },
  swiper: {
    animationfinish: 'animationEnd'
  }
}

// 事件映射
const COMMON_EVENT_MAPPINGS = {
  touchstart: 'touchStart',
  touchmove: 'touchMove',
  touchend: 'touchEnd',
  touchcancel: 'touchCancel',
  tap: 'tap',
  longtap: 'longTap',
  longpress: 'longTap',
  load: 'load',
  change: 'change',
  transition: 'transition',
  transitionend: 'transitionEnd',
  animationstart: 'animationStart',
  animationiteration: 'animationIteration',
  animationend: 'animationEnd'
}

// 支付宝中 组件 attr 匹配命中前缀，需要更换写法 onXxxx catchXxxx
const EVENT_BIND_REGEXP = /^bind:|bind/
const EVENT_CATCH_REGEXP = /^catch:|catch/

/**
 * 处理事件转换
 * bind:abc => onAbc
 * catch:abc => catchAbc
 */
function processEventsAttributes(attrName: string, node: posthtml.Node) {
  // 如果 tag 不存在, 则跳过
  if (!node.tag) return

  let eventPrefix: string
  let eventAttrName: string

  if (EVENT_BIND_REGEXP.test(attrName)) {
    eventAttrName = attrName.replace(EVENT_BIND_REGEXP, '')
    eventPrefix = 'on'
  } else if (EVENT_CATCH_REGEXP.test(attrName)) {
    eventAttrName = attrName.replace(EVENT_CATCH_REGEXP, '')
    eventPrefix = 'catch'
  }
  // 其他情况不处理
  else {
    return
  }

  // 替换 native event 映射
  if (COMMON_EVENT_MAPPINGS[eventAttrName]) {
    eventAttrName = COMMON_EVENT_MAPPINGS[eventAttrName]
  }
  // 标签专属事件替换
  else if (
    node.tag in TAG_SPECIFIC_EVENT_MAPPINGS &&
    TAG_SPECIFIC_EVENT_MAPPINGS[node.tag] &&
    eventAttrName in TAG_SPECIFIC_EVENT_MAPPINGS[node.tag]
  ) {
    eventAttrName = TAG_SPECIFIC_EVENT_MAPPINGS[node.tag][eventAttrName]
  }
  // 否则该事件判定为用户自定义事件
  // 支付宝事件传递函数只支持 on 开头
  // 这里强制 eventPrefix 为 on
  else {
    eventPrefix = 'on'
  }

  if (eventPrefix && eventAttrName) {
    const eventName =
      eventPrefix +
      eventAttrName
        .replace(/^[a-zA-Z]{1}/, (s) => s.toUpperCase())
        .replace(/-./g, (s) => s[1].toUpperCase())
    node.attrs[eventName] = node.attrs[attrName]
    delete node.attrs[attrName]
  }
}

/**
 * 处理组件兼容性
 */
function processComponentCompatible(node: posthtml.Node) {
  // button 标签兼容
  if (node.tag === 'button' && node.attrs) {
    // 手机号码授权
    if (node.attrs['open-type'] === 'getPhoneNumber') {
      node.attrs['open-type'] = 'getAuthorize'
      node.attrs.scope = 'phoneNumber'
      node.attrs['onGetAuthorize'] = node.attrs['bind:getphonenumber']
      delete node.attrs['bind:getphonenumber']
    }

    // 用户信息授权
    if (node.attrs['open-type'] === 'getUserInfo') {
      node.attrs['open-type'] = 'getAuthorize'
      node.attrs.scope = 'userInfo'
      node.attrs['onGetAuthorize'] = node.attrs['bind:getuserinfo']
      delete node.attrs['bind:getuserinfo']
    }
  }
}

/**
 * 处理微信转支付宝的双向绑定支持
 */
function processTwoWayBinding(
  node: posthtml.Node,
  context: Record<string, any>
) {
  const attrs = node.attrs
  if (!attrs) return

  Object.keys(attrs).forEach(function (attrName) {
    // 双向绑定语法符合model:xx，如model:value={{bindingValue}}
    const leftKeyMatchedResult = attrName?.match(/model:(.*)/)

    if (!leftKeyMatchedResult?.[1]) return

    // model:value -> value
    const twoWayBindingLeftKey = leftKeyMatchedResult[1]
    const attrValue = attrs[attrName]
    attrs[twoWayBindingLeftKey] = attrValue
    delete attrs[attrName]

    // {{bindingValue}} -> bindingValue
    const rightKeyMatchedResult =
      typeof attrValue === 'string' ? attrValue.match(/{{(.+?)}}/) : []
    const twoWayBindingRightKey = rightKeyMatchedResult[1]?.trim()

    // 自定义组件
    const usingComponentNames: string[] = context.usingComponentNames || []
    if (usingComponentNames.includes(node.tag as string)) {
      attrs.onMorChildTWBProxy = '$morParentTWBProxy'

      // custom-property -> customProperty
      const processedLeftKey = twoWayBindingLeftKey.replace(/-./g, (s) =>
        s[1].toUpperCase()
      )

      // 同一个 tag，多个双向绑定时，存储键值对，供运行时消费
      // 格式为 a:b,c:d
      const bindMap = `${processedLeftKey}:${twoWayBindingRightKey}`
      if (attrs.morChildTwbMap) {
        if (!attrs.morChildTwbMap.includes(bindMap)) {
          attrs.morChildTwbMap = `${attrs.morChildTwbMap},${bindMap}`
        }
      } else {
        attrs.morChildTwbMap = bindMap
      }
    } else {
      // 已支持双向绑定的tag组件
      const tagComponent = twoWayBindingComponents[node.tag as string]
      if (!tagComponent) {
        return
      }

      // 双向绑定信息，存在 dataset 上,命名使用小写，兼容web端的dataset小写
      attrs[TWO_WAY_BINDING_DATASET.morTwoWayBindingMethod] =
        attrs[tagComponent.bindEventName]
      attrs[TWO_WAY_BINDING_DATASET.morTwoWayBindingEventKey] =
        tagComponent.bindEventKey
      attrs[TWO_WAY_BINDING_DATASET.morTwoWayBindingValue] =
        twoWayBindingRightKey

      // 自定义事件，劫持tag组件事件
      attrs[tagComponent.bindEventName] = '$morTWBProxy'
    }
  })
}
