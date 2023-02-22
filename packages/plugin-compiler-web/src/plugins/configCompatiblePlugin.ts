import {
  EntryBuilderHelpers,
  EntryType,
  Plugin,
  Runner,
  slash
} from '@morjs/utils'
import path from 'path'

/**
 * web 配置文件兼容支持
 */
export class ConfigCompatiblePlugin implements Plugin {
  name = 'MorWebConfigCompatiblePlugin'
  constructor(public entryBuilder: EntryBuilderHelpers) {}
  apply(runner: Runner<any>) {
    // 是否需要注入全局组件, 判断条件如下
    // 1. 当编译模式为 小程序
    // 2. 目标平台不支持全局组件
    // 3. 全局组件不为空
    let shouldInjectGlobalComponents =
      runner.userConfig.compileType === 'miniprogram'

    let globalComponentNames: string[] = []

    // 操作 entries 仅保留入口文件
    // 需要区分 bundle 模式 和 default 模式
    // default 模式用于多端组件 web 版本输出
    runner.hooks.afterBuildEntries.tapPromise(
      this.name,
      async (entries, helpers) => {
        // 判断是否存在全局组件
        if (shouldInjectGlobalComponents) {
          globalComponentNames = Object.keys(
            helpers.appJson?.usingComopnents || {}
          )
          shouldInjectGlobalComponents = globalComponentNames.length > 0
        }

        return entries
      }
    )

    // 替换 config 中的组件为正确的路径
    runner.hooks.configParser.tap(this.name, (config, options) => {
      const entryBuilder = this.entryBuilder
      const fileInfo = options.fileInfo

      const isPageOrComponent =
        fileInfo.entryType === EntryType.component ||
        fileInfo.entryType === EntryType.page

      // 替换app/页面/组件中的路径
      if (
        fileInfo.entryType === EntryType.app ||
        isPageOrComponent ||
        fileInfo.entryType === EntryType.npmComponent
      ) {
        // 替换引用为相对路径
        if (config?.usingComponents) {
          for (const key in config.usingComponents) {
            const referencePath = entryBuilder.getFullPathOfReferenceFile(
              fileInfo.path,
              config.usingComponents[key]
            )

            const referenceEntry =
              entryBuilder.getEntryByFilePath(referencePath)
            if (!referenceEntry) continue

            const scriptFilePath = entryBuilder.entries.get(
              `${referenceEntry.entryName}.js`
            )?.fullPath

            if (scriptFilePath) {
              const relativePath = slash(
                path.relative(path.dirname(fileInfo.path), scriptFilePath)
              )
              config.usingComponents[key] = relativePath.startsWith('.')
                ? relativePath
                : './' + relativePath
            }
          }

          // 为页面和组件注入全局组件
          // 为节约编译性能，目前的全局组件注入比较粗暴
          // 直接为每个页面和组件添加全局组件
          // 没有分析页面的 template 中是否实际有引用
          // if (shouldInjectGlobalComponents && isPageOrComponent) {
          //   const entry = entryBuilder.getEntryByFilePath(fileInfo.path)
          //   for (const name of globalComponentNames) {
          //     // 如果已存在同名组件, 则跳过
          //     if (config.usingComponents[name]) continue

          //     const referencePath =
          //       entryBuilder.getGlobalComponentRelativePath(entry, name)
          //     if (referencePath)
          //       config.usingComponents[name] = referencePath
          //   }
          // }
        }
      }

      return config
    })
  }
}
