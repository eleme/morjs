# 快速上手

`MorJS` 提供将小程序项目转换成 `Web` 项目的能力（转换成一个基于 `React` 的项目），让业务能够快速拓展部署渠道。

接下来，你只需要根据自己的场景（新建工程 or 基于已有 `MorJS` 工程改造）跟着下面的文档操作就可以快速开始。

## 新建 MorJS 工程

```shell
npm i @morjs/cli -g # 全局安装 MorJS cli(如已安装可跳过)
mor init # 选择 MorJS 标准小程序工程，然后填写信息，在填写 投放渠道 这一项时将 Web 选中
npm run dev:web # 运行项目，控制台会打印地址和二维码
```

执行完上述步骤，项目就已经跑在 `Web` 上了~ 如果你需要更多的定制，可以继续浏览更多章节。

## 已有 MorJS 工程

针对已有的 `MorJS` 工程，按照以下方法配置，可以进行 `Web` 端的编译。

### 使用命令行

```shell
# 安装 react 依赖
npm i react react-dom --save
# 开发命令
mor compile --name web -w

# 构建命令
mor compile --name web --production
```

> 直接使用 mor 指令需要你全局安装 mor cli。

### 编辑 scripts 脚本

打开项目的 `package.json`,在 `scripts` 字段中加如下两行：

```json
"compile:prod:web": "mor compile --name web --production",
"dev:web": "mor compile --name web -w",
```

至此，你的项目已经可以运行在 `Web` 端了 🎇，接下来我们继续看一下 `Web` 端都支持哪些配置吧 ~
