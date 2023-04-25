import {
  mor,
  MOR_VENDOR_FILE,
  Plugin,
  Runner,
  SourceTypes,
  WebpackWrapper
} from '@morjs/utils'

/**
 * 默认编译优化配置
 */
export class BundleOptimizationPlugin implements Plugin {
  name = 'MorWebBundleOptimizationPlugin'
  constructor(public wrapper: WebpackWrapper) {}
  apply(runner: Runner<any>) {
    this.removeMiniFileGenerator()
    this.setupDefaultOptimization()
    this.supportSjsExtensionAlias(runner?.userConfig?.sourceType as string)
  }

  // 不生成小程序相关产物
  removeMiniFileGenerator() {
    const chain = this.wrapper.chain
    chain.module.rule('style').delete('type').delete('generator').end()
    chain.module.rule('sass').delete('type').delete('generator').end()
    chain.module.rule('less').delete('type').delete('generator').end()
    chain.module.rule('config').delete('type').delete('generator').end()
    chain.module.rule('template').delete('type').delete('generator').end()
    chain.module.rule('sjs').delete('type').delete('generator').end()
  }

  // 微信 DSL 转 Web 在 bundle 模式下
  // 会将 wxml 中的 wxs 以及 wxs 自身对 wxs 引用转换为 sjs 文件引用
  // 这里通过 extension 来解决
  supportSjsExtensionAlias(sourceType: string) {
    if (sourceType === SourceTypes.wechat) {
      const chain = this.wrapper.chain
      const wxsExtensions = chain.resolve.extensionAlias.get('.wxs') || []
      const sjsExtensions = chain.resolve.extensionAlias.get('.sjs') || []
      chain.resolve.extensionAlias.set('.wxs', [
        ...wxsExtensions,
        '.wxs',
        '.sjs'
      ])
      chain.resolve.extensionAlias.set('.sjs', [
        ...sjsExtensions,
        '.sjs',
        '.wxs'
      ])
    }
  }

  /**
   * 设置默认的打包优化
   */
  setupDefaultOptimization() {
    // 默认优化
    this.wrapper.chain.optimization.splitChunks({
      chunks: 'all',
      maxAsyncRequests: 6,
      maxInitialRequests: 6,
      minSize: 30000,
      cacheGroups: {
        // react 运行时
        react: {
          name: 'react',
          test: /[\\/]react|react-dom[\\/]/,
          priority: 4
        },
        // runtime-web 运行时
        web: {
          name: `${mor.name}.w`,
          test: /(@morjs[\\/]|@ali[\\/]openmor-)runtime-web/,
          priority: 3
        },

        // 其他 node_modules
        vendors: {
          name: MOR_VENDOR_FILE(),
          test: /\/(node_modules|npm_components|mock)\//,
          priority: 2
        }
      }
    })
  }
}
