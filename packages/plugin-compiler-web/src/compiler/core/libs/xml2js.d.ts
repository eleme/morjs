export interface Attributes {
  [key: string]: string | undefined
}

export interface DeclarationAttributes {
  version?: string | number
  encoding?: 'utf-8' | string
  standalone?: 'yes' | 'no'
}

export interface ElementCompact {
  [key: string]: any
  _declaration?: {
    _attributes?: DeclarationAttributes
  }
  _instruction?: {
    [key: string]: string
  }
  _attributes?: Attributes
  _cdata?: string
  _doctype?: string
  _comment?: string
  _text?: string | number
}

export interface Element {
  declaration?: {
    attributes?: DeclarationAttributes
  }
  instruction?: string
  attributes?: Attributes
  cdata?: string
  doctype?: string
  comment?: string
  text?: string
  type?: string
  name?: string
  elements?: Array<Element>
}

declare namespace Options {
  interface XML2JSON extends XML2JS {
    spaces?: number | string
  }

  interface XML2JS extends ChangingKeyNames, IgnoreOptions {
    compact?: boolean
    trim?: boolean
    sanitize?: boolean
    nativeType?: boolean
    addParent?: boolean
    alwaysArray?: boolean | Array<string>
    alwaysChildren?: boolean
    instructionHasAttributes?: boolean
    captureSpacesBetweenElements?: boolean
  }

  interface JS2XML extends ChangingKeyNames, IgnoreOptions {
    spaces?: number | string
    compact?: boolean
    indentText?: boolean
    indentCdata?: boolean
    indentAttributes?: boolean
    indentInstruction?: boolean
    fullTagEmptyElement?: boolean
    noQuotesForNativeAttributes?: boolean
  }

  interface IgnoreOptions {
    ignoreDeclaration?: boolean
    ignoreInstruction?: boolean
    ignoreAttributes?: boolean
    ignoreComment?: boolean
    ignoreCdata?: boolean
    ignoreDoctype?: boolean
    ignoreText?: boolean
  }

  interface ChangingKeyNames {
    declarationKey?: string
    instructionKey?: string
    attributesKey?: string
    textKey?: string
    cdataKey?: string
    doctypeKey?: string
    commentKey?: string
    parentKey?: string
    typeKey?: string
    nameKey?: string
    elementsKey?: string
  }
}

export default function (xml: string, option?: any): Element | ElementCompact
