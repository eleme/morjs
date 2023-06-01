import { FileParserOptions, posthtml } from '@morjs/utils'
import { target } from './constants'

// 支持双向绑定的组件配置
const TWO_WAY_BINDING_COMPONENTS = {
  input: {
    bindEventName: 'input',
    bindEventKey: 'value'
  },
  textarea: {
    bindEventName: 'input',
    bindEventKey: 'value'
  },
  swiper: {
    bindEventName: 'change',
    bindEventKey: 'current'
  },
  switch: {
    bindEventName: 'change',
    bindEventKey: 'value'
  },
  slider: {
    bindEventName: 'change',
    bindEventKey: 'value'
  },
  checkbox: {
    bindEventName: 'change',
    bindEventKey: 'value'
  },
  radio: {
    bindEventName: 'change',
    bindEventKey: 'value'
  },
  picker: {
    bindEventName: 'change',
    bindEventKey: 'value'
  },
  'picker-view': {
    bindEventName: 'bind:change',
    bindEventKey: 'value'
  }
}

// 双向绑定 dataset key 值
const TWO_WAY_BINDING_DATASET = {
  METHOD: 'data-mortwbmethod',
  EVENT_KEY: 'data-mortwbkey',
  VALUE: 'data-mortwbvalue'
}

const MOR_TWO_WAY_BINDING_MAP_KEY = 'mor-child-twb-map'

/**
 * 双向绑定的自定义 template 处理
 */
export const twbTemplateProcessor = {
  onNodeAttr(
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ): void {
    // 仅当微信 DSL 转其他符合条件的端的时候生效
    if (options?.userConfig?.sourceType !== target) return

    if (!attrName || !node.tag || !node.attrs) return

    const attrs = node.attrs

    // 双向绑定语法符合 model:xx，如 model:value={{bindingValue}}
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
      attrs['bind:mortwbproxy'] = '$morParentTWBProxy'

      // custom-property -> customProperty
      const processedLeftKey = twoWayBindingLeftKey.replace(/-./g, (s) =>
        s[1].toUpperCase()
      )

      // 同一个 tag，多个双向绑定时，存储键值对，供运行时消费
      // 格式为 a:b,c:d
      const bindMap = `${processedLeftKey}:${twoWayBindingRightKey}`
      if (attrs[MOR_TWO_WAY_BINDING_MAP_KEY]) {
        if (!attrs[MOR_TWO_WAY_BINDING_MAP_KEY].includes(bindMap)) {
          attrs[
            MOR_TWO_WAY_BINDING_MAP_KEY
          ] = `${attrs[MOR_TWO_WAY_BINDING_MAP_KEY]},${bindMap}`
        }
      } else {
        attrs[MOR_TWO_WAY_BINDING_MAP_KEY] = bindMap
      }
    } else {
      // 已支持双向绑定的 tag 组件
      const tagComponent = TWO_WAY_BINDING_COMPONENTS[node.tag as string]
      if (!tagComponent) {
        return
      }

      // 双向绑定信息，存在 dataset 上,命名使用小写，兼容 web 端的 dataset 小写
      // NOTE: method 这里是有限支持，未考虑所有的事件绑定替换场景
      let targetEventName = `bind:${tagComponent.bindEventName}`
      ;[
        `catch${tagComponent.bindEventName}`,
        `catch:${tagComponent.bindEventName}`,
        `bind${tagComponent.bindEventName}`,
        `bind:${tagComponent.bindEventName}`
      ].forEach(function (eventName) {
        if (attrs[eventName] && !attrs[TWO_WAY_BINDING_DATASET.METHOD]) {
          targetEventName = eventName
          attrs[TWO_WAY_BINDING_DATASET.METHOD] = attrs[eventName]
        }
        delete attrs[eventName]
      })
      attrs[TWO_WAY_BINDING_DATASET.EVENT_KEY] = tagComponent.bindEventKey
      attrs[TWO_WAY_BINDING_DATASET.VALUE] = twoWayBindingRightKey

      // 自定义事件，劫持 tag 组件事件
      attrs[targetEventName] = '$morTWBProxy'
    }
  }
}
