import {
  EntryBuilderHelpers,
  EntryFileType,
  esbuild,
  FileParserOptions,
  lodash as _,
  Plugin,
  Runner,
  slash,
  tsTransformerFactory,
  typescript as ts,
  webpack,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import { CompileModes, CompilerUserConfig } from '../constants'

const getAliasIdentifyRegex = (alias) =>
  new RegExp(
    Object.keys(alias).reduce((a, b) => (a === '' ? b : a + '|' + b), '')
  )

const IMPORT_MODULE_NAME_REGEX =
  /import(?:['"\s]*([\w*${}\s,]+)from\s*)?['"\s]['"\s](.*[@\w_-]+)['"\s].*/g
const REQUIRE_MODULE_NAME_REGEX = /require\s*\(([`'"])\s*([^\s]*)\s*([`'"])\)/g

/**
 * 实现 transform 模式下 alias 支持
 * alias 配置参见：http://mor.eleme.io/guides/basic/config#alias---%E5%88%AB%E5%90%8D%E9%85%8D%E7%BD%AE
 *
 * 注意：alias 配置会对 EntryFileType.script 和 EntryFileType.sjs 文件类型生效
 */
export class AliasSupportPlugin implements Plugin {
  name = 'AliasSupportPlugin'
  webpackWrapper: WebpackWrapper
  entryBuilder: EntryBuilderHelpers

  apply(runner: Runner<any>) {
    runner.hooks.webpackWrapper.tap(this.name, (webpackWrapper) => {
      this.webpackWrapper = webpackWrapper
    })

    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {
      this.entryBuilder = entryBuilder
    })

    const matchedModuleNamesInfo: Record<string, Record<string, string>> = {}

    runner.hooks.userConfigValidated.tap(
      {
        name: this.name
      },
      (userConfig: CompilerUserConfig) => {
        if (
          userConfig.compileMode !== CompileModes.transform ||
          _.isEmpty(userConfig.alias)
        )
          return

        runner.hooks.preprocessorParser.tapPromise(
          {
            name: this.name
          },
          async (fileContent, context, options) => {
            const fileInfo = options.fileInfo
            /*
             * 仅处理 EntryFileType.script 和 EntryFileType.sjs 文件
             */
            if (
              [EntryFileType.script, EntryFileType.sjs].includes(
                fileInfo.entryFileType
              )
            ) {
              await this.handleAliasPrepocesser(
                userConfig,
                fileContent,
                options,
                matchedModuleNamesInfo
              )
            }

            return fileContent
          }
        )

        runner.hooks.scriptParser.tap(
          {
            name: this.name
          },
          (transformers, options) => {
            this.handleAliasTransformer(
              transformers,
              options,
              matchedModuleNamesInfo
            )
            return transformers
          }
        )

        runner.hooks.sjsParser.tap(
          {
            name: this.name
          },
          (transformers, options) => {
            this.handleAliasTransformer(
              transformers,
              options,
              matchedModuleNamesInfo
            )
            return transformers
          }
        )
      }
    )
  }

  async handleAliasPrepocesser(
    userConfig: CompilerUserConfig,
    fileContent: string,
    options: FileParserOptions,
    matchedModuleNamesInfo: Record<string, Record<string, string>>
  ) {
    /**
     * 减少处理损耗，判断文件内容内是否包含 alias 对象 key
     */
    const ALIAS_IDENTIFY_REGEX = getAliasIdentifyRegex(userConfig.alias)
    if (!ALIAS_IDENTIFY_REGEX.test(fileContent)) return
    /**
     * 避免注释文件影响，移除 comment 注释
     */
    const content = (
      await esbuild.transform(fileContent, {
        loader: 'ts',
        target: 'esnext',
        legalComments: 'none'
      })
    ).code

    const resolver = this.getEnhanceResolver({})
    const filePath = options.fileInfo.path
    /**
     * 获取所有匹配标识符
     */
    const matches = [
      ...content.matchAll(IMPORT_MODULE_NAME_REGEX),
      ...content.matchAll(REQUIRE_MODULE_NAME_REGEX)
    ]
    const moduleNamesList = await Promise.all(
      [...matches]
        .filter((matchItem) => {
          return Object.keys(userConfig.alias).some((item) => {
            return new RegExp(item).test(matchItem[2])
          })
        })
        .map(async (matchItem) => {
          const requestPath = matchItem[2]
          const { realPath } = await new Promise((resolve, reject) => {
            resolver.resolve({}, filePath, requestPath, {}, (err, realPath) => {
              if (err) return reject(err)
              if (realPath) {
                resolve({ realPath: realPath })
              } else {
                reject(
                  new Error(`未在 node_modules 中找到文件: ${requestPath}`)
                )
              }
            })
          })
          /**
           * 需要主动移除一个层级，因为是通过 filePath 而非文件夹路径取的相对路径
           */
          let realImportPath = path.relative(filePath, realPath).slice(3)
          realImportPath = slash(
            realImportPath.startsWith('.')
              ? realImportPath
              : './' + realImportPath
          )
          /**
           * 替换引用文件后缀, replaceExtAsExpected 暂不处理 ts 文件类型此处兼容处理下
           * 如：ts 后缀需要替换为编译后的 js
           */
          realImportPath = this.entryBuilder.replaceExtAsExpected(
            realImportPath.replace(/\.ts/, '.js')
          )
          return { requestPath, realImportPath }
        })
    )
    /**
     * 便于在后续 hook 中替换，此处存储匹配信息
     * 优化存储空间，仅存储有内容的 filePath
     */
    if (moduleNamesList.length === 0) return

    matchedModuleNamesInfo[filePath] = {}
    moduleNamesList.forEach((item) => {
      matchedModuleNamesInfo[filePath][item.requestPath] = item.realImportPath
    })
  }

  handleAliasTransformer(transformers, options, names) {
    const filePath = options.fileInfo.path

    if (!names[filePath]) {
      return transformers
    }

    transformers.before.push(
      tsTransformerFactory(function (node, context) {
        if (!node) return node

        const factory = context.factory
        /**
         * 处理 import 节点
         */
        if (
          ts.isImportDeclaration(node) &&
          ts.isStringLiteral(node.moduleSpecifier) &&
          names[filePath][node.moduleSpecifier.text]
        ) {
          return factory.updateImportDeclaration(
            node,
            node.decorators,
            node.modifiers,
            node.importClause,
            factory.createStringLiteral(
              names[filePath][node.moduleSpecifier.text]
            )
          )
        }
        /**
         * 处理 require 节点
         */
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression?.escapedText === 'require' &&
          ts.isStringLiteral(node.arguments?.[0]) &&
          names[filePath][node.arguments[0].text]
        ) {
          return factory.createCallExpression(
            factory.createIdentifier('require'),
            undefined,
            [
              factory.createStringLiteral(
                names[filePath][node.arguments[0].text]
              )
            ]
          )
        }
        return node
      })
    )
    return transformers
  }

  /**
   * 获取 webpack normal resolver
   * @param options - ResolverOptions 用于传递给 resolver
   */
  private getEnhanceResolver(
    options?: webpack.ResolveOptions
  ): webpack.Resolver {
    return this.webpackWrapper.compiler.resolverFactory.get('normal', options)
  }
}
