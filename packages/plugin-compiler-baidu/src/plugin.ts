import type { Plugin, Runner } from '@morjs/utils'

const DYNAMIC_LIB_PREFIX = 'dynamicLib://'

/**
 * 百度小程序编译插件
 */
export class BaiduCompilerPlugin implements Plugin {
  name = 'BaiduCompilerPlugin'
  apply(runner: Runner<any>) {
    // 不处理 dynamicLib:// 动态库中的组件或页面
    runner.hooks.shouldAddPageOrComponent.tap(
      this.name,
      function (pageOrComponent) {
        if (pageOrComponent.startsWith(DYNAMIC_LIB_PREFIX)) return false
      }
    )
  }
}
