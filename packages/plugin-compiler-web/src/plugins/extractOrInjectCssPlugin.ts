import { Plugin, Runner, WebpackWrapper } from '@morjs/utils'
import { fileNameConfig, WebCompilerUserConfig } from '../constants'

/**
 * CSS 提取或注入配置
 */
export class ExtractOrInjectCssPlugin implements Plugin {
  name = 'MorWebExtractOrInjectCssPlugin'
  constructor(public wrapper: WebpackWrapper) {}
  apply(runner: Runner<any>) {
    const { web = {}, mode } = (runner.userConfig ||
      {}) as WebCompilerUserConfig & {
      mode: string
    }

    this.setupCssSupport(web, fileNameConfig(mode))
  }

  /**
   * 配置 css 相关支持
   */
  setupCssSupport(web: WebCompilerUserConfig['web'], fileName: string) {
    const chain = this.wrapper.chain

    const MiniCssExtractPlugin = require('mini-css-extract-plugin')

    let extractOrStyleLoader: string

    if (web.miniCssExtractOptions) {
      extractOrStyleLoader = MiniCssExtractPlugin.loader
      chain.plugin('mini-css-extract-plugin').use(MiniCssExtractPlugin, [
        {
          filename: `${fileName}.css`,
          chunkFilename: `${fileName}.css`,
          ...web.miniCssExtractOptions
        }
      ])
    } else {
      extractOrStyleLoader = 'style-loader'
    }

    // importLoaders 代表通过 @import 引入的文件经过几个 loader
    // 这里设置一个较大的数字，来确保所有样式 loader 都可以被使用到
    const cssLoaderOptions = { importLoaders: 100 }

    // 样式处理
    // prettier-ignore
    chain.module
      .rule('style')
        .use('css')
          .loader('css-loader')
          .options(cssLoaderOptions)
          .before('postprocess')
          .end()
        .use('extractOrStyle')
          .loader(extractOrStyleLoader)
          .before('css')
          .end()

    // 样式处理
    // prettier-ignore
    chain.module
      .rule('less')
        .use('css')
          .loader('css-loader')
          .options(cssLoaderOptions)
          .before('postprocess')
          .end()
        .use('extractOrStyle')
          .loader(extractOrStyleLoader)
          .before('css')
          .end()

    // 样式处理
    // prettier-ignore
    chain.module
      .rule('sass')
        .use('css')
          .loader('css-loader')
          .options(cssLoaderOptions)
          .before('postprocess')
          .end()
        .use('extractOrStyle')
          .loader(extractOrStyleLoader)
          .before('css')
          .end()
  }
}
