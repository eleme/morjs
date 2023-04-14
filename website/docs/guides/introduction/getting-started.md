# 快速上手

## 环境准备

MorJS 项目基于 [node](https://nodejs.org/zh-cn/)，请确保已具备较新的 node 环境（>=14），推荐使用 node 版本管理工具 [nvm](https://github.com/nvm-sh/nvm) 来管理 node（Windows 下使用 [nvm-windows](https://github.com/coreybutler/nvm-windows)），这样可以很方便地切换 node 版本，全局安装时候也不必再使用 `sudo`。

```
# mac 或 linux 下安装 nvm
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
$ nvm -v
0.39.1

# 安装 node
$ nvm install 14
$ nvm use 14
$ node -v
v14.21.3
```

## 创建项目

Mor 提供了 `create-mor` 和 `mor cli` 工具两种方式来创建新项目，选择其中任一一种即可。

- **使用 create-mor 创建项目**

确保你安装了符合版本的 Node.js，选定项目目录，在目录终端执行以下任一命令：

```shell
$ npm init mor # npm 创建项目
$ yarn create mor # yarn 创建项目
$ pnpm create mor # pnpm 创建项目
```

这一指令将会安装并执行 `create-mor`，它是 Mor 官方的项目脚手架工具。

- **使用 mor cli 创建项目**

确保你安装了符合版本的 Node.js，创建项目目录，全局安装 mor cli 工具

```shell
$ mkdir myapp && cd myapp # 创建项目目录
$ tnpm i @morjs/cli -g # 全局安装 mor cli
$ mor -v # 查看全局 mor 版本
```

此时你已安装了 mor cli 工具，然后通过 `mor init` 命令即可创建项目：

```shell
$ mor init
```

## 初始化项目

创建项目后你会看到如下命令号交互界面，选择对应的工程类型，按照提示完成初始化操作：

```shell
✔ 请选择工程类型 › 小程序
✔ 请选择源码类型 › 微信小程序 DSL
✔ 是否使用 Typescript … 否 / 是
✔ 请选择 CSS 预处理器 › less
✔ 请输入 小程序 的名称 … myapp
✔ 请输入 小程序 的描述 … my first app
✔ 用户名 … yourUserName
✔ 邮箱 … your@gmail.com
✔ 请输入 Git 仓库地址 … https://github.com/yourUserName/myapp
✔ 请选择 npm 客户端 › npm / pnpm / yarn
…
[mor] ✔ 安装 node_modules 完成!
[mor] ✔ 小程序项目初始化完成 ^_^ 在终端运行命令 👇🏻

        npm run dev

        即可启动项目。
```

在项目初始化之后，Mor 会默认开始安装项目所需要的依赖，一般来说，依赖安装会自动完成，但某些情况下可能会安装失败，这时候你可以在项目目录下自己使用安装命令进行安装：

```shell
$ npm i
```

## 编译运行

使用 MorJS 的 `compile` 命令可以把 MorJS 代码编译成不同端的代码，然后在对应的开发工具中查看效果。MorJS 初始的编译命令配置了 `dev` 和 `build` 两种模式：

- `dev` 模式（增加 --watch 参数）将会监听文件修改。
- `build` 模式（增加 --production 参数）将对代码进行压缩打包。

执行 `npm run dev` 命令，进行浏览调试：

```
[mor] ℹ 发现配置文件: mor.config.ts
[mor] ✔ 配置文件加载成功: mor.config.ts
[mor] ℹ 准备配置中, 即将开始编译 👇
        配置名称: wechat-miniprogram
        编译目标: 微信小程序
        编译环境: development
        编译类型: 小程序
        编译模式: bundle
        源码类型: wechat
        源码目录: src
        输出目录: dist/wechat
[mor] ℹ 已开启缓存, 可通过 --no-cache 关闭
[mor] ℹ 启动文件监听模式
[mor] ℹ 开始编译 ...
[mor] ℹ 依赖分析中 ...
[mor] ℹ 依赖分析完成: 耗时: 25.125412 ms
[mor] ✔ 编译完成, 耗时: 1451.202285 ms

[mor] ℹ 准备配置中, 即将开始编译 👇
        配置名称: alipay-miniprogram
        编译目标: 支付宝小程序
        编译环境: development
        编译类型: 小程序
        编译模式: bundle
        源码类型: wechat
        源码目录: src
        输出目录: dist/alipay
[mor] ℹ 已开启缓存, 可通过 --no-cache 关闭
[mor] ℹ 启动文件监听模式
[mor] ℹ 开始编译 ...
[mor] ℹ 依赖分析中 ...
[mor] ℹ 依赖分析完成: 耗时: 24.112123 ms
[mor] ✔ 编译完成, 耗时: 441.548922 ms
```

多端产物已构建在 dist 目录下，分别用对应平台的 IDE 打开即可开发预览：

在 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 中打开 `dist/wechat` 目录即可开始微信小程序开发预览
在 [支付宝小程序开发者工具](https://opendocs.alipay.com/mini/ide/download) 中打开 `dist/alipay` 目录即可开始微信小程序开发预览
