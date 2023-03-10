import {
  CompileTypes,
  EntryBuilderHelpers,
  FileParserOptions,
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
  MOR_RUNTIME_PACKAGE_REGEXP,
  RUNTIME_SOURCE_TYPES
} from '../constants'

const EntryBuilderMap = new WeakMap<Runner, EntryBuilderHelpers>()
const WebpackWrapperMap = new WeakMap<Runner, WebpackWrapper>()

type TransformTypes = keyof typeof GlobalObjectTransformTypes

const MOR_IDENTIFIERS = {
  Api: '$MOR_API',
  App: '$MOR_APP',
  Page: '$MOR_PAGE',
  Component: '$MOR_COMPONENT'
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

      const hasRuntimeDeps = this.checkApiOrCoreRuntimeDepExistance(runner)

      runner.hooks.beforeBuildEntries.tap(this.name, (entryBuilder) => {
        EntryBuilderMap.set(runner, entryBuilder)
      })

      // 仅插件或分包需要注入 morGlobal.initApp
      const needToInjectInitApp =
        compileType === CompileTypes.plugin ||
        compileType === CompileTypes.subpackage

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
          hasRuntimeDeps.api &&
          sourceGlobalObject !== targetGlobalObject &&
          // 如果目标平台是 web 且 源码的全局对象和目标平台的全局对象相同，则不做接口转换
          !(
            target === 'web' && sourceGlobalObject === targetDefaultGlobalObject
          ) &&
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
          hasRuntimeDeps.core &&
          !MOR_RUNTIME_PACKAGE_REGEXP.test(options.fileInfo.path) &&
          (autoInjectRuntime?.['app'] ||
            autoInjectRuntime?.['page'] ||
            autoInjectRuntime?.['component'])
        ) {
          this.autoInjectCoreLib(transformers, options)
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
            hasRuntimeDeps.api &&
            autoInjectRuntime?.['api'] &&
            fileContent.includes(MOR_IDENTIFIERS.Api)
          ) {
            const importClause = makeImportClause(
              moduleKind,
              '@morjs/api/lib/api',
              'mor',
              MOR_IDENTIFIERS.Api,
              fileContent
            )

            fileContent = `${importClause}\n${fileContent}`
          }

          // App 自动注入
          if (
            hasRuntimeDeps.core &&
            autoInjectRuntime?.['app'] &&
            fileContent.includes(MOR_IDENTIFIERS.App)
          ) {
            const importClause = makeImportClause(
              moduleKind,
              '@morjs/core/lib/app',
              'createApp',
              MOR_IDENTIFIERS.App,
              fileContent
            )

            fileContent = `${importClause}\n${fileContent}`
          }

          // Page 自动注入
          if (
            hasRuntimeDeps.core &&
            autoInjectRuntime?.['page'] &&
            fileContent.includes(MOR_IDENTIFIERS.Page)
          ) {
            const importClause = makeImportClause(
              moduleKind,
              '@morjs/core/lib/page',
              'createPage',
              MOR_IDENTIFIERS.Page,
              fileContent
            )

            fileContent = `${importClause}\n${fileContent}`
          }

          // Component 自动注入
          if (
            hasRuntimeDeps.core &&
            autoInjectRuntime?.['component'] &&
            fileContent.includes(MOR_IDENTIFIERS.Component)
          ) {
            const importClause = makeImportClause(
              moduleKind,
              '@morjs/core/lib/component',
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
    api: boolean
    core: boolean
  } {
    const wrapper = WebpackWrapperMap.get(runner)

    if (!wrapper) return { api: false, core: false }

    const resolvePaths = Array.from(
      new Set([
        ...(wrapper?.chain?.resolve?.modules?.values?.() || []),
        ...require.resolve.paths('')
      ])
    )

    const result = { api: false, core: false }

    ;(['api', 'core'] as const).map(function (name) {
      const packageName = '@morjs/' + name
      try {
        const p = require.resolve(packageName, { paths: resolvePaths })
        if (p) {
          result[name] = true
          logger.debug(`找到 ${packageName} 依赖: ${p}`)
        }
      } catch (e) {
        logger.debug(
          `未找到 ${packageName} 依赖, 将自动关闭 ${name} 相关运行时注入`
        )
      }
    })

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
          // TODO: 解决拓展参数冲突
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
   * - 自动替换 App 为 $MOR_APP
   * - 自动替换 Page 为 $MOR_PAGE
   * - 自动替换 Component 为 $MOR_COMPONENT
   * - 替换完成后, 在后置的检查中, 基于 $MOR_* 是否存在，自动注入引用代码
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

      // FIXME: 这里的条件无法匹配
      // 箭头函数（ArrowFunction）
      // 二元表达式（BinaryExpression）
      // 三元表达式（ConditionalExpression）
      // 需要提供逻辑进一步支持以上几种情况
      if (
        ts.isExpressionStatement(node) &&
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

          return factory.updateExpressionStatement(
            node,
            factory.createCallExpression(
              factory.createIdentifier(MOR_IDENTIFIERS[identfierName]),
              node.expression.typeArguments,
              args
            )
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
}
