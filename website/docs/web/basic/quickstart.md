# 快速上手

`MorJS` 提供将小程序项目转换成 `Web` 项目的能力（转换成一个基于 `React` 的项目），让业务能够快速拓展部署渠道。

接下来，你只需要根据自己的场景（新建工程 or 基于已有 `MorJS` 工程改造）跟着下面的文档操作就可以快速开始。

## 新建 MorJS 工程

```shell
npm i @morjs/cli -g # 全局安装 MorJS cli(如已安装可跳过)
mor init # 创建工程时会有 <请选择是否需要增加转 Web 配置> 选项，选择 “是”
npm run dev:web # 运行项目，控制台会打印地址和二维码
```

执行完上述步骤，项目就已经跑在 `Web` 上了~ 如果你需要更多的定制，可以继续浏览更多章节。

## 已有 MorJS 工程

针对已有的 `MorJS` 工程，按照以下方法配置，可以进行 `Web` 端的编译。

### 增加配置

打开 `mor.config.[js|ts]`，写入 `web` 转换配置

```
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'web',
    sourceType: 'alipay', // 根据业务工程类型配置，微信就填 wechat
    target: 'web',
    compileType: 'miniprogram', // 根据业务形态类型配置，小程序/插件/分包 分别对应 miniprogram/plugin/subpackage
    compileMode: 'bundle',
  }
])

```

### 运行项目

如果已经全局安装了 `@morjs/cli`，可以直接运行如下指令 👇🏻

```shell
# 开发命令
mor compile --name web -w

# 构建命令
mor compile --name web --production
```

如果没有全局安装 `@morjs/cli`，打开项目的 `package.json`，在 `scripts` 字段中增加指令 👇🏻

```json
"compile:web": "mor compile --name web --production",
"dev:web": "mor compile --name web -w",
```

配置完成后使用 `npm` 运行指令即可。

至此，你的项目已经可以运行在 `Web` 端了 🎇，接下来我们继续看一下 `Web` 端都支持哪些配置吧 ~
