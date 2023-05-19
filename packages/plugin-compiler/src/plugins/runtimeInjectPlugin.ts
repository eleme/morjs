import { isSimilarTarget as isAlipaySimilarTarget } from '@morjs/plugin-compiler-alipay'
import {
  EntryBuilderHelpers,
  lodash as _,
  makeImportClause,
  Plugin,
  Runner,
  WebpackWrapper
} from '@morjs/utils'
import {
  CompilerRuntimeConfig,
  getComposedCompilerPlugins
} from '../compilerPlugins'
import { LOADERS } from '../config'
import {
  CompilerUserConfig,
  COMPILE_COMMAND_NAME,
  CustomLoaderOptions,
  MOR_RUNTIME_PACKAGE_REGEXP,
  RUNTIME_SOURCE_TYPES
} from '../constants'

// 运行时引用替换
const RUNTIME_IMPORT_REPLACER = "/* MOR_[NAME]_POLYFILL_IMPORT_REPLACER */ ''"
// 运行时执行替换
const RUNTIME_INVOKE_REPLACER = "/* MOR_[NAME]_POLYFILL_INVOKE_REPLACER */ ''"

type RUMTIME_REPLACE_TYPE = 'app' | 'page' | 'component' | 'api'

const EntryBuilderMap = new WeakMap<Runner, EntryBuilderHelpers>()
const WebpackWrapperMap = new WeakMap<Runner, WebpackWrapper>()

/**
 * 运行时注入支持, 通过注入多端支持的方式支持
 *
 * - 提供 api 抹平
 * - 提供 app 抹平
 * - 提供 page 抹平
 * - 提供 component 抹平
 * - 提供 behavior 抹平
 * - 提供 mixin 抹平
 *
 * 通过 插件获取 runtime 文件地址, 并基于配置自动注入到响应的 js 文件中
 */
export class RuntimeInjectPlugin implements Plugin {
  name = 'RuntimeInjectPlugin'

  apply(runner: Runner) {
    // 保存 webpackWrapper
    runner.hooks.webpackWrapper.tap(this.name, function (wrapper) {
      WebpackWrapperMap.set(runner, wrapper)
    })

    // 保存 entryBuilder
    runner.hooks.entryBuilder.tap(this.name, function (entryBuilder) {
      EntryBuilderMap.set(runner, entryBuilder)
    })

    // 添加 对应的 loader 处理
    runner.hooks.userConfigValidated.tap(this.name, function (userConfig) {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      const webpackWrapper = WebpackWrapperMap.get(runner)
      const entryBuilder = EntryBuilderMap.get(runner)
      if (!webpackWrapper) return
      if (!entryBuilder) return

      // 自定义 loader 的通用配置
      const commonOptions: CustomLoaderOptions = {
        userConfig,
        entryBuilder,
        runner
      }

      // mor runtime 支持, 在 preprocessor 阶段针对 runtime 注入特定平台的支持
      // 默认情况下 编译不处理 node_modules 里面的 js 文件
      // 所以这里只添加 mor 运行时相关 loader 处理
      // prettier-ignore
      webpackWrapper.chain.module
        .rule('morRuntime')
          .test(MOR_RUNTIME_PACKAGE_REGEXP)
          .use('preprocess')
            .loader(LOADERS.preprocess)
            .options(commonOptions)
            .end()
    })

    // 放在 beforeRun 有助于保证拿到的是最终用户配置
    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      const {
        target,
        sourceType,
        compilerOptions: { module: moduleKind },
        autoInjectRuntime
      } = runner.userConfig as CompilerUserConfig

      // 如果同源编译，不做处理
      if (target === sourceType) return

      // 支付宝 DSL 相关 target 不做处理
      if (sourceType === 'alipay' && isAlipaySimilarTarget(target)) return

      const composedPlugins = getComposedCompilerPlugins()

      const sourceRuntimes =
        composedPlugins.getRuntimeFiles?.[sourceType]?.(sourceType, target) ||
        {}
      const targetRuntimes =
        composedPlugins.getRuntimeFiles?.[target]?.(sourceType, target) || {}

      // 是否支持 behavior： 已开启 behavior 开关且 target 运行时支持 behavior
      const supportBehavior =
        (autoInjectRuntime === true ||
          autoInjectRuntime?.['behavior'] === true) &&
        targetRuntimes.behavior

      // 是否支持 mixin： 已开启 mixin 开关且 target 运行时支持 mixin
      const supportMixin =
        (autoInjectRuntime === true || autoInjectRuntime?.['mixin'] === true) &&
        targetRuntimes.mixin

      // 处理 @morjs/core 和 @morjs/api 运行时的注入
      runner.hooks.preprocessorParser.tap(
        this.name,
        (fileContent, context, options) => {
          const fileInfo = options.fileInfo

          // 只处理 js/ts 文件
          if (!/\.(j|t)s$/.test(fileInfo.path)) return fileContent

          // 检查是是否开启 behavior 运行时注入配置
          // 检查 behavior 特征
          // 不符合的不处理
          // 只处理用户文件，不处理 node_modules
          if (
            supportBehavior &&
            fileInfo.path !== targetRuntimes.behavior &&
            (/\s*Behavior( +)?\(/.test(fileContent) ||
              /=Behavior( +)?\(/.test(fileContent))
          ) {
            const importBehaviorClause = makeImportClause(
              moduleKind,
              targetRuntimes.behavior,
              'Behavior',
              'Behavior',
              fileContent
            )
            fileContent = `${importBehaviorClause}${fileContent}`
          }

          // 检查是是否开启 mixin 运行时注入配置
          // 检查 mixin 特征
          // 不符合的不处理
          // 只处理用户文件，不处理 node_modules
          if (
            supportMixin &&
            fileInfo.path !== targetRuntimes.mixin &&
            (/\s*Mixin( +)?\(/.test(fileContent) ||
              /=Mixin( +)?\(/.test(fileContent))
          ) {
            const importMixinClause = makeImportClause(
              moduleKind,
              targetRuntimes.mixin,
              'Mixin',
              'Mixin',
              fileContent
            )
            fileContent = `${importMixinClause}${fileContent}`
          }

          // 只处理 @morjs/core 或 @morjs/api 的运行时修改
          // 如果未使用 @morjs/core 或 @morjs/api 则不替换任何内容
          const matched = fileInfo.path.match(MOR_RUNTIME_PACKAGE_REGEXP)
          if (!matched) return fileContent

          // 处理 app/page/component/api 的注入
          if (matched[2]) {
            fileContent = this.tryReplaceFileContentByType(
              sourceType,
              fileInfo.path,
              fileContent,
              matched[2] as RUMTIME_REPLACE_TYPE,
              sourceRuntimes,
              targetRuntimes
            )
          }

          return fileContent
        }
      )
    })
  }

  /**
   * 尝试替换运行时占位符为实际的调用
   * @param filePath 文件路径
   * @param fileContent 文件内容
   * @param replaceType 替换类型
   * @param sourceRuntimes 源码运行时代码注入配置
   * @param targetRuntimes 目标平台运行时代码注入配置
   * @returns 替换后的文件内容
   */
  tryReplaceFileContentByType(
    sourceType: string,
    filePath: string,
    fileContent: string,
    replaceType: RUMTIME_REPLACE_TYPE,
    sourceRuntimes: CompilerRuntimeConfig,
    targetRuntimes: CompilerRuntimeConfig
  ) {
    if (!filePath.endsWith(`${replaceType}.js`)) return fileContent

    const imports: string[] = []
    const invokes: string[] = []

    const argName = `${replaceType}Options`
    const invokeFunctionName = `init${_.capitalize(replaceType)}`

    // 先 target
    if (targetRuntimes[replaceType]) {
      imports.push(
        `var ${replaceType}TargetRuntime = require('${targetRuntimes[replaceType]}')`
      )
      invokes.push(
        `${replaceType}TargetRuntime.${invokeFunctionName}(${argName})`
      )
    }

    // 后 source
    if (sourceRuntimes[replaceType]) {
      imports.push(
        `var ${replaceType}SourceRuntime = require('${sourceRuntimes[replaceType]}')`
      )

      // 需要检查 sourceType 和运行时 Component 及 Page 的 sourceType 是否一致
      // 如果不一致则不生效该该逻辑。原因：部分情况下一个项目可能会出现 wPage 和 aPage
      // 或 wComponent 和 aComponent 混用的情况，这时候，运行时抹平代码会产生干扰，如，
      // 支付宝转微信会自动开启样式共享，但是如果项目中同时存在微信原生 DSL，那么会导致按照
      // 原生写法的组件也被开启样式共享，从而可能引发样式冲突
      let invokeCondition = ''
      if (replaceType === 'component' || replaceType === 'page') {
        invokeCondition = `'${RUNTIME_SOURCE_TYPES[sourceType]}' === sourceType && `
      }

      invokes.push(
        `${invokeCondition}${replaceType}SourceRuntime.${invokeFunctionName}(${argName})`
      )
    }

    fileContent = fileContent
      .replace(
        RUNTIME_IMPORT_REPLACER.replace('[NAME]', replaceType.toUpperCase()),
        imports.join(';\n')
      )
      .replace(
        RUNTIME_INVOKE_REPLACER.replace('[NAME]', replaceType.toUpperCase()),
        invokes.join(';\n')
      )

    return fileContent
  }
}
