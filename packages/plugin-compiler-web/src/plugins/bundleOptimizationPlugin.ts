import { mor, MOR_VENDOR_FILE, Plugin, WebpackWrapper } from '@morjs/utils'

/**
 * 默认编译优化配置
 */
export class BundleOptimizationPlugin implements Plugin {
  name = 'MorWebBundleOptimizationPlugin'
  constructor(public wrapper: WebpackWrapper) {}
  apply() {
    this.removeMiniFileGenerator()
    this.setupDefaultOptimization()
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
          priority: 3
        },
        // runtime-web 运行时
        web: {
          name: `${mor.name}.w`,
          test: /@ali[\\/]openmor-runtime-web/,
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
