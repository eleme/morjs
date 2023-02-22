# JS 依赖库规范

## 概要

由于多端小程序运行环境的限制和约束，`JS 依赖库` 和一般意义上的 `NPM 包` 有些区别，这里特指专为小程序定制的 `NPM 包`。

MorJS 要求所有依赖库都需要都是**兼容微信、支付宝小程序等小程序平台**，需要各个库在输出的时候要做好严格的测试以及多端小程序的兼容性。

## 代码约束

### 禁止使用动态函数

由于小程序有安全性相关要求，严禁使用动态函数，请勿请勿使用动态函数 `new Function` 和 `eval`，否则会直接报错。

```javascript
// 千万不要这么干，会报错
function createFunction() {
  var x = 20
  return new Function('return x;')
}

// no!!!
eval('var a = 1')
```

### 严格模式下开发

请在严格模式下进行代码开发，由于小程序的源码在编译后都是在严格模式下，MorJS 的 `bundle` 模式会在构建打包环节，将用到的依赖库变成 `mor.v.js` 文件，因此库的开发也需要遵循严格模式，避免发生不可预料的后果。严格模式的说明，请 [参考文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)。

### TypeScript 的 Polyfill 支持

如果采用 `tsc` 去编译输出 `ES5` 代码，请注意 `tsc` 并不会像 `babel` 一样针对一些原型方法做 `polyfill`。另外由于不同的小程序平台对 `JS` 特性及 `Polyfill` 的支持情况不同，因此需要在写源码的时候尽可能规避以下一些函数、对象的使用。

例如：

- `Array.prototype.includes`
  - 请用 `Array.prototype.indexOf` 替代
- `String.prototype.includes`
  - 请用 `String.prototype.indexOf` 替代
- `Object.values`
  - 请用 `for...in` 循环或者`Object.keys` + `Array.prototype.map`替代
- 不能使用 `Reflect`
- 不能使用 `Proxy`

各平台详细兼容情况，可参考文档：

- [微信小程序 JS 支持情况](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html)
- [支付宝小程序 JS 支持情况](https://opendocs.alipay.com/mini/framework/implementation-detail)
- [百度小程序 JS 支持情况](https://smartprogram.baidu.com/docs/develop/framework/operating-environment/)
- [字节小程序 JS 支持情况](https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/framework/mini-app-runtime/java-script-support)
- [QQ 小程序 JS 支持情况](https://q.qq.com/wiki/develop/miniprogram/frame/useful/useful_env.html)

## 代码规范

- 源代码：

  - 原则上使用 `TypeScript` 写源代码，并输出 `.d.ts` 类型申明文件，方便开发同学快速上手，MorJS 提供了多端组件库的脚手架，可以快速初始化项目，并利用 MorJS 进行多端产物输出。

- 代码输出 `ES5` 版本：

  - 依赖库输出的版本需要为 `ES5` 的版本，原因是小程序构建的时候并不会对 `node_modules` 里面的代码进行 **ES6 转 ES5**，所以在不支持 **ES6** 的机型会直接报错
  - 如果采用的是 `TypeScript`，建议在 `tsconfig.json` 中把 `importHelpers` 设置成 `true`，来减少生成出来的代码体积。注：使用 MorJS 的项目，会建议装 `tslib` 这个依赖

- `babel` 的特别说明：

  - 同样，原则上如果没有特别的需要建议直接用 `TypeScript` 的 `tsc` 即可
  - `babel` 默认情况下针对 `async/await` 的语法会使用 [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime) 这个库做 polyfill，而这个库默认情况下是不会声明这个 `regeneratorRuntime` 变量，因此会在严格模式下报错 `Can't find variable: regeneratorRuntime`，而库的兜底策略是会采用动态函数赋值（参考 [源代码](https://github.com/facebook/regenerator/blob/master/packages/regenerator-runtime/runtime.js#L728)），而动态函数在小程序上由于安全问题不允许执行。所以导致在小程序上会直接报错。
  - 目前 `mor bundle` 模式针对该问题已经做了兼容兜底

- 单元测试：
  - 单元测试建议采用 **Jest**，具体使用上请参考 [Jest 官网](https://jestjs.io/)
  - 建议测试覆盖率达到 `90%` 以上，**Jest** 可直接输出代码覆盖率报告

## 如何实现多端支持

### MorJS 的加载规范

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

Q：为什么会有 `miniprogram` 和 `wechat` 两个字段作为微信小程序的加载入口？我要如何选择？
A：一般情况下我们建议直接用 `miniprogram` 字段即可，除非是库是希望在默认引用的情况下还提供文件路径的依赖加载且还要支持微信小程序的 `NPM构建`。在这种情况下，就需要同时用到 `miniprogram` 和 `wechat` 两个字段了。具体参考下面的多端适配示例。

### 可兼容多端的 JS

如果是纯 `JS` 代码，并不涉及小程序特定端的特殊逻辑，且能保证多端都可兼容运行的情况下，只输出一份代码即可（仅指定 main 入口字段）。这种情况下建议输出的 `module` 类型是 `CommonJS` 规范的模块。`package.json` 中建议配置 `main` 字段来指向实际构建后的文件或目录。

#### 目录结构

```bash
- src
  - index.ts（源代码）
- lib
  - index.js（输出的 ES5 版本代码，采用 CommonJS 模块规范）
  - index.d.ts（输出的类型申明）
```

#### `tsconfig.json` 示例

这里提供的是最少的配置项

```javascript
{
  "compilerOptions": {
    "declaration": true,
    "target": "ES5",
    "importHelpers": true,
    "module": "CommonJS"
  }
}
```

#### `package.json` 示例

无需配置 `miniprogram` / `wechat` 等字段！

```javascript
{
  "main": "lib" // 所有端小程序都生效
}
```

---

### 正常情况下的多端规范示例

以一个需要适配 **微信小程序**、**支付宝小程序 等**模式的小程序的 **JS** 库举例：
业务项目中可以通过 `import { xx } from 'example'` 引用依赖，所有的模块均从根模块下导出。

#### 目录结构

输出的目录结构示例

- 在支付宝小程序中会加载的是 `lib/index.js` 这份文件
- 在微信小程序中会加载的是 `miniprogram_dist/index.js` 这份文件

```bash
- src
  - index.ts（源代码）
- lib
  - index.js（输出的 ES5 版本代码，支付宝小程序加载用）
  - index.d.ts（输出的类型申明）
- miniprogram_dist
  - index.js（输出的 ES5 版本代码，微信小程序加载用）
  - index.d.ts（输出的类型申明）
```

#### `package.json` 配置示例：

```javascript
{
  "main": "lib" // 支付宝小程序，缺省情况下使用 main 字段，也可以配置专属字段 alipay
  "miniprogram": "miniprogram_dist" // 微信小程序
}
```

#### 模块规范说明

- 微信小程序：微信小程序由于兼容性问题，建议输出的 `module` 规范是 `CommonJS` 模块规范
- 支付宝小程序：由于支付宝小程序支持 `node_modules` 中使用 `ESNext` 规范的模块，可以方便做 `tree shaking`，因此在多端版本输出的情况下，支付宝小程序版本建议输出的 `module` 规范是 `ESNext` 模块规范

---

### 复杂情况下的多端规范示例【待移除 - mor 自行支持，降低用户理解成本】

以一个需要适配 **微信小程序、支付宝小程序，`mor bundle`** 模式的小程序的 **JS** 库举例：

业务项目中可以通过 `import { xx } from 'example'` 引用依赖，且要求能够支持 `import { oo } from 'example/lib/zz'` 的情况下也能够加载依赖，可以参考以下的配置示例。

**一般情况下，并不建议大家这样做，所有需要能够加载的模块最好都直接从依赖根模块导出。避免直接去某个特定目录下加载。**

#### 目录结构

这里以最简单的目录形式展示：

```bash
- src
  - index.ts（源代码）
- lib
  - index.js（输出的 ES5 版本代码）
  - index.d.ts（输出的类型申明）
```

#### 支付宝小程序适配

在 `package.json` 中，我们指定 `main` 字段，指向生成后的 `lib` 目录，这样支付宝小程序会采用 `lib/index.js` 这份代码。

由于支付宝小程序支持 `node_modules` 中使用 `ESNext` 规范的模块，可以方便做 `tree shaking`，因此在多端版本输出的情况下，支付宝小程序版本建议输出的 `module` 规范是 `ESNext` 模块规范

##### `package.json` 配置示例：

```javascript
{
  "main": "lib" // 支付宝小程序
}
```

#### 微信原生小程序适配

由于在微信原生小程序中，针对 `NPM包` 是采用 `miniprogram` 字段来指定目录，且实际是通过拷贝目录来 `构建NPM`，因此适配微信原生小程序的话，需要套多一层目录。

建议输出的 `module` 规范是 `CommonJS` 模块规范

```bash
- src
  - index.ts（源代码）
- lib
  - index.js（输出的 ES5 版本代码）
  - index.d.ts（输出的类型申明）
- miniprogram_dist
  - lib
    - index.js（针对微信版本输出的 ES5 版本代码）
    - index.d.ts（输出的类型申明）
```

然后在 `package.json` 中需要通过 `miniprogram` 字段来指向目录，微信小程序下会采用 `miniprogram/lib/index.js`这份代码。

##### `package.json` 配置示例：

```javascript
{
  "main": "lib", // 支付宝小程序
  "miniprogram": "miniprogram_dist" // 微信原生小程序
}
```

#### `mor bundle` 模式适配

由于 MorJS 是自己做依赖解析的，如果库在支持了微信原生小程序的依赖解析方式上，MorJS 通过 `miniprogram` 字段去做解析的话，会因为路径解析问题直接导致报错。
构建并不需要专门为 MorJS 生成一份代码，MorJS 依然会采用`miniprogram_dist`下的代码，只需要在`package.json`中增加`wechat`字段的配置即可

##### `package.json`配置示例：

```javascript
{
  "main": "lib", // 支付宝小程序
  "miniprogram": "miniprogram_dist", // 微信原生小程序
  "wechat": "miniprogram_dist/lib" // mor bundle 模式
}
```
