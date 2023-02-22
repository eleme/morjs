# 小程序形态一体化

## 背景

随着饿了么的业务场景和范围快速拓展，诞生了诸如：

- 支付宝小程序作为分包接入微信小程序
- 淘宝 / 支付宝插件作为分包接入微信小程序
- 支付宝小程序作为插件接入淘宝小程序插件
- 支付宝插件作为分包接入微信或抖音小程序

等诉求，之前业务的做法是针对每个端，如微信、支付宝、淘宝、抖音，各自维护一套代码，但这样做不仅功能同步迭代周期很长，而且 BUG 较多，迭代维护困难，研发过程异常痛苦。

为了解决这个问题，我们从工程化角度出发，期望能够在尽量减少业务代码修改的前提下，以同构的方式支持同一个项目以不同的形态（如小程序、小程序插件和小程序分包）投放在不同的渠道（微信、支付宝、淘宝、抖音等），因而诞生了小程序形态一体化的能力支持。

## 能力概览

支持小程序、小程序插件以及小程序分包之间的相互转换：

- **小程序** ↔ **小程序分包**
- **小程序** ↔ **小程序插件**
- **小程序插件** ↔ **小程序分包**
- **小程序插件** ↔ **小程序**
- **小程序分包** ↔ **小程序插件**
- **小程序分包** ↔ **小程序**

形态转换示意图 👇🏻

<img src="https://img.alicdn.com/imgextra/i3/O1CN01y9k8NX1ypDXbX8iT1_!!6000000006627-0-tps-1386-1062.jpg" width="600" />

## 形态差异

形态差异是指 **小程序**、**小程序分包**、**小程序插件** 三种不同形态的运行方式差异以及转换为其他形态之后产生的差异，具体如下：

- **`getApp` 差异**
  - **小程序：** 可通过 `getApp()` 来获取全局 `App` 实例及实例上挂载的属性或方法
  - **小程序插件：** 无法调用 `getApp()`
  - **小程序分包：** 可通过 `getApp()` 来获取全局 `App` 实例及实例上挂载的属性或方法；但当通过小程序转换为分包后，分包自身原本调用的 `getApp` 将失效，并被替换为宿主小程序的 `getApp`
- **`App 应用生命周期` 差异**
  - **小程序：** 应用会执行 `onLaunch`、`onShow`、`onHide` 等生命周期
  - **小程序插件：** 无应用生命周期
  - **小程序分包：** 无应用生命周期
- **`全局样式`（如：`app.wxss` 或 `app.acss`）差异**
  - **小程序：** 可通过全局样式来声明全局样式
  - **小程序插件：** 无全局样式
  - **小程序分包：** 无全局样式
- **`NPM` 使用限制**
  - **小程序：** 各个小程序平台支持和限制情况不一
  - **小程序插件：** 各个小程序平台支持和限制情况不一
  - **小程序分包：** 各个小程序平台支持和限制情况不一
- **`MorJS 运行时插件/解决方案`使用差异**
  - **小程序：** 可正常使用
  - **小程序插件：** 因为无 `App` 无法使用
  - **小程序分包：** 因为无 `App` 无法使用
- **接口调用限制**
  - **小程序：** 无限制
  - **小程序插件：** 存在大量的接口调用限制，如 [开发支付宝小程序插件](https://opendocs.alipay.com/mini/plugin/plugin-development) 或 [开发微信小程序插件](https://developers.weixin.qq.com/miniprogram/dev/framework/plugin/development.html)
  - **小程序分包：** 无限制
- **路由差异**
  - **小程序：** 转换到其他形态后自身路由会发生变化
  - **小程序插件：** 转换到其他形态后自身路由会发生变化，跳转插件页面需要包含 `plugin://` 或 `dynamic-plugin://` 等前缀，小程序或分包则不需要
  - **小程序分包：** 转换到其他形态后自身路由会发生变化
- **`getCurrentPages` 差异**
  - **小程序：** 无限制
  - **小程序插件：** 无法通过 `getCurrentPages` 获取到小程序的页面堆栈
  - **小程序分包：** 无限制
- **页面或组件样式差异**
  - **小程序：** 无限制
  - **小程序插件：** 基本选择器只支持 ID 与 class 选择器，不支持标签、属性、通配符选择器
  - **小程序分包：** 无限制

等等，相关形态差异可结合各个小程序平台查看，这里仅罗列常见的部分。

## 解决方案

### 适用范围

MorJS 的形态一体化方案重点在于解决上述差异中业务难以自行适配的部分，如：

- `getApp` 差异
- `App 应用生命周期` 差异
- `全局样式`（如：`app.wxss` 或 `app.acss`）差异
- `NPM` 使用限制
- `MorJS 运行时插件/解决方案`

等。其他差异，建议业务自行兼容或基于 MorJS 的 [文件纬度条件编译](/guides/conditional-compile/file-level.md) 或 [代码纬度条件编译](/guides/conditional-compile/code-level.md) 来自行分端兼容。

### 实现方案

为了帮助大家更好的理解一体化方案的逻辑，这里会通过一些示例性的代码来解释下一体化背后的实现思路，实际的实现代码会复杂很多，有兴趣的同学可以直接看 MorJS 源码。

#### 入口配置说明

不同形态的入口文件可通过配置 `compileType` 来指定：

- `miniprogram`: 以小程序的方式编译, 入口配置文件为 `app.json`
- `plugin`: 以插件的方式编译, 入口配置文件为 `plugin.json`
- `subpackage`: 以分包的方式编译, 入口配置文件为 `subpackage.json`

有关 MorJS 配置文件说明可参见文档：[MorJS 基础 - 配置](/guides/basic/config#集成相关配置)

入口文件配置示例如下：

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
  // type 字段为 mor 独有, 用于标识该分包为 "subpackage" 或 "main"
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

#### 差异抹平思路

##### 多形态下的 `getApp` 调用和 `App` 生命周期抹平

通过在小程序插件和小程序分包模式下增加 `app.js` 入口文件的支持，并模拟 `App` 生命周期调用和为所有的页面和组件注入 `getApp` 方法来实现，具体可参见下图示例：

<img src="https://img.alicdn.com/imgextra/i1/O1CN01sgqFgl1CKRN8hS9hB_!!6000000000062-0-tps-3134-1518.jpg" width="800" />

##### 多形态下的全局样式支持（如 `app.acss` 或 `app.wxss`）

小程序编译时通过自动将全局样式文件（`app.acss` 或 `app.wxss` 等）注入到每个页面和组件的样式文件中作为引用来实现对全局样式的兼容，具体可参见下图示例：

<img src="https://img.alicdn.com/imgextra/i2/O1CN01G3WTXh1lIcLZGRkdc_!!6000000004796-0-tps-2138-1572.jpg" width="800" />

##### `NPM` 组件库支持差异抹平

基于 MorJS 本身提供的 `bundle` 模式，结合 [多端组件库规范](/specifications/component) 和 [JS 依赖库规范](/specifications/js) 来自动在编译的过程中，自动将小程序、小程序插件、小程序分包的 JS 依赖统一打包并将使用到的组件库自动提取到 `npm_components` 文件夹来规避不同形态下的依赖问题以及不同小程序平台本身的 NPM 支持差异问题，编译流程如下：

<img src="https://img.alicdn.com/imgextra/i2/O1CN01v5vMgI1JwBJufNH0d_!!6000000001092-0-tps-3378-1300.jpg" width="800" />

## 配置示例

业务可参考下方的配置示例来实现小程序形态一体化的配置。

### 前置准备

相关功能需要以下或更新版本的 MorJS 依赖，开始前请在项目中的 `package.json` 检查并设置。

```bash
npm i @morjs/cli@2 -D
npm i @morjs/core@2 --save
```

### 小程序转分包

#### 1、在项目根目录创建 `subpackage.json` 文件

将需要转换为分包的页面填写进去，如:

```json
{
  "root": "takeout_delicious_food",
  "pages": ["index/index"]
}
```

注意：当前需要业务方手动添加该文件，如果需要转换的小程序 `app.json` 已存在分包配置，需要将分包中的页面也添加至 `subpackage.json` 的 `pages` 中，注意页面路径为`分包名称＋路径`，不要写错。

#### 2、在 `mor.config.ts` 文件中增加分包编译配置

```typescript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  // ⭐️⭐️⭐️ 重点看这里：分包编译配置 ⭐️⭐️⭐️
  {
    // 编译名称，可随意修改
    name: 'wechat_subpackage',
    // 源码类型, 这里以支付宝小程序 DSL 为例
    sourceType: 'alipay',
    target: 'wechat',
    // 指定编译类型为分包!
    compileType: 'subpackage',
    // 分包只能使用 bundle 打包模式
    compileMode: 'bundle',
    // 如果分包需要使用宿主的 npm 依赖，且不希望该依赖参与打包
    // 可以在 externals 中指定 npm 包的名称，在项目中正常引用即可
    // 注意：微信环境下需要自行触发 构建 NPM 操作
    externals: []
  }
])
```

完成以上配置后，即可执行对应的分包编译，编译完成后，将对应编译产物文件夹直接放到对应的宿主中即可。

#### 3、接入注意事项

- 分包的打包模式默认会查找 `mor.subpackage.app.js`，如果该文件不存在，则会直接使用 `app.js`，故小程序转分包如无特别需求可以不使用 `mor.subpackage.app.js`，如果配置了 `mor.subpackage.app.js` 则将使用该文件，并忽略 `app.js`。如果需要两个文件并存，那么可以考虑把公共逻辑抽象到一个单独文件中
- 分包的打包方式，仅提供直接将完整小程序编译为可直接作为分包运行的文件夹，业务方接入到微信还有一些内容需要适配，差异无法全部抹平，具体参见文档：[《多端差异性总结》](/guides/compatibilities/alipay-to-wechat.md)
- 小程序转分包后， `app.onLaunch` 会在首次打开分包页面时调用，`app.onShow` 以及其他方法如 `onError` 等 不会被调用，这块儿的差异需要业务方自行处理
- 分包模式会对 `getApp` 方法进行兜底处理，分包模式下通过 `getApp` 调用获得的 `app` 为宿主和分包的混合产物，宿主的属性和方法可以通过 `app.$host` 获取，具体逻辑可以查看产物中的 `mor.subpackage.global.js` 文件
- 分包模式下如果会将 app.acss 注入到各个页面和组件的样式中作为引用，原因为部分业务团队重度依赖全局样式
- 业务中如有用到自有封装的 npm package，这部分需要自行确保多端支持
- 如果需要使用宿主已提供的 npm package，可以将对应的包名添加到上述配置示例的 `externals` 中，然后在项目中正常引用即可。如项目中出现此类需求，建议抽象出来一个单独的 js 文件，可以通过文件或源代码纬度的条件编译来为不同端提供支持，避免造成对业务代码的污染
- 风险点: 分包没有固定初始化入口，故为了能够正常初始化项目代码，编译时在每个页面和组件的 JS 文件顶部引入了初始化的文件，用于确保分包的初始化

### 小程序转插件

#### 1、在项目根目录创建 `plugin.json` 文件

将需要转换为分包的页面填写进去（这里仅举例支付宝小程序的插件配置，微信略有区别，请自行查看各方文档：[支付宝插件](https://opendocs.alipay.com/mini/plugin/plugin-development) 或 [微信插件](https://developers.weixin.qq.com/miniprogram/dev/framework/plugin/development.html)），如:

```json
{
  "publicComponents": {
    "demo-component": "components/demo/index"
  },
  "publicPages": {
    "index-page": "pages/index/index"
  },
  "pages": ["pages/index/index"],
  "main": "index"
}
```

注意：当前需要业务方手动添加该文件，如果需要转换的小程序 `app.json` 存在分包配置，需要将分包中的页面也添加至 `plugin.json` 的 `pages` 中，注意页面路径为`分包名称＋路径`，不要写错，同时插件需要对外开放的页面需要填写到对应的 `publicPages` 中 。

#### 2、在 `mor.config.ts` 文件中增加插件编译配置

```typescript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  // ⭐️⭐️⭐️ 重点看这里：分包编译配置 ⭐️⭐️⭐️
  {
    // 编译名称，可随意修改
    name: 'alipay_plugin',
    // 源码类型, 这里以支付宝小程序 DSL 为例
    sourceType: 'alipay',
    target: 'alipay'
    // 指定编译类型为插件!
    compileType: 'plugin',
    // 插件只能使用 bundle 打包模式
    compileMode: 'bundle',
    // 开启集成模式
    compose: true,
    host: {
      // miniprogram 为本地的小程序宿主
      // 可自行增加最简单的小程序宿主
      // 也可以使用 mor init 在该文件夹下生成
      file: './miniprogram',
      dist: '.'
    }
  },
])
```

完成以上配置后，即可执行对应的插件编译，编译完成后，即可在对应的小程序开发者工具中进行调试。

#### 3、配置 `index.js` 文件

插件可以在 `index.js` 中输出能力，宿主在使用插件运行时插件的时候可以直接通过 `getApp().$plugin.instances.[插件名称]` 来访问到插件输出的能力。

```typescript
import { aPlugin } from '@morjs/core'

class PluginEntry extends aPlugin {
  constructor() {
    // 必须要调用 super
    super({ getApp })
  }

  // 提供了一个方法 x 可以供宿主小程序调用
  x() {
    return 1
  }
}

export default new PluginEntry()
```

#### 4、配置已有的 `app.js` 或使用 `mor.plugin.app.js`

插件工程默认会查找 `mor.plugin.app.js`，如果该文件不存在，则会直接使用 `app.js`，故小程序转插件如无特别需求可以不使用 `mor.plugin.app.js`

如果配置了 `mor.plugin.app.js` 则将使用该文件，并忽略 `app.js`，如果需要两个文件并存，那么可以考虑把公共逻辑抽象到一个单独文件中

```javascript
import { aApp } from '@morjs/core'

// 和普通小程序一样使用 mor 的运行时解决方案和插件
import SolutionStandard from 'mor-runtime-solution-standard'

// 需要加载插件化的运行时解决方案
import SolutionPlugin from 'mor-runtime-solution-plugin'

// 初始化app，里面的实例是 getApp 返回的实例
aApp(
  {
    onLaunch() {
      console.log('plugin app onLaunch')
    },
    onShow() {
      console.log('plugin app onShow')
    },
    onHide() {
      console.log('plugin app onHide')
    }
  },
  [
    SolutionStandard({ exlog: { biz: 'a1.b2' } }),
    // 初始化 插件 solution
    SolutionPlugin({ type: 'plugin' })
  ]
)
```

#### 5、宿主小程序如何对接插件工程？

##### 如果是 MorJS 标准小程序宿主

```javascript
import { aApp } from '@morjs/core'

// 引入插件 Solution
import SolutionPlugin from 'mor-runtime-solution-plugin'

aApp(
  {
    // 业务逻辑代码
    onLaunch(options) {
      // 初始化插件调用
      this.$plugin.init({
        plugins: [
          {
            // 插件名称，同 app.json 里面的插件配置名称一致
            name: 'myPlugin',
            // 如果是动态插件的话，需要传插件 id 和 version
            id: '',
            version: '',
            // 拓展给插件的方法和属性
            extend: {
              shopId: '123',
              login() {
                console.log('call $host login method')
              },
              getUserId() {
                return '456'
              }
            }
          }
        ]
      })
    }
  },
  [
    // 增加 插件初始化 Solution，并设置类型 type 为 host
    SolutionPlugin({ type: 'host' })
  ]
)
```

##### 如果是普通小程序宿主

```javascript
import PluginSDK from 'mor-runtime-plugin-plugin-init/lib/sdk'

App({
  // 业务逻辑代码
  onLaunch(options) {
    // 初始化 SDK
    this.$plugin = new PluginSDK({ $host: this })

    // 初始化插件调用
    this.$plugin.init({
      plugins: [
        {
          // 插件名称，同 app.json 里面的插件配置名称一致
          name: 'myPlugin',
          // 如果是动态插件的话，需要传插件 id 和 version
          id: '',
          version: '',
          // 拓展给插件的方法和属性
          extend: {
            shopId: '123',
            login() {
              console.log('call $host login method')
            },
            getUserId() {
              return '456'
            }
          }
        }
      ]
    })
  }
})
```

#### 6、接入注意事项

1. 小程序转插件的功能和 [MorJS 插件工程](https://yuque.antfin-inc.com/alsc-f2e/mor/plugin-usage) 基本一致，可以点击文档查看具体用法和限制
2. 宿主需要接入插件 SDK 之后，才具备将宿主方法注入到插件的能力

### 插件转分包

#### 1、在项目根目录创建 `subpackage.json` 文件

将插件的 `plugin.json` 转换为分包的配置，如:

```json
{
  "root": "takeout_delicious_food",
  "pages": ["index/index"]
}
```

注意：当前需要业务方手动添加该文件，注意页面路径为`分包名称＋路径`，不要写错。

#### 2、在 `mor.config.ts` 文件中增加分包编译配置

```typescript
{
    // 编译名称，可随意修改
    name: 'wechat_subpackage',
    // 源码类型, 这里以支付宝小程序 DSL 为例
    sourceType: 'alipay',
    target: 'wechat'
    // 指定编译类型为分包!
    compileType: 'subpackage',
    // 分包只能使用 bundle 打包模式
    compileMode: 'bundle',
    // 如果分包需要使用宿主的 npm 依赖，且不希望该依赖参与打包
    // 可以在 externals 中指定 npm 包的名称，在项目中正常引用即可
    // 注意：微信环境下需要自行触发 构建 NPM 操作
    externals: []
  },
```

完成以上配置后，即可执行对应的分包编译，编译完成后，将对应编译产物文件夹直接放到对应的宿主中即可。

### 其他情况

剩余三种形态转换的配置方式由于和上述三种配置方式类似，这里不再赘述：

- **分包转插件：** 可参考 [插件转分包](unity-of-forms#插件转分包)，思路基本一致
- **插件转小程序：** 本质上只需要增加 `app.json` 配置文件，修改或新增一套配置并将 `compileType` 指定为 `miniprogram` 即可
- **分包转小程序：** 本质上只需要增加 `app.json` 配置文件，修改或新增一套配置并将 `compileType` 指定为 `miniprogram` 即可
