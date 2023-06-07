# 微信 DSL 多端兼容性

本文主要介绍微信 DSL 在多端兼容性方面的差异，微信转抖音、百度等小程序差异较小，多端适配问题较少，转支付宝等小程序注意事项可参考以下内容，具体详情可查询各小程序平台官网文档，转 Web 主要关注对于 JSAPI 和组件转端两方面的支持情况，除此之外，MorJS 提供了代码维度和文件维度两种条件编译能力，便于使用者按需解决多端代码适配问题。

## 转支付宝

因阿里系（支付宝、淘宝、钉钉…）小程序之间差异较小，这里以支付宝小程序为例，其他端可酌情参考。

### WXML 中避免使用不支持的组件

微信小程序 DSL 中尽可能使用 [官方标准组件](https://developers.weixin.qq.com/miniprogram/dev/component/) 进行业务开发，不要使用类似 `i` `span` `img` `h2` `strong` `em` `a` 等官方未提及的元素，当需要显示相关视图时，可以参考如下方式：

- 用 [view](https://developers.weixin.qq.com/miniprogram/dev/component/view.html) 来代替 `label` 的使用，支付宝的 `label` 不支持 `tap` 事件；
- 用 [view](https://developers.weixin.qq.com/miniprogram/dev/component/view.html) 来代替 `h2` `strong` `em` 等元素的使用；
- 用 [image](https://developers.weixin.qq.com/miniprogram/dev/component/image.html) 代替 `img` 的使用；
- 用 [text](https://developers.weixin.qq.com/miniprogram/dev/component/text.html) 代替 `span` 的使用；

### 开启 component2 配置

在 `MorJS` 转端实现中，部分运行时接口抹平方式依赖开启 `component2` 和 `enableAppxNg` 所提供的能力，开发者可以从以下两个方式中任选一种进行开启：

- 在支付宝 IDE 中，点击 详情 => 项目配置，勾选【启用小程序基础库 2.0 构建】和【启用 component2】
- 在小程序项目目录的 mini.project.json 文件（若无则可以新建）下，配置 `component2` 和 `enableAppxNg`

```json
{
  "component2": true,
  "enableAppxNg": true
}
```

### 使用较新的基础库版本

推荐使用较新的支付宝基础库，当基础库版本较低时，个别功能可能会出现一定程度的差异，包括但不限于以下：

- 基础库版本小于 `2.8.5` 时，自定义组件的 `lifetimes` 节点树生命周期采用 MorJS 的自实现，且不支持 `moved` 生命周期方法
- 基础库版本小于 `2.8.5` 时，不支持使用自定义组件的 `relations` 来建立组件关系
- 基础库版本小于 `2.8.1` 时，自定义组件的 `observers` 数据变化观测器采用 MorJS 的自实现而非支付宝提供的官方能力
- 基础库版本小于 `2.8.0` 时，自定义组件的 `$selectComponent` 和 `selectAllComponents` 采用 MorJS 的自实现而非支付宝提供官方能力
- 基础库版本小于 `2.7.22` 时，自定义组件的 `selectOwnerComponent` 采用 MorJS 的自实现而非支付宝提供官方能力

### ESModule 和 CommonJS 语法

MorJS 虽然不限制模块的具体写法，但是项目中尽可能不要出现 ESModule 和 CommonJS 混用的情况，推荐全部使用 ESModule 或全部使用 CommonJS 来编写代码，两者混用可能会在产物生成时出现预期之外的问题。

```typescript
/* ESModule 的使用 */
export const obj = { name: 'E1e' } // 导出 export
export default { name: 'E1e' } // 默认导出

import { obj } from './utils.js' // 引入 import

/* CommonJS 的使用 */
const obj = { a: 1 }
module.exports = obj // 导出

const obj = require('./utils.js') // 引入
```

### 不同的样式隔离支持

如遇到转端编译后的产物在不同小程序端样式紊乱，可能是微信和支付宝对样式隔离的支持和默认值不同导致的。

- 微信支持 6 种样式隔离的配置方式，默认值为：`isolated`，这代表默认情况下自定义组件间的样式互不影响；
- 支付宝支持 2 种样式隔离的配置方式，默认值为：`shared`，代表默认情况下支付宝小程序组件和页面的样式是相互影响的，容易造成样式冲突；

推荐开发者在最初开发时针对不同的页面模块使用不同的 `class` 命名处理样式隔离，对于已有的小程序工程，在基于支付宝基础库 2.7.2 及以上版本时，可以尝试在自定义组件的 JSON 文件中配置 `"styleIsolation": "apply-shared"`，避免页面的样式影响到外部。

参考文档：[《微信样式隔离》](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#%E7%BB%84%E4%BB%B6%E6%A0%B7%E5%BC%8F%E9%9A%94%E7%A6%BB) [《支付宝样式隔离》](https://opendocs.alipay.com/mini/framework/page-acss#%E9%A1%B5%E9%9D%A2%E6%A0%B7%E5%BC%8F%E9%9A%94%E7%A6%BB)

## 转 Web

转 Web 主要关注对于 JSAPI 和组件转端两方面的支持情况。

### JSAPI 差异

使用小程序 DSL 转 Web 能力时，需要关注一下所使用的 API 具体的支持情况，MorJS 目前已完成 92 个 JSAPI 在转 Web 端的兼容，覆盖了大部分常用的业务功能。

如遇到还未支持的 API，可在社区服务群（钉钉群号 `29445021084`）提出，开发同学将按照优先级排期兼容。

参考文档：[《MorJS | Web 开发 - API 支持情况》](https://mor.eleme.io/web/basic/support)

### 组件差异

目前 MorJS 支持 32 个组件在转 Web 端的兼容，同时支持自定义组件替换能力。

## 条件编译

MorJS 提供了代码维度和文件维度两种能力的条件编译，便于使用者按需解决多端代码适配问题。

### 代码维度条件编译

对于代码转端中有适配差异难题，或期望能够根据当前环境和配置的变量，来构建输出不同的代码的，可以使用代码维度的条件编译，该能力主要根据注释来实现条件编译，编译后会把符合条件的代码直接清空。

```xml
<!-- #ifdef wechat -->
<view>只会在微信上显示</view>
<!-- #endif -->

<!-- #ifdef alipay -->
<view>只会在支付宝上显示</view>
<!-- #endif -->
```

```typescript
/* #ifdef wechat */
console.log('这句话只会在微信上显示')
/* #endif */

/* #ifndef wechat */
console.log('除了在微信以外的端都展示')
/* #endif */
```

参考文档：[《MorJS | 条件编译 - 代码维度》](https://mor.eleme.io/guides/conditional-compile/code-level)

### 文件维度条件编译

对于不同端的业务需求，若存在大量的差异性代码，除了使用代码维度的条件编译外，MorJS 还提供了文件维度的条件编译，支持绝大多数的文件类型，以各端特殊后缀为编译条件，编译时根据端区分不同的文件后缀，优先使用对应端的源文件。

参考文档：[《MorJS | 条件编译 - 代码维度》](https://mor.eleme.io/guides/conditional-compile/file-level)
