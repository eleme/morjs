import { FileParserOptions, posthtml } from '@morjs/utils'
import {
  fileType,
  isSimilarTarget,
  target as CURRENT_TARGET
} from './constants'
import { templateProcessorToAlipay } from './templateProcessorToAlipay'
import { templateProcessorToOther } from './templateProcessorToOther'

/**
 * 是否需要处理 微信 DSL => 支付宝或支付宝类似小程序
 * @param options
 * @returns
 */
function shouldProcessToAlipay(options: FileParserOptions): boolean {
  // 目标是 支付宝或支付宝类似小程序
  // 且源码不是 支付宝 小程序
  // 且当前文件不是 支付宝 DSL 源文件
  if (
    isSimilarTarget(options.userConfig.target) &&
    options.userConfig.sourceType !== CURRENT_TARGET &&
    options.fileInfo.extname !== fileType.template
  ) {
    return true
  } else {
    return false
  }
}

/**
 * 是否需要处理 支付宝 DSL => 其他小程序
 */
function shouldProcessToOther(options: FileParserOptions): boolean {
  // 目标不是 支付宝或支付宝类似小程序
  // 且源码为 支付宝 小程序
  // 且当前文件为 支付宝 DSL 源文件
  if (
    !isSimilarTarget(options.userConfig.target) &&
    options.userConfig.sourceType === CURRENT_TARGET &&
    options.fileInfo.extname === fileType.template
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
    if (shouldProcessToAlipay(options)) {
      templateProcessorToAlipay.onNode(node)
    } else if (shouldProcessToOther(options)) {
      templateProcessorToOther.onNode(node, options)
    }
  },

  onNodeExit(
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ) {
    if (shouldProcessToAlipay(options)) {
      templateProcessorToAlipay.onNodeExit(node, options, context)
    } else if (shouldProcessToOther(options)) {
      templateProcessorToOther.onNodeExit(node, options, context)
    }
  },

  onNodeAttr(
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ): void {
    if (shouldProcessToAlipay(options)) {
      templateProcessorToAlipay.onNodeAttr(attrName, node)
    } else if (shouldProcessToOther(options)) {
      templateProcessorToOther.onNodeAttr(attrName, node, options, context)
    }
  },

  onNodeAttrExit(
    attrName: string,
    node: posthtml.Node,
    options: FileParserOptions,
    context: Record<string, any>
  ): void {
    if (shouldProcessToAlipay(options)) {
      templateProcessorToAlipay.onNodeAttrExit(attrName, node, options, context)
    }
  }
}
