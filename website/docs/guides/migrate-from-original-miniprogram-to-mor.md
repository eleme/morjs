# 原生小程序接入

本文主要描述从没有任何框架依赖的原生小程序，迁移并接入到 MorJS 的步骤。

## 环境准备

首先需要有 [node](https://nodejs.org/zh-cn/), 并确保 `node` 版本为 `14` 或以上。

```bash
$ node -v
v14
```

## 增加必要的依赖

> 如果不存在 `package.json`，建议在安装依赖前，先执行 `npm init --yes` 生成 `package.json` 文件。

- 步骤一：进入小程序项目根目录：`cd your_project_dir`
- 步骤二：添加 MorJS 必要的依赖：`npm i @morjs/cli -D && npm i @morjs/core --save`

```diff
{
   "dependencies": {
+    "@morjs/core": "*",
   },
   "devDependencies": {
+    "@morjs/cli": "*",
   }
 }
```

## 调整目录结构

你需要将小程序的源码文件（`app.json`、`app.js`、`app.acss`、`pages`、`components`、`mini.project.json` 等文件），从项目根目录移动到 `src` 中

- 调整前：

```
.
├── .gitignore
├── LEGAL.md
├── app.acss
├── app.js
├── app.json
├── mini.project.json
└── pages
    └── index
        ├── index.axml
        ├── index.acss
        ├── index.json
        └── index.js
└── components
    └── index
        ├── index.axml
        ├── index.acss
        ├── index.json
        └── index.js
```

- 调整后：

```
.
├── .gitignore
├── LEGAL.md
└── src
    ├── app.acss
    ├── app.js
    ├── app.json
    ├── mini.project.json
    └── pages
        └── index
            ├── index.axml
            ├── index.acss
            ├── index.json
            └── index.js
    └── components
        └── index
            ├── index.axml
            ├── index.acss
            ├── index.json
            └── index.js
```

## 增加配置

在项目根目录中增加配置文件 `mor.config.ts`：

```typescript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'ali',
    sourceType: 'alipay',
    target: 'alipay'
  },
  {
    name: 'wechat',
    sourceType: 'alipay',
    target: 'wechat'
  }
])
```

这里的配置仅供参考，有关配置的详细说明和使用方式，参见: [MorJS 基础 - 配置](/guides/basic/config.md)。

## 配置脚本

```diff
{
   "scripts": {
+    "dev": "mor compile -w",
+    "mock": "mor compile -w --mock",
+    "build": "mor compile --production"
   }
 }
```

## 开发和验证

接下来，就可以开始投入开发和验证了：

```bash
# 项目根目录执行命令 👇
npm run dev # 即 mor compile -w
```

执行命令后的效果如下：

```
[mor] ⚑ 当前 MorJS 为开源版本: @morjs/cli
[mor] ℹ 发现配置文件: mor.config.ts
[mor] ✔ 配置文件加载成功: mor.config.ts
[mor] ℹ 准备配置中, 即将开始编译 👇
        配置名称: ali
        编译目标: 支付宝小程序
        编译类型: 小程序
        编译模式: bundle
        源码目录: src
        输出目录: dist/alipay
[mor] ℹ 已开启缓存, 可通过 --no-cache 关闭
[mor] ℹ 启动文件监听模式
[mor] ℹ 开始编译 ...
[mor] ℹ 依赖分析中 ...
[mor] ℹ 依赖分析完成: 耗时: 15.520708 ms
[mor] ✔ 编译完成, 耗时: 581.601542 ms

[mor] ℹ 准备配置中, 即将开始编译 👇
        配置名称: wechat
        编译目标: 微信小程序
        编译类型: 小程序
        编译模式: bundle
        源码目录: src
        输出目录: dist/wechat
[mor] ℹ 已开启缓存, 可通过 --no-cache 关闭
[mor] ℹ 启动文件监听模式
[mor] ℹ 开始编译 ...
[mor] ℹ 依赖分析中 ...
[mor] ℹ 依赖分析完成: 耗时: 10.393 ms
[mor] ✔ 编译完成, 耗时: 464.704167 ms
```

在 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 中打开 `dist/wechat` 目录即可开始微信小程序开发预览

在 [支付宝小程序开发者工具](https://opendocs.alipay.com/mini/ide/download) 中打开 `dist/alipay` 目录即可开始微信小程序开发预览
