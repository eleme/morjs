# Tabbar IOS 小黑条适配开关

## 简介

`MorJS` 默认提供的 `tabbar` 已经存在了 `iphone` 小黑条的兼容，不需要做特殊的关注。通过浏览器控制台调试可以看到，`MorJS` 给 `tiga-tabbar-item` 设置了如下样式：

```css
:host {
  padding-bottom: calc(8px + constant(safe-area-inset-bottom));
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}
```

## 背景

某些容器内嵌时默认提供了小黑条适配逻辑，例如钉钉。这个时候会导致整个页面会被向上推 `2 * safe-area-inset-bottom` 的距离，所以业务侧希望存在一个开关控制 `MorJS` 提供的小黑条适配功能。

## 如何使用

在 `app.json` 配置 `tabbar` 的地方增加 `disableSafeAreaPaddingUARegex` 字段，支持 `Array<String> 和 String` 类型传值。这里传入需要屏蔽的容器的 `UserAgent` 关键字即可。

比如钉钉浏览器内，我们指定 `DingTalk` 即可，因为其完整 `UA` 如下，通过该值就可以判定为钉钉内嵌场景：

```
Mozilla/5.0 (Linux; U; Android 12; zh-CN; M2102J2SC Build/SKQ1.211006.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/69.0.3497.100 UWS/3.22.1.210 Mobile Safari/537.36 AliApp(DingTalk/6.5.20) com.alibaba.android.rimet/24646881 Channel/700159 language/zh-CN abi/64 UT4Aplus/0.2.25 colorScheme/light
```

完整的配置参考如下 👇🏻：

```
  "tabBar": {
    "textColor": "#dddddd",
    "selectedColor": "#49a9ee",
    "backgroundColor": "#ffffff",
    // "disableSafeAreaPaddingUARegex": ["DingTalk", "Alipay"], // Array<String> 传值
    "disableSafeAreaPaddingUARegex": "DingTalk, // String 传值
    "items": [
      {
        "pagePath": "pages/index/index",
        "name": "首页"
      },
      {
        "pagePath": "pages/map/index",
        "name": "日志"
      }
    ]
  },
```
