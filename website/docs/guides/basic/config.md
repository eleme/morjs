# 配置

为方便查找，以下配置项通过字母排序。

## 配置说明

### 配置文件

MorJS 支持 6 种类型的配置文件：

- `mor.config.ts`
- `mor.config.js`
- `mor.config.mjs`
- `mor.config.json`
- `mor.config.jsonc`
- `mor.config.json5`

会按照上方列出的文件的顺序依次查找，并自动读取找到的第一个配置文件。

### 多配置支持

MorJS 默认提供多配置支持，也就是可以在一个配置文件中设置多套编译配置，如：

```typescript
import { defineConfig } from '@morjs/cli'

// defineConfig 的作用仅仅是用于配置的类型提示, 无其他作用
// 直接使用 export default [] 也是一样的
// 数组中的每一套配置都是独立
export default defineConfig([
  // 第一套配置
  {
    name: 'alipay',
    sourceType: 'alipay',
    target: 'alipay'
  },

  // 第二套配置
  {
    name: 'wechat',
    sourceType: 'alipay',
    target: 'wechat'
  },

  // 第三套配置
  {
    name: 'bytedance',
    sourceType: 'alipay',
    target: 'bytedance',
    alias: {}
  }
])
```

不同配置内容以 `name` 属性作为区分。

通过命令行执行任意子命令 (如 `compile`) 时可以通过指定 `--name` 选项来筛选具体需要执行哪套配置，如：

```bash
# 以下命令将仅会执行 mor.config.ts 文件中 name 为 alipay 的配置
mor compile --name alipay

# 以下命令将会依次执行 mor.config.ts 文件中 name 为 alipay 的配置，然后执行 name 为 wechat 的配置
# 两种写法等价
mor compile --name alipay,wechat
mor compile --name alipay --name wechat

# 不指定 --name 时, MorJS 将会依次执行 mor.config.ts 文件中的所有配置
mor compile
```

## 编译相关配置

### alias - 别名配置

- Type: `object`
- Default: `{}`

配置别名，对 `import` 或 `require` 或 `usingComponents` 中引用的文件做别名映射，用以简化路径或引用替换。

比如：

```javascript
{
  alias: {
    foo: '/tmp/to/foo',
  }
}
```

然后代码里 `import 'foo'` 实际上会 `import '/tmp/to/foo'`。

再比如：

```javascript
{
  alias: {
    Utilities: path.resolve(__dirname, 'src/utilities/'),
    Templates: path.resolve(__dirname, 'src/templates/'),
  }
}
```

那么，原先在代码里面基于相对路径引用的文件

```javascript
import Utility from '../../utilities/utility'
```

就可以简化为

```javascript
import Utility from 'Utilities/utility'
```

一些使用上的小窍门：

1、`alias` 的值最好使用绝对路径，尤其是指向依赖时，记得加 `require.resolve`，比如：

```javascript
// 不推荐 ⛔
{
  alias: {
    foo: 'foo',
  }
}

// 推荐 ✅
{
  alias: {
    foo: require.resolve('foo'),
  }
}
```

2、如果不需要子路径也被映射，记得加 $ 后缀，比如：

```javascript
// import 'foo/bar' 会被映射到 import '/tmp/to/foo/bar'
{
  alias: {
    foo: '/tmp/to/foo',
  }
}

// import 'foo/bar' 还是 import 'foo/bar'，不会被修改
{
  alias: {
    foo$: '/tmp/to/foo',
  }
}
```

### analyzer - 包大小分析

- Type: `object`
- Default: `{}`

包模块结构分析工具，可以看到项目各模块的大小，按需优化。通过 `mor compile --analyze` 或 `mor analyze` 开启，默认 server 端口号为 `8888`，更多配置如下：

```js
{
  // 配置具体含义见：https://github.com/webpack-contrib/webpack-bundle-analyzer
  analyzer: {
    analyzerMode: 'server',
    // 分析工具端口号
    analyzerPort: 8888,
    // 是否自动打开浏览器
    openAnalyzer: true,
    // 是否生成 stats 文件
    generateStatsFile: false,
    // stats 文件名称
    statsFilename: 'stats.json',
    // 日志级别
    logLevel: 'info',
    // 显示文件大小的类型, 默认为 `parsed`
    defaultSizes: 'parsed', // stat  // gzip
  }
}
```

### autoClean - 自动清理

- 类型: `boolean`
- 默认值: `false`

是否自动清理产物目录（`outputPath` 所指向的目录）。

自动清理仅会清理产物目录，可放心使用。

**注意：** 开启集成模式时，使用 `autoClean` 会自动标记 `--from-state` 为 `2` 用于避免集成模块产物被清理后，不会自动拷贝到产物目录的问题，相关概念可参考：[《复杂小程序集成》](/guides/advance/complex-miniprogram-integration.md)

### autoInjectRuntime - 运行时自动注入

- 类型: `object` 或 `boolean`
- 默认值: `true`

是否自动注入 MorJS 多端转换运行时。

```javascript
/* 配置示例 */

// 关闭所有运行时注入
{
  autoInjectRuntime: false
}

// 开启所有运行时注入
{
  autoInjectRuntime: true
}

// 开启或关闭部分运行时注入，详细配置
{
  autoInjectRuntime: {
    // App 运行时注入, 编译时替换 App({}) 为 MorJS 的运行时
    app: true,
    // Page 运行时注入, 编译时替换 Page({}) 为 MorJS 的运行时
    page: true,
    // Component 运行时注入, 编译时替换 Component({}) 为 MorJS 的运行时
    component: true,
    // Behavior 运行时注入, 编译时替换 Behavior({}) 为 MorJS 的运行时
    behavior: true,
    // API 运行时抹平注入, 指定为 true 时默认为 `enhanced`, 可选值:
    //   enhanced: 增强方式: MorJS 接管 API 调用并提供接口兼容支持
    //   lite: 轻量级的方式: wx => my, 替换所有全局接口对象
    //   minimal: 最小替换, 如 wx.abc() => my.abc(), 仅替换函数调用
    api: true
  }
}
```

### cache - 缓存开关

- 类型: `boolean`
- 默认值: 非生产环境下默认开启 `true`

是否开启编译缓存。

开启缓存后，假如某些情况下出现：文件进行了修改，但未正确触发更新的问题，可通过执行

```bash
npx mor clean cache
```

命令来清理缓存，有关 `clean` 命令的支持，参见：[清理命令——clean](/guides/basic/cli#清理命令--clean)

### compileMode - 编译模式

- 类型: `string`
- 默认值: `bundle`
- 可选值:
  - `bundle`: 打包模式, 会生成闭包以及基于规则合并 `js` 文件，并会将小程序多端组件提取到 `npm_components` 目录中
  - `transform`: 转换模式, 不生成闭包, 仅针对源码进行编译转换, 不处理 `node_modules` 和多端组件，部分注入能力失效

编译模式, 用于配置当前项目的编译模式。

**注意: 原 `default` 和 `transfer` 模式已合并为 `transform` 模式**

### compilerOptions - 编译配置

- 类型: `object`
- 默认值: {}

ts 编译配置, 大部分和 tsconfig 中的含义一致, 优先级高于 tsconfig.json 中的设定。

```javascript
// 仅支持以下配置项
{
  compilerOptions: {
    // 是否允许合成默认导入
    allowSyntheticDefaultImports: false,

    // 用于自动矫正 commonjs 和 esm 混用的情况
    // 仅当 module 不是 commonjs 且 importHelpers 开启时生效
    // 原因为: typescript 引入 importHelpers 的时候会根据 设定的 module 来决定
    // 是用 esm 还是 commonjs 语法
    // 可能会导致 esm 和 commonjs 混用而引起编译问题
    autoCorrectModuleKind: undefined,

    // 是否生成 declaration (.d.ts) 文件
    // 仅 compileMode 为 default 情况下支持
    declaration: false,

    // 是否开启 ES 模块互操作性
    // 针对 ES Module 提供 Commonjs 兼容
    esModuleInterop: false,

    // 是否引入 tslib
    // 需要依赖中包含 tslib: "^2.3.1"
    importHelpers: true,

    // 模块输出类型
    // 不同的小程序 target 会有不同的默认值
    //   wechat: CommonJS
    //   alipay: ESNext
    //   baidu: CommonJS
    //   bytedance: CommonJS
    //   dingding: ESNext
    //   qq: CommonJS
    //   eleme: ESNext
    //   taobao: ESNext
    //   web: ESNext
    module: '',

    // 输出的 ES 版本
    // 不同的小程序 target 会有不同的默认值
    //   wechat: ES5
    //   alipay: ES2015
    //   baidu: ES5
    //   bytedance: ES5
    //   dingding: ES2015
    //   qq: ES5
    //   eleme: ES2015
    //   taobao: ES2015
    //   web: ES2015
    target: ''
  }
}
```

### compileType - 编译类型

- 类型: `string`
- 默认值: `miniprogram`
- 可选值:
  - `miniprogram`: 以小程序的方式编译，入口配置文件为 `app.json`
  - `plugin`: 以插件的方式编译，入口配置文件为 `plugin.json`
  - `subpackage`: 以分包的方式编译，入口配置文件为 `subpackage.json`

编译类型，用于配置当前项目的产物形态，支持类型如下：

- `miniprogram`: 小程序形态，以 `app.json` 作为入口配置文件
- `plugin`: 小程序插件形态，以 `plugin.json` 作为入口配置文件
- `subpackage`: 小程序分包形态，以 `subpackage.json` 作为入口配置文件

同一个项目可通过不同的 `compileType` 配合不同的入口配置文件输出不同的产物形态，有关多形态相互转换的进一步解释，可参见文档：[小程序形态一体化](/guides/advance/unity-of-forms.md)。

参考配置示例：

```javascript
/* 配置示例 */

// 小程序 app.json 配置示例
// 详细配置可参见微信小程序或支付宝小程序 app.json 配置
{
  "pages": [
    "pages/todos/todos",
    "pages/add-todo/add-todo"
  ],
  // subpackages 或 subPackages 均可
  "subPackages": [
    {
      "root": "my",
      "pages": [
        "pages/profile/profile"
      ]
    }
  ]
}

// 小程序插件 plugin.json 配置示例
// 详细配置可参见微信小程序或支付宝小程序 plugin.json 配置
{
  "publicComponents": {
    "list": "components/list/list"
  },
  "publicPages": {
    "hello-page": "pages/index/index"
  },
  "pages": [
    "pages/index/index",
    "pages/another/index"
  ],
  // 插件导出的模块文件
  "main": "index.js"
}

// 小程序分包 subpackage.json 配置示例
// 配置方式同 app.json 中的 subpackages 的单个分包配置方式一致
{
  // type 字段为 MorJS 独有, 用于标识该分包为 "subpackage" 或 "main"
  // 区别是: 集成时 "subpackage" 类型的分包会被自动合并到 app.json 的 subpackages 字段中
  //              "main" 类型的分包会被自动合并到 app.json 的 pages 字段中 (即: 合并至主包)
  "type": "subpackage",
  // root 字段将影响集成时分包产物合并至宿主小程序时的根目录
  "root": "my",
  // 注意: 编译分包以 pages 作为实际路径进行解析
  "pages": [
    "pages/profile/profile"
  ]
}
```

默认情况下不同 `compileType` 对应的入口配置文件会直接从 `srcPath` 和 `srcPaths` 所指定的源码目录中直接载入。

如需要定制入口配置文件的路径可通过 [customEntries 配置](/guides/basic/config#customentries---自定义入口文件配置) 来自定义。

### conditionalCompile - 条件编译

- 类型: `{ context: Record<string, any>, fileExt: string | string[] }`
- 默认值: `{}`

条件编译配置。 详细参见: [代码纬度条件编译](/guides/conditional-compile/code-level.md) 和 [文件纬度条件编译](/guides/conditional-compile/file-level.md)

### copy - 文件拷贝

- 类型: `(string | { from: string, to: string })[]`
- 默认值: `[]`

设置要复制到输出目录的文件或文件夹，该配置受 [`ignore` 配置](/guides/basic/config#ignore---忽略配置) 影响

默认情况下，MorJS 会自动拷贝如下后缀的文件：

```bash
# 以下资源文件会在编译过程中自动拷贝
.jpg
.jpeg
.png
.svg
.bmp
.ico
.gif
.webp
.otf
.ttf
.woff
.woff2
.eot
.cer
.ogg
.aac
.mp4
.wav
.mp3
.m4a
.silk
.wasm
.br
.cert
```

当配置为字符串时，默认拷贝到产物目录，如：

```javascript
{
  copy: ['foo.json', 'src/bar.json']
}
```

会产生如下产物的目录结构：

```bash
+ dist
  - bar.json
  - foo.json
+ src
  - bar.json
- foo.json
```

当通过对象配置具体的拷贝位置，其中 `from` 相对路径的起点为项目根目录，目标 `to` 相对路径的起点为 [`outputPath`](/guides/basic/config#outputpath) 配置所指向的目录：

```javascript
{
  copy: [
    { from: 'from', to: 'somewhere/insideOutputPath' },
    { from: 'anotherFile.json', to: './' }
  ]
}
```

这种情况下将产生如下产物目录结构：

```bash
+ dist
  + somewhere
    + insideOutputPath
      - onefile.json
  - anotherFile.json
+ from
  - onefile.json
- anotherFile.json
```

### cssMinimizer - CSS 压缩器

- 类型: `string`
- 默认值: `esbuild`
- 可选值:
  - `cssnano`
  - `csso`
  - `cleanCss`
  - `esbuild`
  - `parcelcss`
  - `true` 或 `false`

开关或指定 css 代码压缩器。

### cssMinimizerOptions - CSS 压缩选项

- 类型: `object`
- 默认值: `{}`

css 压缩器自定义配置, 使用时请结合 `cssMinimizer` 所指定的压缩器来配置, 不同的压缩器对应的配置方式不同。

### customEntries - 自定义入口文件配置

- 类型: `object`
- 默认值: `{}`

用于配置自定义入口文件，包含三种用途：

- 可用于指定入口配置文件的自定义文件路径，如 `app.json` / `plugin.json` / `subpackage.json`，参见 [compileType 配置](/guides/basic/config#compiletype---编译类型)
- 可用于指定一些在 `bundle` 模式下额外需要参与编译且需要定制输出名称的文件，如对外输出某个 `js` 文件
- `bundle` 模式下，无引用关系，但需要额外需要编译的 页面（`pages`） 或 组件（`components`）

**_注意：该配置的文件路径，是相对于当前配置文件的路径，若配置文件不存在，则相对于当前工作区。_**

用法举例：

```javascript
// 用途一: 通过配置 `app.json` / `plugin.json` / `subpackage.json` 来指定入口配置文件
{
  customEntries: {
    // 手动指定 app.json 文件路径
    'app.json': './src/my-custom-app.json',
    // 手动指定 plugin.json 文件路径
    'plugin.json': './src/my-custom-plugin.json',
    // 手动指定 subpackage.json 文件路径
    'subpackage.json': './src/my-custom-subpackage.json',
  }
}

// 用途二：编译并对外输出某个类型的文件，其中脚本文件（如 .js/.ts/.mjs/.cjs 等）将按照 commonjs 的方式对外 export
{
  customEntries: {
    // 该文件将会被输出到 [outputPath]/index.js 并通过 commonjs 的方式对外 export
    'index.js': './src/index.js',

    // 该文件将被编译并输出到 [outputPath]/foo.sjs
    'foo.sjs': './src/some-inner-dir/foo.sjs'
  }
}

// 用途三：bundle 模式下，无引用关系，但需要额外需要编译的 页面（pages） 或 组件（components）
{
  customEntries: {
    // 额外需要编译的页面
    pages: [
      './src/any-custom-page/index'
    ],
    // 额外需要编译的组件
    components: [
      './src/any-custom-component/index'
    ]
  }
}
```

### define - 变量替换

- 类型: `object`
- 默认值: `{}`

允许在`编译时`将你代码中的变量替换为其他值或表达式。注意：属性值会经过一次 `JSON.stringify` 转换。

比如，

```javascript
{
  define: {
    FOO: 'bar'
  }
}
```

然后代码里的 `console.log(hello, FOO)` 会被编译成 `console.log(hello, 'bar')`。

### devtool - SourceMap 配置

- 类型: `string` 或 `boolean`
- 默认值: 开发环境下默认为 `cheap-module-source-map`, 生产环境下默认为 `false`

用户配置 sourcemap 类型。

常见的可选类型有：

- eval, 最快的类型，但不支持低版本浏览器和小程序运行环境
- source-map, 最慢最全的类型

更多类型详见 [webpack#devtool 配置](https://webpack.js.org/configuration/devtool/#devtool)。

当 `devtool` 指定为 `true` 时：

- 开发模式（`mode = development`）下会使用：`cheap-module-source-map`
- 生产模式（`mode = production`）下会使用：`nosources-source-map`

### experiments - 实验特性

- 类型: `object`
- 默认值: `{}`

试验特性, 包含:

- 自动裁剪辅助函数功能
- CSS 类型压缩功能

```javascript
/* 配置示例 */
{
  experiments: {
    // 开启自动裁剪辅助函数功能
    // 注意: 该功能需要项目依赖中包含 tslib 或 babel-helpers
    autoTrimRuntimeHelpers: true,

    // 开启 CSS 类型压缩功能
    // 详细配置如下，也可配置为 `true` 或 `false` 来开关该功能
    compressCssClassName: {
      // 压缩策略, 目前仅提供 `lite` 模式
      strategy: 'lite',
      // 压缩后 class 前缀，默认为 ''
      prefix: '',
      // 压缩后的 class 后缀，默认为 ''
      surfix: '',
      // 文件过滤的包含规则，默认为 []
      include: [],
      // 文件过滤排除规则，默认为 []
      exclude: [],
      // 一组不需要重命名的 class 名称，可以将不需要重命名的 class 放在这里
      except: [],
      // 用于生成随机类名的字母库, 默认见下方配置
      alphabet: '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      // 自定义属性名称, 用于指定一些自定义的 class 名称，比如 innerClass 等
      // 配置的自定义class属性会被当做 class 同样被处理
      customAttributeNames: [],
      // 类名过滤, 支持配置自定义函数, 返回 true 代表可以重命名，false 代表不可以重命名: (className: string, filePath: string) => boolean
      classNameFilter: undefined,
      // 处理完成回调, 可获取 类名映射
      // (classNameMappings: Map<string, string>) => void
      success: undefined
    }
  }
}
```

### externals - 外部依赖

- 类型: `string` 或 `object` 或 `function` 或 `RegExp` 或 `(string | object | function | RegExp)[]`
- 默认值: `undefined`

用于设置哪些模块可以不被打包。详细配置参见 [webpack#externals 配置](https://webpack.js.org/configuration/externals/)

```javascript
/* 配置示例 */
{
  externals: ['tslib']
}
```

### generateAppJSONScript - 生成 app.json 脚本文件

- 类型: `boolean`
- 默认值: `true`

是否生成用于代替 `app.json` 的 `JavaScript` 脚本文件（`mor.p.js`），通常用于项目中直接引用 `app.json` 文件，并期望主包和分包集成后，能够被及时更新的场景。

### globalObject - 全局对象

- 类型: `string`
- 默认值: 不同的 `target` 会有默认的全局对象, 通常情况下无需设置

指定输出路径。

各个 `target` 对应的默认 `globalObject` 分别为:

- `alipay`: `my`
- `baidu`: `swan`
- `bytedance`: `tt`
- `dingding`: `dd`
- `eleme`: `my`
- `kuaishou`: `ks`
- `qq`: `qq`
- `taobao`: `my`
- `web`: `window`
- `wechat`: `wx`

### ignore - 忽略配置

- 类型: `string[]`
- 默认值: 忽略配置，支持 `glob patterns`

配置文件或文件夹的忽略规则，主要使用场景为：

- 忽略特定文件或文件夹的拷贝，参见 [`copy` 配置](/guides/basic/config#copy---文件拷贝)
- 在 `compileMode` 为 `transform` 时忽略某些文件或文件夹的编译
- 在 `watch` 监听模式下，忽略特定文件或文件夹的监听，被忽略的文件发生变更时将不会触发重新编译

**注意：** 当 `compileMode` 为 `bundle` 时，由于所有需要编译的文件均是通过依赖分析获得，无法通过 `ignore` 来忽略，如果确实需要忽略某些文件或文件夹，建议是直接在源代码中移除引用来达到目的。

可以通过配置路径的方式来忽略特定文件或文件夹：

```javascript
{
  ignore: [
    path.posix.resolve(__dirname, './src/ignored-dir')
  ],
}
```

也可以通过 `glob patterns` 的方式来配置：

```javascript
{
  ignore: ['**/files/**/*.js', '**/node_modules']
}
```

当使用 `glob patterns` 配置 `ignore` 的时候，MorJS 会使用 [`glob-to-regexp`](https://github.com/fitzgen/glob-to-regexp) 将其转换为正则表达式，请确保你已了解其转换方式、限制和原理。

### jsMinimizer - JS 压缩器

- 类型: `string` 或 `boolean`
- 默认值: `null`
- 可选值:
  - `terser`
  - `esbuild`
  - `swc`
  - `true` 或 `false`

开关或指定 js 代码压缩器。

默认值为 `null` 时会基于 `compilerOptions.target` 的值来自动选择压缩器：

- 当 `compilerOptions.target` 的值是 `ES5` 时，`jsMinimizer` 为 `terser`
- 当 `compilerOptions.target` 的值不是 `ES5` 时，`jsMinimizer` 为 `esbuild`

如果用户配置了 `jsMinimizer` 则以用户配置的为准。

### jsMinimizerOptions - JS 压缩选项

- 类型: `object`
- 默认值: `{}`

js 压缩器自定义配置, 使用时请结合 `jsMinimizer` 所指定的压缩器来配置, 不同的压缩器对应的配置方式不同，参见：

- esbuild: <https://esbuild.github.io/api/#minify>
- terser: <https://github.com/terser/terser>
- swc: <https://swc.rs/docs/configuration/minification>

`jsMinimizerOptions` 的配置会和 MorJS 内部的配置进行合并，且 `jsMinimizerOptions` 的优先级更高。

### minimize - 压缩开关

- 类型: `boolean`
- 默认值: 生产环境下默认 为 `true`

是否开启代码压缩，开启后，将会压缩脚本、样式、模版等文件，也可通过配置单独开关某类文件的压缩或选择不同的压缩器，参见：

- [JS 压缩器](/guides/basic/config.md#jsminimizer---js-压缩器)
- [CSS 压缩器](/guides/basic/config.md#cssminimizer---css-压缩器)
- [XML 压缩器](/guides/basic/config.md#xmlminimizer---xml-压缩器)

### mock - Mock 配置

- 类型: `object`
- 默认值: `{}`

使用命令行选项 `--mock` 开启 `mock` 功能后，可通过 `mock` 修改 Mock 能力配置，详细配置及用法参见： [MorJS 基础 - Mock](/guides/basic/mock#mock-配置)。

### mockAppEntry - 模拟 app 入口

- 类型: `string`
- 默认值: `app`

主要用于在分包或插件编译类型时，指定不同的应用初始化文件名称（不含后缀名），需结合 `compileType` 使用：

- 默认情况下均为 `app`，即使用源码中的 `app.js` 或 `app.ts`
- `plugin` 编译类型下, 优先使用 `mor.plugin.app`
- `subpackage` 编译类型下, 优先使用 `mor.subpackage.app`

### mode - 模式

- 类型: `string`
- 默认值: `development`
- 可选值:
  - `production`: 生产模式
  - `development`: 开发模式
  - `none`: 不指定

构建模式，和 webpack 一致。

当指定了命令行选项 `--production` 时，`mode` 将自动设置为 `production`。

开启 `production` 生产模式后，会有如下默认行为：

- 自动开启压缩支持，参见 [minimize - 压缩开关](/guides/basic/config.md#minimize---压缩开关)
- 代码纬度条件编译的 `context` 将增加 `production: true` 配置，参见 [条件编译 - 代码纬度](/guides/conditional-compile/code-level.md)
- `devtool` 为 `true` 的状态下，自动配置为 `nosources-source-map` 类型，参见：[devtool - SourceMap 配置](/guides/basic/config.md#devtool---sourcemap-配置)
- 自动关闭 `mock` 功能，参见 [mock 配置](/guides/basic/config.md#mock---mock-配置)

### outputPath - 输出产物目录

- 类型: `string`
- 默认值: 不同的 `target` 会有默认的输出目录

指定输出路径。

各个 `target` 对应的默认 `outputPath` 分别为:

- `alipay`: `dist/alipay`
- `baidu`: `dist/baidu`
- `bytedance`: `dist/bytedance`
- `dingding`: `dist/dingding`
- `eleme`: `dist/eleme`
- `kuaishou`: `dist/kuaishou`
- `qq`: `dist/qq`
- `taobao`: `dist/taobao`
- `web`: `dist/web`
- `wechat`: `dist/wechat`

**注意：不允许设定为 `src`、`mock`、`.mor` 等约定式功能相关的目录。**

### phantomDependency - 幽灵依赖检测

- 类型: `object` 或 `boolean`
- 默认值: 开发模式 `true` | 生产模式 `false`

开启关闭或配置幽灵依赖检测功能，不配置时开发模式下默认为 `true` 开启检测 warn 警告，生产模式下默认为 `false` 关闭检测，配置值为 `object` 时支持 `mode` 和 `exclude` 两个属性:

- `mode`: 检测模式，可配置为 `'warn'` 和 `'error'` 两种，默认 `'warn'` 时仅进行警告，配置为 `'error'` 时会作为错误抛出
- `exclude`: `Array<string>` 指定哪些 npm 包不作为幽灵依赖从而跳过检测

```javascript
// 配置示例一：关闭检测（生产模式下默认）
{
  phantomDependency: false
}

// 配置示例二：开启检测 warn 警告，但是某些包不判断为幽灵依赖
{
  phantomDependency: {
    mode: 'warn',
    exclude: ['@morjs/utils']
  }
}

// 配置示例三：开启检测 error 警告，但是某些包不判断为幽灵依赖
{
  phantomDependency: {
    mode: 'error',
    exclude: ['@morjs/utils']
  }
}
```

> - 幽灵依赖: 当一个项目使用了一个没有在其 package.json 中声明的包时，就会出现"幽灵依赖"<br/>

- 出现原因: npm 3.x 开始「改进」了安装算法，使其扁平化，扁平化就是把深层的依赖往上提。好处是消除重复依赖，代价则是引入幽灵依赖问题，因为往上提的依赖你在项目中引用时就能跑<br/>
- 潜在危害:<br/>
  - 不兼容的版本，比如某依赖过了一年发布大版本，然后大版本被提升到 node_modules root 目录，你就会使用不兼容的版本<br/>
  - 依赖缺失，比如你的直接依赖小版本更新后不使用你之前依赖的间接依赖，再次安装时就不会出现这个依赖，或者比如多个直接依赖的间接依赖冲突时，可能也不会做提升

### plugins - 插件配置

- 类型: `Plugin[]`
- 默认值: `[]`

配置 `MorJS` 插件, 详细参见[如何开发 MorJS 插件](/guides/basic/plugin)。

```javascript
// 配置示例
{
  plugins: [
    [
      'your_custom_mor_plugin',
      {
        /* 插件选项 */
      }
    ],
    // 或
    'your_custom_mor_plugin',
    // 或
    { name: 'plugin_name', apply(runner) {} },
    // 或
    new YourCustomMorJSPlugin()
  ]
}

// 自定义插件
class YourCustomMorJSPlugin {
  name = 'YourCustomMorJSPlugin'
  apply(runner) {
    // plugin 逻辑
  }
}
```

### processNodeModules - 是否处理 node_modules

- 类型: `boolean | { include?: RegExp | RegExp[], exclude?: RegExp | RegExp[] }`
- 默认值: `undefined`

是否处理 node_modules 中的组件, 默认不处理。

```javascript
// 配置示例一: 处理全部 node_modules 模块
{
  // 全部处理
  processNodeModules: true
}

// 配置示例二: 仅处理符合规则的 node_modules
{
  processNodeModules: {
    // 只有 npm 名称包含 @abc/alsc- 的 npm 才会被处理
    include: [/@abc\/alsc\-/]
  }
}

// 配置示例三: 仅不处理特定规则的 node_modules
{
  processNodeModules: {
    // 只有 npm 名称不包含 @abc/alsc- 的 npm 才会被处理
    exclude: [/@abc\/alsc\-/]
  }
}

// 配置示例四: 同时配置 include 和 exclude
{
  processNodeModules: {
    // 只有 npm 名称不包含 @abc/alsc- 且 包含 @abc/ 的 npm 才会被处理
    // exclude 的优先级高于 include
    exclude: [/@abc\/alsc\-/]
    include: [/@abc\//]
  }
}
```

### processPlaceholderComponents - 是否处理占位组件

- 类型: `boolean`
- 默认值: `undefined`

用于配置是否需要编译页面或组件中配置的占位组件（`componentPlaceholder`）。

默认情况下：

- 当 `compileType` 为 `miniprogram` 或 `plugin` 时默认为 `true`，即处理占位组件
- 当 `compileType` 为 `subpackage` 时 默认为 `false`，即不处理占位组件

有关占位组件的用途可参考以下文档：

- [微信小程序 - 自定义组件 - 占位组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/placeholder.html)
- [字节小程序 - 自定义组件 - 占位组件](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/guide/developing-and-testing-miniApp/front-end/mini-app-framework/custom-component/placeholder/)

**_注意：字节小程序的占位组件和微信小程序的占位组件渲染时机和逻辑不一致，可能会引起问题。_**

### sourceType - 源码类型

- 类型: `string`
- 默认值: `wechat`
- 可选值:
  - `wechat`: 微信小程序 DSL
  - `alipay`: 支付宝小程序 DSL

源码类型, 表明当前源码是 微信小程序 DSL 或 支付宝小程序 DSL。

### srcPath - 源码目录

- 类型: `string`
- 默认值: `src`

指定需要编译的源代码所在目录，启动编译时，仅该目录中的代码会被编译。

### srcPaths - 多源码目录

- 类型: `string[]`
- 默认值: `src`

指定多个编译的源代码所在目录。

**主要用途：** 当指定多个编译的源代码目录时，MorJS 会将这些 “虚拟” 的源代码目录当做一个单一的源码目录。这就允许 MorJS 在编译过程中，从这些 “虚拟” 目录中去解析模块的相对引用路径，就好像它们是同一个目录一样。

例如：

```javascript
{
  // 配置两个源代码目录
  srcPaths: ['src1', 'another/innerDir/src2']
}
```

```bash
src1
└── views
    └── view1.ts (可以引用 "./template1", "./view2`)
    └── view2.ts (可以引用 "./template1", "./view1`)
another
└── innerDir
    └── src2
        └── views
            └── template1.ts (可以引用 "./view1", "./view2`)
```

这个技巧，有助于解决某些情况下，我们将一个项目拆分成了多个不同的目录，以方便维护，却同时期望在编译完成后，可以继续保持拆分前的目录结构。

### target - 编译目标平台

- 类型: `string`
- 默认值: `wechat`
- 可选值:
  - `alipay` 支付宝小程序
  - `baidu` 百度小程序
  - `bytedance` 字节小程序
  - `dingding` 钉钉小程序
  - `eleme` 饿了么小程序
  - `kuaishou` 快手小程序
  - `qq` QQ 小程序
  - `taobao` 淘宝小程序
  - `web` Web 应用
  - `wechat` 微信小程序

编译目标, 将当前的应用编译为目标小程序应用或 Web 应用。

### watch - 是否开启监听

- 类型: `boolean`
- 默认值: `false`

是否开启监听模式，开启后，文件发生变更时会自动触发重新编译，该配置受 [`ignore` 配置](/guides/basic/config#ignore---忽略配置) 影响。

### watchNodeModules - 监听特定 node_modules

- 类型: `string | RegExp | string[]`
- 默认值: `undefined`

监听某个 `node_modules` 依赖。该配置适用于直接在 `node_modules` 中修改某个 `npm` 的代码且期望触发更新的场景。

> 注意：该配置开启后，会自动禁用缓存。

```javascript
// 配置示例一: RegExp
{
  // 监听 lodash 依赖的变更
  watchNodeModules: /lodash/
}

// 配置示例二: string，支持 glob 模式
{
  // 监听 lodash 依赖的变更
  watchNodeModules: '**/lodash/**'
}

// 配置示例三: string[], 支持 glob 模式
{
  // 监听 lodash 依赖的变更 且 监听所有前缀为 mor-runtime-plugin-* 的运行时插件变更
  watchNodeModules: ['**/lodash/**', '**/mor-runtime-plugin-*/**']
}
```

### web - Web 编译配置

- 类型: `object`
- 默认值: `{}`

Web 编译配置, 仅在 `target` 值为 `web` 时生效。

```javascript
/* 配置示例 */
{
  web: {
    // 配置小程序组件名映射表
    // 默认无需配置, 可指定全局组件配置文件
    globalComponentsConfig: {},

    // 是否使用 rpx2rem 插件对 rpx 单位进行转换
    // 默认为 true
    // 优先级低于 usePx
    needRpx: true,

    // 是否需要样式隔离，如果开启该功能，在编译时会给样式加上唯一 hash 值，用于多页面解决样式冲突问题
    // 默认为 false
    styleScope: false,

    // rpx 方案的 root value。
    // 默认是 32
    rpxRootValue: 32,

    // 默认编译出来的样式会以 rem 为单位
    // 优先级高于 needRpx
    // 配合 runtime 层提供的 setRootFontSizeForRem 方法可以实现移动端的响应式。
    // 如果不想将样式单位编译成 rem 可以配置该对象，
    // 对象中包含一个参数 ratio 用于指定 rpx 2 px 的转换比例。
    // 如 ratio 为 1， 那么 1rpx = 1px， 如果配置 ratio 为 2， 那么 1rpx = 0.5px
    usePx: { ratio: 2 },

    // extensions 配置，用于设置接口扩展
    // 可设置多个扩展路径，如 ['extension1', 'extension2', ['extension3', {}]]
    extensions: [],

    // 配置可开启页面自动响应式（以375尺寸为准）
    // 换算方式为 rpxRootValue / usePx.ratio
    // 以上方默认值为例, 如需开启响应式可配置为: 32 / 2 = 16 即可
    responsiveRootFontSize: undefined,

    // 是否需要在导航栏展示返回按钮, 默认为 false
    // 配置示例:
    //    true: 所有页面均开启
    //    false: 所有页面均关闭
    //    []: 可通过数组配置具体需要开启的页面
    //    (pagePath: string) => boolean: 可通过函数来定制页面开启情况
    showBack: false,

    // 是否需要导航栏, 默认为 true
    // 配置示例:
    //    true: 所有页面均开启
    //    false: 所有页面均关闭
    //    []: 可通过数组配置具体需要开启的页面
    //    (pagePath: string) => boolean: 可通过函数来定制页面开启情况
    showHeader: true,

    // 产物通用路径
    publicPath: '/',

    // 开发服务器配置
    // 详细配置参见: https://webpack.js.org/configuration/dev-server/
    devServer: {},

    // html-webpack-plugin 插件 配置
    // 详细配置参见: https://webpack.js.org/plugins/html-webpack-plugin/
    // 支持在数组中配置多个 html 页面
    htmlOptions: [],

    // mini-css-extract-plugin 插件配置
    // 详细配置参见: https://webpack.js.org/plugins/mini-css-extract-plugin/
    miniCssExtractOptions: {},

    // 行内资源大小配置, 默认为 8k
    inlineAssetLimit: 8192,

    // 是否自动生成 entries, 默认均开启
    // 如关闭, 则需要自行指定 webpack 配置的入口文件
    autoGenerateEntries: true,

    // 入口文件配置, 仅在 autoGenerateEntries 为 false 的情况下生效
    // 用于手动配置 webpack 入口文件地址
    // 若手动配置则需要用户自行组装页面及引用
    entry: undefined,

    // 是否输出中间产物
    emitIntermediateAssets: false,

    // 支持用户自定义运行时的一些行为，该字段将作为 $MOR_APP_CONFIG 写入到 window 对象中，供运行时获取并消费
    appConfig: {
      // 用于传递业务对某个组件的特殊配置, 比如 map 组件传递 key
      components: {},

      // 用于自定义 URL 中 query 部分的 tabBarKey 的实际名称，该 key 作用于 URL 的 query
      // 并将拿到到值，用于获取 app.json 中的 tabbar 内容，以此实现通过 URL 参数切换不同 tabbar 的功能
      customTabBarKey: 'tabBarKey',

      // 用于配置是否允许覆盖全局对象中的方法，默认情况下不会覆盖 `my.xxx` 方法或属性
      // 可以通过配置为 `false` 来强制覆盖
      apiNoConflict: true
    }
  }
}
```

### webpackChain - 配置 Webpack

- 类型: `function`

通过 [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) 的 API 修改 webpack 配置。

比如：

```js
export default {
  webpackChain(chain) {
    // 设置 alias
    chain.resolve.alias.set('foo', '/tmp/a/b/foo')

    // 删除 MorJS 内置 webpack 插件
    chain.plugins.delete('progress')
  }
}
```

支持异步，

```js
export default {
  async webpackChain(chain) {
    await delay(100)

    chain.resolve.alias.set('foo', '/tmp/a/b/foo')
  }
}
```

### xmlMinimizer - XML 压缩器

- 类型: `boolean`
- 默认值: `minimize` 开启的情况下默认为 `true`

是否开启 xml 文件的压缩。

### xmlMinimizerOptions - XML 压缩选项

- 类型: `object`
- 默认值: `{}`

xml 压缩器自定义配置。

## 集成相关配置

### compose - 是否开启集成

- 类型: `boolean`
- 默认值: `false`

是否在执行编译(`compile`)命令时自动开启 [复杂小程序集成功能](/guides/advance/complex-miniprogram-integration.md), 执行集成(`compose`)命令时, 该配置自动为 `true`。

### consumes - 需要消费的共享依赖

- 类型: `string[]`
- 默认值: `[]`

配置需要消费的共享 npm 模块, 通常用于主/分包独立打包场景下的依赖共享场景, 仅在 `compileMode` 为 `bundle` 模式下生效。

_注意: 如开启了小程序独立分包模式, 该共享方式可能会失效, 原因是分包可能早于主包加载, 而此时共享模块还未注入。_

```javascript
/* 配置示例 */
{
  // 配置分包中需要使用的主包中共享出来的 npm 模块
  consumes: ['lodash']
}
```

### host - 宿主配置

- 类型: `object`
- 默认值: `{}`

小程序集成宿主配置, 详细参见 [复杂小程序集成功能](/guides/advance/complex-miniprogram-integration.md)。

```javascript
/* 配置示例 */
{
  // 小程序宿主配置
  host: {
    // 宿主名称, 可选值, 默认会基于 `git` 或 `npm` 或 `tar` 或 `file` 或 `link` 配置自动生成
    name: '',

    // 模块集成模式, 默认为 `compose`
    //  - compose: 通过 compose 方式集成, 通过拷贝的方式复制到产物目录
    //  - compile: 通过 compile 方式集成, 需要通过 MorJS 编译流程
    mode: 'compose',

    /* git / npm / tar / file / link 均用于下载模块, 只需要配置一个即可 */

    // 通过 git 仓库配置宿主
    // 支持直接配置链接, 如:
    //   git: 'git@github.com:abc/cde.git#master'
    //
    // 注意: branch/tag/commit 的优先级为 commit > tag > branch, 相关字段均配置后，会按照优先级取用
    git: {
      // 仓库地址, 支持 git/http/https/ssh 协议链接
      url: 'git@github.com:abc/cde.git',
      // 分支配置, 默认为 HEAD
      branch: 'develop',
      // 标签配置
      tag: 'v1.1.0',
      // Git 提交 commit id
      commit: 'abcdefghigklmnopqrstuvwxyz',
    },

    // 通过 npm 配置宿主
    // 支持直接配置链接, 如:
    //   npm: 'your_package@1.2.0'
    npm: {
      // npm 名称
      name: 'your_package',
      // npm 版本, 默认为 `latest`
      version: '1.2.0'
    },

    // 通过 tar 配置宿主
    // 支持直接配置链接, 如:
    //   tar: 'https://your_domain.com/abc.tar.gz'
    tar: {
      url: 'https://your_domain.com/abc.tar.gz',
      // 支持增加扩展参数, 参见 got 配置
    },

    // 通过 file 配置宿主(复制)
    // 直接支持配置地址, 如:
    //   file: '/Users/yourHomeDir/Workspace/yourCustomHostPath'
    file: {
      path: '/Users/yourHomeDir/Workspace/yourCustomHostPath'
    },

    // 通过 link 配置宿主(软链)
    // 直接支持配置地址, 如:
    //   link: '/Users/yourHomeDir/Workspace/yourCustomHostPath'
    link: {
      path: '/Users/yourHomeDir/Workspace/yourCustomHostPath'
    },

    // 构建产物目录配置, 默认为 `dist`
    dist: 'dist',

    // 集成构建过程中可执行的脚本, 可选配置
    scripts: {
      // 执行脚本时的公共环境变量, 可选配置
      // MorJS 默认会注入如下环境变量:
      //   MOR_COMPOSER_MODULE_CWD: 当前模块工作目录
      //   MOR_COMPOSER_MODULE_TYPE: 当前模块类型
      //   MOR_COMPOSER_MODULE_HASH: 当前模块 hash 信息, 用于 MorJS 内部判断是否需要重新下载模块
      //   MOR_COMPOSER_MODULE_ROOT: 当前模块根目录
      //   MOR_COMPOSER_MODULE_SOURCE: 当前模块源码目录
      //   MOR_COMPOSER_MODULE_OUTPUT_FROM: 当前模块原始产物目录
      //   MOR_COMPOSER_MODULE_OUTPUT_TO: 当前模块集成产物目录
      env: {},

      // 模块编译或拷贝前执行脚本, 可选配置
      before: [
        // 可以直接以字符串的方式配置命令
        'npm i',

        // 也可以以对象的方式配置
        {
          // 需要执行的命令
          command: 'cd some_dir && mor compile',
          // 该命令的自定义环境变量
          env: {
            CUSTOM_ENV: 'CUSTOM_ENV_VALUE'
          },
          // 该命令的选项, 参见 execa.command 的 options 配置
          options: {
            shell: true
          }
        },
      ],

      // 模块编译完成后或拷贝后执行脚本, 可选配置
      after: [],

      // 所有模块完成集成之后执行脚本, 可选配置
      composed: [],

      // 脚本执行公共选项, 参见 execa.command 的 options 配置
      options: {}
    },

    // 模块配置信息, 对应 app.json 的内容
    // 该文件的配置方式，可以参见下方链接中有关 app.json 的描述
    // => https://mor.eleme.io/guides/basic/config#compiletype
    // 配置缺省状态下，集成时 MorJS 会自动读取 dist 配置所指向目录中对应的文件
    config: undefined
  }
}
```

### modules - 模块配置

- 类型: `object[]`
- 默认值: `[]`

小程序集成模块配置, 详细参见 [复杂小程序集成功能](/guides/advance/complex-miniprogram-integration.md)。

```javascript
/* 配置示例 */
{
  // 小程序集成模块配置
  modules: [
    {
      // 模块名称, 可选值, 默认会基于 `git` 或 `npm` 或 `tar` 或 `file` 或 `link` 配置自动生成
      name: '',

      // 模块集成模式, 默认为 `compose`
      //  - compose: 通过 compose 方式集成在宿主小程序中, 通过拷贝的方式复制到产物目录
      //  - compile: 通过 compile 方式集成在宿主小程序中, 需要通过 MorJS 编译流程
      mode: 'compose',

      // 模块类型, 默认为 `subpackage`
      //  - 声明为 主包(main) 的模块，会将页面插入到 app.json 的 pages 中
      //  - 声明为 分包(subpackage) 的模块，会将页面插入到 app.json 的 subPackages 中
      //  - 声明为 插件(plugin) 的模块: 功能研发中
      type: 'subpackage',

      /* git / npm / tar / file / link 均用于下载模块, 只需要配置一个即可 */

      // 通过 git 仓库配置模块
      // 支持直接配置链接, 如:
      //   git: 'git@github.com:abc/cde.git#master'
      //
      // 注意: branch/tag/commit 的优先级为 commit > tag > branch, 相关字段均配置后，会按照优先级取用
      git: {
        // 仓库地址, 支持 git/http/https/ssh 协议链接
        url: 'git@github.com:abc/cde.git',
        // 分支配置, 默认为 HEAD
        branch: 'develop',
        // 标签配置
        tag: 'v1.1.0',
        // Git 提交 commit id
        commit: 'abcdefghigklmnopqrstuvwxyz'
      },

      // 通过 npm 配置模块
      // 支持直接配置链接, 如:
      //   npm: 'your_package@1.2.0'
      npm: {
        // npm 名称
        name: 'your_package',
        // npm 版本, 默认为 `latest`
        version: '1.2.0'
      },

      // 通过 tar 配置模块
      // 支持直接配置链接, 如:
      //   tar: 'https://your_domain.com/abc.tar.gz'
      tar: {
        url: 'https://your_domain.com/abc.tar.gz'
        // 支持增加扩展参数, 参见 got 配置
      },

      // 通过 file 配置模块(复制)
      // 直接支持配置地址, 如:
      //   file: '/Users/yourHomeDir/Workspace/yourCustomModulePath'
      file: {
        path: '/Users/yourHomeDir/Workspace/yourCustomModulePath'
      },

      // 通过 link 配置模块(软链)
      // 直接支持配置地址, 如:
      //   link: '/Users/yourHomeDir/Workspace/yourCustomModulePath'
      link: {
        path: '/Users/yourHomeDir/Workspace/yourCustomModulePath'
      },

      // 构建产物目录配置, 默认为 `dist`
      dist: 'dist',

      // 集成构建过程中可执行的脚本, 可选配置
      scripts: {
        // 执行脚本时的公共环境变量, 可选配置
        // MorJS 默认会注入如下环境变量:
        //   MOR_COMPOSER_MODULE_CWD: 当前模块工作目录
        //   MOR_COMPOSER_MODULE_TYPE: 当前模块类型
        //   MOR_COMPOSER_MODULE_HASH: 当前模块 hash 信息, 用于 MorJS 内部判断是否需要重新下载模块
        //   MOR_COMPOSER_MODULE_ROOT: 当前模块根目录
        //   MOR_COMPOSER_MODULE_SOURCE: 当前模块源码目录
        //   MOR_COMPOSER_MODULE_OUTPUT_FROM: 当前模块原始产物目录
        //   MOR_COMPOSER_MODULE_OUTPUT_TO: 当前模块集成产物目录
        env: {},

        // 模块编译或拷贝前执行脚本, 可选配置
        before: [
          // 可以直接以字符串的方式配置命令
          'npm i',

          // 也可以以对象的方式配置
          {
            // 需要执行的命令
            command: 'cd some_dir && mor compile',
            // 该命令的自定义环境变量
            env: {
              CUSTOM_ENV: 'CUSTOM_ENV_VALUE'
            },
            // 该命令的选项, 参见 execa.command 的 options 配置
            options: {
              shell: true
            }
          }
        ],

        // 模块编译完成后或拷贝后执行脚本, 可选配置
        after: [],

        // 所有模块完成集成之后执行脚本, 可选配置
        composed: [],

        // 脚本执行公共选项, 参见 execa.command 的 options 配置
        options: {}
      },

      // 模块配置信息, 对应 subpackage.json / plugin.json / app.json 的内容
      // 三种类型文件的配置方式，可以参见下方链接中的描述
      // => https://mor.eleme.io/guides/basic/config#compiletype
      // 配置缺省状态下，集成时 MorJS 会自动读取 dist 配置所指向目录中对应的文件
      config: undefined
    }
  ]
}
```

### shared - 共享依赖

- 类型: `string[]`
- 默认值: `[]`

配置想要共享给其他分包使用的 npm 模块, 通常用于主/分包独立打包场景下的依赖共享场景, 仅在 `compileMode` 为 `bundle` 模式下生效。

_注意: 如开启了小程序独立分包模式, 该共享方式可能会失效, 原因是分包可能早于主包加载, 而此时共享模块还未注入。_

```javascript
/* 配置示例 */
{
  // 配置主包中想要共享给分包使用的 npm 模块
  // 分包中通过 consumes 配置来使用
  shared: ['lodash']
}
```
