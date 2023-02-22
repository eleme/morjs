# Takin API

> 关于什么是 `takin` 可以参见 [Takin 介绍](/api/takin)

## Cli

提供给 runner.hooks 的 Cli 实例，可通过 `cli.command().option()` 追加子命令和选项来干预命令行阶段实现自定义命令

```typescript
import type { Plugin, Runner } from '@morjs/cli'

export default class MorJSPluginXXX implements Plugin {
  name = 'MorJSPluginXXX'

  apply(runner: Runner) {
    // 可通过该 hook 拿到一个 cli 的实例
    runner.hooks.cli.tap(this.name, (cli) => {
      // 通过 cli.command 新建一个命令行指令
      const command = cli.command(COMMAND_NAME, 'command指令描述')
      // 注册 options 选项
      command.option(rawName, '选项描述')

      // eg: 创建一个名为 gogogo 的命令行指令，并添加 --prod 选项配置
      // cli.command('gogogo', 'gogog 命令行').option('--prod', '开启生产模式')
      // 那么在终端可运行 mor gogogo 或 mor gogogo --prod 命令行指令
    })
  }
}
```

## Config

提供基础功能，用户配置支持

1. 支持自定义配置配置文件的名称，如 mor.config.js
2. 支持加载 js、ts、mjs、json 四种格式的配置文件
3. 不同的文件使用不同的方式载入
4. 支持用户自定义配置文件名称，并指定配置文件的支持类型，默认是 takin.config
5. 支持通过插件注册配置字段和校验 schema
6. 支持开启配置数组，并通过用户指定的字段来区分
7. 支持配置合并（未完成）

## logger

`MorJS` 对于日志进行了约束和定义，提供了一套简洁、美观的固定日志方法，只需引入 `logger` 即可使用

### logger.init(level, options)

用于初始化 `logger`，多次调用会重复初始化同一个 `logger`

- `level`: 配置日志级别，必填 `string` 类型，支持 `info`｜`success`｜`warn`｜`error`｜`silent`，默认值 `info`
- `options`: 通用 logger 配置，必填 `object` 类型，含四个非必填配置
  - `prefix`: 日志前缀，非必填 `string` 类型，目前默认值 `[mor]`
  - `debugPrefix`: debug 前缀，非必填 `string` 类型，目前默认值 MorJS
  - `allowClearScreen`: 是否清空屏幕，非必填 `boolean` 类型，目前默认值 `true`
  - `customLogger`: 自定义 `logger` 对象，非必填实例对象，用于取代现有 `logger` 实例

```typescript
import { logger } from '@morjs/cli'

logger.init('info', { prefix: '[mor]', debugPrefix: 'mor' })
```

### logger.withOptions(options)

用于返回携带特定 `options` 的 `logger` 实例，该实例后续的调用都含有已配置的特定 `options`

- `options`: 必填 `object` 类型，含以下个非必填配置
  - `clear`: 是否清空当前窗口，非必填 `boolean` 类型
  - `timestamp`: 是否携带时间戳，非必填 `boolean` 类型
  - `color`: 是否输出颜色，非必填 `boolean` 类型
  - `align`: 是否对齐，非必填 `boolean` 类型
  - `symbol`: 是否输出 symbol，非必填 `boolean`｜`string` 类型
  - `update`: 是否为更新，非必填 `boolean` 类型
  - `depth`: 对象层级，非必填`null`｜`number`类型

```typescript
import { logger } from '@morjs/cli'

const logger = createLogger('info', {
  debugPrefix: 'mor',
  prefix: `[mor]`
}).withOptions({ color: false, align: true })
```

### logger.info(msg, options)

在控制台打印 `info` 类型的日志输出

- `msg`: 必填 `any` 类型，显示日志的输出内容
- `options`: 非必填 `object` 类型，配置项与 `logger.withOptions` 的 `options` 一致

### logger.success(msg, options)

在控制台打印 `success` 类型的日志输出，参数配置与 `logger.info` 一致

### logger.warn(msg, options)

在控制台打印 `warn` 类型的日志输出，参数配置与 `logger.info` 一致

### logger.warnOnce(msg, options)

在控制台打印 `warnOnce` 类型的日志输出，相同内容只会输出一次，参数配置与 `logger.info` 一致

### logger.error(msg, options)

在控制台打印 `error` 类型的日志输出，参数配置与 `logger.info` 一致

```typescript
import { logger } from '@morjs/cli'

logger.info('info 日志输出')
logger.success('success 日志输出')
logger.warn('warn 日志输出')
logger.warnOnce('warnOnce 日志输出,相同信息只输出一次')
logger.warnOnce('warnOnce 日志输出,相同信息只输出一次')
logger.error('error 日志输出')
```

<center><img width="50%" src="https://gw.alicdn.com/imgextra/i1/O1CN01DcP2HK1h0WChdcOI6_!!6000000004215-0-tps-652-162.jpg" /></center>

### logger.deprecate(deprecatedMsg, hint, error)

在控制台打印一段 `warn` 类型的 deprecate 日志输出

- `deprecatedMsg`: 必填 `any` 类型，显示日志的输出内容
- `hint`: 必填 `any` 类型，显示日志内容的提示
- `error`: 非必填 `object` 类型，通用 `error` 结构

```typescript
import { logger } from '@morjs/cli'

logger.deprecate('deprecatedMsg 日志输出', 'hint 提示')
```

### logger.debug(msg, ...args)

基于 `debug npm` 的 `debug` 日志输出

```typescript
import { logger } from '@morjs/cli'

logger.debug('debug 日志输出，仅在开启 debug 时显示')
```

### logger.time(label) & logger.timeEnd(label)

耗时性能日志输出, 需要 `logger.time()` 配合 `logger.timeEnd()` 一起使用

- `label`: 必填 `string` 类型，打印同一 `label` 值从开始到结束之间的耗时，单位 ms

### logger.clearScreen(type)

清空当前屏幕

- `type`: 配置清屏设置，必填 `string` 类型，支持 `info`｜`success`｜`warn`｜`error`

### logger.hasErrorLogged(error)

当前错误是否已输出，返回一个 `boolean` 值

- `error`: 非必填 `object` 类型，通用 `error` 结构

### logger.hasWarned

当前 `logger` 实例的 `hasWarned` 项，用于记录是否打印 `warn` 级别及以上报错日志

### logger.hasErrored

当前 `logger` 实例的 `hasErrored` 项，用于记录是否打印 `error` 级别及以上报错日志

### logger.options

当前 `logger` 实例的 `options` 配置，具体值可参考 `logger.withOptions` 的 `options` 配置项

### logger.createLoading(msg, options)

可以创建一个 loading 日志对象

- `msg`: 必填 `any` 类型，显示日志的输出内容
- `options`: 非必填 `object` 类型，含四个非必填配置
  - `clear`: 是否清空当前窗口，非必填 `boolean` 类型
  - `timestamp`: 是否携带时间戳，非必填 `boolean` 类型
  - `color`: 是否输出颜色，非必填 `boolean` 类型
  - `align`: 是否对齐，非必填 `boolean` 类型
  - `symbol`: 是否输出 symbol，非必填 `boolean`｜`string` 类型
  - `update`: 是否为更新，非必填 `boolean` 类型
  - `depth`: 对象层级，非必填 `null`｜`number` 类型

`logger.createLoading(msg)` 返回携带特定 `options` 的 `loadingLogger` 的实例对象，该实例对象提供以下几个方法

- `.start(msg)`: 开始执行 `loadingLogger` 日志实例对象，并先打印一次 `msg` 内容
  - `msg`: 非必填 `any` 类型，显示日志的输出内容，优先级大于 `createLoading` 的 `msg`
- `.update(msg)`: 更新日志的输出内容
  - `msg`: 必填 `any` 类型，显示日志的输出内容
- `.stop()`: 停止 `loadingLogger` 日志实例对象的执行
- `.success(msg, opts)`: 在控制台打印 `success` 类型的日志输出，参数配置与 `logger.info` 一致
- `.fail(msg, opts)`: 在控制台打印 `error` 类型的日志输出，参数配置与 `logger.info` 一致
- `.error(msg, opts)`: 在控制台打印 `error` 类型的日志输出，参数配置与 `logger.info` 一致

以下为示例代码:（真实的显示效果应为，每下一行的打印显示会自动替换前一行的显示，这里为了方便截图我在 `init` 里设置了 `allowClearScreen`，`start` 和 `update` 的 icon 是一个类转圈的动效，开发者可以自己尝试看一下效果）

```typescript
import { logger } from '@morjs/cli'

const loading = logger.createLoading('创建进程日志').start()
try {
  setTimeout(() => {
    loading.update('当前进度50%')
  }, 1500)
  setTimeout(() => {
    loading.stop()
    loading.success('当前进程已完成')
  }, 3000)
} catch (err) {
  loading.fail(err)
}
```

<center><img width="30%" src="https://gw.alicdn.com/imgextra/i1/O1CN01rUNw5w1aw2dUmfwR7_!!6000000003393-0-tps-346-104.jpg" /></center>

### logger.table(tableOptions, type, options)

在控制台打印 `table` 表格类型的日志输出

- `tableOptions`: 必填 `object` 类型
  - `head`: 表格头的配置信息，`string[]` 类型
  - `rows`: 表格内容的配置信息，`string[][]` 类型
  - `colWidths`: 表格每列的宽度，`number[]` 类型
  - `colAligns`: 表格每列的对齐方式，`Array<'left' | 'middle' | 'right'>` 类型
  - 其他配置项可查看源码或 `typescript` 对应注释
- `type`: 非必填 `string` 类型，支持 `info`｜`success`｜`warn`｜`error`
- `options`: 非必填 `object` 类型，配置项与 `logger.withOptions` 的 `options` 一致

```typescript
const table = {
  head: ['head1', 'head2', 'head3'],
  rows: [
    ['rows1-1', 'rows1-2', 'rows1-3'],
    ['rows2-1', 'rows2-2', 'rows2-3'],
    ['rows3-1', 'rows3-2', 'rows3-3']
  ],
  colWidths: [30, 20, 20]
}
logger.table(table)
```

<center><img width="60%" src="https://gw.alicdn.com/imgextra/i2/O1CN01UNronm1wxLJVHnlqE_!!6000000006374-2-tps-1204-260.png" /></center>

## downloader

### downloader.file.parseOptions(pathOrOptions)

解析 file 链接或选项

- `pathOrOptions`: 链接 `path` 或选项 `{ path, ...options }`

```typescript
import { downloader } from '@morjs/cli'

downloader.file.parseOptions(pathOrOptions)
```

### downloader.file.supportProtocol(url)

判断是否支持处理当前链接(正则)

- `url`: 链接

```typescript
import { downloader } from '@morjs/cli'

downloader.file.supportProtocol(url) // true / false
```

### downloader.file.getName(fileOptions)

基于 file 链接选项获取名称

- `fileOptions`: file 链接选项 `{ path, ...options }`

```typescript
import { downloader } from '@morjs/cli'

downloader.file.getName(fileOptions)
```

### downloader.file.download(fileOptions, dest)

下载 file 链接到指定目录

- `fileOptions`: file 链接选项
- `dest`: 指定目录地址

```typescript
import { downloader } from '@morjs/cli'

downloader.file.download(fileOptions, dest)
```

### downloader.link.parseOptions(pathOrOptions)

解析 link 链接或选项

- `pathOrOptions`: 链接或选项

```typescript
import { downloader } from '@morjs/cli'

downloader.link.parseOptions(pathOrOptions)
```

### downloader.link.supportProtocol(url)

判断是否支持处理当前链接(正则)

- `url`: 链接

```typescript
import { downloader } from '@morjs/cli'

downloader.link.supportProtocol(url) // true / false
```

### downloader.link.getName(linkOptions)

基于 link 链接选项获取名称

- `linkOptions`: link 链接选项 `{ path, ...options }`

```typescript
import { downloader } from '@morjs/cli'

downloader.link.getName(linkOptions)
```

### downloader.link.download(linkOptions, dest)

下载 link 链接到指定目录

- `linkOptions`: link 链接选项
- `dest`: 指定目录地址

```typescript
import { downloader } from '@morjs/cli'

downloader.link.download(linkOptions, dest)
```

### downloader.git.addSupportGitSite(siteUrl, siteType)

添加支持的 git 站点

- `siteUrl`: 站点地址, 如 github.com
- `siteType`: 站点类型, 如 git / gitlab / bitbucket

```typescript
import { downloader } from '@morjs/cli'

downloader.git.addSupportGitSite(siteUrl, siteType)
```

### downloader.git.getGitHash(repo)

获取 git hash

- `repo`: git repo 设置

```typescript
import { downloader } from '@morjs/cli'

downloader.git.getGitHash(repo)
```

### downloader.git.parseOptions(urlOrOptions)

解析 git 选项或链接

- `urlOrOptions`: git 下载链接或选项

```typescript
import { downloader } from '@morjs/cli'

downloader.git.parseOptions(urlOrOptions)
```

### downloader.git.supportProtocol(url)

判断是否支持处理当前链接

- `url`: 链接

```typescript
import { downloader } from '@morjs/cli'

downloader.git.supportProtocol(url)
```

### downloader.git.getName(options)

从 git 仓库选项中获取名称

- `options`: git 仓库选项

```typescript
import { downloader } from '@morjs/cli'

downloader.git.getName(options)
```

### downloader.git.download(options, dest)

下载 git repo 到指定的目录

- `options`: git 选项
- `dest`: 下载目录

```typescript
import { downloader } from '@morjs/cli'

downloader.git.download(options, dest)
```

### downloader.tar.parseOptions(urlOrOptions)

解析 tar 链接或选项

- `urlOrOptions`: 链接或选项

```typescript
import { downloader } from '@morjs/cli'

downloader.tar.parseOptions(urlOrOptions)
```

### downloader.tar.supportProtocol(url)

判断是否支持处理当前链接(正则)

- `url`: 链接

```typescript
import { downloader } from '@morjs/cli'

downloader.tar.supportProtocol(url)
```

### downloader.tar.getName(tarOptions)

基于 tar 压缩包选项获取名称

- `tarOptions`: tar 压缩包选项

```typescript
import { downloader } from '@morjs/cli'

downloader.tar.getName(tarOptions)
```

### downloader.tar.download(tarOptions, dest)

下载 tar 压缩包到指定目录

- `tarOptions`: tar 压缩包选项
- `dest`: 指定目录地址

```typescript
import { downloader } from '@morjs/cli'

downloader.tar.download(tarOptions, dest)
```

### downloader.npm.setRegistryUrl(url)

设置自定义 npm registry 地址

- `url`: 自定义 npm registry 地址

```typescript
import { downloader } from '@morjs/cli'

downloader.npm.setRegistryUrl(url)
```

### downloader.npm.getRegistryUrl(scope)

返回 特定 scope 的 npm registry 地址

- `scope`: npm 分组

```typescript
import { downloader } from '@morjs/cli'

downloader.npm.getRegistryUrl(scope)
```

### downloader.npm.parseOptions(urlOrOptions)

解析 npm 链接或选项

- `urlOrOptions`: npm 链接或选项

```typescript
import { downloader } from '@morjs/cli'

downloader.npm.parseOptions(urlOrOptions)
```

### downloader.npm.supportProtocol(url)

判断是否支持处理当前链接

- `url`: 链接

```typescript
import { downloader } from '@morjs/cli'

downloader.npm.supportProtocol(url)
```

### downloader.npm.getName(npmOptions)

从 npm 选项中获取名称

- `npmOptions`: npm 选项

```typescript
import { downloader } from '@morjs/cli'

downloader.npm.getName(npmOptions)
```

### downloader.npm.download(npmOptions, dest)

下载 npm 到指定的目录

- `npmOptions`: npm 下载链接或选项
- `dest`: 下载目录

```typescript
import { downloader } from '@morjs/cli'

downloader.npm.download(npmOptions, dest)
```

### downloader.registerDownloader(type, downloader)

注册新的下载器

- `type`: 下载器类型
- `downloader`: 下载器

```typescript
import { downloader } from '@morjs/cli'

downloader.npm.registerDownloader(type, downloader)
```

### downloader.getModuleName(type, options)

获取下载模块名称

- `type`: 下载类型
- `options`: 下载配置

```typescript
import { downloader } from '@morjs/cli'

downloader.npm.getModuleName(type, options)
```

### downloader.chooseDownloadType(options)

基于下载配置选择下载方式

- `options`: 下载配置

```typescript
import { downloader } from '@morjs/cli'

downloader.chooseDownloadType(options)
```

### downloader.getAllDownloadTypes()

获取所有下载类型

```typescript
import { downloader } from '@morjs/cli'

downloader.getAllDownloadTypes()
```

### downloader.parseOptions(type, options)

解析下载链接或选项

- `type`: 下载类型
- `options`: 下载链接或选项

```typescript
import { downloader } from '@morjs/cli'

downloader.parseOptions(type, options)
```

### downloader.download(type, options, dest)

尝试通过不同的方式下载模块

- `type`: 下载方式
- `options`: 下载配置
- `dest`: 下载地址

```typescript
import { downloader } from '@morjs/cli'

downloader.download(type, options, dest)
```

### downloader.autoDetectDownloaderTypeAndOptions(url)

基于 url 自动判断支持的下载器类型及下载选项

- `url`: 下载链接或地址

```typescript
import { downloader } from '@morjs/cli'

downloader.autoDetectDownloaderTypeAndOptions(url)
```

### downloader.tryDownloadByUrl(options, dest)

自动基于不同的协议来下载模块

- `options`: 下载链接
- `dest`: 下载地址

```typescript
import { downloader } from '@morjs/cli'

downloader.tryDownloadByUrl(options, dest)
```

## utils

封装定义了一些常用方法

### asArray(value)

数组转换方法

- `value`: 需要转换为数组的值

```typescript
import { asArray } from '@morjs/cli'

asArray(value)
```

### bundleMjsOrTsFile(cwd, fileName, mjs)

使用 esbuild 读取 ts 或 mjs 文件内容

- `cwd`: 当前工作目录
- `fileName`: 配置文件路径
- `mjs`: 是否为 mjs 文件类型

```typescript
import { bundleMjsOrTsFile } from '@morjs/cli'

bundleMjsOrTsFile(cwd, fileName, mjs)
```

### isSupportColorModifier()

主要用于 logger 内部，标记是否支持 color modifier 如: bold strikethrough 等

```typescript
import { isSupportColorModifier } from '@morjs/cli'

isSupportColorModifier()
```

### disableColorModifierSupport()

将标记值改为 false

```typescript
import { disableColorModifierSupport } from '@morjs/cli'

disableColorModifierSupport()
```

### enableColorModifierSupport()

将标记值改为 true

```typescript
import { enableColorModifierSupport } from '@morjs/cli'

enableColorModifierSupport()
```

### compose(fns)

组合多个函数为一个，顺序执行

- `fns`: 函数列表

```typescript
import { compose } from '@morjs/cli'

compose(fns)
```

### importJsOrMjsOrTsFromFile(cwd, filePath, isMjs, isTs, tempFilePath, autoDeleteTempFile)

载入并解析 js、mjs 或 ts 文件

```typescript
import { importJsOrMjsOrTsFromFile } from '@morjs/cli'

importJsOrMjsOrTsFromFile(
  cwd,
  filePath,
  isMjs,
  isTs,
  tempFilePath,
  autoDeleteTempFile
)
```

### interopRequireDefault(obj)

改造传入的对象结构

- `obj`: 传入的对象值

```typescript
import { interopRequireDefault } from '@morjs/cli'

interopRequireDefault(obj)
```

### isObject(value)

判断是否为 object

- `value`: 传入的对象值

```typescript
import { isObject } from '@morjs/cli'

isObject(value)
```

### isUnicodeSupported()

判断是否支持 unicode

```typescript
import { isUnicodeSupported } from '@morjs/cli'

isUnicodeSupported()
```

### lookupFile(dirs, files, extnames, options)

查找文件

- `dirs`: 目录地址
- `files`: 文件名
- `extnames`: 后缀名
- `options`: 查找选项

```typescript
import { lookupFile } from '@morjs/cli'

lookupFile(dirs, files, extnames, options)
```

### objectEnum(t)

通过数组创建对象 enum

- `t`: 静态数组

```typescript
import { objectEnum } from '@morjs/cli'

objectEnum(t)
```

### readJsonLike(filePath)

读取类 json 文件，支持 json / jsonc / json5 三种格式

- `filePath`: 类 json 文件

```typescript
import { readJsonLike } from '@morjs/cli'

readJsonLike(filePath)
```

### requireResolve(args)

由于 jest 没有办法 mock require.resolve, 需要单独封装方法来解决单测问题

https://github.com/facebook/jest/issues/9543

## Generator

用于构建脚手架：

1. 指定某个模板，支持本地加载或网络加载，支持多种类型

- 基于 downloader 支持的各种类型：file 文件、git 仓库、link 软链、npm 包、tar 包
- 下载后会调用 prompts 获取命令行交互结果，把结果作为参数抛给 lodash 的 template 模板里，通过模板 render 生成文件，写入模板到目标文件夹

2. 自定义模板

## deps

将 `takin` 本身的依赖库 `export` 出去，避免重复依赖

### chalk

引用自 `chalk` 的第三方依赖，直接 `export` 给开发者引用，可用于修改终端输出字符彩色样式

```typescript
import { chalk } from '@morjs/cli'

chalk()
```

### debug

引用自 `debug` 的第三方依赖，直接 `export` 给开发者引用，可用于 logger 的 debug 日志输出，返回一个修饰过的 console.error 函数

```typescript
import { debug } from '@morjs/cli'

debug()
```

### execa

引用自 `execa` 的第三方依赖，直接 `export` 给开发者引用，可用于执行终端进程的库，如 execa.command(`git clone ${repo.ssh}${dest}`)

```typescript
import { execa } from '@morjs/cli'

execa()
```

### esbuild

引用自 `esbuild` 的第三方依赖，直接 `export` 给开发者引用，支持 typescript 和 jsx 的极速打包器，目前提供给 bundleMjsOrTsFile 方法使用

```typescript
import { esbuild } from '@morjs/cli'

esbuild()
```

### fastGlob

引用自 `fast-glob` 的第三方依赖，直接 `export` 给开发者引用，可提供遍历文件系统和返回路径名的方法，目前提供给 generator 使用

```typescript
import { fastGlob } from '@morjs/cli'

fastGlob()
```

### fsExtra

引用自 `fs-extra` 的第三方依赖，直接 `export` 给开发者引用，可用于文件操作，复制、建目录、删除等 fs 扩展操作

```typescript
import { fsExtra as fs } from '@morjs/cli'

fs()
```

### got

引用自 `got` 的第三方依赖，直接 `export` 给开发者引用，可用于支持 promise 的 request 请求，目前提供给 download 使用

```typescript
import { got } from '@morjs/cli'

got()
```

### json5

引用自 `json5` 的第三方依赖，直接 `export` 给开发者引用，可用于支持 json5 格式的文件，提供更精简的 json 格式，去掉了 key 的双引号，同时支持注释

```typescript
import { json5 } from '@morjs/cli'

json5()
```

### jsoncParser

引用自 `jsonc-parser` 的第三方依赖，直接 `export` 给开发者引用，可用于支持 jsonc 格式的文件，用于序列化 jsonc 文件内容

```typescript
import { jsoncParser } from '@morjs/cli'

jsoncParser()
```

### lodash

引用自 `lodash` 的第三方依赖，直接 `export` 给开发者引用，提供大量封装的 js 方法，如「模板插入 template」「深拷贝 cloneDeep」「删除对象属性 omit」「判空 isEmpty」等

```typescript
import { lodash } from '@morjs/cli'

lodash()
```

### prompts

引用自 `prompts` 的第三方依赖，直接 `export` 给开发者引用，可用于创建交互命令行表单，目前提供给 generator 使用获取命令行交互结果

```typescript
import { prompts } from '@morjs/cli'

prompts()
```

### tapable

引用自 `tapable` 的第三方依赖，直接 `export` 给开发者引用，流程管理工具，主要用来串联插件，完善事件流执行

```typescript
import { tapable } from '@morjs/cli'

tapable()
```

### tarFs

引用自 `tar-fs` 的第三方依赖，直接 `export` 给开发者引用，可用于 tar 包的压缩与解压，目前提供给 download 使用

```typescript
import { tarFs } from '@morjs/cli'

tarFs()
```

### zod

引用自 `zod` 的第三方依赖，直接 `export` 给开发者引用，可用于以 typeScript 为基础的模式声明和验证校验手段

```typescript
import { zod } from '@morjs/cli'

zod()
```
