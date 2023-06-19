# MorJS 使用社区组件库指南

## 背景

距离 MorJS 开源已经有一段时间了，随着使用人数的上升，较多开发者将现有小程序项目接入 MorJS 框架都会提出一个疑问，项目中除了开发同学写的原生业务代码外，很多项目还用到了第三方的组件库，这些社区组件库能够被一同转成其他小程序端么？

答案是：可以，只要是（微信/支付宝）小程序原生开发的组件，理论上是可以一并转换的，使用方式上，需按照对应平台 npm 组件的规范 来使用，本次我们将分别对使用到社群中提及频率较高的 [Vant Weapp](https://github.com/youzan/vant-weapp)、[TDesign](https://github.com/Tencent/tdesign-miniprogram)、[Wux Weapp](https://github.com/wux-weapp/wux-weapp/) 的项目进行转端（如果你的项目选用的是其他组件库，也可以参考以下流程）

## 一. 项目接入 MorJS

使用 MorJS 提供的一码多端能力，自然需要用到 MorJS 本身，我们针对不同业务场景，提供了两种接入方式：

- 新项目使用 create-mor 创建项目，文档参考：[《MorJS - 快速上手》](https://mor.eleme.io/guides/introduction/getting-started)
- 已有项目添加必要依赖进行接入，文档参考：[《MorJS - 原生小程序接入》](https://mor.eleme.io/guides/migrate-from-original-miniprogram-to-mor)

完成以上接入后，可在项目目录终端下执行编译命令启动项目 npm run dev，多端产物已构建在 dist 目录下，分别用对应平台的 IDE 打开即可开发预览。

```
.
├── dist          // 产物目录，可在 mor.config.* 中通过 outputPath 配置进行修改
│   ├── alipay    // 支付宝端产物，可在用支付宝 IDE 进行预览调试
│   ├── wechat    // 微信端产物，可在用微信 IDE 进行预览调试
│   └── web       // 转 web 产物，可在浏览器中进行预览调试
├── node_modules  // 安装 node 后用来存放用包管理工具下载安装的包的文件夹
├── src           // 源码目录，可在 mor.config.* 中通过 srcPath 配置进行修改
├── mor.config.ts // MorJS 配置文件，用于提供多套编译配置
└── package.json  // 项目的基础配置文件
```

## 二. 项目接入社区组件库

根据对应的社区组件库文档进行接入，如果你的项目选用的是其他组件库，也可以参考以下流程进行接入。

请注意，项目所使用的组件库和项目的小程序 DSL 需要为同一套源码，例如选择使用微信 DSL 写的项目，引入的组件库需要是 for 微信小程序的组件库，支付宝 DSL 亦然。

### 接入 [Vant Weapp](https://github.com/youzan/vant-weapp) 流程

1. 安装：通过 npm 安装组件库 `npm i @vant/weapp -S --production`
2. 配置：MorJS 工程默认配置下，可直接跳过这步

- app.json 配置：小程序新版组件库与 [Vant Weapp](https://github.com/youzan/vant-weapp) 可能存在一定样式冲突问题，请根据业务需求及项目表现，自行决定是否需要去除新版基础组件样式，如需去除删除 app.json 文件的 `"style": "v2"` 配置项即可
- project.config.json 配置：MorJS 默认的 bundle 模式无需修改此项配置
- 构建 npm 包：MorJS 默认的 bundle 模式无需构建此项
- typescript 支持：MorJS 本身支持 typescript，无需配置此项

3. 使用：在对应的 json 文件中配置所用组件对应的路径，在 xml 中直接使用组件即可

> 配置组件路径有两种方式：可以按照 组件库规范 来引用组件，或按照实际路径引用组件

```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index", // 按照规范引用 button 组件
    "van-popup": "@vant/weapp/lib/popup/index" // 按照实际路径引用 popup 组件
  }
}
```

### 接入 [TDesign](https://github.com/Tencent/tdesign-miniprogram) 流程

1. 安装：通过 npm 安装组件库 `npm i tdesign-miniprogram -S --production`
2. 配置：MorJS 工程默认配置下，可直接跳过这步

- app.json 配置：小程序新版组件库与 [TDesign](https://github.com/Tencent/tdesign-miniprogram) 可能存在一定样式冲突问题，请根据业务需求及项目表现，自行决定是否需要去除新版基础组件样式，如需去除删除 app.json 文件的 `"style": "v2"` 配置项即可
- 构建 npm 包：MorJS 默认的 bundle 模式无需构建此项
- typescript 支持：MorJS 本身支持 typescript，无需配置此项

3. 使用：在对应的 json 文件中配置所用组件对应的路径，在 xml 中直接使用组件即可

> 配置组件路径有两种方式：可以按照 组件库规范 来引用组件，或按照实际路径引用组件

```json
{
  "usingComponents": {
    "van-button": "tdesign-miniprogram/button/button", // 按照规范引用 button 组件
    "van-popup": "tdesign-miniprogram/miniprogram_dist/popup/popup" // 按照实际路径引用 popup 组件
  }
}
```

### 接入 [Wux Weapp](https://github.com/wux-weapp/wux-weapp/) 流程

1. 安装：通过 npm 安装组件库 `npm i wux-weapp -S --production`
2. 配置：MorJS 工程默认配置下，无需进行 npm 构建或单独拷贝组件产物
3. 使用：在对应的 json 文件中配置所用组件对应的路径，在 xml 中直接使用组件即可

> 配置组件路径有两种方式：可以按照 组件库规范 来引用组件，或按照实际路径引用组件

```json
{
  "usingComponents": {
    "van-button": "wux-weapp/button/index", // 按照规范引用 button 组件
    "van-popup": "wux-weapp/packages/lib/popup/index" // 按照实际路径引用 popup 组件
  }
}
```

## 三. 添加组件库转端配置

接入社区组件库后，执行编译命令 npm run dev 启动项目会发现，仅本端的编译是正常执行的，转为其他端的编译会报类似 Can't resolve 'xxx' in 'xxx' 的错误，这是因为 MorJS 默认是不会在编译环节动态编译处理 node_modules 的 NPM 组件的，所以导致引入使用的组件无法载入，需要通过添加 mor.config.ts 中的 processNodeModules 配置，让编译环节处理 node_modules 中的组件

相关文档可参考：[《MorJS 基础用法 - 配置 processNodeModules》](https://mor.eleme.io/guides/basic/config/#processnodemodules---%E6%98%AF%E5%90%A6%E5%A4%84%E7%90%86-node_modules)

```typescript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'ali',
    sourceType: 'wechat', // 源码类型: 微信 DSL
    target: 'alipay', // 编译目标: 支付宝小程序
    processNodeModules: {
      include: [
        /@vant\/weapp/, // 添加处理 @vant/weapp 组件
        /tdesign\-miniprogram/, // 添加处理 tdesign-miniprogram 组件
        /wux\-weapp/ // 添加处理符合 wux-weapp 组件
      ]
    }
  }
])
```

> 之所以 MorJS 编译默认不处理 node_modules 的 NPM 组件，原因大致有以下几点：

- 动态编译性能差：node_modules 里面文件繁多，需要所有文件都去判断是否需要进行编译处理，效率较低，会一定程度上影响编译效率；
- 排查问题困难：动态转换会变成黑箱，使用方无法直接感知到转换过程中所做的处理；
- 无法直接给原生小程序复用：组件在满足一定条件下，是可以同时给非 MorJS 的小程序工程使用的，如果采用动态编译就能且只能给 MorJS 工程使用；
- 降低了组件提供方的自测责任：在 NPM 组件 输出时直接提供了编译后产物，能够要求 NPM 组件 做好对应测试，而不是依赖于 MorJS 动态编译来确保可用性；
- …

## 四. 编译调试

在项目目录终端下执行编译命令启动项目，即可构建生成对应的多端产物，默认是放在项目 dist 目录下，分别用对应平台的 IDE 打开即可开发预览。

你也可以针对不同端，在 package.json 中添加单端的编译命令和相关配置，在终端执行对应的编译命令生成单端的编译产物进行开发调试。

相关文档可参考：[《MorJS 基础用法 - 命令行》](https://mor.eleme.io/guides/basic/cli)

```json
{
  "scripts": {
    "dev": "mor compile -w", // 编译构建所有端并开启文件变更监听
    "dev:ali": "mor compile --name ali", // 编译构建配置名为 ali 的产物
    "dev:wx": "mor compile --name wx", // 编译构建配置名为 wx 的产物
    "dev:dy": "mor compile --name dy", // 编译构建配置名为 dy 的产物
    "build": "mor compile --production" // 开启生产环境构建所有端
  }
}
```

## Q&A

- Q: 为什么 MorJS 接入组件库不需要执行 IDE 构建 npm 包？
- A: 默认的 bundle 打包模式下，MorJS 会生成闭包并基于规则合并 js 文件，同时将小程序多端组件自动提取到产物对应的 npm_components 目录，但如果 compileMode 配置的是 transform 模式，会因为该编译模式下并不处理 node_modules 和多端组件，所以得走常规的微信构建 npm

---

- Q: 为什么我按照规范(xxx/button/index)引用组件转其他端会报 Can't resolve 'xxx' in 'xxx' 的错误？
- A: MorJS 是通过目录结构结合 package.json 的 [目录指向字段配置](https://mor.eleme.io/specifications/component#%E7%9B%AE%E5%BD%95%E5%AD%97%E6%AE%B5%E9%85%8D%E7%BD%AE) 来实现的，若转端读取的字段入口对应目录下没有组件产物，编译引入组件时将报上述错误，可以把使用路径改为组件实际路径，或联系组件开发者补充 main 入口字段

---

- Q: 社区组件库中使用的字体资源文件会被一同编译吗？
- A: 不会，针对 node_modules 中的非预期文件类型不会进行处理，请把资源文件改为引用 cdn 资源
