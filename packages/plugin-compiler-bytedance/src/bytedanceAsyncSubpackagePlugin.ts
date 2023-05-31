import { CompileTypes, Plugin, Runner } from '@morjs/utils'

/**
 * 抖音支持异步分包插件
 */
export class BytedanceAsyncSubpackagePlugin implements Plugin {
  name = 'BytedanceAsyncSubpackagePlugin'
  runner?: Runner

  apply(runner: Runner<any>) {
    this.runner = runner
    this.runAsyncSubpackage()
  }

  runAsyncSubpackage() {
    const runner = this.runner
    runner.hooks.userConfigValidated.tap(this.name, (userConfig) => {
      const { target, compileType } = userConfig
      if (
        target === 'bytedance' &&
        (compileType === CompileTypes.miniprogram ||
          compileType === CompileTypes.subpackage)
      ) {
        runner.hooks.beforeBuildEntries.tapPromise(
          this.name,
          async (entryBuilder) => {
            if (
              compileType === 'subpackage' &&
              entryBuilder?.subpackageJson?.common === true
            ) {
              // 分包项目场 且配置了 common: true 时执行
              await entryBuilder.buildByGlob()
            } else if (compileType === 'miniprogram') {
              // 小程序项目 部分分包配置了 common: true 时执行
              const subpackagesArr =
                entryBuilder?.appJson?.subpackages ||
                entryBuilder?.appJson?.subPackages ||
                []
              for await (const item of subpackagesArr) {
                if (item.common === true && item.root) {
                  await entryBuilder.buildByGlob(`${item.root}/**`)
                }
              }
            }
          }
        )
      }
    })
  }
}
