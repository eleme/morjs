# 多端组件库规范

## 概要

MorJS 在编译的过程中，不会处理 `node_modules` 中的小程序多端组件，所以需要每个组件或者组件库在输出给到业务使用的时候都是适配了多端，如: **微信小程序、支付宝小程序、字节小程序、QQ 小程序、百度小程序等**，因此需要各个组件、组件库要做好严格的自测以确保多端下的兼容性。

## 特别说明

- 请在输出组件 **JS** 代码的时候输出 `ES5` 版本的
  - 小程序并不会去做 `node_modules` 里面的 `ESNext` 语法转换
  - 建议使用 `tsc` 输出 `ES5` 代码，原因参考: [小程序 JS 依赖库规范](/specifications/js)
- 组件输出多端版本的时候，建议使用 MorJS 的 `compile` 能力来输出产物
- 组件的运行时必须是采用 `aComponent` 或 `wComponent` 来替代 `Component`，用法请参考: [运行时文档](/guides/basic/runtime)
- 组件库与组件的规范是一致的，区别只是输出多个组件还是单个组件
- 各个小程序平台的兼容性问题，超出多端编译覆盖范围的，需要自行处理，如支付宝小程序是否开启 `component2` 支持的情况

## 多端适配简要说明

- MorJS 是通过目录结构结合 `package.json` 的目录指向字段配置来实现的，在 NPM 组件 `npm publish` 环节中需要将已经适配好多端的文件编译处理输出发布；
- MorJS 的编译环节会根据业务引用路径结合 `NPM 组件` 目录配置来按需拷贝对应的组件文件，并改写对应的引用路径来实现一个路径多个端可兼容运行；
- 请注意: MorJS 是不会在编译环节动态编译处理 `node_modules` 的 `NPM 组件`，原因大致有以下几点:
  - 动态编译性能非常差: `node_modules` 里面文件繁多，需要所有文件都去判断是否需要进行编译处理，效率非常低；
  - 排查问题困难: 动态转换会变成黑箱，使用方无法直接感知到转换过程中所做的处理；
  - 无法直接给原生小程序复用: 组件在满足一定条件下，是可以同时给非 MorJS 的小程序工程使用的，如果采用动态编译就有且只能给 MorJS 工程使用
  - 降低了组件提供方的自测责任: 在 `NPM 组件` 输出时直接提供了编译后产物，能够要求 `NPM 组件` 做好对应测试，而不是依赖于 MorJS 动态编译来确保可用性
  - ...

### 目录字段配置

MorJS 是通过 `package.json` 中指定的入口字段来做多端逻辑区分的，详细如下:

**重要: `main` 字段遵从 `NPM` 的 `package.json` 本身对于该字段的定义，参见 [文档](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main)。其他多端入口字段为目录配置字段。**

- `main`: 默认加载入口, 用于存放 `CommonJS` 产物
  - 未指定多端入口的情况下，所有端都会读取该入口
  - 部分多端的情况下，未明确以下方字段指定入口的端，均会读取该缺省入口
- `module`: 默认加载入口，用于存放 `ESModule` 产物, 作用和 `main` 类似
  - 仅当配置为 `ESNext` 的端默认情况下会优先使用 `module`
- `alipay`: 支付宝小程序加载入口
- `miniprogram`: 微信小程序加载入口，**该字段和微信/QQ/企业微信小程序官方一致**
- `wechat`: 微信小程序加载入口
  - 优先级比 `miniprogram` 高
- `qq`: QQ 小程序加载入口
  - 优先级比 `miniprogram` 高
- `bytedance`: 字节跳动小程序加载入口
- `baidu`: 百度小程序加载入口
- `eleme`: 饿了么小程序加载入口
- `dingding`: 钉钉小程序加载入口
- `taobao`: 淘宝小程序加载入口
- `kuaishou`: 快手小程序加载入口
- `miniforweb`: Web 应用专用小程序产物加载入口

请注意，以上的入口字段规范是要求 `NPM 组件` 支持哪个端就 **必须设置好对应的字段**。

### 多端适配输出目录结构说明

这里主要是阐述输出目录，整体的 `NPM 组件` 说明，请参考下面的组件示例说明环节

#### `exmaple-component` 的 `package.json` 配置示例

```javascript
{
  "name": "exmaple-component",

  // 缺省目录设置，JS 入口文件为 lib/index.js，
  // 未指定端的小程序组件文件会从该目录下获取，
  // 如将该字段配置为 "lib/index.js", 则有可能会
  // 无法找到正确的组件文件
  "main": "lib",

  // 微信小程序的入口配置，请注意，只需要配置目录名即可
  "miniprogram": "miniprogram_dist",

  // 支付宝小程序的入口配置，请注意，只需要配置目录名即可
  "alipay": "alipay",

  // 建议配置只输出组件内容目录
  "files": [
    "lib",
    "miniprogram_dist",
    "alipay"
  ]
}
```

#### `exmaple-component` 的整体输出目录结构示例

```bash
- lib
  - index.js
  - index.axml
  - index.acss
  - index.json
- miniprogram_dist
  - lib
    - index.js
    - index.wxml
    - index.wxss
    - index.json
- alipay
  - lib
    - index.js
    - index.wxml
    - index.wxss
    - index.json
- package.json
```

**请注意: miniprogram_dist 和 alipay 目录下是有 lib 目录的！**

#### 使用方引用 `NPM 组件` 示例

```javascript
{
  "usingComponents": {
    "demo-component": "exmaple-component/lib/index"
  }
}
```

#### MorJS 编译说明

默认情况下，使用方引用组件 `exmaple-component` 去掉多端专属的那个目录就可以了。在不同端下 MorJS 会根据组件的 `package.json` 中的相关入口字段，如 `miniprogram` 字段来自动匹配加上对应的路径，来确保使用方只需一个引用路径，即可在多个端上生效。

## 组件完整示例

为了解决组件本地预览的问题，建议组件本身也是一个小程序项目。只是在输出的时候采用指定目录输出的形式。

请注意: 组件的运行时必须是用 `aApp` 或 `wPage` 替代 `App`，`aPage` 或 `wPage` 替代 `Page`，`aComponent` 或 `wComponent` 替代 `Component`。

### 组件源代码

这里以项目根目录的 `component` 为源代码目录:

```bash
- component
  - index.js
  - index.less
  - index.axml
  - index.json
```

### 小程序目录规范完善项目

- example 目录: 小程序页面，用于直接引用组件，本地预览用
- app: 小程序入口
- mor.config.ts: MorJS 小程序配置文件
- mini.project.json: 支付宝小程序项目配置文件
- project.config.json: 微信小程序项目配置文件
- project.tt.json: 字节小程序项目配置文件
  - 也可以直接使用 project.config.json 文件
- project.qq.json: QQ 小程序项目配置文件
  - 也可以直接使用 project.config.json 文件
- project.swan.json: 百度小程序项目配置文件
- project.eleme.json: 饿了么小程序项目配置文件
  - 也可以直接使用 mini.project.json 文件
- project.taobao.json: 淘宝小程序项目配置文件
- project.kuaishou.json: 淘宝小程序项目配置文件
  - 也可以直接使用 mini.project.json 文件
- project.dd.json: 钉钉小程序项目配置文件
  - 也可以直接使用 mini.project.json 文件
- package.json: NPM 依赖配置文件

```bash
- example
  - index.js
  - index.wxss
  - index.wxml
  - index.json
- app.js
- app.json
- package.json
- mini.project.json
- project.config.json
- project.tt.json
- project.qq.json
- project.swan.json
- project.dd.json
- mor.config.ts
```

`example/index.json` 示例:

- 引用组件

```javascript
{
  "defaultTitle": "组件测试页",
  "usingComponents": {
    "demo-component": "../component/index"
  }
}

```

`example/index.wxml` 示例:

```html
<view class="example-page">
  <demo-component />
</view>
```

`app.json` 示例:

- 增加页面入口

```json
{
  "pages": ["example/index"]
}
```

`mor.config.ts` 内容示例:

- IDE 预览配置

```javascript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'ali',
    sourceType: 'alipay',
    target: 'alipay',
    compileMode: 'bundle'
  },
  {
    name: 'wechat',
    sourceType: 'alipay',
    target: 'wechat',
    compileMode: 'bundle'
  }
])
```

`package.json` 内容示例:

- 增加 scripts 配置

```javascript
{
  "scripts": {
    "compile": "mor compile",
    "dev": "mor compile --watch"
  }
}
```

`project.config.json` 内容示例:

```json
{
  "miniprogramRoot": "dist/wechat"
}
```

`mini.project.json` 内容示例:

```json
{
  "miniprogramRoot": "dist/alipay"
}
```

项目运行:

`npm run dev` 然后微信小程序 IDE、支付宝小程序 IDE 等打开项目根目录即可。

### 构建处理

MorJS 支持配置文件指定，因此在组件输出的时候，我们可以利用 MorJS 的 `compile` 能力来直接输出支持多端的构建产物。
这里以组件输出`lib`目录为示例。

项目根目录下新增 `mor.build.config.ts` 文件，用于组件编译输出

```javascript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'alipay',
    sourceType: 'alipay',
    target: 'alipay',
    compileMode: 'default',
    srcPath: './component',
    outputPath: './alipay'
  },
  {
    name: 'wechat',
    sourceType: 'alipay',
    target: 'wechat',
    compileMode: 'default',
    srcPath: './component',
    outputPath: './miniprogram_dist'
  }
])
```

pacakge.json 内容示例:

- 增加相关 `scripts`

```javascript
{
  "miniprogram": "miniprogram_dist",
  "alipay": "alipay",
  "files": [
    "miniprogram_dist",
    "alipay"
  ],
  "scripts": {
    "clean": "rm -rf alipay miniprogram_dist", // 清空构建产物目录
    "build": "npm run clean && mor compile --production --config mor.build.config.ts", // 构建产物
    "prepublishOnly": "npm run build", // 发布前进行一次构建，确保发布的代码是最新版本
    "compile": "mor compile", // 用于本地预览
    "dev": "mor compile --watch" // 用于本地预览
  }
}
```

后续通过 `npm publish` 发布即可
