---
title: Takin 介绍
---

# Takin

## 什么是 Takin

`takin` 是一个用于开发复杂命令行工具的基础库，提供如下的能力:

- 相对完善及灵活的插件机制
- 支持多配置及多任务机制
- 高度可扩展的插件生态
- 可灵活新增、定制及扩展命令行
- 友好的 `typescript` 类型支持
- 不绑定打包工具, 如 webpack、vite 等
- 支持通过 API 调用注册命令

为什么开发这个工具而不是使用已有的 `build-scripts` ?

在 MorJS 升级计划启动初期，的确曾仔细评估过是否要使用集团的 `build-scripts`, 毕竟其用户广泛、更加成熟且已经有了丰富的插件生态，但综合评估下来，由于种种限制因素，`build-scripts` 并不能很好的满足 MorJS 升级改造场景，如：

- 写死的 `start|build|test` 命令且不支持扩展
- 类型提示不友好, 如插件编写、用户配置等
- 不支持扩展生命周期
- 不支持自定义配置文件, 只能使用 build.json
- 绑定了 webpack 且因为某些原因暂时只能使用 webpack 4
- 不支持通过 API 调用已注册的命令
- 日志输出不够优美

所以，基于上述原因，我们开发了 `takin` 这个工具库，期望在满足 MorJS 本身架构诉求的基础上，能够进一步作为饿了么未来的命令行基础工具供各个团队使用和扩展。

## 原理及流程介绍

<img src="https://img.alicdn.com/imgextra/i1/O1CN01XMVGfc1m657YFC345_!!6000000004904-2-tps-6763-4669.png" width="1200" />

## 基本用法

`takin` 内部仅仅内置了部分全局命令行选项，并未内置任何命令，全部功能可通过插件来实现。

```bash
内置全局命令选项:

  --cwd [cwd]            当前工作目录, 默认为 process.cwd()
  -c, --config [path]    指定自定义配置文件路径, 支持 .js, .ts, .json, .mjs 等类型, 如 takin.config.js
  --ignore-config        忽略或不自动载入用户配置文件
  --no-autoload-plugins  关闭自动载入插件功能 (default: true)
  -h, --help             显示帮助信息
```

### 快速开发一个命令行工具

下面我们将演示如何快速开发一个命令行工具 👇🏻

```typescript
/**
 * 0. 从安装 takin 作为依赖, 并新建一个 index.ts 开始
 *    执行命令: npm i takin --save
 *    执行命令: touch index.ts
 */

/**
 * 1. 引入 takin 作为依赖
 */
import * as takin from 'takin'

/**
 * 2. 为自己的命令行取一个名字, 比如 MorJS 并导出
 */
export const mor = takin.takin('mor')

/**
 * 3. 编写你的第一个插件
 */
class MyFirstTakinPlugin implements takin.Plugin {
  name = 'MyFirstTakinPlugin'
  apply(runner: takin.Runner) {
    runner.hooks.cli.tap(this.name, function (cli) {
      // 开启帮助信息显示
      cli.help()

      // 开启版本信息显示
      cli.version('1.0.0')

      // 注册命令
      cli
        .command('compile [srcPath]', '编译命令, 支持指定源码目录')
        .option('--output-path [outputPath]', '指定产物目录')
        .option('--production', '是否开启生产模式')
        // 注册命令行执行函数
        .action(function (command: takin.CommandOptions) {
          // 打印命令行相关信息
          console.log(command)
        })
    })

    // 注册用户配置
    runner.hooks.registerUserConfig.tap(this.name, function (schema, zod) {
      return schema.extend({
        mode: zod.nativeEnum(['production', 'development']).optional()
      })
    })
  }
}

/**
 * 4. 应用插件
 */
mor.use([new MyFirstTakinPlugin()])

/**
 * 5. 调用 `run` 命令启动
 */
mor.run()
```

编译上述文件为 `index.js` 文件之后(也可以直接使用 javascript 来编写以避免编译), 即可尝试运行文件, 如:

```
#### 获取帮助信息
❯ node index.js -h

mor/1.0.0

Usage:
  $ mor <command> [options]

Commands:
  compile [srcPath]  编译命令, 支持指定源码目录

For more info, run any command with the `--help` flag:
  $ mor compile --help

Options:
  --cwd [cwd]            当前工作目录, 默认为 process.cwd()
  -c, --config [path]    指定自定义配置文件路径, 支持 .js, .ts, .json, .mjs 等类型, 如 mor.config.js
  --ignore-config        忽略或不自动载入用户配置文件
  --no-autoload-plugins  关闭自动载入插件功能 (default: true)
  -h, --help             Display this message
  -v, --version          Display version number




#### 获取编译命令帮助信息
❯ node index.js compile -h

mor/1.0.0

Usage:
  $ mor compile [srcPath]

Options:
  --output-path [outputPath]  指定产物目录
  --production                是否开启生产模式
  --cwd [cwd]                 当前工作目录, 默认为 process.cwd()
  -c, --config [path]         指定自定义配置文件路径, 支持 .js, .ts, .json, .mjs 等类型, 如 mor.config.js
  --ignore-config             忽略或不自动载入用户配置文件
  --no-autoload-plugins       关闭自动载入插件功能 (default: true)
  -h, --help                  Display this message



#### 执行编译命令
❯ node index.js compile ./ --output-path ./dist --production
{
  name: 'compile',
  args: [ './' ],
  options: {
    '--': [],
    autoloadPlugins: true,
    outputPath: './dist',
    production: true
  }
}
```

### 配置 takin 功能

#### 定制配置文件

`takin` 支持定义配置文件名称和类型, 详细如下:

```typescript
import { takin } from 'takin'

// 实例, 默认情况下在指定了名称之后
// 即会自动开启对 mor.config.{ts/js/mjs/json} 等 4 中文件类型的配置支持
const mor = takin('mor')

// 也可以自定义新的配置文件名称, 如:
// 增加支持 mor.config.* 和 alsc.mor.config.*
// 配置后会优先读取 mor.config.* 如果未找到则尝试读取 alsc.mor.config.*
mor.config.setSupportConfigFileNames(['mor.config', 'alsc.mor.config'])

// 也可以自定义支持的文件类型
// 目前支持设置 ".js"、".json"、".ts"、".mjs"
// 如设置为仅支持 ts 或 js
mor.config.supportConfigExtensions(['.ts', '.js'])
```

#### 多配置能力

`takin` 支持一键开启多配置支持, 详细如下:

```typescript
import { takin } from 'takin'

// 实例
const mor = takin('mor')

// 开启多配置支持, 并通过 `name` 来区分不同配置
// 多配置支持示例: `[{ name: 'config-one' }, { name: 'config-two' }]`
mor.config.enableMultipleConfig({ by: 'name' })

// 关闭多配置支持
mor.config.disableMultipleConfig()

// 开启 package.json 配置支持
// 即允许通过 `package.json` 文件中的 MorJS 字段来获取配置
// 如: `{ mor: {} }`
mor.config.enablePackageJsonConfig()

// 关闭 package.json 配置支持
mor.config.disablePackageJsonConfig()
```

## 接口及插件开发

### 插件定义

```typescript
/**
 * 插件接口定义
 */
interface Plugin {
  /**
   * 插件名称
   */
  name: string
  /**
   * 插件版本
   */
  version?: string
  /**
   * 插件执行顺序:
   * - `设置为 enforce: 'pre'` 的插件
   * - 通过 takin.config.usePlugins 传入的插件
   * - 普通插件
   * - 设置为 `enforce: 'post'` 的插件
   */
  enforce?: ObjectValues<typeof PluginEnforceTypes>
  /**
   * 插件回调函数: 当插件通过 takin 实例的 use 方法载入时自动触发, 并传入当前命令行的实例
   */
  onUse?: (takin: Takin) => void
  /**
   * 执行 Runner 插件逻辑, 通过 Hooks 来干预不同的阶段
   */
  apply: (runner: Runner) => void
}
```

### Hooks 支持

`takin` 中插件的扩展能力主要通过对 `Hooks` 的调用来实现, 目前支持的 `Hooks` 如下：

```typescript
/**
 * 可通过 takin.hooks 来使用
 * 通过插件中 onUse 方法传入
 */
interface TakinHooks {
  /**
   * 配置文件载入完成, 可在这个阶段修改整体配置
   * 如果配置通过 run 方法直接传入则该 hook 不会执行
   */
  configLoaded: AsyncSeriesHook<[Config, CommandOptions]>
  /**
   * 配置完成筛选, 可在这个阶段调整需要运行的用户配置
   */
  configFiltered: AsyncSeriesWaterfallHook<[UserConfig[], CommandOptions]>
}

/**
 * 可通过 runner.hooks 来使用
 * 通过插件中的 apply 方法传入
 */
interface RunnerHooks {
  /**
   * 初始化, 当 runner 被初始化并完成插件加载之后运行
   */
  initialize: SyncHook<Runner>
  /**
   * 构建命令行时运行
   */
  cli: SyncHook<Cli>
  /**
   * 获取到匹配命令的阶段
   */
  matchedCommand: AsyncSeriesHook<CommandOptions>
  /**
   * 加载用户 config 阶段
   */
  loadConfig: AsyncSeriesHook<CommandOptions>
  /**
   * 修改用户配置
   */
  modifyUserConfig: AsyncSeriesWaterfallHook<[UserConfig, CommandOptions]>
  /**
   * 注册用户配置及校验 schema
   */
  registerUserConfig: AsyncSeriesWaterfallHook<[AnyZodObject, Zod]>
  /**
   * 是否需要运行后续逻辑
   * 执行的时机为 校验用户配置之前
   */
  shouldRun: SyncBailHook<Runner, boolean | undefined>
  /**
   * 是否校验用户配置, 部分不使用配置的命令, 可使用该 hook 结合 runner 的上下文
   * 来选择是否跳过用户配置校验
   */
  shouldValidateUserConfig: SyncBailHook<Runner, boolean | undefined>
  /**
   * 用户配置校验完成之后执行
   */
  userConfigValidated: AsyncSeriesHook<UserConfig>
  /**
   * 开始 run 之前的 hook, 可用于准备一些运行命令需要的数据或内容
   */
  beforeRun: AsyncSeriesHook<Runner>
  /**
   * 运行命令逻辑
   */
  run: HookMap<AsyncParallelHook<CommandOptions>>
  /**
   * runner 运行完成
   */
  done: AsyncParallelHook<Runner>
  /**
   * runner 运行失败
   */
  failed: SyncHook<Error>
}
```

### 如何扩展 Hooks

`takin` 支持通过对 `TakinHooks` 或 `RunnerHooks` 类型定义进行扩展以及调用 `registerHooks` 方法注册工厂函数的方式对 takin 本身的 hooks 进行扩展，如:

```typescript
import { registerHooks, tapable as t } from 'takin'

/**
 * 扩展 takin.RunnerHooks 中的 hook
 */
declare module 'takin' {
  interface RunnerHooks {
    /**
     * Compile Hook: config(json) 文件解析 hook
     */
    configParser: t.AsyncSeriesWaterfallHook<
      [Record<string, any>, FileParserOptions]
    >

    /**
     * Compile Hook: script(js/ts) 文件解析 hook
     */
    scriptParser: t.SyncWaterfallHook<[CustomTransformers, FileParserOptions]>

    /**
     * Compile Hook: template(*xml) 文件解析 hook
     */
    templateParser: t.AsyncSeriesWaterfallHook<
      [PosthtmlNode, FileParserOptions]
    >

    /**
     * Compile Hook: style(*css) 文件解析 hook
     */
    styleParser: t.AsyncSeriesWaterfallHook<
      [PostCssAcceptedPlugin[], FileParserOptions]
    >

    /**
     * Compile Hook: sjs(wxs/sjs) 文件解析 hook
     */
    sjsParser: t.SyncWaterfallHook<[CustomTransformers, FileParserOptions]>

    /**
     * Compile Hook: 文件预处理器 hook
     */
    preprocessorParser: t.AsyncSeriesWaterfallHook<
      [string, Record<string, any>, FileParserOptions]
    >

    /**
     * Compile Hook: 文件后置处理器 hook
     */
    postprocessorParser: t.AsyncSeriesWaterfallHook<[string, FileParserOptions]>
  }
}

/**
 * 注册自定义 hook 工厂, 和上方的 RunnerHooks 扩展一一对应
 */
registerHooks({
  configParser() {
    return new t.AsyncSeriesWaterfallHook(['config', 'options'])
  },
  scriptParser() {
    return new t.SyncWaterfallHook(['customTransformers', 'options'])
  },
  templateParser() {
    return new t.AsyncSeriesWaterfallHook(['tree', 'options'])
  },
  styleParser() {
    return new t.AsyncSeriesWaterfallHook(['postcssPlugins', 'options'])
  },
  sjsParser() {
    return new t.SyncWaterfallHook(['customTransformers', 'options'])
  },
  preprocessorParser() {
    return new t.AsyncSeriesWaterfallHook([
      'fileContent',
      'conditionalCompileContext',
      'options'
    ])
  },
  postprocessorParser() {
    return new t.AsyncSeriesWaterfallHook(['fileContent', 'options'])
  }
})
```

通过上述方法注入的 `Hooks` 扩展可在插件中直接使用, 如:

```typescript
import * as takin from 'takin'

class MyTakinPlugin implements takin.Plugin {
  name = 'MyTakinPlugin'
  apply(runner: takin.Runner) {
    runner.hooks.configParser.tap(...)
    runner.hooks.scriptParser.tap(...)
    runner.hooks.templateParser.tap(...)
    runner.hooks.styleParser.tap(...)
    runner.hooks.sjsParser.tap(...)
    runner.hooks.preprocessorParser.tap(...)
    runner.hooks.postprocessorParser.tap(...)
  }
}
```

### 接口

参加文档： [Takin API](/api/engineering-takin.md)
