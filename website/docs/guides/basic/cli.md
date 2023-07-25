# 命令行

## 概览

可通过 `mor -h` 查看帮助信息。

命令说明: `[]` 代表可选参数, `<>` 代表必填参数

```bash
.__  __   ___   ____         ____  _      ___
|  \/  | / _ \ |  _ \       / ___|| |    |_ _|
| |\/| || | | || |_) |     | |    | |     | |
| |  | || |_| ||  _ <      | |___ | |___  | |
|_|  |_| \___/ |_| \_\      \____||_____||___|

用法:
  $ mor

命令:
                             默认选项描述
  compile                    编译小程序工程
  clean <action>             清理 mor 清理缓存/临时目录
  compose                    小程序集成功能
  generate <type> [...args]  生成器, 命令别名 [g]
  init [projectDir]          初始化/创建 MorJS 项目、插件、脚手架等, 命令别名 [create]
  analyze                    分析小程序相关 bundle 信息

更多信息可通过 `--help` 选项，运行下方命令获取:
  $ mor --help
  $ mor compile --help
  $ mor clean --help
  $ mor compose --help
  $ mor generate --help
  $ mor init --help
  $ mor analyze --help

选项:
  --verbose               开启框架调试日志
  -h, --help              显示帮助信息
  -v, --version           显示版本信息
  --cwd <cwd>             当前工作目录, 默认为 process.cwd()
  -c, --config <path>     指定自定义配置文件路径, 支持 .ts, .js, .mjs, .json, .jsonc, .json5 等类型, 如 mor.config.ts
  --ignore-config         忽略或不自动载入用户配置文件
  --no-autoload-plugins   关闭自动载入插件功能 (默认: true)
  --name <configName>     指定配置名称, 如不指定则代表选择所有配置
  --plugins <plugins>     指定需要运行的插件, 如: plugin1,plugin2
```

## 编译命令 — `compile`

可通过 `mor compile -h` 查看帮助信息。

```bash
用法:
  $ mor compile 编译命令

  支持的小程序或应用类型 (target):
    alipay     支付宝小程序
    baidu      百度小程序
    bytedance  字节小程序
    dingding   钉钉小程序
    kuaishou   快手小程序
    qq         QQ 小程序
    taobao     淘宝小程序
    web        Web 应用
    wechat     微信小程序

选项:
  --source-type <sourceType>       源码类型, 用于判断小程序页面或组件使用了哪种 DSL, 可选值为 wechat, alipay
  -t, --target <target>            编译目标, 将当前的工程编译为目标小程序工程, 可选值为 alipay, wechat, baidu, bytedance, qq, taobao, dingding, kuaishou, web, eleme
  --compile-mode <compileMode>     编译模式, 将当前工程以指定的编译模式编译, 编译模式差异参见官方文档, 可选值为 bundle, transform, transfer, default
  --compile-type <compileType>     编译形态, 将当前工程编译为指定形态, 可选值为 miniprogram, plugin, subpackage
  -d, --devtool [devtool]          开发工具, 控制是否生成, 以及如何生成 source map, 参见 https://webpack.js.org/configuration/devtool
  --no-devtool                     关闭 devtool (默认: true)
  --mock                           是否开启 mock 功能, --production 状态下会自动关闭 mock 功能
  --minimize                       是否开启压缩, --production 状态下会自动开启 (默认: false)
  --js-minimizer [minimizer]       JS 代码压缩器, 可选值为 terser, esbuild, swc
  --no-js-minimizer                关闭 JS 压缩 (默认: true)
  --css-minimizer [minimizer]      CSS 代码压缩器, 默认为 esbuild, 可选值为 esbuild, csso, cssnano, cleancss, parcelcss
  --no-css-minimizer               关闭 CSS 压缩 (默认: true)
  --xml-minimizer                  XML 代码压缩器, 目前仅支持 html-terser
  --no-xml-minimizer               关闭 XML 压缩 (默认: true)
  --mode <mode>                    开发模式, 设置开发模式, 可选值为 production, development, none
  --production                     是否开启生产模式, 等同于 --mode production
  --auto-clean                     是否自动清空输出目录, (默认: false)
  -w, --watch                      是否开启监听模式, (默认: false)
  -s, --src-path <dir>             源代码根目录, 默认为 src
  -o, --output-path <dir>          编译产物输出目录, 不同的 target 会有默认的输出目录, 如 dist/wechat
  --ignore <fileOrDir>             忽略文件或目录, 各个配置中的 outputPath 会被自动添加到忽略目录
  --no-cache                       是否关闭缓存 (默认: true)
  --cache                          是否开启缓存, mode = development 下默认开启, mode = production 状态下默认关闭 (默认: null)
  --process-node-modules           是否自动处理 node_modules 中的多端组件库, 默认情况为 false, 开启后会自动处理 node_modules 中的文件的转端
  --global-object <name>           全局对象配置, 不同的 target 会有默认的全局对象, 通常情况下无需设置
  --analyze                        是否开启 bundle analyzer
  --no-progress                    关闭进度显示 (默认: true)
  --emit-web-intermediate-assets   生成 web 转端中间产物 (方便调试)
  --compose                        开启小程序集成功能
  --with-modules <moduleName>      指定需要参与集成的模块, 支持 glob 模式, 该配置需要开启集成后生效
  --without-modules <moduleName>   排除不需要集成的模块, 支持 glob 模式, 该配置需要开启集成后生效
  --from-state <state>             控制模块集成时的初始状态, 可选值: 0-6, 该配置需要开启集成后生效
  --to-state <state>               控制模块集成时的最终状态, 可选值: 0-6, 该配置需要开启集成后生效
  --concurrency <number>           控制模块集成时的并发数量
  --combine-modules                合并模块配置 (主要用于合并分包配置的页面到主包中)
  --verbose                        开启框架调试日志
  -h, --help                       显示帮助信息
  --cwd <cwd>                      当前工作目录, 默认为 process.cwd()
  -c, --config <path>              指定自定义配置文件路径, 支持 .ts, .js, .mjs, .json, .jsonc, .json5 等类型, 如 mor.config.ts
  --ignore-config                  忽略或不自动载入用户配置文件
  --no-autoload-plugins            关闭自动载入插件功能 (默认: true)
  --name <configName>              指定配置名称, 如不指定则代表选择所有配置
  --plugins <plugins>              指定需要运行的插件, 如: plugin1,plugin2
```

## 清理命令 — `clean`

可通过 `mor clean -h` 查看帮助信息。

```bash
用法:
  $ mor clean <cache|temp|all>  清理缓存/临时目录

选项:
  --verbose               开启框架调试日志
  -h, --help              显示帮助信息
  --cwd <cwd>             当前工作目录, 默认为 process.cwd()
  -c, --config <path>     指定自定义配置文件路径, 支持 .ts, .js, .mjs, .json, .jsonc, .json5 等类型, 如 mor.config.ts
  --ignore-config         忽略或不自动载入用户配置文件
  --no-autoload-plugins   关闭自动载入插件功能 (默认: true)
  --name <configName>     指定配置名称, 如不指定则代表选择所有配置
  --plugins <plugins>     指定需要运行的插件, 如: plugin1,plugin2
```

## 集成命令 — `compose`

可通过 `mor compose -h` 查看帮助信息。

```bash
用法:
  $ mor compose

选项:
  --with-modules <moduleName>     指定需要参与集成的模块, 支持 glob 模式, 该配置需要开启集成后生效
  --without-modules <moduleName>  排除不需要集成的模块, 支持 glob 模式, 该配置需要开启集成后生效
  --from-state <state>            控制模块集成时的初始状态, 可选值: 0-6, 该配置需要开启集成后生效
  --to-state <state>              控制模块集成时的最终状态, 可选值: 0-6, 该配置需要开启集成后生效
  --concurrency <number>          控制模块集成时的并发数量
  --combine-modules               合并模块配置 (主要用于合并分包配置的页面到主包中)
  --verbose                       开启框架调试日志
  -h, --help                      显示帮助信息
  --cwd <cwd>                     当前工作目录, 默认为 process.cwd()
  -c, --config <path>             指定自定义配置文件路径, 支持 .ts, .js, .mjs, .json, .jsonc, .json5 等类型, 如 mor.config.ts
  --ignore-config                 忽略或不自动载入用户配置文件
  --no-autoload-plugins           关闭自动载入插件功能 (默认: true)
  --name <configName>             指定配置名称, 如不指定则代表选择所有配置
  --plugins <plugins>             指定需要运行的插件, 如: plugin1,plugin2
```

## 分析命令 — `analyze`

可通过 `mor analyze -h` 查看帮助信息。

```bash
用法:
  $ mor analyze

选项:
  --mode <analyzerMode>               依赖分析模式, 可选值为 server, static, json, disabled
  --host <analyzerHost>               依赖分析 HTTP 服务域名, 仅在 mode 为 server 时生效
  --port <analyzerPort>               依赖分析 HTTP 服务端口号, 仅在 mode 为 server 时生效
  --report-filename <reportFilename>  生成报告文件的名称, 仅在 mode 为 static 时生效
  --report-title <reportTitle>        生成报告文件的标题, 仅在 mode 为 static 时生效
  --default-sizes <defaultSizes>      分析报告中展示模块大小的定义方式, 可选值为 stat, parsed, gzip
  --open                              浏览器中打开
  --no-open                           不在浏览器中打开 (默认: true)
  --generate-stats-file               是否生成 stats 文件
  --stats-filename <statsFilename>    stats 文件名称
  --verbose                           开启框架调试日志
  -h, --help                          显示帮助信息
  --cwd <cwd>                         当前工作目录, 默认为 process.cwd()
  -c, --config <path>                 指定自定义配置文件路径, 支持 .ts, .js, .mjs, .json, .jsonc, .json5 等类型, 如 mor.config.ts
  --ignore-config                     忽略或不自动载入用户配置文件
  --no-autoload-plugins               关闭自动载入插件功能 (默认: true)
  --name <configName>                 指定配置名称, 如不指定则代表选择所有配置
  --plugins <plugins>                 指定需要运行的插件, 如: plugin1,plugin2
```

## 脚手架命令 — `create` 或 `init`

可通过 `mor generate -h` 查看帮助信息

```bash
用法:
  $ mor init [projectDir]

选项:
  --template, -t <template>  指定脚手架模版
  --no-custom                关闭初始化/创建功能定制 (默认: true)
  --verbose                  开启框架调试日志
  -h, --help                 显示帮助信息
  --cwd <cwd>                当前工作目录, 默认为 process.cwd()
  -c, --config <path>        指定自定义配置文件路径, 支持 .ts, .js, .mjs, .json, .jsonc, .json5 等类型, 如 mor.config.ts
  --ignore-config            忽略或不自动载入用户配置文件
  --no-autoload-plugins      关闭自动载入插件功能 (默认: true)
  --name <configName>        指定配置名称, 如不指定则代表选择所有配置
  --plugins <plugins>        指定需要运行的插件, 如: plugin1,plugin2
```

## 微生成器 — `generate` 或 `g`

```bash
用法:
  $ mor generate <type> [...args]

选项:
  --verbose               开启框架调试日志
  -h, --help              显示帮助信息
  --cwd <cwd>             当前工作目录, 默认为 process.cwd()
  -c, --config <path>     指定自定义配置文件路径, 支持 .ts, .js, .mjs, .json, .jsonc, .json5 等类型, 如 mor.config.ts
  --ignore-config         忽略或不自动载入用户配置文件
  --no-autoload-plugins   关闭自动载入插件功能 (默认: true)
  --name <configName>     指定配置名称, 如不指定则代表选择所有配置
  --plugins <plugins>     指定需要运行的插件, 如: plugin1,plugin2
```
