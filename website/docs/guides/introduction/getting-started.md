# 快速上手

## 环境准备

首先需要有 [node](https://nodejs.org/zh-cn/), 并确保 `node` 版本为 `14` 或以上。（推荐用 [nvm](https://github.com/nvm-sh/nvm) 来管理 `node` 版本，windows 下推荐用 [nvm-windows](https://github.com/coreybutler/nvm-windows)）

mac 或 linux 下安装 nvm。

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
$ nvm -v
0.39.1
```

安装 `node`。

```
$ nvm install 14
$ nvm use 14
$ node -v
v14.19.0
```

然后需要包管理工具。`node` 默认包含 `npm`

## 创建项目

先找个地方建个空目录。

```
mkdir myapp && cd myapp
```

全局安装 mor cli 工具。

```
npm i @morjs/cli -g
```

通过 mor cli 工具创建项目：

```
mor init
```

然后你会看到如下界面：

```
? 请选择工程类型 › - Use arrow-keys. Return to submit.
❯   小程序
    小程序插件
    小程序分包
    MorJS 工程插件
    MorJS 运行时插件
    MorJS 运行时解决方案
    MorJS 多端组件库
    MorJS 自定义脚手架
```

选择 `小程序` 回车并根据提示完成操作后，即可完成项目创建

```
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
[mor] ✔ 拷贝: .eslintrc.js
[mor] ✔ 拷贝: .gitignore
[mor] ✔ 拷贝: mor.config.ts
[mor] ✔ 拷贝: package.json
[mor] ✔ 拷贝: tsconfig.json
[mor] ✔ 拷贝: src/app.json
[mor] ✔ 拷贝: src/app.less
[mor] ✔ 拷贝: src/app.ts
[mor] ✔ 拷贝: src/project.config.json
[mor] ✔ 拷贝: src/sitemap.json
[mor] ✔ 拷贝: src/utils/util.ts
[mor] ✔ 拷贝: src/pages/index/index.json
[mor] ✔ 拷贝: src/pages/index/index.less
[mor] ✔ 拷贝: src/pages/index/index.ts
[mor] ✔ 拷贝: src/pages/index/index.wxml
[mor] ✔ 拷贝: src/pages/logs/logs.json
[mor] ✔ 拷贝: src/pages/logs/logs.less
[mor] ✔ 拷贝: src/pages/logs/logs.ts
[mor] ✔ 拷贝: src/pages/logs/logs.wxml
[mor] ℹ 自动安装 node_modules 中...
[mor] ✔ 安装 node_modules 完成!
[mor] ✔ 小程序项目初始化完成 ^_^ 在终端运行命令 👇🏻

        npm run dev

        即可启动项目。
```

## 启动项目

执行 `npm run dev` 命令，

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

在 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 中打开 `dist/wechat` 目录即可开始微信小程序开发预览

在 [支付宝小程序开发者工具](https://opendocs.alipay.com/mini/ide/download) 中打开 `dist/alipay` 目录即可开始微信小程序开发预览
