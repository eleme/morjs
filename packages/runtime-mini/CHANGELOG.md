# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.114-beta.16](https://github.com/eleme/morjs/compare/v1.0.114-beta.15...v1.0.114-beta.16) (2025-02-21)


### Bug Fixes

* componentToAlipay props setData ([7f18c85](https://github.com/eleme/morjs/commit/7f18c859a545287e6f81354b507a10027eddaaf6))
* not firstDeriveWithObserversSupported nextProps cloneDeep ([87ff4c4](https://github.com/eleme/morjs/commit/87ff4c4931b1eed53df11df794e1d243272a869f))





## [1.0.114-beta.0](https://github.com/eleme/morjs/compare/v1.0.113...v1.0.114-beta.0) (2024-07-24)

**Note:** Version bump only for package @morjs/runtime-mini





## [1.0.113](https://github.com/eleme/morjs/compare/v1.0.112...v1.0.113) (2024-05-21)


### Bug Fixes

* **runtime-mini:** 支付宝转微信类场景移除 saveImageToPhotosAlbum => saveImage 转换 ([7a00597](https://github.com/eleme/morjs/commit/7a0059702bd424ecde2abaf0e960bbc8a1d84fe7))





## [1.0.106](https://github.com/eleme/morjs/compare/v1.0.105...v1.0.106) (2024-04-03)


### Features

* **runtime-mini:** 解除 getTabBar 方法的不支持标记 ([d8b9059](https://github.com/eleme/morjs/commit/d8b905983b35ae2480d89c15a6eb469e65a69555))





## [1.0.95](https://github.com/eleme/morjs/compare/v1.0.95-beta.1...v1.0.95) (2024-01-16)

**Note:** Version bump only for package @morjs/runtime-mini





## [1.0.95-beta.1](https://github.com/eleme/morjs/compare/v1.0.95-beta.0...v1.0.95-beta.1) (2024-01-15)


### Features

* **runtime-mini:** observer 执行时机由首次每次必执行改成数据相比于默认值发生变化时才执行 ([50c9e07](https://github.com/eleme/morjs/commit/50c9e0766018c33244d2e5ba748cdba829b8b85e))



## [1.0.95-beta.0](https://github.com/eleme/morjs/compare/v1.0.94...v1.0.95-beta.0) (2024-01-15)


### Features

* **runtime-mini:** 修复微信转支付宝 observer和created触发时序问题 & 修复组件调用batchedUpdates报错问题 ([8dad870](https://github.com/eleme/morjs/commit/8dad8706cf88cc62b129e4db3baadfeca33eb607))





## [1.0.85](https://github.com/eleme/morjs/compare/v1.0.84...v1.0.85) (2023-11-06)


### Bug Fixes

* **runtime-mini:** 支持 catch 前缀回调 ([1d716af](https://github.com/eleme/morjs/commit/1d716af309e8ca958d0e6e589866d90d00903332))





## [1.0.82](https://github.com/eleme/morjs/compare/v1.0.81...v1.0.82) (2023-09-08)


### Bug Fixes

* **runtime-mini:** 添加微信转其他端 jsapi nextTick 的兼容支持 ([3e4cb91](https://github.com/eleme/morjs/commit/3e4cb9120baf398838fc8c4165d0ce7e37661f67))





## [1.0.79](https://github.com/eleme/morjs/compare/v1.0.78...v1.0.79) (2023-08-28)


### Bug Fixes

* 修复未经 promisify 处理，导致的 api 空指针报错问题 ([#102](https://github.com/eleme/morjs/issues/102)) ([f4f8cae](https://github.com/eleme/morjs/commit/f4f8cae236c72ffb7178b19056c204f6bf6508e0))





## [1.0.71](https://github.com/eleme/morjs/compare/v1.0.70...v1.0.71) (2023-07-26)


### Features

* **runtime-web:** this.createSelectorQuery 用法支持 ([94abb99](https://github.com/eleme/morjs/commit/94abb9903a545e5f4f848ede0453e26da93637c7))





## [1.0.70](https://github.com/eleme/morjs/compare/v1.0.69...v1.0.70) (2023-07-19)


### Bug Fixes

* **runtime-mini:** 修复组件初始化时，property 中的 observer 可能会不触发的问题 ([#84](https://github.com/eleme/morjs/issues/84)) ([f107657](https://github.com/eleme/morjs/commit/f107657fa20df7c996e0791cce9dff5bf78fc7d1))





## [1.0.69](https://github.com/eleme/morjs/compare/v1.0.68...v1.0.69) (2023-07-17)

**Note:** Version bump only for package @morjs/runtime-mini





## [1.0.68](https://github.com/eleme/morjs/compare/v1.0.67...v1.0.68) (2023-07-14)

**Note:** Version bump only for package @morjs/runtime-mini





## [1.0.54](https://github.com/eleme/morjs/compare/v1.0.53...v1.0.54) (2023-06-09)


### Bug Fixes

* **runtime-mini:** 修复微信转支付宝小程序后组件在 created 阶段无法从 data 中获取 properties 值的问题 ([#58](https://github.com/eleme/morjs/issues/58)) ([07f7ff9](https://github.com/eleme/morjs/commit/07f7ff9d0cf8afc5fa5df6511f7467497a6522cf))





## [1.0.53](https://github.com/eleme/morjs/compare/v1.0.52...v1.0.53) (2023-06-07)

**Note:** Version bump only for package @morjs/runtime-mini





## [1.0.51](https://github.com/eleme/morjs/compare/v1.0.50...v1.0.51) (2023-06-02)


### Features

* **runtime-mini:** 增加字节小程序及快手小程序运行时双向绑定支持 ([653767f](https://github.com/eleme/morjs/commit/653767f44d954fedfd435cbc4a86889e310d1e30))





## [1.0.49](https://github.com/eleme/morjs/compare/v1.0.48...v1.0.49) (2023-05-30)

**Note:** Version bump only for package @morjs/runtime-mini





## [1.0.48](https://github.com/eleme/morjs/compare/v1.0.47...v1.0.48) (2023-05-23)


### Bug Fixes

* **runtime-mini:** 修改生命周期执行顺序，修复微信 DSL 首次传入 props 未执行 observer 的问题 ([#44](https://github.com/eleme/morjs/issues/44)) ([3ee2f9a](https://github.com/eleme/morjs/commit/3ee2f9ac1588e8bce0078bde9b2d56b61e3767f1))





## [1.0.46](https://github.com/eleme/morjs/compare/v1.0.45...v1.0.46) (2023-05-19)


### Features

* **runtime-mini:** 对齐最新 lifetimes 的官方功能，优先使用官方提供的 lifetimes 方法，兜底使用 mor 的自实现 ([#38](https://github.com/eleme/morjs/issues/38)) ([0044d4a](https://github.com/eleme/morjs/commit/0044d4a8cc86fc619c505f664d098c033fb7d8a7))





## [1.0.42](https://github.com/eleme/morjs/compare/v1.0.41...v1.0.42) (2023-05-05)


### Features

* **runtime-mini:** 添加 triggerEvent 方法对 bind:abc-def 的支持 ([843435e](https://github.com/eleme/morjs/commit/843435e733dd4ca2b4c4be9e3dffcd3fab2d475f))





## [1.0.39](https://github.com/eleme/morjs/compare/v1.0.38...v1.0.39) (2023-04-26)


### Bug Fixes

* **runtime-mini:** 修复判断 relations 和 externalClasses 参数错误 ([c176e94](https://github.com/eleme/morjs/commit/c176e9426e5cfa64aa5484ebdac7a54fdb690e6d))


### Features

* **runtime-mini:** 增加微信转支付宝外部样式类支持 ([d9202e6](https://github.com/eleme/morjs/commit/d9202e645e4d7f7da5936e039259f4cd33a5ddd6))





## [1.0.37](https://github.com/eleme/morjs/compare/v1.0.36...v1.0.37) (2023-04-26)


### Features

* **runtime-mini:** 完善 selectComponent、selectAllComponents、selectOwnerComponent 组件或页面示例方法支持 ([dd809eb](https://github.com/eleme/morjs/commit/dd809ebb17f6b37bd1d038feb30acf47779fa773))
* **runtime-mini:** 增加微信转支付宝 relations 支持 ([66f8dc0](https://github.com/eleme/morjs/commit/66f8dc081abecd882e81f756fbf7f4aa51bf19a9))





## [1.0.36](https://github.com/eleme/morjs/compare/v1.0.35...v1.0.36) (2023-04-26)


### Bug Fixes

* **runtime-mini:** 优化属性监听器执行时机，仅在变更时执行 ([3d0348c](https://github.com/eleme/morjs/commit/3d0348ce8f20633fab9acc57b20a3d16f1fba19f))





## [1.0.35](https://github.com/eleme/morjs/compare/v1.0.34...v1.0.35) (2023-04-26)


### Bug Fixes

* **runtime-mini:** 修复微信转支付宝的 observer 触发多个 props 问题 ([#27](https://github.com/eleme/morjs/issues/27)) ([8e9b528](https://github.com/eleme/morjs/commit/8e9b5285bd133b91f80341e4f17d5d233d1916f1))


### Features

* **runtime-mini:** 优化 observers 在支付宝端的兼容支持 ([b610e3f](https://github.com/eleme/morjs/commit/b610e3f4d1746a105ee0ca07e5ffc853b2d6947e))





## [1.0.34](https://github.com/eleme/morjs/compare/v1.0.33...v1.0.34) (2023-04-25)

**Note:** Version bump only for package @morjs/runtime-mini





## [1.0.33](https://github.com/eleme/morjs/compare/v1.0.32...v1.0.33) (2023-04-25)


### Features

* **runtime-mini:** 增加微信转支付宝的 getSystemInfo、getSystemInfoSync、getSystemInfoAsync 等接口抹平支持 ([431f7e9](https://github.com/eleme/morjs/commit/431f7e92d1ffeb2b26f519c9729aab3fd7c9b6eb))





## [1.0.27](https://github.com/eleme/morjs/compare/v1.0.26...v1.0.27) (2023-04-19)


### Bug Fixes

* spell error ([b8d5c4c](https://github.com/eleme/morjs/commit/b8d5c4c9158260e90273b25891761ddb61207bf7))


### Features

* 添加蓝牙转换方法 ([fd6fcc4](https://github.com/eleme/morjs/commit/fd6fcc461bc32ec5cb89cfb3444728c2e6774189))
* **runtime-mini:** 支付宝&微信蓝牙方法交叉兼容 ([20251dc](https://github.com/eleme/morjs/commit/20251dc1d268b84f9ed1724c2bd6c97ae4b55685))
* **runtime-mini:** openBluetoothAdapter 返回值兼容 ([f38c46e](https://github.com/eleme/morjs/commit/f38c46ed411abf38e19aa9206f33592ce7a29ea4))





## [1.0.26](https://github.com/eleme/morjs/compare/v1.0.25...v1.0.26) (2023-04-18)

**Note:** Version bump only for package @morjs/runtime-mini





## [1.0.22](https://github.com/eleme/morjs/compare/v1.0.21...v1.0.22) (2023-04-13)


### Bug Fixes

* **runtime-mini:** 修复微信转支付宝部分 Api 无法调用的问题 ([#12](https://github.com/eleme/morjs/issues/12)) ([b824c33](https://github.com/eleme/morjs/commit/b824c3332b3d716beabf51013848f723b73a5b7b))





## [1.0.21](https://github.com/eleme/morjs/compare/v1.0.20...v1.0.21) (2023-04-13)


### Bug Fixes

* **runtime-mini:** 修复支付宝转其他端时 created 生命周期未触发的问题 ([d03262c](https://github.com/eleme/morjs/commit/d03262cb3c768064144d3c661174163bf03fe897))





## [1.0.16](https://github.com/eleme/morjs/compare/v1.0.15...v1.0.16) (2023-03-29)


### Features

* **runtime-mini:** 修复微信转支付宝 data 更新未触发 observers 的问题 ([#9](https://github.com/eleme/morjs/issues/9)) ([8b8ac97](https://github.com/eleme/morjs/commit/8b8ac97ce378273a9f23b807d025c34b39474cc0))





## [1.0.6](https://github.com/eleme/morjs/compare/v1.0.5...v1.0.6) (2023-03-10)


### Bug Fixes

* **runtime-mini:** replace @morjs/api with @morjs/runtime-base to avoid cycle references ([84b4a0c](https://github.com/eleme/morjs/commit/84b4a0cef834e8bfabad4e2821b3f6414dd89ab9))





## [1.0.4](https://github.com/eleme/morjs/compare/v1.0.3...v1.0.4) (2023-03-09)


### Bug Fixes

* **runtime-mini:** fix wechat npm build support ([096fb7c](https://github.com/eleme/morjs/commit/096fb7ce31547c71eac1e2c2f316a9f438c7da52))





# 1.0.0 (2023-02-22)

**Note:** Version bump only for package @morjs/runtime-mini
