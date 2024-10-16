import {
  CompileTypes,
  EntryBuilderHelpers,
  EntryFileType,
  EntryType,
  lodash as _,
  Plugin,
  Runner
} from '@morjs/utils'
import path from 'path'
import { getComposedCompilerPlugins } from '../compilerPlugins'
import { CompilerUserConfig } from '../constants'

const EntryBuilderMap = new WeakMap<Runner, EntryBuilderHelpers>()

/**
 * 多端编译的配置解析和转换
 * 这里仅提供通用的处理, 端的差异由编译插件来解决
 */
export class ConfigParserPlugin implements Plugin {
  name = 'ConfigParserPlugin'

  apply(runner: Runner) {
    runner.hooks.beforeRun.tap(this.name, () => {
      const userConfig = runner.userConfig as CompilerUserConfig

      // 如果是转换为 web、weex-pro 则不做处理
      if (
        userConfig.target === 'web' ||
        userConfig.target === 'web-pro' ||
        userConfig.target === 'weex-pro'
      )
        return

      // 是否需要注入全局组件, 判断条件如下
      // 1. 当编译模式为 小程序
      // 2. 目标平台不支持全局组件
      // 3. 全局组件不为空
      let shouldInjectGlobalComponents =
        userConfig.compileType === CompileTypes.miniprogram &&
        !getComposedCompilerPlugins().supportGlobalComponents[userConfig.target]

      let globalComponentNames: string[] = []

      runner.hooks.afterBuildEntries.tap(this.name, (entries, entryBuilder) => {
        EntryBuilderMap.set(runner, entryBuilder)

        // 判断是否存在全局组件
        if (shouldInjectGlobalComponents) {
          globalComponentNames = Object.keys(
            entryBuilder.appJson?.usingComopnents || {}
          )
          shouldInjectGlobalComponents = globalComponentNames.length > 0
        }

        return entries
      })

      runner.hooks.configParser.tapPromise(
        this.name,
        async (config, options) => {
          const entryBuilder = EntryBuilderMap.get(runner)
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
                const referencePath = entryBuilder.getRealReferencePath(
                  fileInfo.path,
                  config.usingComponents[key]
                )

                if (referencePath) config.usingComponents[key] = referencePath
              }
            }

            // 为页面和组件注入全局组件
            // 为节约编译性能，目前的全局组件注入比较粗暴
            // 直接为每个页面和组件添加全局组件
            // 没有分析页面的 template 中是否实际有引用
            if (shouldInjectGlobalComponents && isPageOrComponent) {
              if (!config.usingComponents) config.usingComponents = {}
              const entry = entryBuilder.getEntryByFilePath(fileInfo.path)
              for (const name of globalComponentNames) {
                // 如果已存在同名组件, 则跳过
                if (config.usingComponents[name]) continue

                const referencePath =
                  entryBuilder.getGlobalComponentRelativePath(entry, name)
                if (referencePath) config.usingComponents[name] = referencePath
              }
            }

            // 抽象节点的默认组件相对路径替换
            if (config?.componentGenerics) {
              _.forEach(config?.componentGenerics, function (val, key) {
                if (
                  typeof val === 'object' &&
                  typeof val?.default === 'string'
                ) {
                  const referencePath = entryBuilder.getRealReferencePath(
                    fileInfo.path,
                    val.default
                  )
                  if (referencePath) {
                    config.componentGenerics[key].default = referencePath
                  }
                }
              })
            }
          }

          // plugin.json 的 main 字段补足后缀
          if (
            userConfig.compileType === CompileTypes.plugin &&
            fileInfo.entryType === EntryType.plugin &&
            fileInfo.entryFileType === EntryFileType.config
          ) {
            if (config.main) {
              const extname = path.extname(config.main)
              if (!extname) {
                config.main = config.main + '.js'
              }
            }
          }

          // 修改 项目配置 中的路径
          // 指定为当前目录
          if (
            fileInfo.entryType === EntryType.project &&
            fileInfo.entryFileType === EntryFileType.config
          ) {
            if (userConfig.compileType === CompileTypes.miniprogram) {
              config.miniprogramRoot = './'
            } else if (userConfig.compileType === CompileTypes.plugin) {
              config.pluginRoot = './'
            }

            // 这里移除 项目配置中的自定义脚本 避免一些脚本重复执行
            if (config.scripts) {
              delete config.scripts
            }
          }

          return config
        }
      )
    })
  }
}
