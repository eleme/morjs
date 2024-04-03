import { css, html, property } from 'lit-element'
import { BaseElement } from '../baseElement'

const codes = {
  amp: '&',
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  apos: "'"
}

const Rules = {
  a: 1,
  abbr: 1,
  b: 1,
  blockquote: 1,
  br: 1,
  code: 1,
  col: {
    span: 1,
    width: 1
  },
  colgroup: {
    span: 1,
    width: 1
  },
  dd: 1,
  del: 1,
  div: 1,
  dl: 1,
  dt: 1,
  em: 1,
  fieldset: 1,
  h1: 1,
  h2: 1,
  h3: 1,
  h4: 1,
  h5: 1,
  h6: 1,
  hr: 1,
  i: 1,
  img: {
    alt: 1,
    src: 1,
    height: 1,
    width: 1
  },
  ins: 1,
  label: 1,
  legend: 1,
  li: 1,
  ol: {
    start: 1,
    type: 1
  },
  p: 1,
  q: 1,
  span: 1,
  strong: 1,
  sub: 1,
  sup: 1,
  table: {
    width: 1
  },
  tbody: 1,
  td: {
    colspan: 1,
    height: 1,
    rowspan: 1,
    width: 1
  },
  tfoot: 1,
  th: {
    colspan: 1,
    height: 1,
    rowspan: 1,
    width: 1
  },
  thead: 1,
  tr: 1,
  ul: 1
}
// 维护 props => attribute 的映射
const PROPS_MAP = {
  className: 'class'
}

function decode(text) {
  return text.replace(/&([a-zA-Z]*?);/g, function (match, p) {
    if (Object.prototype.hasOwnProperty.call(codes, p) && codes[p]) {
      return codes[p]
    }
    if (/^#[0-9]{1,4}$/.test(p)) {
      return String.fromCharCode(p.slice(1))
    }
    if (/^#x[0-9a-f]{1,4}$/i.test(p)) {
      return String.fromCharCode(('0' + p.slice(1)) as any)
    }
    throw new Error('HTML Entity "' + match + '" is not supported.')
  })
}

function objectKeys(obj) {
  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
  }
  return []
}

export default class RichText extends BaseElement {
  static get styles() {
    return css`
      :host {
      }
    `
  }

  /**
   * nodes 节点
   */
  @property({ type: Array }) nodes = []

  /*

  @property({ type: Array }) nodes = [{
    name: 'div',
    attrs: {
      class: 'wrapper abc',
      style: 'color: orange;',
    },
    children: [{
      type: 'text',
      text: 'Hello&nbsp;World!',
    }, {
      name: 'span',
      attrs: {
        style: 'color: orange; font-size: 40px',
      },
      children: [{
        type: 'text',
        text: 'leon!'
      }]
    }],
  }];
   */

  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback()
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  getNodeProps(node, tagName) {
    const props: any = {}
    if ('object' !== typeof node.attrs) {
      return {}
    }
    const rule = Rules[tagName]
    objectKeys(node.attrs).forEach((key) => {
      const attr = key.toLowerCase()
      const attrValue = decode(node.attrs[key])
      if ('class' === attr) {
        props.className = attrValue
      } else if ('style' === attr) {
        props.style = attrValue
      } else if (
        rule &&
        Object.prototype.hasOwnProperty.call(rule, attr) &&
        rule[attr]
      ) {
        props[attr] = attrValue
      }
    })
    return props
  }

  parseNodes(nodes) {
    const res: any = []
    nodes.forEach((node) => {
      if ('object' === typeof node) {
        const isNodeType =
          undefined === node.type || 'node' === node.type || '' === node.type
        const isTextType =
          'text' === node.type &&
          'string' === typeof node.text &&
          '' !== node.text
        const hasName = 'string' === typeof node.name && '' !== node.name
        if (isNodeType && hasName) {
          const TagName = node.name.toLowerCase()
          if (
            Object.prototype.hasOwnProperty.call(Rules, TagName) &&
            Rules[TagName]
          ) {
            let children: any = null
            const props = this.getNodeProps(node, TagName)
            if (Array.isArray(node.children) && node.children.length) {
              children = this.parseNodes(node.children)
            }
            const n = this.parseHtmlTag(TagName, props, children)
            res.push(n)
          }
        } else if (isTextType) {
          res.push(decode(node.text))
        }
      }
    })
    return res
  }

  parseHtmlTag(tagName, props, children) {
    const element = document.createElement(tagName)
    // props 已经在 getNodeProps 中做了过滤处理，所以走到这里后应该全量设置
    const keys = Object.keys(props || {})
    if (keys.length > 0) {
      keys.forEach((key) => {
        element.setAttribute(PROPS_MAP[key] || key, props[key])
      })
    }

    if (!children) return element

    children.forEach((child) => {
      if (typeof child === 'string') {
        const textNode = document.createTextNode(child)
        element.appendChild(textNode)
      } else {
        element.appendChild(child)
      }
    })
    return element
    /*
    const classMapObj = this.parseClassMap(props.className);
    const styleMapObj = this.parseStyleMap(props.style);
    switch(tagName) {
      case 'div': return html`<div class=${classMap(classMapObj)} style=${styleMap(styleMapObj)}>${children}</div>`;
      case 'span': return html`<span class=${classMap(classMapObj)} style=${styleMap(styleMapObj)}>${children}</span>`;
      case 'p': return html`<p class=${classMap(classMapObj)} style=${styleMap(styleMapObj)}>${children}</p>`;
      default:
    }
    */
  }

  parseStyleMap(style: string = '') {
    const styleMapObj = {}
    style.split(';').forEach((item) => {
      const [attr = '', attrVal = ''] = item.split(':') || []
      if (attr && attrVal) {
        styleMapObj[attr.trim()] = attrVal.trim()
      }
    })
    return styleMapObj
  }

  parseClassMap(className = '') {
    const classMapObj = {}
    className.split(' ').forEach((item) => {
      if (item) classMapObj[item] = !!item
    })
    return classMapObj
  }

  renderContent() {
    let content
    const nodes =
      typeof this.nodes === 'string' ? JSON.parse(this.nodes) : this.nodes
    if (Array.isArray(nodes) && nodes.length > 0) {
      try {
        content = this.parseNodes(nodes)
      } catch (e) {
        console.error(e)
        content = null
      }
    } else {
      content = null
      console.group(
        new Date() + ' nodes属性只支持 Array 类型, 节点长度必须大于0'
      )
      console.warn('For developer:nodes属性只支持 Array 类型，请检查输入的值。')
      console.groupEnd()
    }
    return content
  }

  render() {
    const content = this.renderContent()
    return html`${content}`
  }
}
