# 条件编译 (文件维度)

对于存在业务上如果在端上有大量的端上的差异性代码的话，除了用[代码维度的条件编译](/guides/conditional-compile/code-level)外，还可以采用文件维度的条件编译。

## 注意事项

条件编译的维度是**项目源代码的维度，不会对 npm 库生效**。npm 库需要在输出的时候就需要做好各端文件的输出，具体可以参考

- [JS 依赖库规范](/specifications/js.md)
- [组件库规范](/specifications/component.md)

## 目前支持的文件类型

- 各端样式文件: `.wxss` 或 `.acss` 或 `.css` 或 `.qss` 等
- 各端模版文件: `.wxml` 或 `.axml` 或 `.swan` 或 `.qml` 或 `ksml` 等
- 各端脚本文件: `.js` 或 `.ts`
- 各端配置文件: `.json` 或 `.jsonc` 或 `.json5`

## 各端特殊后缀列表

以下以`index.js`文件示例，其他文件一样的规则, 各端默认配置如下

- 微信小程序 (`.wx`): `index.wx.js`
- 支付宝小程序 (`.my`): `index.my.js`
- 百度小程序 (`.bd`): `index.bd.js`
- QQ 小程序 (`.qq`): `index.qq.js`
- 字节小程序 (`.tt`): `index.tt.js`
- 快手小程序 (`.ks`): `index.ks.js`
- 钉钉小程序 (`.dd`): `index.dd.js`
- 淘宝小程序 (`.tb`): `index.tb.js`
- Web 应用 (`.web`): `index.web.js`

### `mor.config.ts` 配置示例

```javascript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'alipay',
    conditionalCompile: {
      // fileExt 支持配置配置单个或多个, 如 { fileExt: '.my' } 或 { fileExt: ['.my', '.share'] }
      // 如配置为多个, 则文件寻址及解析的优先级以实际配置的先后顺序为准
      // 以 { fileExt: ['.my', '.share'] } 为例
      // 优先查找 xxxx.my.xx, 如无则查找 xxxx.share.xx, 如无则查找 xxxx.xx 文件
      fileExt: '.my'
    }
  },
  {
    name: 'wechat',
    conditionalCompile: {
      fileExt: '.wx'
    }
  }
])
```

## 实现效果

文件默认输出就是（支付宝）小程序的版本，因此条件编译主要是针对域外的小程序（如：微信小程序）

如：自定义组件（页面也是如此）需要做两端的区分
页面引用该组件的代码：

```javascript
{
  "usingComponents": {
    "demo": "../../components/demo/index"
  }
}
```

默认情况下，组件都包含了`axml`/`acss`/`js`/`json`四个文件

```bash
- components
  - demo
    - index.axml
    - index.acss
    - index.js
    - index.json
```

由于在微信小程序下。逻辑差异较大。可以直接用`.wx`来做区分

```bash
- components
  - demo
    - index.axml（支付宝版本）
    - index.acss（支付宝版本）
    - index.js（支付宝版本）
    - index.json
    - index.wx.axml（微信版本）
    - index.wx.acss（微信版本）
    - index.wx.js（微信版本）
```

在 MorJS 编译输出的时候，在输出目录下`_wechat`，会优先用`.wx`的版本来生成对应的微信版本源文件

```bash
- _wechat
  - components
    - demo
      - index.wxml
      - index.wxss
      - index.js
      - index.json
```

而在`Page`的`json`中的`usingComponents`是不需要做任何修改的，依然保留原本的引用路径即可。

## js 引用说明

比方说在`pages/index/index`中，你希望区分引入不同的`util.js`也是能够支持的

```bash
- pages
  - index
    - index.axml
    - index.acss
    - index.js
    - index.json
    - util.js（支付宝版本）
    - util.wx.js（微信版本）
```

在`pages/index/index.js`文件中，`import`语句并不需要做文件引用的区分，统一用文件前缀即可。MorJS 会按照文件后缀的优先级来实现不同文件的加载

微信小程序下生效的是`util.wx.js`，支付宝小程序下生效的是`util.js`

```javascript
import { createPage } from '@morjs/core'
import { log } from './util'

createPage({
  onLoad() {
    log()
  }
})
```
