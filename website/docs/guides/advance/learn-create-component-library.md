# 五分钟教会你如何让小程序组件库支持多端

## 背景

上文 [《MorJS 使用社区组件库指南》](https://mor.eleme.io/guides/advance/use-community-component) 我们提到了 MorJS 能够支持在业务转端的同时，将业务所引用的社区组件库一同转端，而针对很多定制属性较强的项目，大多会自行维护一套组件库提供给多个项目使用，本文教会你如何让你的小程序组件库支持多端，与上文的区别在于：

- 上文是将社区组件库作为源码的一部分，通过 MorJS 编译业务代码的同时，将 node_modules 中的组件也作为源码编译的一部分，生成能够在不同端运行的产物；
- 本文是将小程序组件库单独编译，生成能够分别在不同端引入使用的组件进行发包，支持不同项目自行引用 npm 包，组件库与业务、框架解耦；

## 已有组件库快速上手

组件库转端需要使用 MorJS 提供的一码多端能力，总体流程为：

项目接入 MorJS => 添加多端编译配置 => 配置脚本 => 编译构建生成产物 => 发包

### 接入 MorJS

在组件库项目中添加必要的依赖：

```shell
$ npm i @morjs/cli -D && npm i @morjs/core --save
```

### 添加配置文件

在项目根目录下增加文件 mor.config.ts，修改需要编译的配置

```typescript
import { defineConfig, UserConfig } from '@morjs/cli'

// 公共配置
const CommonConfig: UserConfig = {
  sourceType: 'wechat', // 源码类型: 微信 DSL
  srcPath: './src/components', // 源码目录，指定组件库源代码所在的目录
  compileMode: 'default', // 编译模式，由于组件库不是完整项目，需使用转换模式编译
  autoInjectRuntime: {
    // 运行时自动注入配置
    api: 'minimal' // API 运行时抹平注入，使用最小替换将仅替换函数调用
  },
  compilerOptions: {
    // ts 编译配置
    esModuleInterop: false, // 开启 ES 模块互操作性，针对 ES Module 提供 Commonjs 兼容
    declaration: true, // 生成 (.d.ts) 文件
    target: 'ES5', // 输出的 ES 版本
    module: 'CommonJS' // 模块输出类型
  }
}

export default defineConfig([
  // 第一套配置: 微信 DSL 编译
  {
    ...CommonConfig,
    name: 'wx',
    target: 'wechat', // 编译目标: 微信
    outputPath: './miniprogram_dist/lib' // 输出产物目录
  },
  // 第二套配置: 微信转支付宝
  {
    ...CommonConfig,
    name: 'ali',
    target: 'alipay', // 编译目标: 支付宝
    outputPath: './alipay/lib' // 输出产物目录
  },
  // 第三套配置: 微信转抖音
  {
    ...CommonConfig,
    name: 'dy',
    target: 'bytedance', // 编译目标: 抖音
    outputPath: './bytedance/lib' // 输出产物目录
  },
  // 第四套配置: 微信转 Web
  {
    ...CommonConfig,
    name: 'web',
    target: 'web', // 编译目标: Web
    outputPath: './lib' // 输出产物目录
  }
])
```

### 编译调试

在项目目录终端下执行编译命令启动项目，即可构建生成对应的多端产物，分别用对应平台的 IDE 打开即可开发预览。

你也可以针对不同端，在 package.json 中添加单端的编译命令和相关配置，在终端执行对应的编译命令生成单端的编译产物进行开发调试。

相关文档可参考：[《MorJS 基础用法 - 命令行》](https://mor.eleme.io/guides/basic/cli)

```json
{
  "name": "my-component",
  "version": "1.0.0",
  "scripts": {
    "build": "mor compile --production", // 开启生产环境构建所有端
    "dev:wx": "mor compile --name wx", // 编译构建配置名为 wx 的产物
    "dev:ali": "mor compile --name ali --production", // 编译构建配置名为 ali 的产物
    "dev:dy": "mor compile --name dy --production" // 编译构建配置名为 dy 的产物
  }
}
```

### 构建发包

在项目目录终端执行打包构建命令编译项目，生成对应的多端产物，产物目录取决与配置文件各端的 outputPath 配置，该目录需要和 package.json 中多端适配输出目录一致。

相关文档可参考：[《MorJS - 多端组件库规范》](https://mor.eleme.io/specifications/component)

```json
{
  "name": "my-component",
  "version": "1.0.0",
  // 缺省目录设置，未指定端的小程序组件文件会从该目录下获取，
  "main": "lib",
  // 微信小程序的入口配置
  "miniprogram": "miniprogram_dist",
  // 支付宝小程序的入口配置
  "alipay": "alipay",
  // 字节小程序的入口配置
  "bytedance": "bytedance",
  // 建议配置只输出组件内容目录
  "files": ["lib", "miniprogram_dist", "alipay", "bytedance"]
}
```

修改 package.json 的包名 name 和版本号 version，运行 `npm publish` 进行发包。

## 开始一个新组件库项目

如果你还没有开始写组件库，想要重新开始一个新的多端组件库项目，欢迎你使用官方脚手架工具来创建新项目：

1. 选定项目目录，并在目录终端执行以下任一命令：

```shell
$ npm init mor # npm 创建项目
$ yarn create mor # yarn 创建项目
$ pnpm create mor # pnpm 创建项目
```

2. 选择工程类型 MorJS 多端组件库，按照提示完成初始化操作

```shell
✔ 请选择工程类型 › MorJS 多端组件库
✔ 请选择源码类型 › 微信小程序 DSL
✔ 请输入 小程序 的名称 … my-components
✔ 请输入 小程序 的描述 … my first components
✔ 用户名 … yourUserName
✔ 邮箱 … your@gmail.com
✔ 请输入 Git 仓库地址 … https://github.com/yourUserName/myapp
✔ 请选择 npm 客户端 › npm / pnpm / yarn
…
```

3. 编译与调试，在终端运行 `tnpm run dev`，将生成的产物用各端对应的 IDE 打开进行预览调试

4. 构建与发包，在终端运行 `tnpm run build`，生成对应各端的小程序产物，修改 package.json 的包名 name 和版本号 version，运行 `npm publish` 进行发包

## Q&A

- Q: 转端过程中，发现小程序的 JSAPI 转端后不兼容怎么办？
- A: 修改 mor.config.ts 中的 autoInjectRuntime.api 配置，默认 minimal 时只做最小替换，设置为 true 或 enhanced 时，MorJS 会接管 JSAPI 调用并提供接口兼容支持

---

- Q: 个别情况下，组件转端表现不一致该怎么办？
- A: 各个小程序平台的兼容性问题，超出多端编译覆盖范围的，需要自行处理，可考虑使用条件编译进行分端兼容

---

- Q: 组件库中使用的字体资源文件会被一同编译吗？
- A: 会，Mor 编译时，针对业务的静态资源会全部拷过去，不依赖构建关系
