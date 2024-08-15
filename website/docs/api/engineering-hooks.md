# Hooks

## 介绍

- 在插件的 `apply` 函数中，会得到一个 `runner` 对象，对象中会有如下 `takin` 提供的内置 `hook`，插件可使用 `tap` 来注册对应的 `hook`，`tap` 接受两个参数

  - `name`: 插件名
  - `pluginHandle`: 插件逻辑

- 若插件有设置参数 `IMorJSPluginXXXOptions`，请将 `options` 的 `interface` 给 `export` 出去，方便可能需要集成的使用方进行引用

## 基础 Hooks

```typescript
import type { Plugin, Runner, UserConfig } from '@morjs/cli'

export interface IMorJSPluginXXXOptions {
  key: value
}

export default class MorJSPluginXXX implements Plugin {
  name = 'MorJSPluginXXX'
  pluginOptions: IMorJSPluginXXXOptions

  constructor(options?: IMorJSPluginXXXOptions) {
    this.pluginOptions = {
      ...options
    }
  }

  apply(runner: Runner) {
    // initialize: 初始化, 当 runner 被初始化并完成插件加载之后运行
    runner.hooks.initialize.tap(this.name, () => {
      // 打印当前 MorJS 版本
      console.log(`当前 MorJS 版本为 1.0.0 ⚑`)
    })

    // cli: 构建命令行时运行，可运行命令行注册，获取匹配的命令
    runner.hooks.cli.tap(this.name, (cli) => {
      // 注册 abc 命令行并添加一个 cde 的选项，于是终端可执行 mor abc --cde 123 命令
      cli.command('abc', 'abc描述').option('--cde [xxx]', 'cde描述')
    })

    // matchedCommand: 获取到匹配命令的阶段
    runner.hooks.matchedCommand.tap(this.name, (command) => {
      const { name, outputPath } = command.options
      console.log(name, outputPath) // 获取命令行选项
    })

    // loadConfig: 加载用户 config 阶段
    runner.hooks.loadConfig.tap(this.name, (command) => {
      const { name, outputPath } = command.options
      console.log(name, outputPath)
    })

    // modifyUserConfig: 可基于命令行选项修改用户配置
    runner.hooks.modifyUserConfig.tap(this.name, (userConfig, command) => {
      const { outputPath } = command.options
      // 获取命令行 outputPath 选项，若有则修改 userConfig 的 outputPath 配置为该值
      if (outputPath) userConfig.outputPath = outputPath
      return userConfig
    })

    // registerUserConfig: 注册用户配置及校验 schema
    runner.hooks.registerUserConfig.tap(this.name, (schema) => {
      return schema.merge(UserConfigSchema)
    })

    // shouldRun: 是否需要运行后续逻辑(执行的时机为 校验用户配置之前)
    runner.hooks.shouldRun.tap(this.name, () => {
      return true
    })

    // shouldValidateUserConfig: 是否校验用户配置, 部分不使用配置的命令
    // 可使用该 hook 结合 runner 的上下文，来选择是否跳过用户配置校验
    runner.hooks.shouldValidateUserConfig.tap(this.name, () => {
      if (runner.commandName === 'clean') return false
    })

    // userConfigValidated: 用户配置校验完成之后执行
    runner.hooks.userConfigValidated.tap(this.name, (userConfig) => {
      // 这个阶段可以进行部分配置，如添加 mor 运行时相关 loader 处理
      console.log(userConfig)
    })

    // beforeRun: 开始 run 之前的 hook, 可用于准备一些运行命令需要的数据或内容
    runner.hooks.beforeRun.tap(this.name, () => {
      const userConfig = runner.userConfig
      console.log(userConfig)
    })

    // run: 运行命令逻辑
    runner.hooks.run.tap(this.name, (command) => {})

    // done: runner 运行完成
    runner.hooks.done.tap(this.name, () => {
      console.log(`编译完成`)
    })

    // failed: runner 运行失败
    runner.hooks.failed.tap(this.name, (error) => {
      console.log('运行失败, 原因:', error)
    })

    // shutdown: runner 主动关闭 runner 时执行
    runner.hooks.shutdown.tap(this.name, () => {
      // runner 关闭时自动关闭 server
      if (devServer) await devServer.stop()
      devServer = null
    })
  }
}
```

## 编译 Hooks

```typescript
import type { Plugin, Runner, UserConfig } from '@morjs/cli'

export interface IMorJSPluginXXXOptions {
  key: value
}

export default class MorJSPluginXXX implements Plugin {
  name = 'MorJSPluginXXX'
  pluginOptions: IMorJSPluginXXXOptions

  constructor(options?: IMorJSPluginXXXOptions) {
    this.pluginOptions = {
      ...options
    }
  }

  apply(runner: Runner) {
    // webpackWrapper: 用于获取 webpackWrapper
    runner.hooks.webpackWrapper.tap(this.name, (webpackWrapper) => {
      // 保存 webpackWrapper 提供给后续流程调用
      this.webpackWrapper = webpackWrapper
    })

    // compiler: 用于获取 webpack compiler
    runner.hooks.compiler.tap(this.name, (compiler) => {
      const userConfig = runner.userConfig
      console.log(userConfig)
    })

    // entryBuilder: 用于获取 entryBuilder
    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {
      this.entryBuilder = entryBuilder
    })

    // shouldAddPageOrComponent: 用于判断是否要处理页面或组件
    runner.hooks.shouldAddPageOrComponent.tap(this.name, (pageOrComponent) => {
      if (pageOrComponent.startsWith('dynamicLib://')) return false
      return true
    })

    // addEntry: 添加 entry 时触发, 可用于修改 entry 相关信息
    runner.hooks.addEntry.tap(this.name, (entryInfo) => {
      // 把 'pages/main/' 页面的产物放到 'src/pages/main' 下
      if (entryInfo.name && entryInfo.name.startsWith('pages/main/')) {
        entryInfo.entry.fullEntryName = 'src/' + entryInfo.entry.fullEntryName
        entryInfo.entry.entryName = 'src/' + entryInfo.entry.entryName
        entryInfo.entry.entryDir = 'src/' + entryInfo.entry.entryDir
        entryInfo.name = 'src/' + entryInfo.name
      }

      return entryInfo
    })

    // beforeBuildEntries: 解析所有 entries 文件之后, 生成 entries 之前执行
    runner.hooks.beforeBuildEntries.tap(this.name, (entryBuilder) => {
      EntryBuilderMap.set(runner, entryBuilder)
    })

    // afterBuildEntries: 用于获取并修改构建出来的 entries
    runner.hooks.afterBuildEntries.tap(this.name, (entries, entryBuilder) => {
      this.entryBuilder = entryBuilder
      return entries
    })

    // configParser: config(json) 文件解析 hook
    runner.hooks.configParser.tap(this.name, (config, options) => {
      // 删除抖音编译下，所有 json 文件的 componentPlaceholder 内容
      if (options.userConfig.target === 'bytedance') {
        if (config?.componentPlaceholder) {
          delete config.componentPlaceholder
        }
      }
      return config
    })

    // scriptParser: script(js/ts) 文件解析 hook
    runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
      // 给 app.ts 文件的 CApp({}) 方法插入 { globalApp: morGlobal.initApp } 作为最后一个参数
      if (!options.fileInfo.content?.includes('CApp')) return transformers

      transformers = transformers || {}
      transformers.before = transformers.before || []

      const transformer = tsTransformerFactory((node, context) => {
        const factory = context.factory
        if (
          ts.isExpressionStatement(node) &&
          ts.isCallExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.escapedText === 'CApp'
        ) {
          args.push(
            factory.createObjectLiteralExpression(
              [
                factory.createPropertyAssignment(
                  factory.createIdentifier('globalApp'),
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier('morGlobal'),
                    factory.createIdentifier('initApp')
                  )
                )
              ],
              false
            )
          )

          return [
            factory.createExpressionStatement(
              factory.createCallExpression(
                factory.createIdentifier('CApp'),
                undefined,
                [...node.expression.arguments, ...args]
              )
            )
          ]
        }

        return node
      })

      transformers.before.push(transformer)
      return transformers
    })

    // templateParser: template(*xml) 文件解析 hook
    runner.hooks.templateParser.tap(this.name, (tree, options) => {
      // 替换 wxml 中的 morstyle 为 style
      return tree.walk((node) => {
        if (node.attrs && node.attrs.morStyle) {
          node.attrs.style = node.attrs.morStyle
          delete node.attrs.morStyle
        }

        return node
      })
    })

    // styleParser: style(*css) 文件解析 hook
    runner.hooks.styleParser.tap(this.name, (plugins, options) => {
      return plugins
        .concat
        // 进行一些关于 *css 文件的处理
        ()
    })

    // sjsParser: sjs(wxs/sjs) 文件解析 hook
    runner.hooks.sjsParser.tap(this.name, (transformers, options) => {
      // 添加 commonjs => esm 转换 修改引用路径
      if (
        options.fileInfo.content.includes('import') ||
        options.fileInfo.content.includes('require')
      ) {
        this.alterImportOrRequirePath(transformers, options.fileInfo.path)
      }

      return transformers
    })

    // preprocessorParser: 文件预处理器 hook，该阶段会处理条件编译
    runner.hooks.preprocessorParser.tap(
      this.name,
      (fileContent, context, options) => {
        if (!/\.(j|t)s$/.test(options.fileInfo.path)) return fileContent
        // 对 js/ts 文件进行一些前置处理
        return fileContent
      }
    )

    // postprocessorParser: 文件后置处理器 hook
    runner.hooks.postprocessorParser.tap(this.name, (fileContent, options) => {
      if (!/\.(w|a)xml$/.test(options.fileInfo.path)) return fileContent
      // 对 *xml 文件进行一些后置处理
      return fileContent
    })
  }
}
```

## 集成 Hooks

```typescript
import type { Plugin, Runner, UserConfig } from '@morjs/cli'

export interface IMorJSPluginXXXOptions {
  key: value
}

export default class MorJSPluginXXX implements Plugin {
  name = 'MorJSPluginXXX'
  pluginOptions: IMorJSPluginXXXOptions

  constructor(options?: IMorJSPluginXXXOptions) {
    this.pluginOptions = {
      ...options
    }
  }

  apply(runner: Runner) {
    // moduleDownloaded: 下载模块阶段, 完成后触发
    runner.hooks.moduleDownloaded.tapPromise(this.name, (moduleInfo) => {
      const { target } = runner.userConfig
      if (target) {
        // 对 moduleInfo 进行 scripts 脚本修改等操作
      }
    })

    // moduleBeforeScriptsExecuted: 前置脚本阶段, 完成后触发
    runner.hooks.moduleBeforeScriptsExecuted.tapPromise(
      this.name,
      (moduleInfo) => {
        const { target } = runner.userConfig
        if (['alipay', 'taobao'].includes(target)) {
          // 对支付宝、淘宝端完成前置脚本后进行一些文件处理
        }
      }
    )

    // moduleConfigLoaded: 配置载入阶段, 完成后触发
    runner.hooks.moduleConfigLoaded.tapPromise(this.name, (moduleInfo) => {
      const { target } = runner.userConfig
      if (target === 'wechat') {
        // 对微信端配置载入后进行一些操作流程
      }
    })

    // moduleCopiedOrCompiled: 复制编译阶段, 完成后触发
    runner.hooks.moduleCopiedOrCompiled.tapPromise(this.name, (moduleInfo) => {
      const { target } = runner.userConfig
      if (target === 'bytedance') {
        // 对抖音端复制编译完成后进行一些操作流程
      }
    })

    // moduleAfterScriptsExecuted: 后置脚本阶段, 完成后触发
    runner.hooks.moduleAfterScriptsExecuted.tapPromise(
      this.name,
      (moduleInfo) => {
        const { target } = runner.userConfig
        if (target === 'wechat') {
          // 对微信端 scripts.after 脚本执行完成后进行一些操作流程
        }
      }
    )

    // moduleComposed: 模块集成阶段, 完成后触发
    runner.hooks.moduleComposed.tapPromise(this.name, (moduleInfo) => {
      const { target } = runner.userConfig
      if (target === 'wechat') {
        // 对微信端集成完成成后进行一些文件操作
      }
    })

    // moduleFailedAttempt: 失败重试阶段，模块集成失败后将自动尝试修复
    runner.hooks.moduleFailedAttempt.tapPromise(this.name, (moduleInfo) => {
      // 模块集成失败后重试阶段介入一下错误输出上报或相关操作
    })
  }
}
```
