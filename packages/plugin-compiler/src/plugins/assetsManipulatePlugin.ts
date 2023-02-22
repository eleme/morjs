import { EntryBuilderHelpers, Plugin, Runner, webpack } from '@morjs/utils'
import {
  CompileModes,
  CompilerUserConfig,
  NON_SCRIPT_ENTRIES_FILENAME
} from '../constants'

/**
 * Webpack assets 操作插件
 * 1. 额外 asset 输出
 * 2. asset 替换
 * 3. 无用文件删除, 如 由 css 文件生成的 css.js 文件等
 */
export class AssetsManipulatePlugin implements Plugin {
  name = 'AssetsManipulatePlugin'

  apply(runner: Runner) {
    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {
      runner.hooks.compiler.tap(this.name, (compiler) => {
        this.applyWebpackPlugin(
          compiler,
          entryBuilder,
          runner.userConfig as CompilerUserConfig
        )
      })
    })
  }

  applyWebpackPlugin(
    compiler: webpack.Compiler,
    entryBuilder: EntryBuilderHelpers,
    userConfig: CompilerUserConfig
  ) {
    const needToReplaceContent = userConfig.compileMode !== CompileModes.bundle

    const nonScriptEntryFileName = NON_SCRIPT_ENTRIES_FILENAME + '.js'

    // 设置输出需要额外输出的文件
    compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
      compilation.hooks.additionalAssets.tap(this.name, () => {
        this.emitExtraAssets(compilation, entryBuilder)
      })

      // 非 bundle 模式下 script 文件编译不走 webpack, 需要替换文件结果
      // 原因: 无法绕过 webpack 运行时相关内容的添加
      compilation.hooks.processAssets.tap(
        {
          name: this.name,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COUNT
        },
        (assets) => {
          // 删除用于引用非 js 文件的 asset
          if (assets[nonScriptEntryFileName]) {
            delete assets[nonScriptEntryFileName]
          }

          // 替换文件内容
          if (needToReplaceContent) {
            for (const [asset, source] of entryBuilder.replaceEntrySources) {
              if (assets[asset]) assets[asset] = source
            }
          }

          // 再次尝试输出额外文件
          // 原因为 可能存在 additionalAssets 和 PROCESS_ASSETS_STAGE_OPTIMIZE_COUNT
          // 两个阶段之间添加的文件
          this.emitExtraAssets(compilation, entryBuilder)
        }
      )
    })
  }

  emitExtraAssets(
    compilation: webpack.Compilation,
    entryBuilder: EntryBuilderHelpers
  ) {
    if (entryBuilder.additionalEntrySources.size === 0) return
    for (const [asset, source] of entryBuilder.additionalEntrySources) {
      // 如果文件不存在, 则添加新文件
      if (!compilation.assets[asset]) compilation.emitAsset(asset, source)
    }
  }
}
