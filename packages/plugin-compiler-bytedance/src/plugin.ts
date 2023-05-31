import type { Plugin, Runner, webpack, WebpackWrapper } from '@morjs/utils'
import { asArray } from '@morjs/utils'
import { BytedanceAsyncSubpackagePlugin } from './bytedanceAsyncSubpackagePlugin'

const PLUGIN_EXT_PREFIX = 'ext://'

/**
 * 字节小程序编译插件
 */
export class BytedanceCompilerPlugin implements Plugin {
  name = 'BytedanceCompilerPlugin'
  apply(runner: Runner<any>) {
    // 不处理 ext:// 插件扩展的页面或组件
    runner.hooks.shouldAddPageOrComponent.tap(
      this.name,
      function (pageOrComponent) {
        if (pageOrComponent.startsWith(PLUGIN_EXT_PREFIX)) return false
      }
    )

    let wrapper: WebpackWrapper
    runner.hooks.webpackWrapper.tap(this.name, function (webpackWrapper) {
      wrapper = webpackWrapper
    })

    // 标记 ext:// 开头的文件为 externals
    // 来避免被 webpack 打包
    runner.hooks.userConfigValidated.tap(this.name, function () {
      const externals = asArray(
        wrapper.chain.get('externals') as webpack.Configuration['externals']
      )

      // 添加 externals 支持
      externals.push(function ({ request }, callback) {
        if (request && request.startsWith(PLUGIN_EXT_PREFIX)) {
          return callback(null, `commonjs ${request}`)
        }

        callback()
      })

      wrapper.chain.externals(externals)
    })

    new BytedanceAsyncSubpackagePlugin().apply(runner)
  }
}
