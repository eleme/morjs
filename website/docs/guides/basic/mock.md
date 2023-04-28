# Mock

MorJS 提供了开箱即用的 Mock 功能，能够通过方便简单的方式来完成 Mock 数据或 JSAPI 的设置。

> **什么是 Mock 数据**：在前后端约定好 API 接口以后，前端可以使用 Mock 数据来在本地模拟出 API 应该要返回的数据，这样一来前后端开发就可以同时进行，不会因为后端 API 还在开发而导致前端的工作被阻塞。
>
> **什么是 Mock JSAPI**：JSAPI 通常是由宿主环境提供的，用于调起宿主能力的接口，如支付宝小程序的 `my.alert` 或 微信小程序的 `wx.showModal` 等，Mock JSAPI 就是前端可以基于宿主本身提供的 JSAPI 的出入参作为标准，在本地模拟出 JSAPI 相同的调用方式，以解决部分 JSAPI 只能够通过真机调用或需要针对多端差异测试的场景。

## 能力概览

- 提供小程序本地 JSAPI mock 能力，解决开发阶段无法联调接口请求数据的痛点
- 可灵活切换线上线下数据，快速便捷修改本地数据复现业务特定场景或流程
- 支持绝大部分同步和异步的小程序 JSAPI，支持 MorJS 生态下的多端小程序适配
- 保障使用安全，线上线下数据隔离，mock 数据不会带到线上
- 支持自由扩展的 Adapter 能力，可定制化特殊逻辑接入到 mock 中
- 兼容 `.ts` `.mjs` `.jsonc` `.json5` `.json` `.js` `.cjs` 文件类型格式，优先级顺序依次

## 目录约定

MorJS 约定 `/mock` 目录下的所有文件为 Mock 文件，例如这样的目录结构：

```bash
.
├── mock
│   ├── my
│   │   └── getSystemInfo.ts
│   ├── wx
│   │   └── login.ts
│   └── request
│       └── user
│           └── info.ts
├── src
│   ├── pages
│   │   └── todos
│   │       ├── todos.axml
│   │       ├── todos.json
│   │       ├── todos.less
│   │       └── todos.ts
│   ├── app.json
│   ├── app.less
│   ├── app.ts
│   ├── mini.project.json
│   └── project.config.json
```

则 `/mock` 目录中的 `my/getSystemInfo.ts`, `wx/login.ts` 和 `request/user/info.ts` 就会被 MorJS 视为 Mock 文件 来处理。

## 快速接入

1. 项目根目录创建 `/mock` 文件目录，该目录用于存放所有的 mock 文件；

```bash
.
├── mock
│
├── src
│   ├── pages
│   ├── app.json
```

2. 根据需要 `mock` 的 JSAPI 类型，在 `/mock` 文件目录下创建对应的文件目录和 mock 文件：

```bash
.
├── mock
│   ├── my
│   │   └── getLocation.ts
│   ├── wx
│   │   └── getSystemInfo.ts
│   └── request
│       └── getList.ts
```

3. 在业务代码中添加相关 JSAPI 请求，对于不同的 JSAPI 类型请查看下方详细说明；
4. 终端运行 `mor compile --mock` 开启 mock；

```bash
$ mor compile --mock
```

5. 把编译产物用 IDE 打开，查看调用的 JSAPI，返回结果应为第 2 步创建的 mock 文件；

> mock 文件兼容支持 `.ts` `.mjs` `.jsonc` `.json5` `.json` `.js` `.cjs` 文件类型格式，优先级顺序依次

## 类型说明

### JSAPI 类型详细说明

#### 通用 JSAPI

- 小程序基础 API，提供小程序的基础能力，如 `my.getLocation` `wx.getSystemInfo` 等等；
- mock 目录下创建 my (微信为 wx) 目录，把需要 mock 的 API 文件创建在此处；

```bash
.
├── mock
│   ├── my
│   │   ├── getLocation.ts
│   │   └── getNetworkType.ts
│   └── wx
│       ├── getSetting.ts
│       └── getSystemInfo.ts
```

#### request 请求

- 小程序发起 HTTPS 网络请求调用的 JSAPI，由于 request 接口的特殊性和通用行，我们把该 API 单独处理；
- 无论是支付宝、微信或是其他平台小程序，都适用该方式 mock HTTPS 网络请求；
- mock 目录下创建 request 目录，把需要 mock 的 HTTPS 网络请求接口文件创建在此处；
- 由完整 url 请求地址拆分为域名和接口两部分，将接口部分作为 mock 文件的路径
  - 如接口为 `my.request({ url: 'https://abc.org/api/abc/getList' })`，则 mock 文件路径为 `/mock/request/api/abc/getList.ts`
  - 如接口为 `my.request({ url: 'https://abc.org/aaa/getList' })`，则 mock 文件路径为 `/mock/request/aaa/getList.ts`

```bash
.
├── mock
│   └── request
│       ├── getFeedsList.ts
│       ├── api
│       │   └── getList.ts
│       └── aaa
│           └── getList.ts
```

> 实际开发中，我们常常会遇到传入的参数不同，接口下发不同数据的情况，mock 同样支持该能力，详情见下发 mock 文件类型说明。

### mock 文件类型说明

我们目前兼容 `.ts` `.mjs` `.jsonc` `.json5` `.json` `.js` `.cjs` 五种文件类型格式，优先级顺序依次，以下分别说明不同类型文件的写法：

- `.json` 文件、`.json5` 文件、`.jsonc` 文件，标准 json 类型文件，返回结果对应 json 的内容

```json
// /mock/wx/getSystemInfo.json
{
  "data": { "a": 1, "b": 2 }
}
```

- `.ts` 文件、`.js` 文件、`.mjs` 文件、`.cjs` 文件，支持 ESM 和 CJS 两种写法；
- 同时支持函数写法，根据入参的不同，返回不同 mock 结果

```typescript
/* /mock/my/getHAMemoryInfo.js */

// ESModule 写法
export default {
  evaluatedStatus: 'good',
  currentMemory: 123
}

// CommonJS 写法
module.exports = {
  evaluatedStatus: 'good',
  currentMemory: 123
}

// 函数写法，根据参数 opts 的不同，return 不同 mock 结果
module.exports = function (opts) {
  const {
    data: { type }
  } = opts
  switch (type) {
    case 'ali':
      return { res: 'alipay' }
    case 'wx':
      return { res: 'wechat' }
    default:
      return { res: '其他' }
  }
}
```

## mock 配置

`mor.config.ts` 文件中的 `mock` 配置项，可不配置，默认值 `{}`，每项的详细说明如下:

- debug: 是否开启小程序 debug，默认值 `false`，设置为 `true` 时，将显示哪些 JSAPI 命中 mock；
- path: 本地 mock 目录路径，默认值 `'./mock'`，若你不想把 mock 文件放在根目录下，可通过此项更改 mock 文件目录位置；
- originMap: 配置哪些 JSAPI 跳过 mock，强制使用原生的事件方法；
- adapters: 扩展能力支持，用于自定义扩展 mock 逻辑，优先级高于 mock 流程；

示例配置如下:

```typescript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'ali',
    sourceType: 'alipay' ,
    target: 'alipay',
    ...,
    mock: {
      debug: false, // 是否开启 debug
      path: './mock', // 本地 mock 目录路径
      originMap: { // 配置哪些 API 使用原生方法
        my: ['getSystemInfo', 'request'],
      },
      adapters: [], // adapters 扩展能力配置
    }
  },
])
```

## Adapter 扩展配置

`adapters` 配置用于支持 `mock` 的扩展能力，其返回结果的优先级高于 `mock` 逻辑，`mock` 优先级则高于原生方法（未命中配置 originMap 的情况下）

`adapters` 配置项接收一个数组，支持配置多个 `adapter`，其执行顺序和优先级从上到下，当命中某个 `adapter`，返回正确的结果后，将不会再执行后续的 `adapter`

### 如何使用 Adapter

每个 adapter 支持 `string` 类型和 `array` 两种类型:

- `string` 类型，参数为本地 adapter 路径或 npm 包名，配置以加载该 adapter

```typescript
export default defineConfig([
  {
    name: 'ali',
    sourceType: 'alipay' ,
    target: 'alipay',
    ...,
    mock: {
      ...,
      adapters: [
        './you_adapter_name.js', // string 类型本地 adapter 文件路径
      ],
    }
  },
])
```

- `array` 类型，接收两个参数，加载 adapter 并向其传参
  - 第一个参数为本地 adapter 路径或 npm 包名
  - 第二个参数为传给 adapter 的参数（非必填）

```typescript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'ali',
    sourceType: 'alipay' ,
    target: 'alipay',
    ...,
    mock: {
      ...,
      adapters: [
        [
          // 参数①: 本地 adapter 或 npm 包名
          'your_adapter_name',
          // 参数②: 提供 adapter 的参数
          {
            type: 'your_parameter_type',
            api: 'your_parameter_api'
          }
        ],
      ],
    }
  },
])
```

### 如何编写 Adapter

在 `adapters` 中配置的 `adapter`，会在 mock 初始化阶段中自动依次 `import`，`new` 对应的实例对象并执行 `run` 方法，`adapter` 的 `run` 需要返回一个结果用于优先替代后续的 mock 结果，若不返回或返回 `undefined` 则继续执行后续的 mock 流程，所以一个基本的 `adapter` 的结构如下：

```typescript
export default class XXXAdapter {
  private options: Record<string, any>

  constructor(options) {
    this.options = options
  }

  public run(runOptions: IRunOptions) {
    // 执行相关逻辑 获取最终结果 result
    return result || undefined
  }
}
```

#### `runOptions` 参数

在 mock 初始化对应的实例对象后，自动调用的 `run` 方法会传一些固定的参数提供给开发者使用，`runOptions` 目前包含四个属性:

- `apiName`: 调用的 JSAPI 名称，如 `getSystemInfo` `request` 等，开发者可以根据该属性选择介入哪些 JSAPI 的 mock 流程；
- `apiArguments`: 调用的 API 的传参，例如调用 `request` 时的入参，可根据参数不同执行不会逻辑流程或返回不同结果；
- `originalGlobal`: 小程序原生全局对象 如支付宝的 `my`（微信的 `wx`），该原生方法不会走 mock 流程避免 mock 嵌套死循环；
- `mockContext`: webpack require 的 mock 目录结构，详情可参考 [webpack - Dependency Management](https://webpack.js.org/guides/dependency-management/)；

```typescript
export default class XXXAdapter {
  private options: Record<string, any>

  constructor(options) {
    this.options = options
  }

  public run(runOptions: IRunOptions) {
    const { apiName, apiArguments, originalGlobal, mockContext } = runOptions
    // 执行相关逻辑 获取最终结果 result
    return result || undefined
  }
}
```

#### 给 `adapter` 传参

在如何使用 `adapter` 的时候说过，每个 adapter 支持 `string` 类型和 `array` 两种类型，想要给 `adapter` 传参必须使用 `array` 类型，第二个参数为传给 adapter 的参数，传入的参数可以在 `constructor` 的 `options` 中获取

```typescript
// mor.config.ts
export default defineConfig([
  {
    name: 'ali',
    target: 'alipay',
    ...,
    mock: {
      ...,
      adapters: [
        [
          // 参数①: 本地 adapter 或 npm 包名
          'your_adapter_name',
          // 参数②: 提供 adapter 的参数
          {
            type: 'your_parameter_type',
            api: 'your_parameter_api'
          }
        ],
      ],
    }
  },
])
```

```typescript
// your_adapter_name/index.ts
export default class MtopAdapter {
  private options: Record<string, any>

  constructor(options) {
    this.options = options
  }

  public run(runOptions: IRunOptions) {
    const { apiName, apiArguments, mockContext, originalGlobal } = runOptions
    const {
      type, // your_parameter_type
      api // your_parameter_api
    } = this.options || {}
    // 执行相关逻辑 获取最终结果 result
    return result
  }
}
```
