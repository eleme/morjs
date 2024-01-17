import DataBinding from './data-binding/index'

// export  dataBindingNode;

interface BaseNode {
  type: Node['type']
}

export type Node =
  | Document
  | TemplateNode
  | Element
  | ImportNode
  | ElementAtrrbute
  | FragmentNode
  | DataBindingNode
  | ImportSJSNode

export type Element =
  | ElementNode
  | ForElementNode
  | TextNode
  | IfElementNode
  | ElseIfElementNode
  | ElseElementNode
  | UseTemplateNode
  | SlotNode
  | UseSlotNode
  | IncludeNode
  | BlockNode
  | CommentNode
  | SlotScopeNode

export type ElementAtrrbute =
  | RefAttributeNode
  | AttributeNode
  | EventAttributeNode
  | StyleAttributeNode
  | ClassAttributeNode
  | NamedSlotAttributeNode
  | UnSupportAttribute

export interface Document extends BaseNode {
  type: 'Document'
  fragment: FragmentNode
  imports: Array<ImportNode | ImportSJSNode>
  templates: Array<TemplateNode>
}

export function document(
  imports: Array<ImportNode>,
  templates: Array<TemplateNode>,
  fragment: FragmentNode
): Document {
  return {
    type: 'Document',
    imports,
    templates,
    fragment
  }
}

export interface DataBindingNode extends BaseNode {
  type: 'DataBindingNode'
  express: string
  readonly hasBinding: boolean
  readonly bindingExpression: string
  readonly bindingVars: Set<string>
  getExpressionAst(options?)
  getExpressionAstForText()
}

export function dataBindingNode(express: string): DataBindingNode {
  return new DataBinding(express)
}

export interface FragmentNode extends BaseNode {
  type: 'FragmentNode'
  body: Array<Element>
}

export function fragmentNode(body: Array<Element>): FragmentNode {
  return {
    type: 'FragmentNode',
    body
  }
}

export function isFragmentNode(node: BaseNode): boolean {
  return node.type === 'FragmentNode'
}
export interface ImportNode extends BaseNode {
  type: 'ImportNode'
  src?: string
  // expresion: string;
  name?: string
  from?: string
}

export function importNode(
  src?: string,
  name?: string,
  from?: string
): ImportNode {
  return {
    type: 'ImportNode',
    src,
    name,
    from
  }
}

export interface ImportSJSNode extends BaseNode {
  type: 'ImportSJSNode'
  name?: string
  from?: string
  src?: string
}

export function importSJSNode(name?: string, from?: string): ImportSJSNode {
  return {
    type: 'ImportSJSNode',
    name,
    from
  }
}

export interface IncludeNode extends BaseNode {
  type: 'IncludeNode'
  src: string
  name?: string
}

export function includeNode(src: string): IncludeNode {
  return {
    type: 'IncludeNode',
    src
  }
}

/**
 * 元素节点
 */
export interface ElementNode extends BaseNode {
  type: 'ElementNode'
  name: string
  attributes: Array<ElementAtrrbute>
  children: Array<Element>
  nodeId: string
}

export function elementNode(
  name: string,
  nodeId: string,
  attributes: Array<ElementAtrrbute> = [],
  children: Array<Element> = []
): ElementNode {
  return {
    type: 'ElementNode',
    name,
    attributes,
    children,
    nodeId
  }
}

export function isElementNode(node: BaseNode): boolean {
  return node.type === 'ElementNode'
}

export interface BlockNode extends BaseNode {
  type: 'BlockNode'
  children: Array<Element>
  attributes: Array<ElementAtrrbute>
  name?: string
}

export function blockNode(
  children: Array<Element> = [],
  attributes: Array<ElementAtrrbute> = []
): BlockNode {
  return {
    type: 'BlockNode',
    children,
    attributes
  }
}

/**
 * for节点
 */
export interface ForElementNode extends BaseNode {
  type: 'ForElementNode'
  name?: string
  expresion: DataBindingNode
  element: Element
  // key?: DataBindingNode;  NOTE: key 通过在处理ast 的过程中，添加attribute 来实现
  item?: string
  index?: string
}

export function forElementNode(
  expresion: DataBindingNode,
  element: Element
): ForElementNode {
  return {
    type: 'ForElementNode',
    expresion,
    element
  }
}

export interface IfElementNode extends BaseNode {
  type: 'IfElementNode'
  expresion: DataBindingNode
  ifElement: Element
  elseIfElements: ElseIfElementNode[]
  elseElement?: ElseElementNode
  name?: string
}

export function ifElementNode(
  expresion: DataBindingNode,
  ifElement: Element
): IfElementNode {
  return {
    type: 'IfElementNode',
    expresion,
    ifElement,
    elseIfElements: []
  }
}

export interface ElseIfElementNode extends BaseNode {
  type: 'ElseIfElementNode'
  expresion: DataBindingNode
  element: Element
  name?: string
}

export function elseIfElementNode(
  expresion: DataBindingNode,
  element: Element
): ElseIfElementNode {
  return {
    type: 'ElseIfElementNode',
    expresion,
    element
  }
}

export interface ElseElementNode extends BaseNode {
  type: 'ElseElementNode'
  element: Element
  name?: string
}

export function elseElementNode(element: Element): ElseElementNode {
  return {
    type: 'ElseElementNode',
    element
  }
}

/**
 * 使用模板的节点
 */
export interface UseTemplateNode extends BaseNode {
  type: 'UseTemplateNode'
  templateName: DataBindingNode
  dataExpression: DataBindingNode
  name?: string
}

export function useTemplateNode(
  templateName: DataBindingNode,
  dataExpression: DataBindingNode
): UseTemplateNode {
  return {
    type: 'UseTemplateNode',
    templateName,
    dataExpression
  }
}

export function isUseTemplateNode(node: BaseNode): boolean {
  return node.type === 'UseTemplateNode'
}

/**
 * 元素属性
 */
export interface AttributeNode extends BaseNode {
  type: 'AttributeNode'
  name: string // 属性名称
  value: DataBindingNode // 属性值
}

export function attributeNode(
  name: string,
  value: DataBindingNode
): AttributeNode {
  return {
    type: 'AttributeNode',
    name,
    value
  }
}

/* alipay 不支持的属性 */
export interface UnSupportAttribute extends BaseNode {
  type: 'UnSupportAttributeNode'
  name: string // 属性名称
  value: DataBindingNode // 属性值
}

export function makeUnSupportAttributeNode(
  name: string,
  value: DataBindingNode
): UnSupportAttribute {
  return {
    type: 'UnSupportAttributeNode',
    name,
    value
  }
}
/**
 * 事件属性节点
 */
export interface EventAttributeNode extends BaseNode {
  type: 'EventAttributeNode'
  name: string // 事件名称
  value: DataBindingNode // 事件值,
  isCatch: boolean // 是否捕获事件
}

export function eventAttributeNode(
  name: string,
  value: DataBindingNode,
  isCatch: boolean = false
): EventAttributeNode {
  return {
    type: 'EventAttributeNode',
    name,
    value,
    isCatch
  }
}

/**
 * ref 引用的属性节点
 */
export interface RefAttributeNode extends BaseNode {
  type: 'RefAttributeNode'
  value: DataBindingNode
}

export function refAttributeNode(value: DataBindingNode): RefAttributeNode {
  return {
    type: 'RefAttributeNode',
    value
  }
}

export interface StyleAttributeNode extends BaseNode {
  type: 'StyleAttributeNode'
  value: DataBindingNode
}

export function styleAttributeNode(value: DataBindingNode): StyleAttributeNode {
  return {
    type: 'StyleAttributeNode',
    value
  }
}

export interface ClassAttributeNode extends BaseNode {
  type: 'ClassAttributeNode'
  value: DataBindingNode
}

export function classAttributeNode(value: DataBindingNode): ClassAttributeNode {
  return {
    type: 'ClassAttributeNode',
    value
  }
}

/**
 * 文本节点
 */
export interface TextNode extends BaseNode {
  type: 'TextNode'
  text: DataBindingNode
  name?: string
}

export function textNode(text: DataBindingNode): TextNode {
  return {
    type: 'TextNode',
    text
  }
}

/**
 * 模板节点
 */
export interface TemplateNode extends BaseNode {
  type: 'TemplateNode'
  name: string //模板名称
  fragment: FragmentNode
}

export function templateNode(
  name: string,
  fragment: FragmentNode
): TemplateNode {
  return {
    type: 'TemplateNode',
    name,
    fragment
  }
}

export function isTemplateNode(node: BaseNode): boolean {
  return node.type === 'TemplateNode'
}

/**
 * 定义slot
 */
export interface SlotNode extends BaseNode {
  type: 'SlotNode'
  name?: DataBindingNode
  attributes: Array<ElementAtrrbute>
  children: Array<Element>
}

export function slotNode(
  children: Array<Element>,
  attributes: Array<ElementAtrrbute>,
  name?: DataBindingNode
): SlotNode {
  return {
    type: 'SlotNode',
    name,
    attributes,
    children
  }
}

export interface NamedSlotAttributeNode extends BaseNode {
  type: 'NamedSlotAttributeNode'
  name: DataBindingNode
}

export function namedSlotAttributeNode(
  name: DataBindingNode
): NamedSlotAttributeNode {
  return {
    type: 'NamedSlotAttributeNode',
    name
  }
}

/**
 * 使用slot
 */
export interface UseSlotNode extends BaseNode {
  type: 'UseSlotNode'
  name: string
  element: Element
}

export interface SlotScopeNode extends BaseNode {
  type: 'SlotScopeNode'
  value: string
  slot?: string
  element: Element
  name?: string
}

export function slotScopeNode(
  value: string,
  element: Element,
  slot?: string
): SlotScopeNode {
  return {
    type: 'SlotScopeNode',
    value,
    element,
    slot
  }
}

/**
 * 注释节点
 */
export interface CommentNode extends BaseNode {
  type: 'CommentNode'
  comment: string
  name?: string
}

export function commentNode(comment: string): CommentNode {
  return {
    type: 'CommentNode',
    comment
  }
}
