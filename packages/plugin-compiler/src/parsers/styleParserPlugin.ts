import {
  CompileTypes,
  cssProcessorFactory,
  EntryBuilderHelpers,
  EntryFileType,
  EntryType,
  logger,
  Plugin,
  Runner
} from '@morjs/utils'
import { CompilerUserConfig, COMPILE_COMMAND_NAME } from '../constants'

const EntryBuilderMap = new WeakMap<Runner, EntryBuilderHelpers>()

/**
 * 多端编译的 style 解析和转换
 * 这里仅提供通用的处理, 端的差异由编译插件来解决
 * NOTE: 目前对于特定文件的引用解析放在了这里
 * 可能导致的问题是: 由于 分包动态优化 导致引用路径发生变更, 实际替换的路径文件并不存在
 * 如果出现了类似情况，可能要将依赖的解析前置到 entryBuilder 中
 */
export class StyleParserPlugin implements Plugin {
  name = 'StyleParserPlugin'

  apply(runner: Runner) {
    // 放在 beforeRun 有助于保证拿到的是最终用户配置
    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      const { compileType, target } = runner.userConfig as CompilerUserConfig

      // 转 web 模式下, css 中的引用会被 css-loader 自动处理
      // 无需手动处理
      if (target === 'web') return

      const isSubpackageOrPlugin = compileType !== CompileTypes.miniprogram

      runner.hooks.beforeBuildEntries.tap(this.name, (entryBuilder) => {
        EntryBuilderMap.set(runner, entryBuilder)
      })

      runner.hooks.styleParser.tap(this.name, (plugins, options) => {
        const entryBuilder = EntryBuilderMap.get(runner)

        return plugins.concat(
          cssProcessorFactory(this.name, async (tree) => {
            const { loaderContext, fileInfo } = options

            const entry = entryBuilder.getEntryByFilePath(fileInfo.path)

            const allImports = new Map<
              string,
              Parameters<Parameters<typeof tree.walkAtRules>[number]>[0]
            >()

            // 获取所有的引用文件
            tree.walkAtRules((atRule) => {
              if (atRule.name === 'import') {
                // 处理 @import "pathtofile" 为 pathtofile
                // 处理 @import 'pathtofile' 为 pathtofile
                // 处理 @import url(pathtofile) 为 pathtofile
                const importPath = (atRule.params || '')
                  .trim()
                  .replace(/^url\(/, '')
                  .replace(/\)$/, '')
                  .replace(/^('|")/, '')
                  .replace(/('|")$/, '')

                allImports.set(importPath, atRule)
              }
            })

            // 插入全局样式引用的条件为:
            //   1. 插件或分包编译下需要支持全局样式
            //   2. 全局样式本身 和 npm 中的样式 不引用全局样式
            //   3. 非 entry 文件不需要插入全局样式
            if (
              isSubpackageOrPlugin &&
              entryBuilder.globalStyleFilePath &&
              entry &&
              entry.fullPath !== entryBuilder.globalStyleFilePath &&
              fileInfo.entryType !== EntryType.npmComponent
            ) {
              const globalStyleEntry = entryBuilder.getEntryByFilePath(
                entryBuilder.globalStyleFilePath
              )
              // 插入全局样式引用
              if (globalStyleEntry) {
                const importPath = entryBuilder.getRelativePathFor(
                  entry,
                  globalStyleEntry,
                  true
                )
                tree.prepend({ name: 'import', params: `"${importPath}"` })
              }
            }

            // 载入依赖的文件
            for await (const [importPath, atRule] of allImports) {
              let addedEntry =
                await entryBuilder.tryAddEntriesFromPageOrComponent(
                  importPath,
                  EntryType.unknown,
                  entry,
                  EntryFileType.style,
                  null,
                  'dep'
                )

              // 如果未添加 entry 成功 且 路径不是以 . 开头
              // 则可能是 npm 中的文件, 重新尝试一次
              if (!addedEntry && !importPath.startsWith('.')) {
                addedEntry =
                  await entryBuilder.tryAddEntriesFromPageOrComponent(
                    importPath,
                    EntryType.npmComponent,
                    entry,
                    EntryFileType.style,
                    null,
                    'dep'
                  )
              }

              // 添加依赖
              if (addedEntry) {
                // 载入模块, 模块被载入后将会作为 asset 输出
                // 且由于模块被标记为了 entry (addedEntry) , 所以当输出时
                // 会按照期望的名称重命名 (参见: config.ts#generatorOptions 方法)
                await loaderContext.importModule(addedEntry.fullPath)

                // 真实引用路径替换
                const realPath = entryBuilder.getRealReferencePath(
                  fileInfo.path,
                  importPath,
                  true
                )
                atRule.params = `"${realPath}"`
              } else {
                logger.warn(`文件 ${fileInfo.path} 缺少依赖: ${importPath}`)
                loaderContext.addMissingDependency(importPath)
              }
            }
          })
        )
      })
    })
  }
}
