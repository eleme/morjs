import {
  asArray,
  CompileTypes,
  EntryBuilderHelpers,
  FileParserOptions,
  lodash as _,
  logger,
  makeImportClause,
  Plugin,
  Runner,
  SourceTypes,
  TSCustomVisitor,
  tsTransformerFactory,
  typescript as ts,
  WebpackWrapper
} from '@morjs/utils'
import { getComposedCompilerPlugins } from '../compilerPlugins'
import {
  CompilerUserConfig,
  COMPILE_COMMAND_NAME,
  GlobalObjectTransformTypes,
  MOR_RUNTIME_NPMS,
  MOR_RUNTIME_PACKAGE_REGEXP,
  RUNTIME_SOURCE_TYPES
} from '../constants'

const EntryBuilderMap = new WeakMap<Runner, EntryBuilderHelpers>()
const WebpackWrapperMap = new WeakMap<Runner, WebpackWrapper>()

type TransformTypes = keyof typeof GlobalObjectTransformTypes

const MOR_IDENTIFIERS = {
  Api: '__MOR_API__',
  App: '__MOR_APP__',
  Page: '__MOR_PAGE__',
  Component: '__MOR_COMPONENT__'
} as const

const MINIPROGRAM_CONSTRUCTOR_MAPPINGS = {
  App: 'app',
  Page: 'page',
  Component: 'component'
}

/**
 * 需要注入 源码类型的 构造函数
 */
const SOURCE_TYPE_INJECTABLE_CONSTRUCTORS = ['createPage', 'createComponent']

/**
 * 多端编译的 js/ts 解析和转换
 * - 处理 插件或分包 morGlobal.initApp 的注入
 * - 全局对象的替换, 如 wx => my 或 wx => mor
 * - 提供对 App,Page,Component 的自动注入替换
 */
export class ScriptParserPlugin implements Plugin {
  name = 'ScriptParserPlugin'

  apply(runner: Runner) {
    runner.hooks.webpackWrapper.tap(this.name, function (webpackWrapper) {
      WebpackWrapperMap.set(runner, webpackWrapper)
    })

    // 放在 beforeRun 有助于保证拿到的是最终用户配置
    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      const {
        sourceType,
        compileType,
        globalObject: targetGlobalObject,
        autoInjectRuntime,
        compilerOptions: { module: moduleKind },
        target
      } = runner.userConfig as CompilerUserConfig

      const isWeb = target === 'web' || target === 'web-pro'

      const morRuntimeDeps = this.checkApiOrCoreRuntimeDepExistance(runner)

      runner.hooks.beforeBuildEntries.tap(this.name, (entryBuilder) => {
        EntryBuilderMap.set(runner, entryBuilder)
      })

      // 仅插件或分包需要注入 morGlobal.initApp
      const needToInjectInitApp =
        !isWeb &&
        (compileType === CompileTypes.plugin ||
          compileType === CompileTypes.subpackage)

      // 源码的 globalObject
      const sourceGlobalObject =
        getComposedCompilerPlugins().globalObject[sourceType]

      // 目标编译平台默认 globalObject
      const targetDefaultGlobalObject =
        getComposedCompilerPlugins().globalObject[target]

      // 全局变量替换 visitor
      const globalTransformVisitor = this.getGlobalObjectTransformVisitor(
        autoInjectRuntime['api'] as TransformTypes,
        sourceGlobalObject,
        targetGlobalObject
      )

      runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
        const entryBuilder = EntryBuilderMap.get(runner)

        // 简单判断是否包含 sourceGlobalObject
        // global 不一致时才需要转换
        if (
          morRuntimeDeps.api &&
          sourceGlobalObject !== targetGlobalObject &&
          // 如果目标平台是 web 且 源码的全局对象和目标平台的全局对象相同，则不做接口转换
          !(isWeb && sourceGlobalObject === targetDefaultGlobalObject) &&
          autoInjectRuntime?.['api'] &&
          !MOR_RUNTIME_PACKAGE_REGEXP.test(options.fileInfo.path) &&
          options.fileInfo.content.includes(sourceGlobalObject)
        ) {
          transformers.before.push(tsTransformerFactory(globalTransformVisitor))
        }

        // 为分包或插件注入 initApp
        if (needToInjectInitApp) {
          this.injectGlobalAppInvokerForPluginOrSubpackage(
            entryBuilder,
            transformers,
            options
          )
        }

        // 自动注入 sourceType 标记
        this.injectSourceTypeIntoPageAndComponent(transformers, options)

        // 自动替换 App/Page/Component 为 mor core 中的方法
        if (
          morRuntimeDeps.core &&
          !MOR_RUNTIME_PACKAGE_REGEXP.test(options.fileInfo.path) &&
          (autoInjectRuntime?.['app'] ||
            autoInjectRuntime?.['page'] ||
            autoInjectRuntime?.['component'])
        ) {
          this.autoInjectCoreLib(transformers, options)
        }

        // component 模式下，
        // 1、component.json 里配置的组件路径被修改，故需要修改引用其他文件的路径为正确路径，
        // 2、不在约定的源码目录中的文件，需要修改为正确的路径
        if (
          (options.fileInfo.content.includes('import') ||
            options.fileInfo.content.includes('require')) &&
          compileType === CompileTypes.component
        ) {
          this.alterImportOrRequirePath(
            transformers,
            entryBuilder,
            options.fileInfo.path
          )
        }

        return transformers
      })

      // 追加 mor api 引用
      // 追加 mor core 引用
      runner.hooks.postprocessorParser.tap(
        this.name,
        (fileContent, options) => {
          if (!/\.(j|t)s$/.test(options.fileInfo.path)) return fileContent

          // API 自动注入
          if (
            morRuntimeDeps.api &&
            autoInjectRuntime?.['api'] &&
            fileContent.includes(MOR_IDENTIFIERS.Api)
          ) {
            const importClause = makeImportClause(
              moduleKind,
              morRuntimeDeps.api,
              'mor',
              MOR_IDENTIFIERS.Api,
              fileContent
            )

            fileContent = `${importClause}\n${fileContent}`
          }

          // App 自动注入
          if (
            morRuntimeDeps.core &&
            autoInjectRuntime?.['app'] &&
            fileContent.includes(MOR_IDENTIFIERS.App)
          ) {
            const importClause = makeImportClause(
              moduleKind,
              morRuntimeDeps.core,
              'createApp',
              MOR_IDENTIFIERS.App,
              fileContent
            )

            fileContent = `${importClause}\n${fileContent}`
          }

          // Page 自动注入
          if (
            morRuntimeDeps.core &&
            autoInjectRuntime?.['page'] &&
            fileContent.includes(MOR_IDENTIFIERS.Page)
          ) {
            const importClause = makeImportClause(
              moduleKind,
              morRuntimeDeps.core,
              'createPage',
              MOR_IDENTIFIERS.Page,
              fileContent
            )

            fileContent = `${importClause}\n${fileContent}`
          }

          // Component 自动注入
          if (
            morRuntimeDeps.core &&
            autoInjectRuntime?.['component'] &&
            fileContent.includes(MOR_IDENTIFIERS.Component)
          ) {
            const importClause = makeImportClause(
              moduleKind,
              morRuntimeDeps.core,
              'createComponent',
              MOR_IDENTIFIERS.Component,
              fileContent
            )

            fileContent = `${importClause}\n${fileContent}`
          }

          return fileContent
        }
      )
    })
  }

  /**
   * 检查 @morjs/api 和 @morjs/core 是否存在
   */
  checkApiOrCoreRuntimeDepExistance(runner: Runner): {
    api: false | string
    core: false | string
  } {
    const wrapper = WebpackWrapperMap.get(runner)

    if (!wrapper) return { api: false, core: false }

    const resolvePaths = Array.from(
      new Set([
        ...(wrapper?.chain?.resolve?.modules?.values?.() || []),
        ...require.resolve.paths('')
      ])
    )

    const { consumes, externals } = (runner?.userConfig ||
      {}) as CompilerUserConfig

    // 需要消费的 npm 包
    // 通常用于 主/子 共享及消费依赖的场景
    const consumesOrExternalsPackages = []
      .concat(asArray(consumes))
      .concat(
        // externals 支持的类型比较多，这里只处理 string 和 object
        asArray(externals)
      )
      .reduce((res, value) => {
        if (typeof value === 'string') {
          res.add(value)
        } else if (_.isPlainObject(value)) {
          _.forEach(value, function (v) {
            res.add(v)
          })
        }

        return res
      }, new Set<string>())

    const result: {
      api: false | string
      core: false | string
    } = { api: false, core: false }

    ;(['api', 'core'] as const).forEach(function (name) {
      const packages = MOR_RUNTIME_NPMS[name] || []
      packages.forEach(function (packageName) {
        if (result[name]) return

        // 如果子包已通过 consumes 配置 mor 的运行时, 则标记当前运行时为存在
        if (consumesOrExternalsPackages.has(packageName)) {
          result[name] = packageName
          logger.debug(`在 consumes 或者 externals 中找到 ${packageName} 依赖`)
          return
        }

        // 否则尝试通过解析文件是否存在来判断
        try {
          const p = require.resolve(packageName, { paths: resolvePaths })
          if (p) {
            result[name] = packageName
            logger.debug(`找到 ${packageName} 依赖: ${p}`)
          }
        } catch (e) {
          logger.debug(`未找到 ${packageName} 依赖`)
        }
      })

      if (!result[name]) {
        logger.debug(
          `未找到 ${name} 相关运行时依赖, 将自动关闭 ${name} 相关运行时注入`
        )
      }
    })

    logger.debug(`运行时自动注入依赖为：`, result)

    return result
  }

  /**
   * 自动为 createPage 或 createComponent 注入 sourceType 标记
   */
  injectSourceTypeIntoPageAndComponent(
    transformers: ts.CustomTransformers,
    options: FileParserOptions
  ) {
    const fileContent = options.fileInfo.content

    if (!options?.userConfig?.sourceType) return transformers

    // 简单判断是否包含 createPage 或 createComponent
    if (
      !fileContent.includes('createPage') &&
      !fileContent.includes('createComponent')
    ) {
      return transformers
    }

    function visitor(node: ts.Node, ctx: ts.TransformationContext) {
      if (!ts.isCallExpression(node)) return node

      const exp = node.expression
      const factory = ctx.factory

      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(exp) &&
        SOURCE_TYPE_INJECTABLE_CONSTRUCTORS.includes(exp.getText())
      ) {
        if (node.arguments.length >= 2) return node

        return factory.updateCallExpression(
          node,
          node.expression,
          node.typeArguments,
          [
            ...node.arguments,
            factory.createStringLiteral(
              options.userConfig.sourceType === SourceTypes.alipay
                ? RUNTIME_SOURCE_TYPES.alipay
                : RUNTIME_SOURCE_TYPES.wechat
            )
          ]
        )
      }

      return node
    }

    transformers.before.push(tsTransformerFactory(visitor))
  }

  /**
   * 编译类型 为 plugin 或 subpackage 的情况下
   * 为 aApp 或 wApp 或 createApp 调用 注入 模拟的 globalApp
   */
  injectGlobalAppInvokerForPluginOrSubpackage(
    entryBuilder: EntryBuilderHelpers,
    transformers: ts.CustomTransformers,
    options: FileParserOptions
  ) {
    const fileContent = options.fileInfo.content
    // 简单判断是否包含 aApp 或 wApp 或 createApp
    if (
      !fileContent.includes('aApp') &&
      !fileContent.includes('wApp') &&
      !fileContent.includes('createApp')
    ) {
      return transformers
    }

    // 非全局脚本不处理
    if (options.fileInfo.path !== entryBuilder.globalScriptFilePath) return

    function visitor(node: ts.Node, ctx: ts.TransformationContext) {
      if (!ts.isCallExpression(node)) return node

      const exp = node.expression
      const factory = ctx.factory

      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(exp) &&
        // 支付宝 使用 aApp
        (exp.getText() === 'aApp' ||
          // 微信使用 wApp
          exp.getText() === 'wApp' ||
          // 或者通用 createApp
          exp.getText() === 'createApp' ||
          // 自动注入的 mor app 名称
          exp.getText() === MOR_IDENTIFIERS.App)
      ) {
        if (node.arguments.length >= 3) {
          if (ts.isObjectLiteralExpression(node.arguments[2])) {
            const globalApp = factory.createPropertyAssignment(
              factory.createIdentifier('globalApp'),
              factory.createPropertyAccessExpression(
                factory.createIdentifier('morGlobal'),
                factory.createIdentifier('initApp')
              )
            )

            const extendProperties = factory.updateObjectLiteralExpression(
              node.arguments[2],
              [...node.arguments[2].properties, globalApp]
            )

            return factory.updateCallExpression(
              node,
              node.expression,
              node.typeArguments,
              [
                ...node.arguments.slice(0, 2),
                extendProperties,
                ...node.arguments.slice(3)
              ]
            )
          } else {
            logger.warn(
              `${exp.getText()} 的第三个参数非 Object 类型，无法注入 App 支持，分包或插件场景下可能会引发问题`
            )
          }
        } else {
          const globalApp = factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                factory.createIdentifier('globalApp'),
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('morGlobal'),
                  factory.createIdentifier('initApp')
                )
              )
            ],
            true
          )

          const emptySolution = factory.createArrayLiteralExpression([], false)

          const extendArguments = []

          if (node.arguments.length === 1) {
            extendArguments.push(emptySolution)
          }

          extendArguments.push(globalApp)

          return factory.updateCallExpression(
            node,
            node.expression,
            node.typeArguments,
            [...node.arguments, ...extendArguments]
          )
        }
      }

      return node
    }

    transformers.before.push(tsTransformerFactory(visitor))
  }

  /**
   * 自动注入 mor 的运行时
   *
   * - 自动替换 App 为 __MOR_APP__
   * - 自动替换 Page 为 __MOR_PAGE__
   * - 自动替换 Component 为 __MOR_COMPONENT__
   * - 替换完成后, 在后置的检查中, 基于 __MOR_*__ 是否存在，自动注入引用代码
   */
  autoInjectCoreLib(
    transformers: ts.CustomTransformers,
    options: FileParserOptions
  ) {
    if (
      !options.fileInfo.content.includes('App') &&
      !options.fileInfo.content.includes('Page') &&
      !options.fileInfo.content.includes('Component')
    )
      return transformers

    function visitor(node: ts.Node, ctx: ts.TransformationContext) {
      const factory = ctx.factory
      // 判断  statement 的同时，要判断一下  node.expression 是否存在，如果业务上返回的不是一个 expression，调用 ts.isCallExpression 会报错
      const isReturnStatement = ts.isReturnStatement(node) && node.expression

      // FIXME: 这里的条件无法匹配
      // 箭头函数（ArrowFunction）
      // 二元表达式（BinaryExpression）
      // 三元表达式（ConditionalExpression）
      // 需要提供逻辑进一步支持以上几种情况
      if (
        (ts.isExpressionStatement(node) || isReturnStatement) &&
        ts.isCallExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression)
      ) {
        const identfierName = node.expression.expression.escapedText
        const injectName =
          MINIPROGRAM_CONSTRUCTOR_MAPPINGS[identfierName as string]
        if (
          identfierName &&
          injectName &&
          // 检查是否开启了对应的运行时自动注入
          options.userConfig?.autoInjectRuntime?.[injectName] === true
        ) {
          const args = [...node.expression.arguments]
          // 如果是 Page 或 Component 需要注入 sourceType

          if (identfierName !== 'App' && options?.userConfig?.sourceType) {
            // a 代表 支付宝
            // w 代表 微信
            args.push(
              factory.createStringLiteral(
                options?.userConfig?.sourceType === SourceTypes.alipay
                  ? RUNTIME_SOURCE_TYPES.alipay
                  : RUNTIME_SOURCE_TYPES.wechat
              )
            )
          }

          const updateExpression = factory.createCallExpression(
            factory.createIdentifier(MOR_IDENTIFIERS[identfierName]),
            node.expression.typeArguments,
            args
          )

          return isReturnStatement
            ? factory.updateReturnStatement(node, updateExpression)
            : factory.updateExpressionStatement(
                node as ts.ExpressionStatement,
                updateExpression
              )
        }
      }

      return node
    }

    transformers.before.push(tsTransformerFactory(visitor))
  }

  /**
   * 获取 globalObject 替换插件, 支持 3 种策略
   * 1. `enhanced` 增强方式: wx => mor 并追加 mor import, mor 中包含 api 的抹平
   * 2. `lite` 轻量级的方式: wx => my, 替换所有 globalObject
   * 3. `minimal` 最小替换: wx.abc() => my.abc(), 仅替换函数调用
   */
  getGlobalObjectTransformVisitor(
    transformType: TransformTypes,
    sourceGlobalObject: string,
    targetGlobalObject: string
  ): TSCustomVisitor {
    // `enhanced` 增强方式: wx => mor 并追加 mor import, mor 中包含 api 的抹平
    function enhancedVisitor(node: ts.Node, ctx: ts.TransformationContext) {
      const factory = ctx.factory
      if (ts.isIdentifier(node) && node.escapedText === sourceGlobalObject) {
        return factory.createIdentifier(MOR_IDENTIFIERS.Api)
      }

      return node
    }

    // `lite` 轻量级的方式: wx => my, 替换所有 globalObject
    function liteVisitor(node: ts.Node, ctx: ts.TransformationContext) {
      if (ts.isIdentifier(node) && node.escapedText === sourceGlobalObject) {
        return ctx.factory.createIdentifier(targetGlobalObject)
      }

      return node
    }

    // `minimal` 最小替换: wx.abc() => my.abc(), 仅替换函数调用
    function minimalVisitor(node: ts.Node, ctx: ts.TransformationContext) {
      if (!ts.isCallExpression(node)) return node

      const exp = node.expression
      const factory = ctx.factory

      // 判断是否是类似于 wx.showModal() 的函数调用
      if (
        ts.isPropertyAccessExpression(exp) &&
        ts.isIdentifier(exp.expression) &&
        exp.expression.escapedText === sourceGlobalObject &&
        ts.isIdentifier(exp.name)
      ) {
        return factory.updateCallExpression(
          node,
          factory.updatePropertyAccessExpression(
            exp,
            factory.createIdentifier(targetGlobalObject),
            exp.name
          ),
          node.typeArguments,
          node.arguments
        )
      }

      return node
    }

    const allVisitors = {
      enhanced: enhancedVisitor,
      lite: liteVisitor,
      minimal: minimalVisitor
    }

    return allVisitors[transformType]
  }
  /**
   * component 模式下修改 require 或 import 的引用路径
   */
  alterImportOrRequirePath(
    transformers: ts.CustomTransformers,
    entryBuilder: EntryBuilderHelpers,
    filePath: string
  ) {
    transformers.before.push(
      tsTransformerFactory((node, context) => {
        const factory = context.factory

        if (ts.isImportDeclaration(node)) {
          /**
           * import 引用替换为正确的路径
           */
          if (
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
          ) {
            const importPath = node.moduleSpecifier.text
            const realImportPath = entryBuilder.getRealReferencePath(
              filePath,
              importPath,
              true
            )
            if (realImportPath) {
              return factory.updateImportDeclaration(
                node,
                node.decorators,
                node.modifiers,
                node.importClause,
                factory.createStringLiteral(realImportPath)
              )
            }
          }
        } else if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.escapedText === 'require'
        ) {
          if (!node.arguments?.length) return node
          const arg = node.arguments[0]
          if (!ts.isStringLiteral(arg)) return node
          let importPath = arg.getText()
          if (!importPath) return node

          // 修正链接
          importPath = importPath.replace(/^('|")/, '').replace(/('|")$/, '')

          const realImportPath = entryBuilder.getRealReferencePath(
            filePath,
            importPath,
            true
          )

          if (realImportPath) {
            return factory.updateCallExpression(
              node,
              node.expression,
              node.typeArguments,
              [factory.createStringLiteral(realImportPath)]
            )
          }
        }

        return node
      })
    )
  }
}
