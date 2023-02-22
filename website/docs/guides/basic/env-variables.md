# 环境变量

MorJS 可以通过环境变量来完成一些特殊的配置和功能。

## 如何设置环境变量

### 环境变量约定

`''`、`none`、`false`、`0`、`undefined`、`null` 在环境变量中会被认为是 `false`，如：

`CAHCE=none` 与 `CAHCE=''` 或 `CACHE=false` 具有相同的作用，均为关闭缓存。

### 执行命令时设置

例如需要改变 `mor compile --target web` 开发服务器的端口，进可以通过如下命令实现。

```bash
# OS X, Linux
$ PORT=3000 mor compile --target web

# Windows (cmd.exe)
$ set PORT=3000&&mor compile --target web
```

如果需要同时在不同的操作系统中使用环境变量，推荐使用工具 [cross-env](https://github.com/kentcdodds/cross-env)

```bash
$ npm install cross-env -D
$ cross-env PORT=3000 mor compile --target web
```

### 设置在 .env 文件中

如果你的环境变量需要在开发者之间共享，推荐你设置在项目根目录的 `.env` 文件中，例如:

```text
# file .env
PORT=3000
CACHE=none
```

然后执行，

```bash
$ mor compile --target web
```

MorJS 会以 3000 端口启动 dev server，并且禁用缓存。

## 环境变量列表

按字母顺序排列。

### ANALYZE

用于分析 bundle 构成，默认关闭。

比如：

```bash
$ ANALYZE=1 mor compile
```

### PROGRESS

用于开启或关闭百分比进度显示，默认为开启。

### CACHE

是否开启缓存，`mode` 为 `development` 时自动开启，`mode` 为 `production` 时自动关闭。

### HOST

默认是 `0.0.0.0`，仅在编译为 web 产物且开启监听模式时生效。

### PORT

指定端口号，默认是 `8080`，仅在编译为 web 产物且开启监听模式时生效。

### MOR_PLUGINS

指定 MorJS 命令执行时额外加载的插件的路径，使用 `,` 隔开。

```bash
$ MOR_PLUGINS=./path/to/plugin1,./path/to/plugin2  mor compile
```
