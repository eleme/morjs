import { compileModuleKind } from '@morjs/plugin-compiler-alipay'
import WebDefaultComponentsConfig from '@morjs/runtime-web/lib/components/config'
import {
  asArray,
  CompileModuleKind,
  CompileScriptTarget,
  EntryBuilderHelpers,
  expandExtsWithConditionalExt,
  logger,
  mor,
  Plugin,
  resolveDependency,
  Runner,
  webpack,
  WebpackWrapper
} from '@morjs/utils'
import Module from 'module'
import {
  ASSETS_REGEXP,
  CURRENT_NODE_MODUELS,
  fileNameConfig,
  globalObject as DEFAULT_GLOBAL_OBJECT,
  RUNTIME_NPM_NAME,
  WebCompilerUserConfig,
  WEB_COMPILER_LOADERS
} from '../constants'
import type { WebLoaderOptions } from '../loaders/builder'

export const NODE_MODULE_REGEXP = /[\\/]node_modules[\\/]/

/**
 * Web 相关通用配置支持
 */
export class CommonConfigPlugin implements Plugin {
  name = 'MorWebCommonConfigPlugin'
  constructor(
    public wrapper: WebpackWrapper,
    public entryBuilder: EntryBuilderHelpers
  ) {}

  apply(runner: Runner<any>) {
    this.setupCommonConfigForWeb(runner)
  }

  /**
   * 增加转 web 相关通用 webpack 配置
   */
  setupCommonConfigForWeb(runner: Runner) {
    const userConfig = runner.userConfig
    const {
      mode,
      srcPaths = [],
      compileMode,
      conditionalCompile: { fileExt: conditionalFileExt },
      web = {},
      compilerOptions: {
        target,
        // 提前获取用户配置的 模块类型, 后面用于配置 babel 的最终产物
        module: moduleKind
      },
      globalObject,
      processNodeModules
    } = userConfig as {
      srcPaths: string[]
      conditionalCompile: { fileExt: string | string[] }
      mode: string
      compileMode: string
      compilerOptions: {
        target: string
        module: string
      }
      globalObject: string
      processNodeModules?:
        | boolean
        | {
            include?: RegExp | RegExp[]
            exclude?: RegExp | RegExp[]
          }
    } & WebCompilerUserConfig

    // 这里做一点点 hack
    // 变异类型固定为 支付宝的 compileModuleKind 也就是 ESNext
    // 原因为转 web 需要接收到的产物均为 ESNext 模式
    // 另外用户配置的 module 类型会提前保存在 moduleKind 变量中, 供后续 babel 使用
    userConfig.compilerOptions.module = compileModuleKind

    // TODO: 后面允许用户自行配置 babel 内容
    const babelEnvOptions: Record<string, any> = {
      targets: { chrome: 50, ios: 8, android: 5 }
    }

    // 如果用户配置了 commonjs 则透传给 babel
    // 如果未配置, 则采用 babel 的默认逻辑 即 auto
    // NOTE: 如果配置为 commonjs 那么 webpack 的 dynamic import 会失效
    // https://webpack.js.org/guides/code-splitting/#dynamic-imports
    // 原因为 dynamic imports 依赖 import() 这种异步 chunk 加载
    // 而指定 commonjs 会将 import() 转换为 require() 方法, 从而导致异步变同步
    if (moduleKind === CompileModuleKind.CommonJS) {
      babelEnvOptions.modules = 'commonjs'
      if (compileMode === 'bundle') {
        logger.warnOnce(
          `配置 compilerOptions.module 为 CommonJS 会导致 asyncChunks 配置失效`
        )
      }
    }

    // 这里使用 require 是为了加快启动速度
    const BABEL_LOADER = {
      loader: resolveDependency('babel-loader'),
      options: {
        compact: false,
        sourceType: 'unambiguous',
        // 配置 targets 以保证低版本浏览器的兼容性
        presets: [
          [require(resolveDependency('@babel/preset-env')), babelEnvOptions],
          require(resolveDependency('@babel/preset-react'))
        ],
        plugins: [
          [
            require(resolveDependency('@babel/plugin-transform-runtime')),
            { version: '^7.18.3' }
          ]
        ]
      }
    }

    const wrapper = this.wrapper
    const entryBuilder = this.entryBuilder
    const chain = wrapper.chain

    // 添加 .tsx / .jsx 及对应的文件纬度条件编译支持
    chain.resolve.extensions.merge(
      expandExtsWithConditionalExt(['.tsx', '.jsx'], conditionalFileExt)
    )

    // 检查是否已经使用了 @
    if (chain.resolve.alias.has('@')) {
      logger.warnOnce(
        `@ 符号已被 ${mor.name} 转 web 中作为 srcPaths 的 alias 使用`
      )
    }
    chain.resolve.alias.set('@', srcPaths)

    // 扩展 node_modules
    chain.resolve.modules.add(CURRENT_NODE_MODUELS).end()
    // loader 优先查找当前 npm 所在位置的 node_modules
    chain.resolveLoader.modules.prepend(CURRENT_NODE_MODUELS).end()

    // 设置 publicPath
    chain.output.publicPath(web.publicPath || '/')

    // global 对象固定为 window
    chain.output.globalObject('window')

    // 如果用户配置了自定义的全局 API 对象
    // 这里利用 DefinePlugin 对全局对象直接重命名
    if (globalObject !== DEFAULT_GLOBAL_OBJECT) {
      chain
        .plugin('global-object-rename-plugin')
        .use(webpack.DefinePlugin, [{ [DEFAULT_GLOBAL_OBJECT]: globalObject }])
    }

    // 设置 filename
    chain.output.filename(`${fileNameConfig(mode)}.js`)
    chain.output.chunkFilename(`${fileNameConfig(mode)}.js`)

    // 编译为 web 不需要支持 其他小程序的原生文件支持, 这里移除掉
    chain.module.rules.delete('native')

    // 转 web 自动开启 node global 模拟
    chain.node.set('global', true)

    // 兜底配置 react 和 react-dom 的 fallback 引用
    try {
      const resolvedRuntimeWeb = require.resolve(RUNTIME_NPM_NAME)
      const r = Module.createRequire(resolvedRuntimeWeb)
      const resolvedReact = r.resolve('react')
      const resolvedReactDom = r.resolve('react-dom')
      chain.resolve.fallback.merge({
        react: resolvedReact,
        'react-dom': resolvedReactDom
      })
    } catch (error) {
      logger.debug('配置 react 和 react-dom fallback 失败, 原因: ', error)
    }
    const WEB_LOADER_OPTIONS: WebLoaderOptions = {
      globalComponentsConfig: {
        ...WebDefaultComponentsConfig,
        ...(web.globalComponentsConfig || {})
      },
      rpxRootValue: web.rpxRootValue,
      usePx: web.usePx,
      needRpx: web.needRpx,
      styleScope: web.styleScope,
      // platform 出于历史兼容性, 这里固定配置为 h5
      platform: 'h5',
      conditionalCompileFileExt: asArray(conditionalFileExt),
      userConfig: userConfig as WebLoaderOptions['userConfig'],
      entryBuilder
    }

    // 获取 compiler 中的 loaders
    const BASE_COMPILER_LOADERS = runner.methods.invoke('getCompilerLoaders')
    const BASE_COMMON_OPTIONS = {
      userConfig,
      entryBuilder,
      runner
    }
    const SJS_BABEL_OPTIONS = {
      ...BABEL_LOADER.options,
      presets: [
        // sjs 固定输出 commonjs 版本
        [
          require(resolveDependency('@babel/preset-env')),
          { ...babelEnvOptions, modules: 'commonjs' }
        ]
      ],
      plugins: [
        ...BABEL_LOADER.options.plugins,
        [
          // 处理 sjs 文件中的 export default {} 问题
          // 将 export default {} 转换为
          // module.exports = {}
          // 同时添加 module.exports.default = {}
          // 原因: 支付宝小程序 和 百度小程序 sjs 语法导致
          require(resolveDependency('babel-plugin-add-module-exports')),
          { addDefaultProperty: true }
        ]
      ]
    }

    // 样式处理
    // prettier-ignore
    chain.module
      .rule('style')
        // 扩展 css 支持
        .test(/\.(wx|a?c)ss$/)
        .use('web-style')
          .loader(WEB_COMPILER_LOADERS.style)
          .options(WEB_LOADER_OPTIONS)
          .before('style')
          .end()

    // 样式处理
    // prettier-ignore
    chain.module
      .rule('less')
        .use('web-style')
          .loader(WEB_COMPILER_LOADERS.style)
          .options(WEB_LOADER_OPTIONS)
          .before('style')
          .end()

    // 样式处理
    // prettier-ignore
    chain.module
      .rule('sass')
        .use('web-style')
          .loader(WEB_COMPILER_LOADERS.style)
          .options(WEB_LOADER_OPTIONS)
          .before('style')
          .end()

    // 模版处理
    // prettier-ignore
    chain.module
      .rule('template')
        .use('web-template')
          .loader(WEB_COMPILER_LOADERS.template)
          .options(WEB_LOADER_OPTIONS)
          .before('template')
          .end()
        .use('web-babel')
          .loader(BABEL_LOADER.loader)
          .options(BABEL_LOADER.options)
          .before('web-template')
          .end()

    // sjs 处理
    // prettier-ignore
    chain.module
      .rule('sjs')
        .use('web-sjs')
          .loader(BABEL_LOADER.loader)
          .options(SJS_BABEL_OPTIONS)
          .before('sjs')
          .end()

    // js 处理
    // prettier-ignore
    chain.module
      .rule('script-js')
        .use('web-js')
          .loader(WEB_COMPILER_LOADERS.script)
          .options(WEB_LOADER_OPTIONS)
          .before('script')
          .end()
        .use('web-babel')
          .loader(BABEL_LOADER.loader)
          .options(BABEL_LOADER.options)
          .before('web-js')
          .end()

    // ts 处理
    // prettier-ignore
    chain.module
      .rule('script-ts')
        .use('web-ts')
          .loader(WEB_COMPILER_LOADERS.script)
          .options(WEB_LOADER_OPTIONS)
          .before('script')
          .end()
        .use('web-babel')
          .loader(BABEL_LOADER.loader)
          .options(BABEL_LOADER.options)
          .before('web-ts')
          .end()

    // j/tsx 支持
    // prettier-ignore
    chain.module
      .rule('script-jsx')
        .test(/\.(j|t)sx$/)
        .use('postprocess')
          .loader(BASE_COMPILER_LOADERS.postprocess)
          .options(BASE_COMMON_OPTIONS)
          .end()
        .use('web-babel')
          .loader(BABEL_LOADER.loader)
          .options(BABEL_LOADER.options)
          .end()
        .use('preprocess')
          .loader(BASE_COMPILER_LOADERS.preprocess)
          .options(BASE_COMMON_OPTIONS)
          .end()

    // 未开启/关闭 node_modules 时的自动处理支持
    // 自动追加 node_modules 中的 组件/页面中的  JS/SJS 等文件处理
    if (processNodeModules == null) {
      // 多端组件中的 js 支持
      // prettier-ignore
      chain.module
        .rule('npm-component-script')
          .test(/\.js$/)
          .include.add(function(resource) {
            if (NODE_MODULE_REGEXP.test(resource) && entryBuilder.isEntryFile(resource)) {
              for (const [key] of entryBuilder.usedNpmPackages) {
                if (resource.includes(key)) {
                  return true
                }
              }
            }
            return false
          }).end()
          .use('postprocess')
            .loader(BASE_COMPILER_LOADERS.postprocess)
            .options(BASE_COMMON_OPTIONS)
            .end()
          .use('web-babel')
            .loader(BABEL_LOADER.loader)
            .options(BABEL_LOADER.options)
            .end()
          .use('web-js')
            .loader(WEB_COMPILER_LOADERS.script)
            .options(WEB_LOADER_OPTIONS)
            .end()
          .use('preprocess')
            .loader(BASE_COMPILER_LOADERS.preprocess)
            .options(BASE_COMMON_OPTIONS)
            .end()

      // 多端组件中的 wxs/sjs 支持
      // prettier-ignore
      chain.module
        .rule('npm-component-sjs')
          .test(/\.(sjs|wxs)$/)
          // 仅处理 node_modules 的 sjs 文件
          .include.add(NODE_MODULE_REGEXP).end()
          .use('postprocess')
            .loader(BASE_COMPILER_LOADERS.postprocess)
            .options(BASE_COMMON_OPTIONS)
            .end()
          .use('web-sjs')
            .loader(BABEL_LOADER.loader)
            .options(SJS_BABEL_OPTIONS)
            .end()
          .use('sjs')
            .loader(BASE_COMPILER_LOADERS.sjs)
            // 配置 loader 缺省 processNodeModules 为 true
            .options({ ...BASE_COMMON_OPTIONS, processNodeModules: true })
            .end()
          .use('preprocess')
            .loader(BASE_COMPILER_LOADERS.preprocess)
            .options(BASE_COMMON_OPTIONS)
            .end()

      // 开启 ES5 模式下处理 node_modules
      if (target === CompileScriptTarget.ES5) {
        // 如果开启了 es5, 则将所有的 node_modules 都转换为 es5
        // prettier-ignore
        chain.module
          .rule('process-node-modules')
            .test(/\.jsx?$/)
            .include.add(/[\\/]node_modules[\\/]/).end()
            .use('web-babel')
            .loader(BABEL_LOADER.loader)
            .options(BABEL_LOADER.options)
            .end()
      }
    }

    // 静态资源
    // prettier-ignore
    chain.module
      .rule('asset')
        .test(ASSETS_REGEXP)
        .type('asset')
        .parser({
          dataUrlCondition: {
            maxSize: web.inlineAssetLimit
          }
        })
  }
}
