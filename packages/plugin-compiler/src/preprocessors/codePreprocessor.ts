import { logger } from '@morjs/utils'
import { EOL } from 'os'
import XRegExp from 'xregexp'
import {
  AllConfigFileTypes,
  AllScriptFileTypes,
  AllSjsFileTypes,
  AllStyleFileTypes,
  AllTemplateFileTypes
} from '../constants'

interface PreprocessRule {
  start: string
  end: string
}

interface PreprocessProcessorOptions {
  type: { if: PreprocessRule }
  srcEol: string
}

interface PreprocessProcessor {
  (
    startMatches: RegExpExecArray | null,
    endMatches: RegExpExecArray | null,
    include: string | null,
    recurse: (content: string) => string
  ): string
}

const JsLikeFileExts = [
  ...AllStyleFileTypes,
  ...AllConfigFileTypes,
  ...AllScriptFileTypes,
  ...AllSjsFileTypes,
  '.jsx',
  '.tsx'
]

const XmlLikeFileExts = AllTemplateFileTypes

type JsLikeFileExtType = (typeof JsLikeFileExts)[number]
type XmlLikeFileExtType = (typeof XmlLikeFileExts)[number]

// 条件编译的正则
const RegexRules = {
  xml: {
    if: {
      start:
        '[ \t]*<!--[ \t]*#(ifndef|ifdef|if)[ \t]+(.*?)[ \t]*(?:-->|!>)(?:[ \t]*\n+)?',
      end: '[ \t]*<!(?:--)?[ \t]*#endif[ \t]*(?:-->|!>)(?:[ \t]*\n)?'
    }
  },
  js: {
    if: {
      start:
        '[ \t]*(?://|/\\*)[ \t]*#(ifndef|ifdef|if)[ \t]+([^\n*]*)(?:\\*(?:\\*|/))?(?:[ \t]*\n+)?',
      end: '[ \t]*(?://|/\\*)[ \t]*#endif[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*\n)?'
    }
  }
}

function normalizeEol(source: string, indent?: string): string {
  if (indent) {
    source = source.replace(/(?:\r?\n)|\r/g, '\n' + indent)
  } else {
    source = source.replace(/(?:\r\n)|\r/g, '\n')
  }

  return source
}

function restoreEol(normalizedSource: string, originalEol: string): string {
  if (originalEol !== '\n') {
    normalizedSource = normalizedSource.replace(/\n/g, originalEol)
  }

  return normalizedSource
}

// eslint-disable-next-line @typescript-eslint/ban-types
function getTestTemplate(test: string): Function {
  test = test || 'true'
  test = test.trim()

  // force single equals replacement
  test = test.replace(/([^=!])=([^=])/g, '$1==$2')
  test = test.replace(/-/g, '_')

  /* eslint-disable no-new-func */
  return new Function(
    'context',
    `
    try {
      with (context || {}) {
        return (${test})
      }
    } catch (err) {
      return err
    }
  `
  )
}

function getDeepPropFromObj(
  obj: Record<string, any>,
  propPath: string
): Record<string, any> {
  propPath.replace(/\[([^\]+?])\]/g, '.$1')
  const propPaths = propPath.split('.')

  // fast path, no need to loop if structurePath contains only a single segment
  if (propPaths.length === 1) {
    return obj[propPaths[0]]
  }

  // loop only as long as possible (no exceptions for null/undefined property access)
  propPaths.some(function (pathSegment) {
    obj = obj[pathSegment]
    return obj == null
  })

  return obj
}

function testPasses(test: string, context: Record<string, any>): boolean {
  const testFn = getTestTemplate(test)
  try {
    return testFn(context, getDeepPropFromObj)
  } catch (e) {
    logger.warn(e)
  }
  return false
}

function replaceRecursive(
  rv: string,
  rule: PreprocessRule,
  processor: PreprocessProcessor
): string {
  if (!rule.start || !rule.end) {
    throw new Error('Recursive rule must have start and end.')
  }

  const startRegex = new RegExp(rule.start, 'mi')
  const endRegex = new RegExp(rule.end, 'mi')

  function matchReplacePass(content: string): string {
    const matches = XRegExp.matchRecursive(
      content,
      rule.start,
      rule.end,
      'gmi',
      {
        valueNames: ['between', 'left', 'match', 'right']
      }
    )

    // 如果未命中则直接返回内容
    if (matches.length === 0) return content

    const matchGroup = {
      left: null,
      match: null,
      right: null
    } as {
      left: null | RegExpExecArray
      match: null | string
      right: null | RegExpExecArray
    }

    return matches.reduce(function (builder, match) {
      switch (match.name) {
        case 'between':
          builder += match.value
          break
        case 'left':
          matchGroup.left = startRegex.exec(match.value)
          break
        case 'match':
          matchGroup.match = match.value
          break
        case 'right':
          matchGroup.right = endRegex.exec(match.value)
          builder += processor(
            matchGroup.left,
            matchGroup.right,
            matchGroup.match,
            matchReplacePass
          )
          break
      }
      return builder
    }, '')
  }

  return matchReplacePass(rv)
}

function preprocessor(
  src: string,
  context: Record<string, any>,
  opts: PreprocessProcessorOptions,
  noRestoreEol?: boolean,
  filePath?: string
): string {
  let rv = normalizeEol(src)

  const processor: PreprocessProcessor = (
    startMatches,
    endMatches,
    include,
    recurse
  ) => {
    if (!startMatches || !endMatches || !include) return ''

    const variant = startMatches[1]
    const test = (startMatches[2] || '').trim()

    switch (variant) {
      case 'if': {
        let testResult = testPasses(test, context) as any
        // 当前传入的 context 没有该 key
        if (testResult instanceof ReferenceError) {
          logger.warn(
            '当前条件编译中找不到变量，将按照条件执行结果为 false 处理\n' +
              `条件判断语句: ${test}\n` +
              `报错信息: ${testResult.message}` +
              (filePath ? `\n文件路径: ${filePath}` : '')
          )
        }

        if (typeof testResult !== 'boolean') testResult = false

        return testResult ? recurse(include) : ''
      }
      case 'ifdef':
        return typeof getDeepPropFromObj(context, test) !== 'undefined'
          ? recurse(include)
          : ''
      case 'ifndef':
        return typeof getDeepPropFromObj(context, test) === 'undefined'
          ? recurse(include)
          : ''
      default:
        throw new Error('Unknown if variant ' + variant + '.')
    }
  }

  if (opts.type.if) rv = replaceRecursive(rv, opts.type.if, processor)

  if (!noRestoreEol) rv = restoreEol(rv, opts.srcEol)

  return rv
}

function getEolType(source: string): string {
  let eol: string
  let foundEolTypeCnt = 0

  if (source.indexOf('\r\n') >= 0) {
    eol = '\r\n'
    foundEolTypeCnt++
  }

  if (/\r[^\n]/.test(source)) {
    eol = '\r'
    foundEolTypeCnt++
  }

  if (/[^\r]\n/.test(source)) {
    eol = '\n'
    foundEolTypeCnt++
  }

  if (eol == null || foundEolTypeCnt > 1) eol = EOL

  return eol
}

export function preprocess(
  sourceCode: string,
  context: Record<string, any>,
  ext: string,
  filePath?: string
): string {
  let type: string

  if (JsLikeFileExts.includes(ext as JsLikeFileExtType)) {
    type = 'js'
  } else if (XmlLikeFileExts.includes(ext as XmlLikeFileExtType)) {
    type = 'xml'
  }

  if (!type) return sourceCode

  return preprocessor(
    sourceCode,
    context,
    { type: RegexRules[type], srcEol: getEolType(sourceCode) },
    undefined,
    filePath
  )
}
