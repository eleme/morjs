import {
  FileParserOptions,
  logger,
  posthtml,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import {
  getEventName,
  getNativeEventName,
  getNativePropName,
  isCatchEventAttr,
  isEventAttr,
  isNativeEvent
} from './templateEvents'
import { isNativeTag } from './templateTags'

type NodeAttributes = Record<string, string | number | boolean>

/**
 * 自定义 template 处理
 * 处理 支付宝转 其他小程序的兼容性
 */
export const templateProcessorToOther = {
  onNode(node: posthtml.Node, options: FileParserOptions): void {
    processComponentCompatible(node, options)

    if (node.content && node.content.length) {
      node.content = node.content.map(function (value) {
        // 处理函数调用
        return processAttrFuncionCall(
          // 处理模版字符串
          processTemplateString(value)
        )
      })
    }
  },

  onNodeExit(
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ) {
    processEventProxy(node, options, context)
  },

  onNodeAttr(
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ): void {
    // polyfills
    // 针对 native tags
    if (node.attrs[attrName] === '' && node.tag && isNativeTag(node.tag)) {
      ;(node.attrs as NodeAttributes)[attrName] = true
    }

    // a:else 检查
    processAElseCheck(attrName, node, options)

    if (node.attrs[attrName]) {
      // 方法调用转换支持
      node.attrs[attrName] = processAttrFuncionCall(
        // 模版字符串处理
        processTemplateString(node.attrs[attrName])
      )
    }

    // 事件处理
    processEventsAttributes(attrName, node, options, context)

    // 初始 style 对象支持
    processStyleAttrObject(attrName, node, context)

    if (node.tag && isNativeTag(node.tag)) {
      // 属性映射及替换
      const replaceAttrName = getNativePropName(node.tag, attrName)
      if (replaceAttrName !== attrName) {
        node.attrs[replaceAttrName] = node.attrs[attrName]
        delete node.attrs[attrName]
      }
    } else {
      // 非 native 的样式兼容
      // NOTE: 需要了解原因
      if (attrName === 'style') {
        node.attrs['morStyle'] = node.attrs['style']
        delete node.attrs['style']
      }
    }

    if (
      typeof node.attrs[attrName] === 'string' &&
      /\n/.test(node.attrs[attrName])
    ) {
      // 其他平台 attr 值 不支持换行
      node.attrs[attrName] = node.attrs[attrName].replace(/\n/g, '').trim()
    }
  }
}

// 事件代理名称
const PROXY_EVENT_NAME = '$morEventHandlerProxy'
const EVENT_HANDLER_NAME = 'data-mor-event-handlers'
const PROXY_DISABLE_EVENT_NAME = '$morDisableScrollProxy'

/**
 * 将事件代理存储到 node 节点上
 */
function processEventProxy(
  node: posthtml.Node,
  options: FileParserOptions,
  context: Record<string, any>
) {
  if (
    context.morHandlersMap &&
    Object.keys(context.morHandlersMap).length &&
    !options.userConfig?.processComponentsPropsFunction
  ) {
    node.attrs[EVENT_HANDLER_NAME] = Buffer.from(
      JSON.stringify(context.morHandlersMap)
    ).toString('base64')

    delete context.morHandlersMap
  }
}

/**
 * 处理事件转换
 */
function processEventsAttributes(
  attrName: string,
  node: posthtml.Node,
  options: FileParserOptions,
  context: Record<string, any>
) {
  // 如果 tag 不存在, 则跳过
  if (!node.tag) return

  const morHandlersMap: Record<string, string> = context.morHandlersMap || {}

  // 判断是否是 onTap 等以 on 开头的事件属性
  if (isEventAttr(attrName)) {
    // eventName 是去掉 on 且把事件名首字母改成小写
    // 比如 onTouchStart 将会得到touchStart
    const eventName = getEventName(attrName)
    const isNativeEventName = isNativeEvent(eventName, node.tag)

    // 组件的原生事件不走代理模式
    if (isNativeEventName) {
      const newAttr = `bind:${getNativeEventName(eventName, node.tag)}`
      node.attrs[newAttr] = node.attrs[attrName]
    } else {
      const newAttr = `bind:${eventName}`
      node.attrs[newAttr] = options.userConfig?.processComponentsPropsFunction
        ? node.attrs[attrName]
        : PROXY_EVENT_NAME
      morHandlersMap[eventName] = node.attrs[attrName] as string
    }

    delete node.attrs[attrName]
  }

  // catchTap 等以 catch 开头的事件属性
  else if (isCatchEventAttr(attrName)) {
    const eventName = getEventName(attrName)
    // catch 暂且理解为只有原生事件, 后续需要提供更好的兼容
    const newAttr = `catch:${getNativeEventName(eventName, node.tag)}`
    node.attrs[newAttr] = node.attrs[attrName]
    delete node.attrs[attrName]
  }

  // 支持 ref 引用传递
  else if (attrName === 'ref') {
    node.attrs['bind:ref'] = PROXY_EVENT_NAME
    morHandlersMap.ref = node.attrs[attrName] as string
    delete node.attrs[attrName]
  }

  context.morHandlersMap = morHandlersMap
}

/**
 * 检查 a:else 有效性
 */
function processAElseCheck(
  attrName: string,
  node: posthtml.Node,
  options: FileParserOptions
) {
  if (attrName === 'a:else') {
    const value = node.attrs[attrName]

    if (value !== '' && value !== true) {
      logger.warn(
        'a:else 不能有业务逻辑，请直接使用 a:else 即可\n' +
          `文件路径: ${options.fileInfo.path}`
      )
    }

    node.attrs[attrName] = true
  }
}

/**
 * 处理组件兼容性
 */
function processComponentCompatible(
  node: posthtml.Node,
  options: FileParserOptions
) {
  // text 标签兼容
  if (node.tag === 'text' && node.attrs && node.attrs['number-of-lines']) {
    const numberOfLines = node.attrs['number-of-lines']
    const lines = Number(numberOfLines)
    let appendStyle: string
    if (
      (isNaN(lines) &&
        typeof numberOfLines === 'string' &&
        numberOfLines.startsWith('{{')) ||
      lines >= 1
    ) {
      // 这里的处理和支付宝的做法保持一致，单行文本也是用这种方式处理
      appendStyle =
        'overflow:hidden;text-overflow:ellipsis;' +
        `display:-webkit-box;-webkit-line-clamp:${
          isNaN(lines) ? numberOfLines : lines
        };-webkit-box-orient:vertical;user-select:none;`
    } else {
      logger.warn(
        'text 组件的 number-of-lines 属性请设置为 >=1 的数字\n' +
          `文件路径: ${options.fileInfo.path}`
      )
    }

    // 样式兼容
    if (appendStyle) {
      if (node.attrs.style) {
        node.attrs.style = `${appendStyle}${node.attrs.style}`
      } else {
        node.attrs.style = appendStyle
      }
    }

    /**
     * TODO: 后面看下其他端是否也有同样的问题
     * 在微信下，如果文本内容有换行符会导致缩略文本的样式异常
     **/
    if (
      node.content &&
      node.content.length === 1 &&
      typeof node.content[0] === 'string'
    ) {
      node.content[0] = node.content[0].replace(/\n/g, '')
    }

    delete node.attrs['number-of-lines']
  }

  // button 标签兼容
  if (node.tag === 'button' && node.attrs) {
    // 授权相关
    if (node.attrs['open-type'] === 'getAuthorize') {
      if (!node.attrs['onGetAuthorize']) {
        logger.warn(
          'button 组件, 用户授权相关需要设置 onGetAuthorize 回调\n' +
            `文件地址: ${options.fileInfo.path}`
        )
      }

      // 手机号码授权
      if (node.attrs.scope === 'phoneNumber') {
        node.attrs['open-type'] = 'getPhoneNumber'
        node.attrs['bind:getphonenumber'] = node.attrs['onGetAuthorize']
        delete node.attrs['onGetAuthorize']
      }

      // 用户信息授权
      if (node.attrs.scope === 'userInfo') {
        node.attrs['open-type'] = 'getUserInfo'
        node.attrs['bind:getuserinfo'] = node.attrs['onGetAuthorize']
        delete node.attrs['onGetAuthorize']
      }
    }
  }

  // 通过 catchtouchmove 来实现阻止 view 滚动
  if (
    node.tag === 'view' &&
    node.attrs &&
    // view 上面有 disable-scroll 属性
    'disable-scroll' in node.attrs &&
    // view 维度的禁用
    !('data-mor-transform-disable' in node.attrs)
  ) {
    if ('catchTouchMove' in node.attrs) {
      logger.warn(
        'view 的 disable-scroll 属性抹平需要用到 catchTouchMove 事件, 当前文件中被占用\n' +
          `文件路径: ${options.fileInfo.path}`
      )
    } else {
      const value = node.attrs['disable-scroll'] as string
      const reg = /\{\{([\w\W]*?)\}\}/m
      node.attrs['data-disable-scroll'] = node.attrs['disable-scroll']

      // 如果是 {{variable}} 的类型
      if (reg.test(value)) {
        const match = reg.exec(value)
        if (match) {
          node.attrs[
            'catchTouchMove'
          ] = `{{(${match[1]}) ? '${PROXY_DISABLE_EVENT_NAME}' : ''}}`
        } else {
          logger.warn(
            'view 的 disable-scroll 属性匹配出错\n' +
              `文件路径: ${options.fileInfo.path}`
          )
        }
      } else {
        node.attrs['catchTouchMove'] =
          value === 'true' ? PROXY_DISABLE_EVENT_NAME : ''
      }

      delete node.attrs['disable-scroll']
    }
  }
}

function unicodeEscapeRegexp() {
  return /\\u([a-f0-9]{4})/gi
}

/**
 * 判断是否有转义的 unicode 字符
 * @param content - 内容
 * @returns 是否有转义的 unicode 字符
 */
function hasEscapedUnicode(content: string): boolean {
  return unicodeEscapeRegexp().test(content)
}

/**
 * 处理 模版字符串
 * 兼容支付宝小程序模版字符串语法：{{`xxx ${a}`}} 会被转化为 {{'xxx' + a}}
 */
function processTemplateString(content: any): any {
  if (typeof content === 'string') {
    if (
      (content.indexOf('{{') < content.indexOf('`') &&
        content.indexOf('`') < content.indexOf('}}')) ||
      /\{\{[\w\W]*?`[\w\W]*?`[\w\W]*?\}\}/.test(content)
    ) {
      return content.replace(/\{\{([\w\W]*?)\}\}/g, (_, matchStr) => {
        let es5Code = ts
          .transpileModule(matchStr, {
            compilerOptions: {
              module: ts.ModuleKind.None,
              target: ts.ScriptTarget.ES5,
              noImplicitUseStrict: true
            }
          })
          .outputText.replace(/;\n/, '')

        // 处理双引号包裹单引号的问题
        // 由于后续的逻辑中会将双引号全部替换为单引号
        // 这里将单引号进行转义处理
        if (es5Code.includes('"') && es5Code.includes("'")) {
          es5Code = es5Code.replace(/"([^"]*)"/g, function (s) {
            return s.replace(/([^\\])?'/g, "$1\\'")
          })
        }

        es5Code = es5Code.replace(/"/g, "'").replace(/'\\''/g, "'\"'")

        // 判断是否存在 cjk 字符被转换为了 \uxxxx
        // 判断条件为: 转换前不符合 UNICODE_ESCAPE_REGEXP 规则
        //           转换后符合 UNICODE_ESCAPE_REGEXP 规则
        if (!hasEscapedUnicode(matchStr) && hasEscapedUnicode(es5Code)) {
          // 修复 ts 处理 tempalte literal 时会将中文字符转换为 \uxxxx 的问题
          // 将其恢复为中文字符, 避免 *xml 渲染时显示错误
          es5Code = es5Code.replace(unicodeEscapeRegexp(), function (_, hex) {
            return String.fromCharCode(parseInt(hex, 16))
          })
        }

        return `{{${es5Code}}}`
      })
    }
  }

  return content
}

/**
 * 处理 style 属性中的对象
 * 增加 {{ height: '20rpx' }} 转换支持，将其转换为 {{morSjs.s({ height: '20rpx' })}}
 */
function processStyleAttrObject(
  attrName: string,
  node: posthtml.Node,
  context: Record<string, any>
) {
  if (
    attrName === 'style' &&
    typeof node.attrs[attrName] === 'string' &&
    /^ *\{\{[\n ]*[a-zA-Z0-9$_]+ *\:[\w\W]+\}\} *$/.test(node.attrs[attrName])
  ) {
    node.attrs[attrName] = node.attrs[attrName].replace(
      /\{\{([\w\W]*?)\}\}/g,
      (_: string, matchStr: string) => {
        // 标记为需要注入 sjs 对象支持
        context.injectSjsObjectSupport = true
        return `{{morSjs.s({${matchStr}})}}`
      }
    )
  }
}

// 支持的函数调用
const SUPPORT_FUNCTION_CALL_NAMES = [
  'toLowerCase',
  'toUpperCase',
  'slice',
  'includes',
  'toString',
  'indexOf'
]
// 判断是否包含符合条件的调用方式
const FUNCTION_CALL_REGEXP = new RegExp(
  `(\\.(${SUPPORT_FUNCTION_CALL_NAMES.join('|')})\\(|typeof )`
)
/**
 * 处理属性中的方法调用，支持：
 * - typeof a === 'string' => morSjs.toType(a) === 'string'
 * - a.toLowerCase() => morSjs.toLowerCase(a)
 * - a.toUpperCase() => morSjs.toUpperCase(a)
 * - a.slice(0,1) => morSjs.slice(a, 0, 1)
 * - a.includes(b) => morSjs.includes(a, b)
 * - a.indexOf(b) => morSjs.indexOf(a, b)
 * - a.toString() => morSjs.toString(a)
 */
function processAttrFuncionCall(value: string) {
  if (!value) return value
  if (typeof value !== 'string') return value
  if (!/{{(.*?)}}/.test(value)) return value
  if (!FUNCTION_CALL_REGEXP.test(value)) return value

  return value.replace(/{{(.*?)}}/g, function (matchStr, captureStr) {
    if (!FUNCTION_CALL_REGEXP.test(matchStr)) return matchStr

    ts.transpileModule(captureStr, {
      compilerOptions: {
        module: ts.ModuleKind.None,
        target: ts.ScriptTarget.Latest,
        noImplicitUseStrict: true
      },
      transformers: {
        before: [
          tsTransformerFactory(function (node) {
            // 处理 typeof
            if (ts.isTypeOfExpression(node)) {
              captureStr = captureStr.replace(
                node.getText(),
                `morSjs.toType(${node.expression.getFullText().trim()})`
              )
            }

            // 处理函数调用
            if (
              ts.isCallExpression(node) &&
              ts.isPropertyAccessExpression(node.expression)
            ) {
              const functionName = node.expression
                .getChildAt(node.expression.getChildCount() - 1)
                ?.getText?.()
              if (SUPPORT_FUNCTION_CALL_NAMES.includes(functionName)) {
                const arg1 = node.expression
                  .getText()
                  .replace(new RegExp(`\\.${functionName}$`), '')
                const allArgs = [arg1].concat(
                  node.arguments.map((arg) => arg.getText())
                )

                captureStr = captureStr.replace(
                  node.getText(),
                  `morSjs.${functionName}(${allArgs.join(',')})`
                )
              }
            }
            return node
          })
        ]
      }
    })

    return `{{${captureStr}}}`
  })
}
