# 自定义 Api 全局变量名称

## 背景

默认情况下，`MorJS` 会将提供的 `api` 挂载到 `window.my` 上，这样做的话，业务 `js` 文件里写的 `my.*` 就可以直接使用。

在某些场景下，业务希望能够自定义挂载 `api` 的名称，比如有些业务中使用的工具库，直接通过 `typeof my === 'object'` 判断是否在小程序，如果是就直接走小程序相关的逻辑，导致业务出现异常。

## 使用方式

在 `mor.config` 中对 `web` 配置项进行修改，如 👇🏻:

```js
// ... 省略
 {
    name: 'web',
    sourceType: 'alipay',
    target: 'web',
    compileType: 'miniprogram',
    compileMode: 'bundle',
    web: {},
    globalObject: 'customMy', // 通过这个配置项自定义 api 的挂载名称
 }
```

按照上述配置完成之后，在页面控制台打印 `window.customMy` 就可以看到挂载的 `api` 详情了。

## 原理

在编译时读取业务配置的 `globalObject` 的值，如果接收到页面自定义的值，在编译层做两件事(以 `globalObject` 设置为 `customMy` 为例)：

1. 将 `.js` 文件中的 `my.*` 调用更改成 `customMy.*`
2. 给 `window.$MOR_GLOBAL_OBJECT` 赋值为 `customMy`，以供 `runtime` 模块消费。

运行时只需要做一件事：读取 `window.$MOR_GLOBAL_OBJECT` 的值，拿到值后将所有 `api` 挂载到 `window.[window.$MOR_GLOBAL_OBJECT]`。（如果 `window.$MOR_GLOBAL_OBJECT` 没有值，默认会挂在 `my` 上 ）
