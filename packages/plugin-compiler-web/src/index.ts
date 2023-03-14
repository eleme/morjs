import { addSimilarTarget } from '@morjs/plugin-compiler-alipay'
import {
  EntryBuilderHelpers,
  Plugin as MorPlugin,
  Runner,
  WebpackWrapper
} from '@morjs/utils'
import { target as WEB_TARGET, UserConfigSchema } from './constants'
import { AtomicFileGeneratePlugin } from './plugins/atomicFileGeneratePlugin'
import { BundleOptimizationPlugin } from './plugins/bundleOptimizationPlugin'
import { CommonConfigPlugin } from './plugins/commonConfigPlugin'
import { ConfigCompatiblePlugin } from './plugins/configCompatiblePlugin'
import { DevServerPlugin } from './plugins/devServerPlugin'
import { EmitIntermediateAssetsPlugin } from './plugins/emitIntermediateAssetsPlugin'
import { ExtractOrInjectCssPlugin } from './plugins/extractOrInjectCssPlugin'
import { GenerateJSXEntryPlugin } from './plugins/generateJSXEntryPlugin'
import { HtmlSupportPlugin } from './plugins/htmlSupportPlugin'
import { SjsCompatiblePlugin } from './plugins/sjsCompatiblePlugin'
import { TemplateCompatiblePlugin } from './plugins/templateCompatiblePlugin'

export {
  compileModuleKind,
  compileScriptTarget,
  fileType,
  getRuntimeFiles,
  isSupportSjsContent,
  sjsModuleAttrName,
  sjsSrcAttrName,
  sjsTagName,
  supportGlobalComponents,
  templateDirectives,
  templateProcessor,
  templateSingleTagNames
} from '@morjs/plugin-compiler-alipay'
export {
  defaultConditionalFileExt,
  defaultOutputDir,
  globalObject,
  projectConfigFiles,
  resolveMainFields,
  target,
  targetDescription,
  templateSingleTagClosingType,
  WebCompilerUserConfig
} from './constants'

// 将当前 target 添加为 支付宝类似小程序
// 以复用 支付宝相关的转换逻辑
addSimilarTarget(WEB_TARGET)

const WrapperMap = new WeakMap<Runner, WebpackWrapper>()
const EntryBuilderMap = new WeakMap<Runner, EntryBuilderHelpers>()

/**
 * web 编译插件
 * - 支持微信支付宝小程序 DSL 编译为 web 项目
 */
class WebCompilerPlugin implements MorPlugin {
  name = 'MorWebCompilerPlugin'
  apply(runner: Runner<any>) {
    new EmitIntermediateAssetsPlugin().apply(runner)

    runner.hooks.webpackWrapper.tap(this.name, function (wrapper) {
      WrapperMap.set(runner, wrapper)
    })

    runner.hooks.entryBuilder.tap(this.name, function (entryBuilder) {
      EntryBuilderMap.set(runner, entryBuilder)
    })

    runner.hooks.registerUserConfig.tap(this.name, function (schema) {
      return schema.merge(UserConfigSchema)
    })

    runner.hooks.userConfigValidated.tapPromise(
      {
        name: this.name,
        stage: 100
      },
      async () => {
        const { compileMode, target } = (runner.userConfig || {}) as {
          compileMode: string
          target: string
        }

        if (target !== WEB_TARGET) return

        const wrapper = WrapperMap.get(runner)
        const entryBuilder = EntryBuilderMap.get(runner)

        new CommonConfigPlugin(wrapper, entryBuilder).apply(runner)
        new SjsCompatiblePlugin().apply(runner)
        new TemplateCompatiblePlugin(entryBuilder).apply(runner)
        new ConfigCompatiblePlugin(entryBuilder).apply(runner)

        // bundle 模式适配
        if (compileMode === 'bundle') {
          new ExtractOrInjectCssPlugin(wrapper).apply(runner)
          new GenerateJSXEntryPlugin(wrapper).apply(runner)
          new HtmlSupportPlugin(wrapper).apply(runner)
          await new DevServerPlugin(wrapper).apply(runner)
          new BundleOptimizationPlugin(wrapper).apply()
        }
        // 非 bundle 模式适配
        else {
          new AtomicFileGeneratePlugin().apply(runner)
        }
      }
    )
  }
}

export const Plugin = WebCompilerPlugin
