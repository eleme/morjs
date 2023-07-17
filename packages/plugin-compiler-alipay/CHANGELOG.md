# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.69](https://github.com/eleme/morjs/compare/v1.0.68...v1.0.69) (2023-07-17)


### Bug Fixes

* **plugin-compiler-alipay:** 修复 sjs 文件模块变量 this 名称替换可能会漏掉的问题 ([ed6046f](https://github.com/eleme/morjs/commit/ed6046fd73fa9eaceaf1e0bf00ca8ccd1934c7b6))
* **plugin-compiler-alipay:** 修复微信转支付宝分包配置可能会引发报错的问题 ([63522f9](https://github.com/eleme/morjs/commit/63522f9c0f93419313162023823d4e1a2d2bfcc0))


### Features

* **plugin-compiler-web:** 移除 slot 组件对 class, style 属性的解析以及完善节点返回值校验 ([#79](https://github.com/eleme/morjs/issues/79)) ([fcca600](https://github.com/eleme/morjs/commit/fcca60068edc7e50787e5f36eac328b6e48ee4bd))





## [1.0.68](https://github.com/eleme/morjs/compare/v1.0.67...v1.0.68) (2023-07-14)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.59](https://github.com/eleme/morjs/compare/v1.0.58...v1.0.59) (2023-06-25)


### Bug Fixes

* **plugin-compiler-alipay:** 修复 sjs 辅助文件某些情况下可能被注入多次的问题 ([7781f72](https://github.com/eleme/morjs/commit/7781f725fa9f842785d1d738cd83ae68025fd75b))
* **plugin-compiler-alipay:** 优化 sjs 辅助函数注入检查逻辑 ([cb9eb35](https://github.com/eleme/morjs/commit/cb9eb356ff603566bb1bb17f531b53d60bea91f8))





## [1.0.58](https://github.com/eleme/morjs/compare/v1.0.57...v1.0.58) (2023-06-21)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.57](https://github.com/eleme/morjs/compare/v1.0.56...v1.0.57) (2023-06-21)


### Features

* **plugin-compiler-alipay:** 优化 sjs 帮助文件的名称生成逻辑 ([30395bb](https://github.com/eleme/morjs/commit/30395bb32d919abf09eeffb0a0fbfd89f317e48d))





## [1.0.55](https://github.com/eleme/morjs/compare/v1.0.54...v1.0.55) (2023-06-13)


### Features

* **plugin-compiler-alipay:** 完善支付宝转微信 sjs 中 export default function xxx(){} 的转换支持 ([f907bb2](https://github.com/eleme/morjs/commit/f907bb2333b46a4a03e0b1d926f8bd4491aed198))
* **plugin-compiler-alipay:** 完善支付宝转微信不兼容选择器提示信息 ([eacdf5e](https://github.com/eleme/morjs/commit/eacdf5e60898e2ad30533c1407d81c2eca0202b0))
* **plugin-compiler-alipay:** 完善支付宝转微信时模版中对部分方法调用的支持 ([4780b28](https://github.com/eleme/morjs/commit/4780b28140551e0ae5b1d3cfe4e4b139928bb59c))





## [1.0.54](https://github.com/eleme/morjs/compare/v1.0.53...v1.0.54) (2023-06-09)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.53](https://github.com/eleme/morjs/compare/v1.0.52...v1.0.53) (2023-06-07)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.51](https://github.com/eleme/morjs/compare/v1.0.50...v1.0.51) (2023-06-02)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.50](https://github.com/eleme/morjs/compare/v1.0.49...v1.0.50) (2023-05-31)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.49](https://github.com/eleme/morjs/compare/v1.0.48...v1.0.49) (2023-05-30)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.48](https://github.com/eleme/morjs/compare/v1.0.47...v1.0.48) (2023-05-23)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.46](https://github.com/eleme/morjs/compare/v1.0.45...v1.0.46) (2023-05-19)


### Features

* **runtime-mini:** 对齐最新 lifetimes 的官方功能，优先使用官方提供的 lifetimes 方法，兜底使用 mor 的自实现 ([#38](https://github.com/eleme/morjs/issues/38)) ([0044d4a](https://github.com/eleme/morjs/commit/0044d4a8cc86fc619c505f664d098c033fb7d8a7))





## [1.0.42](https://github.com/eleme/morjs/compare/v1.0.41...v1.0.42) (2023-05-05)


### Features

* **plugin-compiler-alipay:** 添加对 bind:abc-def 事件写法的支持 ([c533d92](https://github.com/eleme/morjs/commit/c533d92e669cb0dcd84598ade3a64e4574a85f77))





## [1.0.39](https://github.com/eleme/morjs/compare/v1.0.38...v1.0.39) (2023-04-26)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.38](https://github.com/eleme/morjs/compare/v1.0.37...v1.0.38) (2023-04-26)


### Bug Fixes

* **plugin-compiler-alipay:** 修复微信转支付宝对分包配置的兼容 ([17eb4da](https://github.com/eleme/morjs/commit/17eb4da82182616b2e42c825c3813fdb86889c56))





## [1.0.37](https://github.com/eleme/morjs/compare/v1.0.36...v1.0.37) (2023-04-26)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.36](https://github.com/eleme/morjs/compare/v1.0.35...v1.0.36) (2023-04-26)


### Features

* **plugin-compiler-alipay:** 完善微信转支付宝的转端兼容性：处理支付宝不支持 sjs 模块名称为 this 及 组件名称不支持大写的问题 ([b6aa409](https://github.com/eleme/morjs/commit/b6aa4097c82c16e49f3b018570c59efeacd43df0))





## [1.0.35](https://github.com/eleme/morjs/compare/v1.0.34...v1.0.35) (2023-04-26)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.34](https://github.com/eleme/morjs/compare/v1.0.33...v1.0.34) (2023-04-25)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.33](https://github.com/eleme/morjs/compare/v1.0.32...v1.0.33) (2023-04-25)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.31](https://github.com/eleme/morjs/compare/v1.0.30...v1.0.31) (2023-04-21)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.27](https://github.com/eleme/morjs/compare/v1.0.26...v1.0.27) (2023-04-19)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.26](https://github.com/eleme/morjs/compare/v1.0.25...v1.0.26) (2023-04-18)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.22](https://github.com/eleme/morjs/compare/v1.0.21...v1.0.22) (2023-04-13)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.21](https://github.com/eleme/morjs/compare/v1.0.20...v1.0.21) (2023-04-13)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.20](https://github.com/eleme/morjs/compare/v1.0.19...v1.0.20) (2023-04-11)


### Features

* **plugin-compiler-alipay:** 补充部分支付宝原生组件事件配置 ([b1b7f76](https://github.com/eleme/morjs/commit/b1b7f7625f018add0ace22cb338d6ac242ee623c))
* **plugin-compiler-alipay:** 完善支付宝 DSL 的模版字符串和样式对象支持 ([c748f83](https://github.com/eleme/morjs/commit/c748f8386336bd0206441b3b44bbc5ee9fee7c4f))





## [1.0.19](https://github.com/eleme/morjs/compare/v1.0.18...v1.0.19) (2023-03-31)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.16](https://github.com/eleme/morjs/compare/v1.0.15...v1.0.16) (2023-03-29)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.9](https://github.com/eleme/morjs/compare/v1.0.8...v1.0.9) (2023-03-17)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.6](https://github.com/eleme/morjs/compare/v1.0.5...v1.0.6) (2023-03-10)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.5](https://github.com/eleme/morjs/compare/v1.0.4...v1.0.5) (2023-03-10)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.4](https://github.com/eleme/morjs/compare/v1.0.3...v1.0.4) (2023-03-09)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





## [1.0.1](https://github.com/eleme/morjs/compare/v1.0.0...v1.0.1) (2023-02-27)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay





# 1.0.0 (2023-02-22)

**Note:** Version bump only for package @morjs/plugin-compiler-alipay
