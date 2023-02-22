# MorJS 如何工作?

## 架构概览

- **灵活的插件架构**
  - 支持命令行、编译流程、编译平台扩展、集成流程、用户配置文件等各个方面的定制
- **微信、支付宝双 DSL 支持**
  - 域外多以 微信小程序 DSL 为准，域内多以支付宝小程序 DSL 为准，而 MorJS 两者都支持
- **开箱即用的转端能力**
  - 无需借助任何外部依赖，即可完成微信小程序和支付宝小程序转其他端
- **极致的性能和研发体验**
  - 从日志输出到缓存利用，从配置兼容到构建提示，从编译压缩到分包优化，始终以提升开发者体验为第一原则
- **更加健壮的组件研发规范**
  - 不论是已有的多端组件规范，还是 npm 依赖，亦或是微信小程序的 npm 组件规范，通通支持
- **适配大中小不同类型的小程序项目**
  - 小项目只需编译能力，中等项目结合编译和页面注入能力，而大项目可使用复杂小程序集成能力

<img src="https://img.alicdn.com/imgextra/i1/O1CN01fb5HEq1qNipyFSbaf_!!6000000005484-2-tps-2406-1706.png" width="1200" />

## 静态编译原理

<img src="https://img.alicdn.com/imgextra/i1/O1CN01L57dw41G6w9fB4YGe_!!6000000000574-2-tps-2582-1336.png" width="1200" />

静态编译转换主要用于处理 `JS`、`WXS/SJS`、`WXML/AXML`、`WXSS/ACSS`、`JSON` 等源码中约束强且不能动态修改的部分，如：

- **模块引用：** `JS`/`WXS`/`SJS`/`WXML`/`AXML`/`WXSS`/`ACSS`/`JSON` 等源码中的模块引用替换和后缀名修改；
- **模版属性映射或语法兼容：** `AXML`/`WXML` 中如
  - `a:if` ➙ `wx:if`
  - `onTap` ➙ `bind:tap`
  - `` {{`${name}Props`}} `` ➙ `{{name + 'Props'}}` 等；
- **配置映射：** 如页面配置
  - `{ "titleBarColor": "#000000" }` ➙ `{ "navigationBarBackgroundColor: "#000000", "navigationBarTextStyle": "white" }` 等

等，通过静态编译环节去抹平差异性处理。

## 运行时补偿原理

<img src="https://img.alicdn.com/imgextra/i4/O1CN01VnYRen1NTZ2DQnoIz_!!6000000001571-2-tps-5679-2088.png" width="1200" />

运行时补偿主要用于处理静态编译无法处理的一些运行时动态内容，如：

- **JSAPI：** 实际业务使用上，不管是 `JSAPI` 的名字还是 `JSAPI` 的入参都会存在动态赋值的情况，导致了在 `JSAPI` 的真实调用上，很难通过 `AST` 去解析出实际传参；
- **自定义组件 - Props 属性：** 支付宝属性使用 props 声明，而微信属性使用 properties 声明，配置方式不同且使用时分别使用 `this.props.x`及 `this.properties.x`的方式获取，同时可能存在动态取值的情况；
- **自定义组件 - 生命周期：** 支付宝小程序中的`didUpdate`生命周期，在触发了`props`和`data`更新后都会进入`didUpdate`这个生命周期，且能够在`didUpdate`中访问到`prevProps` / `prevData`，而在微信小程序中静态转义出这个生命周期就意味着你需要去动态分析出`didUpdate`里面要用到的所有属性，然后去动态生成出这些属性的监听函数。这显然可靠程度是极其低的；

等（这里不再一一列举）。

## 功能定制

业务可基于自身业务诉求来定制 **工程插件** 或 **运行时插件/解决方案**。

### 工程能力定制

<img src="https://img.alicdn.com/imgextra/i4/O1CN01PEzcAh1sy1ShieQLG_!!6000000005834-2-tps-4020-2493.png" width="1200" />

### 运行时能力定制

<img src="https://img.alicdn.com/imgextra/i1/O1CN01WFfxj41Q9MPRRThMi_!!6000000001933-2-tps-4020-2022.png" width="1200" />
