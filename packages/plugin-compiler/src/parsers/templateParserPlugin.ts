import {
  EntryBuilderHelpers,
  FileParserOptions,
  logger,
  Plugin,
  posthtml,
  Runner,
  slash,
  SourceTypes
} from '@morjs/utils'
import path from 'path'
import {
  CompilerTemplateDirectives,
  CompilerTemplateProcessor,
  getComposedCompilerPlugins
} from '../compilerPlugins'
import { CompilerUserConfig, COMPILE_COMMAND_NAME } from '../constants'

const EntryBuilderMap = new WeakMap<Runner, EntryBuilderHelpers>()

const SJS_MODULE_NAME_REGEXP = /^[a-zA-Z_][a-zA-Z0-9_]*$/

let INLINE_SJS_MODULE_NAME = 1

interface SjsConfig {
  source: {
    sjsTagName: string
    sjsSrcAttrName: string
    sjsModuleAttrName: string
    isSupportSjsContent: boolean
    extname: string
  }
  target: {
    sjsTagName: string
    sjsSrcAttrName: string
    sjsModuleAttrName: string
    isSupportSjsContent: boolean
    extname: string
  }
}

// 参考文档记录
const REFERENCE_DOCS = {
  'a:key': 'https://opendocs.alipay.com/mini/framework/list-render#a%3Akey',
  'wx:key':
    'https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/list.html'
}

/**
 * 多端编译的 template 解析和转换
 * 这里仅提供通用的处理, 端的差异由编译插件来解决
 */
export class TemplateParserPlugin implements Plugin {
  name = 'TemplateParserPlugin'

  runner: Runner
  userConfig: CompilerUserConfig

  apply(runner: Runner) {
    // 放在 beforeRun 有助于保证拿到的是最终用户配置
    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      this.runner = runner
      this.userConfig = runner.userConfig as CompilerUserConfig

      const composedPlugins = getComposedCompilerPlugins()

      const { sourceType, target } = this.userConfig

      const sjsMapping = {
        source: {
          sjsTagName: composedPlugins.sjsTagName[sourceType],
          sjsSrcAttrName: composedPlugins.sjsSrcAttrName[sourceType],
          sjsModuleAttrName: composedPlugins.sjsModuleAttrName[sourceType],
          isSupportSjsContent: composedPlugins.isSupportSjsContent[sourceType],
          extname: composedPlugins.fileType[sourceType].sjs
        },
        target: {
          sjsTagName: composedPlugins.sjsTagName[target],
          sjsSrcAttrName: composedPlugins.sjsSrcAttrName[target],
          sjsModuleAttrName: composedPlugins.sjsModuleAttrName[target],
          isSupportSjsContent: composedPlugins.isSupportSjsContent[target],
          extname: composedPlugins.fileType[sourceType].sjs
        }
      }

      const targetProcessor = composedPlugins.templateProcessor[target]
      const sourceProcessor = composedPlugins.templateProcessor[sourceType]

      const sourceDirectives = composedPlugins.templateDirectives[sourceType]
      const targetDirectives = composedPlugins.templateDirectives[target]

      // 源码和编译类型不一致时需要转换 directive
      const needToTransformDirective =
        sourceType !== target && sourceDirectives !== targetDirectives

      // directive 结构转换 方便后续逻辑使用
      const directivesMap: Record<string, string> = {}
      if (needToTransformDirective) {
        for (const attrName in sourceDirectives) {
          if (attrName in targetDirectives) {
            directivesMap[sourceDirectives[attrName]] =
              targetDirectives[attrName]
          }
        }
      }

      runner.hooks.beforeBuildEntries.tap(this.name, (entryBuilder) => {
        EntryBuilderMap.set(runner, entryBuilder)
      })

      runner.hooks.templateParser.tap(this.name, (tree, options) => {
        const fileContent = options.fileInfo.content

        // 判断是否需要处理 sjs 类型的节点
        // 判断条件为包含源码的 sjs 标签或目标代码的 sjs 标签
        const needToProcessSjs =
          fileContent.includes(sjsMapping.source.sjsTagName) ||
          fileContent.includes(sjsMapping.target.sjsTagName)

        const needToProcessImportOrInclude =
          target !== 'web' &&
          (fileContent.includes('import') || fileContent.includes('include'))

        if (
          !needToProcessSjs &&
          !needToProcessImportOrInclude &&
          !needToTransformDirective
        ) {
          return tree
        }

        const entryBuilder = EntryBuilderMap.get(runner)

        // 可能使用的自定义组件标签名数组
        const usingComponentNames = entryBuilder.getUsingComponentNames(
          options.fileInfo.path
        )

        return tree.walk((node) => {
          // 如果不包含要替换的 tag 名称则跳过 sjs 处理
          if (needToProcessSjs) {
            this.transformSjsTag(entryBuilder, node, options, sjsMapping)
          }

          // 如果不含 include 或 import 则跳过
          if (needToProcessImportOrInclude) {
            this.transformIncludeOrImportTag(entryBuilder, node, options)
          }

          if (needToTransformDirective) {
            this.transformDirectives(
              node,
              options,
              targetProcessor,
              sourceProcessor,
              directivesMap,
              sourceDirectives,
              usingComponentNames
            )
          }

          return node
        })
      })
    })
  }

  /**
   * 处理 directive 映射
   * 同时提供了轻量级的 node 和 nodeAttr 处理接口, 参见 CompilerTemplateProcessor 定义
   */
  transformDirectives(
    node: posthtml.Node,
    options: FileParserOptions,
    targetProcessor: CompilerTemplateProcessor,
    sourceProcessor: CompilerTemplateProcessor,
    directivesMap: Record<string, string>,
    sourceDirectives: CompilerTemplateDirectives,
    usingComponentNames: string[]
  ) {
    // node 上下文
    const nodeContext: Record<string, any> = {
      usingComponentNames
    }

    // 触发源码转换
    if (sourceProcessor.onNode) {
      sourceProcessor.onNode(node, options, nodeContext)
    }
    // 触发目标代码转换
    if (targetProcessor.onNode) {
      targetProcessor.onNode(node, options, nodeContext)
    }

    // 处理 attrs
    if (node.attrs) {
      for (const attrName of Object.keys(node.attrs)) {
        // 触发源码转换
        if (sourceProcessor.onNodeAttr) {
          sourceProcessor.onNodeAttr(attrName, node, options, nodeContext)
        }
        // 触发目标代码转换
        if (targetProcessor.onNodeAttr) {
          targetProcessor.onNodeAttr(attrName, node, options, nodeContext)
        }

        const value = node.attrs[attrName]

        if (attrName in directivesMap) {
          node.attrs[directivesMap[attrName]] = value

          // 检查 wx:key / a:key 等 中是否使用了 {{ }} 语法
          if (
            attrName === sourceDirectives.key &&
            attrName.endsWith(':key') &&
            value &&
            value.includes('{{')
          ) {
            logger.warnOnce(
              `标签 ${node.tag} 的属性 ${sourceDirectives.key} 中使用了不支持的数据绑定语法: {{}}\n` +
                '允许的值为 字符串 或 *this \n' +
                `文件路径: ${options.fileInfo.path}` +
                (REFERENCE_DOCS[sourceDirectives.key]
                  ? `\n参考文档: ${REFERENCE_DOCS[sourceDirectives.key]}`
                  : '')
            )
          }

          delete node.attrs[attrName]
        }

        // 触发源码转换
        if (sourceProcessor.onNodeAttrExit) {
          sourceProcessor.onNodeAttrExit(
            directivesMap[attrName],
            node,
            options,
            nodeContext
          )
        }

        // 触发目标代码转换
        if (targetProcessor.onNodeAttrExit) {
          targetProcessor.onNodeAttrExit(
            directivesMap[attrName],
            node,
            options,
            nodeContext
          )
        }
      }
    }

    // 触发源码转换
    if (sourceProcessor.onNodeExit) {
      sourceProcessor.onNodeExit(node, options, nodeContext)
    }
    // 触发目标代码转换
    if (targetProcessor.onNodeExit) {
      targetProcessor.onNodeExit(node, options, nodeContext)
    }
  }

  /**
   * import 或 include 标签 src 文件地址替换
   */
  transformIncludeOrImportTag(
    entryBuilder: EntryBuilderHelpers,
    node: posthtml.Node,
    options: FileParserOptions
  ) {
    if (!node) return
    if (node.tag === 'import' || node.tag === 'include') {
      if (node.attrs && node.attrs.src && typeof node.attrs.src === 'string') {
        const importPath = node.attrs.src
        const realPath = entryBuilder.getRealReferencePath(
          options.fileInfo.path,
          importPath,
          true
        )
        node.attrs.src = realPath ? realPath : importPath
      } else {
        logger.warn(
          'import/include 标签需要设置 src 属性' +
            `文件路径: ${options.fileInfo.path}`
        )
      }
    }
  }

  /**
   * 转换 sjs 相关标签
   */
  transformSjsTag(
    entryBuilder: EntryBuilderHelpers,
    node: posthtml.Node,
    options: FileParserOptions,
    sjsConfig: SjsConfig
  ) {
    if (!node) return
    if (!node.attrs) return
    if (
      node.tag !== sjsConfig.source.sjsTagName &&
      node.tag !== sjsConfig.target.sjsTagName
    )
      return

    // 用于判断是否需要替换 sjs 引用路径
    let shouldReplaceSjsFileImportPath = true

    // 处理需要转换标签名称的情况
    if (node.tag === sjsConfig.source.sjsTagName) {
      // 替换标签名称
      node.tag = sjsConfig.target.sjsTagName

      // 除支付宝之外的其他端 module 只能是名字，不能是解构值
      // https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/01wxs-module.html
      if (
        this.userConfig.sourceType !== SourceTypes.alipay &&
        typeof node.attrs[sjsConfig.source.sjsModuleAttrName] === 'string' &&
        !SJS_MODULE_NAME_REGEXP.test(
          node.attrs[sjsConfig.source.sjsModuleAttrName] as string
        )
      ) {
        logger.error(
          `不合法的模块名称: ${node.attrs.name}\n` +
            `文件路径: ${options.fileInfo.path}`
        )
      }

      // 替换模块名称
      if (
        sjsConfig.target.sjsModuleAttrName !==
        sjsConfig.source.sjsModuleAttrName
      ) {
        node.attrs[sjsConfig.target.sjsModuleAttrName] =
          node.attrs[sjsConfig.source.sjsModuleAttrName]

        // 仅当 attr 名称不一致时删除原名称
        delete node.attrs[sjsConfig.source.sjsModuleAttrName]
      }

      /**
       * 如果源代码支持 嵌套代码, 而目标不支持, 则需要额外生成文件 如:
       * <wxs>
       *   var a = 1
       * </wxs>
       */
      if (
        sjsConfig.source.isSupportSjsContent &&
        !sjsConfig.target.isSupportSjsContent &&
        node.content
      ) {
        // 同层目录生成文件
        const sjsFileName = `inline-${
          sjsConfig.target.sjsTagName
        }-${INLINE_SJS_MODULE_NAME++}${sjsConfig.target.extname}`
        const newEntryFileName = slash(
          path.join(path.dirname(options.fileInfo.entryName), sjsFileName)
        )

        // 输出额外文件
        entryBuilder.setEntrySource(
          newEntryFileName,
          String(node.content[0] || ''),
          'additional'
        )

        // 清空内嵌的脚本内容
        node.content = []
        // 替换为文件引用
        node.attrs[sjsConfig.target.sjsSrcAttrName] = `./${sjsFileName}`
        // 标记为不需要替换 sjs 真实路径
        shouldReplaceSjsFileImportPath = false
      }

      // 否则引用字段不可为空
      else {
        if (!node.attrs[sjsConfig.source.sjsSrcAttrName]) {
          // 如果目标平台不支持嵌套代码, 则输出警告
          if (!sjsConfig.target.isSupportSjsContent) {
            logger.warn(
              `${sjsConfig.source.sjsTagName} 的 ` +
                `${sjsConfig.source.sjsSrcAttrName} 不能为空\n` +
                `文件路径: ${options.fileInfo.path}`
            )
          }
        } else {
          // 替换 字段名称
          node.attrs[sjsConfig.target.sjsSrcAttrName] =
            node.attrs[sjsConfig.source.sjsSrcAttrName]

          // 仅当 attr 名称不一致时删除原名称
          if (
            sjsConfig.target.sjsSrcAttrName !== sjsConfig.source.sjsSrcAttrName
          ) {
            delete node.attrs[sjsConfig.source.sjsSrcAttrName]
          }
        }
      }
    }

    const importPath = node.attrs[sjsConfig.target.sjsSrcAttrName] as string
    if (shouldReplaceSjsFileImportPath && importPath) {
      const realPath = entryBuilder.getRealReferencePath(
        options.fileInfo.path,
        importPath,
        true
      )
      node.attrs[sjsConfig.target.sjsSrcAttrName] = realPath
        ? realPath
        : importPath
    }
  }
}
