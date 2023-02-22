# 路由设置

`MorJS` 将小程序 `page/component` 转化成 `react component`，需要一套 `SPA` 路由解决方案，管理页面切换，页面的切换其实就是不同组件的切换。

## 配置路由

> 在按照`MorJS`快速上手 接入项目后，可以在 `app.json` 中配置 `router` 字段。

例如：

```json
"router": {
   "mode": "browser",
   "baseName": "/mor",
    "customRoutes": {
      "/pages/index/index": "/index"
    }
 }
```

## 参数介绍

### mode

- 可选值：`hash | browser`
- 默认值： `browser`
- 介绍: 路由模式切换

示例：

```json
// app.json
"router": {
    "mode": "browser",
    ....
 }
```

地址栏分别展示为：

- `https://{{domain}}/#/pages/index/index`（`hash` 模式）
- `https://{{domain}}/pages/index/index`（`browser` 模式）

### baseName

- 默认值：''
- 介绍：路由基础路径

示例：

```json
// app.json
"router": {
    "baseName": "/mor",
    ....
 }
```

地址栏分别展示为:

- `https://{{domain}}/#/mor/pages/index/index`（`hash` 模式）
- `https://{{domain}}/mor/pages/index/index`（`browser` 模式）

### customRoutes

- 默认值：`{}`
- 介绍：自定义路由

示例：

```javascript
// app.json
"router": {
  "customRoutes": {
    "/pages/index/index": "/index"
  }
 }
```

根据配置，调用 `my.navigateTo({ url: '/pages/index.index'})` 后，

地址栏分别展示为:

- `https://{{domain}}/#/index`（`hash` 模式）
- `https://{{domain}}/index`（`browser` 模式）

## 路由 API

目前支付宝小程序页面路由相关方法均已实现，包括:

- `navigateTo`
- `redirectTo`
- `relaunch`
- `switchTab`
- `navigateBack`
- `getCurrentPages`
