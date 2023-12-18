# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.91](https://github.com/eleme/morjs/compare/v1.0.90...v1.0.91) (2023-12-18)

### Bug Fixes

- **plugin-compiler:** sjs/wxs 文件中的 require/import 替换为真实路径 ([6b2031b](https://github.com/eleme/morjs/commit/6b2031ba089a40370872b5cccd2efe1b75abc0de))

## [1.0.90](https://github.com/eleme/morjs/compare/v1.0.89...v1.0.90) (2023-12-12)

### Bug Fixes

- **runtime-web:** slider 展示的值与预设值不匹配 ([#135](https://github.com/eleme/morjs/issues/135)) ([ec0cd19](https://github.com/eleme/morjs/commit/ec0cd19d515d75a806df96fdd7cc0fd0b2669acb))

### Features

- **plugin-compiler:** 新增组件级别多端产物互通能力支持 ([#97](https://github.com/eleme/morjs/issues/97)) ([cc97565](https://github.com/eleme/morjs/commit/cc97565561ecf4529b47466c55e63892e60d35f1))

## [1.0.89](https://github.com/eleme/morjs/compare/v1.0.88...v1.0.89) (2023-12-05)

### Bug Fixes

- **runtime-web:** 页面返回时拿到上一个页面的 location ([#130](https://github.com/eleme/morjs/issues/130)) ([b2802cb](https://github.com/eleme/morjs/commit/b2802cb25c2215a459881bb7e0b96911f1939a4c))

### Reverts

- Revert "fix(runtime-web): 页面返回时拿到上一个页面的 location (#130)" (#131) ([273f855](https://github.com/eleme/morjs/commit/273f8553c9a75b4625abd97f539ca13334280516)), closes [#130](https://github.com/eleme/morjs/issues/130) [#131](https://github.com/eleme/morjs/issues/131)

## [1.0.88](https://github.com/eleme/morjs/compare/v1.0.87...v1.0.88) (2023-11-16)

### Features

- **plugin-compiler-web:** 转 web 时 js script 上增加 crossorigin 属性，方便业务监控捕获详细的 JS Error ([40b34cd](https://github.com/eleme/morjs/commit/40b34cde51d00d0d1454d6cc1a5a48c594f31788))
- **runtime-web:** map 组件增加 init complete 事件通知 ([#127](https://github.com/eleme/morjs/issues/127)) ([34f6d85](https://github.com/eleme/morjs/commit/34f6d855c97818956ca76312762812c99888c370))

## [1.0.87](https://github.com/eleme/morjs/compare/v1.0.86...v1.0.87) (2023-11-15)

### Features

- **plugin-compiler:** 微信转支付宝时 camera ready 事件兼容 ([#125](https://github.com/eleme/morjs/issues/125)) ([a852093](https://github.com/eleme/morjs/commit/a852093777ccf09f8847dc5866eb33a6e0671276))

## [1.0.86](https://github.com/eleme/morjs/compare/v1.0.85...v1.0.86) (2023-11-07)

### Reverts

- Revert "feat(core): 微信转支付宝页面 behaviors 无效 (#122)" ([e0e3c0e](https://github.com/eleme/morjs/commit/e0e3c0e925ab8079614b2fa4defda84cc6fb226f)), closes [#122](https://github.com/eleme/morjs/issues/122)

## [1.0.85](https://github.com/eleme/morjs/compare/v1.0.84...v1.0.85) (2023-11-06)

### Bug Fixes

- **runtime-mini:** 支持 catch 前缀回调 ([1d716af](https://github.com/eleme/morjs/commit/1d716af309e8ca958d0e6e589866d90d00903332))

### Features

- **core:** 微信转支付宝页面 behaviors 无效 ([#122](https://github.com/eleme/morjs/issues/122)) ([0ea297b](https://github.com/eleme/morjs/commit/0ea297be5051b8e8e2b7be13899c0e026b13e123))
- **plugin-compiler-alipay:** 微信转支付宝时将 map 组件的 polygons 转换成 polygon ([#124](https://github.com/eleme/morjs/issues/124)) ([367a66e](https://github.com/eleme/morjs/commit/367a66e771ea0e9a56cfaa0c8d07dba80dd89607))
- **runtime-web:** my.pageScrollTo 支持 selector 参数 ([#119](https://github.com/eleme/morjs/issues/119)) ([5ff2ea0](https://github.com/eleme/morjs/commit/5ff2ea082458a03d97093bb6203c01c049d22206))

## [1.0.84](https://github.com/eleme/morjs/compare/v1.0.83...v1.0.84) (2023-10-31)

### Bug Fixes

- **core:** mixin 数组被转换成了对象 ([#117](https://github.com/eleme/morjs/issues/117)) ([c895e30](https://github.com/eleme/morjs/commit/c895e30b5b8bdddd2eb8ab6b537888b4291738b2))

## [1.0.83](https://github.com/eleme/morjs/compare/v1.0.82...v1.0.83) (2023-09-14)

### Bug Fixes

- animation 动画因用户指定了单位导致异常 ([07e9756](https://github.com/eleme/morjs/commit/07e97565947c9b30fd3f5add38b058a7d25bad07))

## [1.0.82](https://github.com/eleme/morjs/compare/v1.0.81...v1.0.82) (2023-09-08)

### Bug Fixes

- **plugin-compiler-web:** 修复嵌套场景下 styleScope 失效的问题 ([#109](https://github.com/eleme/morjs/issues/109)) ([df462ec](https://github.com/eleme/morjs/commit/df462ec587d57c89e9ebfe22fab9997690245d0c))
- **runtime-mini:** 添加微信转其他端 jsapi nextTick 的兼容支持 ([3e4cb91](https://github.com/eleme/morjs/commit/3e4cb9120baf398838fc8c4165d0ce7e37661f67))

## [1.0.81](https://github.com/eleme/morjs/compare/v1.0.80...v1.0.81) (2023-09-01)

### Bug Fixes

- **runtime-web:** this.createIntersectionObserver 类型错误 ([#105](https://github.com/eleme/morjs/issues/105)) ([ec4316a](https://github.com/eleme/morjs/commit/ec4316a3b3f6089faa52a05b5f234aa69d9de692))
- **runtime-web:** this.createIntersectionObserver 指定 selector 为自定义组件的最外层节点时导致触发异常 ([#104](https://github.com/eleme/morjs/issues/104)) ([c22c2a2](https://github.com/eleme/morjs/commit/c22c2a221c9a506cad17080a9df04534799c5d2b))

## [1.0.80](https://github.com/eleme/morjs/compare/v1.0.79...v1.0.80) (2023-08-30)

### Bug Fixes

- **runtime-web:** 修复 map 组件 getCenterLocation 经常失败问题 ([#103](https://github.com/eleme/morjs/issues/103)) ([13d5532](https://github.com/eleme/morjs/commit/13d5532b704149c1604e8c743aff61822c917773))

## [1.0.79](https://github.com/eleme/morjs/compare/v1.0.78...v1.0.79) (2023-08-28)

### Bug Fixes

- 修复未经 promisify 处理，导致的 api 空指针报错问题 ([#102](https://github.com/eleme/morjs/issues/102)) ([f4f8cae](https://github.com/eleme/morjs/commit/f4f8cae236c72ffb7178b19056c204f6bf6508e0))

## [1.0.78](https://github.com/eleme/morjs/compare/v1.0.77...v1.0.78) (2023-08-18)

### Bug Fixes

- disable-scroll 切换为 false 时容器仍然不可滚动 ([#99](https://github.com/eleme/morjs/issues/99)) ([a2dcf89](https://github.com/eleme/morjs/commit/a2dcf8918ff01e76b85d652b45759f374b82b7e3))
- runtime-web components 类型错误 ([#100](https://github.com/eleme/morjs/issues/100)) ([d2bbda3](https://github.com/eleme/morjs/commit/d2bbda32ef02f85af0125fceb7dd2b19bc595860))

## [1.0.77](https://github.com/eleme/morjs/compare/v1.0.76...v1.0.77) (2023-08-17)

### Bug Fixes

- **runtime-web:** 修复 swiper 组件空指针异常 ([#98](https://github.com/eleme/morjs/issues/98)) ([d1046a6](https://github.com/eleme/morjs/commit/d1046a65923fd5b5d9fa8130f105618c0a39197a))

## [1.0.76](https://github.com/eleme/morjs/compare/v1.0.75...v1.0.76) (2023-08-08)

### Bug Fixes

- **plugin-compiler-web:** 修复 web 服务启动的端口号冲突检测逻辑并调整最大检测次数为 5 次 ([4a36bc0](https://github.com/eleme/morjs/commit/4a36bc03efffa43f31f132d617cd8909d0b4517f))

## [1.0.75](https://github.com/eleme/morjs/compare/v1.0.74...v1.0.75) (2023-08-03)

**Note:** Version bump only for package morjs-monorepo

## [1.0.74](https://github.com/eleme/morjs/compare/v1.0.73...v1.0.74) (2023-08-01)

### Bug Fixes

- **plugin-compiler-web:** 修复转 web 在 windows 下的路径兼容性问题 ([#90](https://github.com/eleme/morjs/issues/90)) ([48f31b6](https://github.com/eleme/morjs/commit/48f31b636cc9b06d057e947b12b236745b395fa3))

## [1.0.73](https://github.com/eleme/morjs/compare/v1.0.72...v1.0.73) (2023-08-01)

### Features

- **runtime-web:** 增加 this.createIntersectionObserver 实现 ([#92](https://github.com/eleme/morjs/issues/92)) ([96f4c34](https://github.com/eleme/morjs/commit/96f4c34c8ca6147e4ea090bb7c0be1fcb02b471d))

## [1.0.72](https://github.com/eleme/morjs/compare/v1.0.71...v1.0.72) (2023-08-01)

### Features

- **plugin-composer:** 支持在 CI 环境下打印更多的集成信息 ([#91](https://github.com/eleme/morjs/issues/91)) ([9b70c32](https://github.com/eleme/morjs/commit/9b70c32c2621fbe8690d7a306a231d057dd0fb57))

## [1.0.71](https://github.com/eleme/morjs/compare/v1.0.70...v1.0.71) (2023-07-26)

### Bug Fixes

- **plugin-compiler-web:** 修复 pnpm 场景下 runtime-web 可能会找不到的问题 ([b598de8](https://github.com/eleme/morjs/commit/b598de8abbb911c92ef222ba65e8f193d05b2b9b))
- **plugin-compiler-web:** 修复分包工程编译为 web 时可能会报错的问题 ([b9d5203](https://github.com/eleme/morjs/commit/b9d5203b5d14ee1b0ba73bcf17bc47e1200489af))
- **plugin-compiler:** 分包或插件转 web 场景下不注入 App 的初始化模拟支持 ([1bb21f6](https://github.com/eleme/morjs/commit/1bb21f61ceff805c0a85a144b01c37a3a6128baf))

### Features

- **plugin-generator:** 修改模版文件用于支持 isSupportWeb 选项 ([39896d1](https://github.com/eleme/morjs/commit/39896d1ec52f9c97758a2d25fb93ed2ae536668d))
- **runtime-web:** createIntersectionObserver 增加 dataset 透传 ([3012c51](https://github.com/eleme/morjs/commit/3012c51ba43113b0f6f9669789707210c1e99a7b))
- **runtime-web:** this.createSelectorQuery 用法支持 ([94abb99](https://github.com/eleme/morjs/commit/94abb9903a545e5f4f848ede0453e26da93637c7))

## [1.0.70](https://github.com/eleme/morjs/compare/v1.0.69...v1.0.70) (2023-07-19)

### Bug Fixes

- **runtime-mini:** 修复组件初始化时，property 中的 observer 可能会不触发的问题 ([#84](https://github.com/eleme/morjs/issues/84)) ([f107657](https://github.com/eleme/morjs/commit/f107657fa20df7c996e0791cce9dff5bf78fc7d1))

## [1.0.69](https://github.com/eleme/morjs/compare/v1.0.68...v1.0.69) (2023-07-17)

### Bug Fixes

- **plugin-compiler-alipay:** 修复 sjs 文件模块变量 this 名称替换可能会漏掉的问题 ([ed6046f](https://github.com/eleme/morjs/commit/ed6046fd73fa9eaceaf1e0bf00ca8ccd1934c7b6))
- **plugin-compiler-alipay:** 修复微信转支付宝分包配置可能会引发报错的问题 ([63522f9](https://github.com/eleme/morjs/commit/63522f9c0f93419313162023823d4e1a2d2bfcc0))
- **plugin-compiler:** 修复 autoInjectRuntime.api 设为 true，未自动转换为 enhanced 引发的 ts 类型报错 ([#82](https://github.com/eleme/morjs/issues/82)) ([4d5a660](https://github.com/eleme/morjs/commit/4d5a6602b88ce45b4502e289cf67a70bb7ad3a8e))
- **plugin-compiler:** 修复部分情况下自动写入内存文件可能会引发报错的问题 ([a2bac5f](https://github.com/eleme/morjs/commit/a2bac5fd232f8cf92baa66ffc96412a5e7b7753b))

### Features

- **plugin-compiler-web:** 完善小程序转 Web 的功能逻辑以及禁止载入用户自定义的 babel 配置 ([824e032](https://github.com/eleme/morjs/commit/824e032978299d9d5a9e5ea6afd4a4b8f6f621fc))
- **plugin-compiler-web:** 移除 slot 组件对 class, style 属性的解析以及完善节点返回值校验 ([#79](https://github.com/eleme/morjs/issues/79)) ([fcca600](https://github.com/eleme/morjs/commit/fcca60068edc7e50787e5f36eac328b6e48ee4bd))
- **plugin-compiler:** template 文件解析增加页面纬度的共享上下文透传支持 ([184a132](https://github.com/eleme/morjs/commit/184a1323bc0840ddbc0a759179467e54f3c82453))
- **plugin-compiler:** 优化微信 DSL 转 Web 对 wxs 文件解析逻辑的支持 ([dac0fc5](https://github.com/eleme/morjs/commit/dac0fc5a8991fa2aa7947ba0deecd4c157555d52))
- **plugin-compiler:** 完善 setEntrySource 对写入内存文件的逻辑支持 ([3bb4a92](https://github.com/eleme/morjs/commit/3bb4a922cbf7a42a3547d85d07c0304b1c6b4368))
- **plugin-generator:** 优化生成的项目模板代码，移除无用的换行和空格 ([2e4e6af](https://github.com/eleme/morjs/commit/2e4e6afc84dcfffea69596f2352cc3b9316a2181))
- **plugin-generator:** 完善生成器使用体验，替换报错为 prompts 选择 ([f3b955a](https://github.com/eleme/morjs/commit/f3b955a688dc2e43228cf9c1bc898a9688bc21b6))
- **runtime-web:** map 组件限制缩放级别范围 ([#83](https://github.com/eleme/morjs/issues/83)) ([aedf820](https://github.com/eleme/morjs/commit/aedf8205540eeeb1cf3a1e90151d39a30d75f81e))

## [1.0.68](https://github.com/eleme/morjs/compare/v1.0.67...v1.0.68) (2023-07-14)

### Bug Fixes

- **core:** 修复 invokeHook 参数 hookName 的类型报错 ([#78](https://github.com/eleme/morjs/issues/78)) ([3e1cfcb](https://github.com/eleme/morjs/commit/3e1cfcb8d886f509b567383d84c5b087fb512809))

### Features

- **plugin-compiler:** 新增多端组件构建模式支持 ([#75](https://github.com/eleme/morjs/issues/75)) ([3307838](https://github.com/eleme/morjs/commit/3307838d278607d300c390877abe48e40f117acd))
- **runtime-base:** 新增 hooks 的 pause、resume 方法，用于暂停/恢复部分 hooks 生命周期的执行 ([#77](https://github.com/eleme/morjs/issues/77)) ([aa712eb](https://github.com/eleme/morjs/commit/aa712ebf2603ecd5b1340f77c0d79e2e709476ad))

## [1.0.67](https://github.com/eleme/morjs/compare/v1.0.66...v1.0.67) (2023-07-13)

### Bug Fixes

- **runtime-web:** 解决 swiper item 数据更新异常以及单个 swiper-item 场景无需 autoplay 的问题 ([#74](https://github.com/eleme/morjs/issues/74)) ([5c40253](https://github.com/eleme/morjs/commit/5c402532c70aee994f821d02951c7c6c67ab28d2))

### Features

- **runtime-web:** 地图组件支持自定义样式 ([#76](https://github.com/eleme/morjs/issues/76)) ([78e92a3](https://github.com/eleme/morjs/commit/78e92a30b9bb17c82aa9547b804a934b5cadc9ac))

## [1.0.66](https://github.com/eleme/morjs/compare/v1.0.65...v1.0.66) (2023-07-10)

### Bug Fixes

- **runtime-web:** 修复地图组件 relative 布局错位问题 ([#72](https://github.com/eleme/morjs/issues/72)) ([598863b](https://github.com/eleme/morjs/commit/598863b5112b644eb701bf7ac1d7aa20d84aa497))

## [1.0.65](https://github.com/eleme/morjs/compare/v1.0.64...v1.0.65) (2023-07-07)

### Features

- **runtime-web:** caniuse 函数增加部分能力判断 ([#71](https://github.com/eleme/morjs/issues/71)) ([a45cd02](https://github.com/eleme/morjs/commit/a45cd02bb0ee7f0a3ce393504d5a94b1f3f93341))

## [1.0.64](https://github.com/eleme/morjs/compare/v1.0.63...v1.0.64) (2023-07-04)

### Features

- **plugin-compiler:** 优化分包和插件编译的 getApp 注入逻辑，避免在支付宝小程序上的 externals 生效问题 ([#70](https://github.com/eleme/morjs/issues/70)) ([be79063](https://github.com/eleme/morjs/commit/be790631943efc328145353945dde8c74edf44a5))

## [1.0.63](https://github.com/eleme/morjs/compare/v1.0.62...v1.0.63) (2023-07-04)

### Bug Fixes

- **plugin-compiler-web:** 修复转 Web 小程序组件库的产物加载入口和文档不一致的问题 ([584809f](https://github.com/eleme/morjs/commit/584809fea95163b2a504d308d31cf037846f17ae))

## [1.0.62](https://github.com/eleme/morjs/compare/v1.0.61...v1.0.62) (2023-07-03)

### Features

- **runtime-web:** 元素获取适配 & 配置读取优先级调整 ([#68](https://github.com/eleme/morjs/issues/68)) ([0f4381d](https://github.com/eleme/morjs/commit/0f4381d5de409a77f93adefe4a9a668bb8473230))

## [1.0.61](https://github.com/eleme/morjs/compare/v1.0.60...v1.0.61) (2023-06-28)

### Bug Fixes

- **plugin-compiler:** 修复异步 require 或 require.async 的参数被跳过解析可能引起运行时报错的问题 ([#66](https://github.com/eleme/morjs/issues/66)) ([50f29b7](https://github.com/eleme/morjs/commit/50f29b7065864e35847134e16f9ef254c6f6c7d4))

## [1.0.60](https://github.com/eleme/morjs/compare/v1.0.59...v1.0.60) (2023-06-25)

### Bug Fixes

- **plugin-composer:** 修复监听状态下集成编译可能会错误将当前宿主或分包模块产物进行二次编译的问题 ([0e846c4](https://github.com/eleme/morjs/commit/0e846c4dff0f6bd8a82755306d6344df673548c1))

## [1.0.59](https://github.com/eleme/morjs/compare/v1.0.58...v1.0.59) (2023-06-25)

### Bug Fixes

- **plugin-compiler-alipay:** 修复 sjs 辅助文件某些情况下可能被注入多次的问题 ([7781f72](https://github.com/eleme/morjs/commit/7781f725fa9f842785d1d738cd83ae68025fd75b))
- **plugin-compiler-alipay:** 优化 sjs 辅助函数注入检查逻辑 ([cb9eb35](https://github.com/eleme/morjs/commit/cb9eb356ff603566bb1bb17f531b53d60bea91f8))

## [1.0.58](https://github.com/eleme/morjs/compare/v1.0.57...v1.0.58) (2023-06-21)

**Note:** Version bump only for package morjs-monorepo

## [1.0.57](https://github.com/eleme/morjs/compare/v1.0.56...v1.0.57) (2023-06-21)

### Bug Fixes

- **runtime-web:** ios 设备无法正常渲染 2.0 版本地图 ([#61](https://github.com/eleme/morjs/issues/61)) ([89be519](https://github.com/eleme/morjs/commit/89be519f2f05fba6523c3d22082675567fff776d))

### Features

- **plugin-compiler-alipay:** 优化 sjs 帮助文件的名称生成逻辑 ([30395bb](https://github.com/eleme/morjs/commit/30395bb32d919abf09eeffb0a0fbfd89f317e48d))
- **plugin-compiler-web:** 优化 Web 编译的 bundle 文件生成名称 ([f07acec](https://github.com/eleme/morjs/commit/f07acecde018d271fb3cd33bb6af60b1953568ad))
- **plugin-compiler:** 优化编译相关全局文件名称生成逻辑，允许配置后缀名以避免冲突 ([aae1dad](https://github.com/eleme/morjs/commit/aae1dad13864ee3e4a58786870435a36e4f581d5))
- **plugin-compiler:** 完善自定义入口配置文件的解析逻辑，允许指定为非源码目录的文件 ([fb7610c](https://github.com/eleme/morjs/commit/fb7610c7324c9833296497cddc71246c3c458d08))
- **utils:** 优化全局集成应用信息的名称生成规则 ([fcbc491](https://github.com/eleme/morjs/commit/fcbc491dd7b44178b8c5f9a5f30e00a1d7cf1257))
- **utils:** 全局文件名称常量方法支持配置后缀用于规避文件冲突 ([7d99e50](https://github.com/eleme/morjs/commit/7d99e5097d3a49537e2335c58656c4a1f81d055f))

## [1.0.56](https://github.com/eleme/morjs/compare/v1.0.55...v1.0.56) (2023-06-20)

### Features

- **plugin-compiler:** 优化项目配置文件载入逻辑，不需要输出项目配置文件时跳过查找 ([a4cda13](https://github.com/eleme/morjs/commit/a4cda13f21690bd2be6c3ebe1da730d6fc813bf0))
- **runtime-web:** 地图重构 & 支持高级定制渲染 ([#60](https://github.com/eleme/morjs/issues/60)) ([eda6b66](https://github.com/eleme/morjs/commit/eda6b66fc8f2dd8c76e15ab881dc68cf07be8ba6))

## [1.0.55](https://github.com/eleme/morjs/compare/v1.0.54...v1.0.55) (2023-06-13)

### Features

- **plugin-compiler-alipay:** 完善支付宝转微信 sjs 中 export default function xxx(){} 的转换支持 ([f907bb2](https://github.com/eleme/morjs/commit/f907bb2333b46a4a03e0b1d926f8bd4491aed198))
- **plugin-compiler-alipay:** 完善支付宝转微信不兼容选择器提示信息 ([eacdf5e](https://github.com/eleme/morjs/commit/eacdf5e60898e2ad30533c1407d81c2eca0202b0))
- **plugin-compiler-alipay:** 完善支付宝转微信时模版中对部分方法调用的支持 ([4780b28](https://github.com/eleme/morjs/commit/4780b28140551e0ae5b1d3cfe4e4b139928bb59c))
- **takin:** 优化生成器逻辑增加模版解析对 <%_ 或 _%> 或 -%> 的支持 ([1982ed6](https://github.com/eleme/morjs/commit/1982ed631ac1ae5aedf7a0d00092ccf433fc5cd7))

## [1.0.54](https://github.com/eleme/morjs/compare/v1.0.53...v1.0.54) (2023-06-09)

### Bug Fixes

- **runtime-mini:** 修复微信转支付宝小程序后组件在 created 阶段无法从 data 中获取 properties 值的问题 ([#58](https://github.com/eleme/morjs/issues/58)) ([07f7ff9](https://github.com/eleme/morjs/commit/07f7ff9d0cf8afc5fa5df6511f7467497a6522cf))

### Features

- **takin:** 优化生成器逻辑增加模版解析对 <%_ 或 _%> 或 -%> 的支持 ([#57](https://github.com/eleme/morjs/issues/57)) ([e82bb63](https://github.com/eleme/morjs/commit/e82bb63c23e27f8094083be6057e724a5fd7c0fa))

## [1.0.53](https://github.com/eleme/morjs/compare/v1.0.52...v1.0.53) (2023-06-07)

### Bug Fixes

- **plugin-mocker:** 修复 mock JSAPI 的异步方法获取 ESModule 数据需要使用 .default 的问题 ([#55](https://github.com/eleme/morjs/issues/55)) ([7476a47](https://github.com/eleme/morjs/commit/7476a4769b77f210126a34f826fc4425e047ff1d))
- **runtime-base:** 修复 qq 等端 request 不执行的问题 ([#54](https://github.com/eleme/morjs/issues/54)) ([52fa701](https://github.com/eleme/morjs/commit/52fa7018d1b0a5798eca184cfd866acf9a09c709))

## [1.0.52](https://github.com/eleme/morjs/compare/v1.0.51...v1.0.52) (2023-06-05)

### Bug Fixes

- **core:** 修复支付宝 DSL 下 lifetimes 无值可能导致报错的问题 ([#51](https://github.com/eleme/morjs/issues/51)) ([644f9b2](https://github.com/eleme/morjs/commit/644f9b208ca50af5158ac39af9216465d0dda638))
- **plugin-mocker:** 修复 windows 下 mock 编译报错的问题 ([#50](https://github.com/eleme/morjs/issues/50)) ([6f78eac](https://github.com/eleme/morjs/commit/6f78eacd3dac0ab9168da34cf9f127945a7b671b))

## [1.0.51](https://github.com/eleme/morjs/compare/v1.0.50...v1.0.51) (2023-06-02)

### Bug Fixes

- **plugin-compiler-wechat:** 修复微信双向绑定在抖音和快手端未正确处理 picker-view 的问题 ([ea4b6c9](https://github.com/eleme/morjs/commit/ea4b6c9feb2f8da981583d5a207b7f46472c811c))

### Features

- **plugin-compiler-bytedance:** 增加字节小程序双向绑定编译能力支持 ([6a03f1c](https://github.com/eleme/morjs/commit/6a03f1c786e1474418b47d292ed8c9054a8cd87b))
- **plugin-compiler-kuaishou:** 增加快手小程序双向绑定编译能力支持 ([53e72ee](https://github.com/eleme/morjs/commit/53e72eeb98f54f1300d12166e039da9495bb9284))
- **plugin-compiler-wechat:** 增加微信转其他类似于微信端的双向绑定支持 ([74f5b13](https://github.com/eleme/morjs/commit/74f5b1345ee63aef91f58369328b2338bb277ab0))
- **runtime-mini:** 增加字节小程序及快手小程序运行时双向绑定支持 ([653767f](https://github.com/eleme/morjs/commit/653767f44d954fedfd435cbc4a86889e310d1e30))

## [1.0.50](https://github.com/eleme/morjs/compare/v1.0.49...v1.0.50) (2023-05-31)

### Features

- **plugin-compiler-bytedance:** 新增抖音分包异步化编译支持 ([#46](https://github.com/eleme/morjs/issues/46)) ([6e2ede2](https://github.com/eleme/morjs/commit/6e2ede2782bdbdc259d81deb603fccabc3f8f136))

## [1.0.49](https://github.com/eleme/morjs/compare/v1.0.48...v1.0.49) (2023-05-30)

### Features

- **plugin-compiler-baidu:** 完善微信转百度双向绑定适配以及修复 s-for 指令适配逻辑 ([3d15094](https://github.com/eleme/morjs/commit/3d15094eb983f8148690dda08c80c480474335b5))

## [1.0.48](https://github.com/eleme/morjs/compare/v1.0.47...v1.0.48) (2023-05-23)

### Bug Fixes

- **plugin-generator:** 替换脚手架生成的 eslint 配置项，防止 eslint-config-prettier 8.0 所有子包收束到 prettier 后的报错 ([#43](https://github.com/eleme/morjs/issues/43)) ([004ce55](https://github.com/eleme/morjs/commit/004ce55b1fad286f83f25521ff0f1ad87000f58e))
- **runtime-mini:** 修改生命周期执行顺序，修复微信 DSL 首次传入 props 未执行 observer 的问题 ([#44](https://github.com/eleme/morjs/issues/44)) ([3ee2f9a](https://github.com/eleme/morjs/commit/3ee2f9ac1588e8bce0078bde9b2d56b61e3767f1))

## [1.0.47](https://github.com/eleme/morjs/compare/v1.0.46...v1.0.47) (2023-05-22)

### Features

- **runtime-web:** fields 调用和 scrollOffset,boundingClientRect 调用隔离 ([#42](https://github.com/eleme/morjs/issues/42)) ([f6d23e1](https://github.com/eleme/morjs/commit/f6d23e1accc72d1b8140ffb7c0475518ec9394b7))

## [1.0.46](https://github.com/eleme/morjs/compare/v1.0.45...v1.0.46) (2023-05-19)

### Features

- **runtime-mini:** 对齐最新 lifetimes 的官方功能，优先使用官方提供的 lifetimes 方法，兜底使用 mor 的自实现 ([#38](https://github.com/eleme/morjs/issues/38)) ([0044d4a](https://github.com/eleme/morjs/commit/0044d4a8cc86fc619c505f664d098c033fb7d8a7))
- **runtime-web:** selectorQuery 方法重构 & 支持 fields 查询 ([#41](https://github.com/eleme/morjs/issues/41)) ([902ffb7](https://github.com/eleme/morjs/commit/902ffb788899425cdaf46ffaaec0fea6aea0124a))

## [1.0.45](https://github.com/eleme/morjs/compare/v1.0.44...v1.0.45) (2023-05-17)

### Bug Fixes

- **runtime-web:** swiper 默认为 inline 元素导致上下边距异常 ([#39](https://github.com/eleme/morjs/issues/39)) ([4b852c1](https://github.com/eleme/morjs/commit/4b852c153d9e0907f205c989dec7a094402ef166))

### Features

- **runtime-web:** tabbar 组件之间的切换方法由 navigateTo 切换为 switchTab 行为与小程序保持一致 ([b0f29ad](https://github.com/eleme/morjs/commit/b0f29ad8428564dbd2c6a5519b1d355937bdfbff))

## [1.0.44](https://github.com/eleme/morjs/compare/v1.0.43...v1.0.44) (2023-05-12)

### Bug Fixes

- **plugin-compiler-web:** 修复 web 组件转换在生产模式下 js 文件名称错误及内容为空的问题 ([7501253](https://github.com/eleme/morjs/commit/750125345e1d37db180d8d3a4de66b171e573339))
- **plugin-compiler:** 修复 web 编译在生产模式下 css 文件可能未被压缩的问题 ([ed509e4](https://github.com/eleme/morjs/commit/ed509e4948025bcb24f76114e1e719a10302c031))

## [1.0.43](https://github.com/eleme/morjs/compare/v1.0.42...v1.0.43) (2023-05-09)

### Bug Fixes

- **runtime-web:** 修复 onAppear 在某些特殊场景下可能不执行的问题 ([#37](https://github.com/eleme/morjs/issues/37)) ([1413271](https://github.com/eleme/morjs/commit/14132715b66e17beee16b6de5c437e84812ebcf0))

## [1.0.42](https://github.com/eleme/morjs/compare/v1.0.41...v1.0.42) (2023-05-05)

### Features

- **plugin-compiler-alipay:** 添加对 bind:abc-def 事件写法的支持 ([c533d92](https://github.com/eleme/morjs/commit/c533d92e669cb0dcd84598ade3a64e4574a85f77))
- **runtime-mini:** 添加 triggerEvent 方法对 bind:abc-def 的支持 ([843435e](https://github.com/eleme/morjs/commit/843435e733dd4ca2b4c4be9e3dffcd3fab2d475f))

## [1.0.41](https://github.com/eleme/morjs/compare/v1.0.40...v1.0.41) (2023-05-05)

### Bug Fixes

- **runtime-web:** 修复父元素未完成挂载时尝试获取 DOM 节点及绑定事件可能会导致报错的问题 ([#34](https://github.com/eleme/morjs/issues/34)) ([3227eeb](https://github.com/eleme/morjs/commit/3227eeb0235a64f5f098734b952395e607e180ea))

## [1.0.40](https://github.com/eleme/morjs/compare/v1.0.39...v1.0.40) (2023-04-28)

### Features

- **runtime-web:** setClipboard 增加 queryCommand 实现方式 & 可以通过配置强切实现方式 ([#32](https://github.com/eleme/morjs/issues/32)) ([3b02ed7](https://github.com/eleme/morjs/commit/3b02ed7ba37a9950916b590246552b2fb192c4fa))

## [1.0.39](https://github.com/eleme/morjs/compare/v1.0.38...v1.0.39) (2023-04-26)

### Bug Fixes

- **runtime-mini:** 修复判断 relations 和 externalClasses 参数错误 ([c176e94](https://github.com/eleme/morjs/commit/c176e9426e5cfa64aa5484ebdac7a54fdb690e6d))

### Features

- **runtime-mini:** 增加微信转支付宝外部样式类支持 ([d9202e6](https://github.com/eleme/morjs/commit/d9202e645e4d7f7da5936e039259f4cd33a5ddd6))

## [1.0.38](https://github.com/eleme/morjs/compare/v1.0.37...v1.0.38) (2023-04-26)

### Bug Fixes

- **plugin-compiler-alipay:** 修复微信转支付宝对分包配置的兼容 ([17eb4da](https://github.com/eleme/morjs/commit/17eb4da82182616b2e42c825c3813fdb86889c56))

## [1.0.37](https://github.com/eleme/morjs/compare/v1.0.36...v1.0.37) (2023-04-26)

### Features

- **runtime-mini:** 完善 selectComponent、selectAllComponents、selectOwnerComponent 组件或页面示例方法支持 ([dd809eb](https://github.com/eleme/morjs/commit/dd809ebb17f6b37bd1d038feb30acf47779fa773))
- **runtime-mini:** 增加微信转支付宝 relations 支持 ([66f8dc0](https://github.com/eleme/morjs/commit/66f8dc081abecd882e81f756fbf7f4aa51bf19a9))

## [1.0.36](https://github.com/eleme/morjs/compare/v1.0.35...v1.0.36) (2023-04-26)

### Bug Fixes

- **plugin-compiler:** 修复模版解析器处理多端编译时 attrName 可能无值导致逻辑错误的问题 ([920249f](https://github.com/eleme/morjs/commit/920249f0b2637751a20615e3db8ae448fded77be))
- **runtime-mini:** 优化属性监听器执行时机，仅在变更时执行 ([3d0348c](https://github.com/eleme/morjs/commit/3d0348ce8f20633fab9acc57b20a3d16f1fba19f))

### Features

- **plugin-compiler-alipay:** 完善微信转支付宝的转端兼容性：处理支付宝不支持 sjs 模块名称为 this 及 组件名称不支持大写的问题 ([b6aa409](https://github.com/eleme/morjs/commit/b6aa4097c82c16e49f3b018570c59efeacd43df0))
- **plugin-compiler:** 完善 processNodeModules 对组件库的解析逻辑支持 ([2b33ef1](https://github.com/eleme/morjs/commit/2b33ef1acfc42960c0ee9cb9813f92fd22e936e3))

## [1.0.35](https://github.com/eleme/morjs/compare/v1.0.34...v1.0.35) (2023-04-26)

### Bug Fixes

- **runtime-mini:** 修复微信转支付宝的 observer 触发多个 props 问题 ([#27](https://github.com/eleme/morjs/issues/27)) ([8e9b528](https://github.com/eleme/morjs/commit/8e9b5285bd133b91f80341e4f17d5d233d1916f1))

### Features

- **runtime-mini:** 优化 observers 在支付宝端的兼容支持 ([b610e3f](https://github.com/eleme/morjs/commit/b610e3f4d1746a105ee0ca07e5ffc853b2d6947e))

## [1.0.34](https://github.com/eleme/morjs/compare/v1.0.33...v1.0.34) (2023-04-25)

### Bug Fixes

- **runtime-base:** 修复同步接口抹平结果修改未被正确触发的问题 ([8173706](https://github.com/eleme/morjs/commit/8173706744966929494d85d275cd0032602959d1))

### Features

- **plugin-compiler:** 优化 processNodeModules 配置开启后对组件库的转端编译支持 ([fcacc95](https://github.com/eleme/morjs/commit/fcacc952f8d18ddc530d0335d41d2217b89c4cb0))

## [1.0.33](https://github.com/eleme/morjs/compare/v1.0.32...v1.0.33) (2023-04-25)

### Bug Fixes

- **plugin-compiler-web:** 修复 runtime-web chunk 未抽取为单独的文件的问题 ([330eb5c](https://github.com/eleme/morjs/commit/330eb5c61af9eb253e24e3ab06a4425d6ff13c0c))
- **plugin-compiler-web:** 修复微信 DSL 转 Web 可能会找不到 sjs 文件的问题 ([fc77d21](https://github.com/eleme/morjs/commit/fc77d211d0d8957c1d4b1450a983e3a6328f9e48))
- **plugin-compiler:** 修复运行时自动注入可能会导致转 Web 运行时加载时机错误的问题 ([aad48e9](https://github.com/eleme/morjs/commit/aad48e9ecb8b299b7b9761f3a9483ee33ba7ab6f))
- **runtime-web:** 提供 my.SDKVersion 支持 ([ba333b3](https://github.com/eleme/morjs/commit/ba333b33906ca801b9887e27462df595ee0bd2c4))

### Features

- **runtime-mini:** 增加微信转支付宝的 getSystemInfo、getSystemInfoSync、getSystemInfoAsync 等接口抹平支持 ([431f7e9](https://github.com/eleme/morjs/commit/431f7e92d1ffeb2b26f519c9729aab3fd7c9b6eb))
- **runtime-web:** getSystemInfo 接口补充 SDKVersion 版本信息 ([037eaef](https://github.com/eleme/morjs/commit/037eaef91ac7c0b82b6c533a03e5a5b95b1dd184))

## [1.0.32](https://github.com/eleme/morjs/compare/v1.0.31...v1.0.32) (2023-04-21)

### Bug Fixes

- **plugin-compiler:** 修复全局组件注入可能不生效的问题 ([3fda777](https://github.com/eleme/morjs/commit/3fda777afb2dc2ec2d11bc3c2e2ff63b2b95c1e4))
- **plugin-compiler:** 修复提取内联 sjs 内容时文件后缀错误以及未执行 sjsParser 的问题 ([3fb9971](https://github.com/eleme/morjs/commit/3fb9971f41ea00b40bbc0f9eb7691ba5a6a629ca))

## [1.0.31](https://github.com/eleme/morjs/compare/v1.0.30...v1.0.31) (2023-04-21)

### Bug Fixes

- **plugin-compiler:** 修复样式文件如果传入 null 或 undefined 会导致 postcss 报错的问题 ([0d0ce21](https://github.com/eleme/morjs/commit/0d0ce211e1ec5cb49bfcf05083ff8263d5f23f81))
- **utils:** 升级 sass 版本为 1.60.0 确保对 node 12 的支持 ([4e3928e](https://github.com/eleme/morjs/commit/4e3928ed2d5a7efb6ba0ef98655c3e4460ecc016))

## [1.0.30](https://github.com/eleme/morjs/compare/v1.0.29...v1.0.30) (2023-04-21)

### Bug Fixes

- **plugin-compiler:** 修复 getApp 在分包和插件场景下注入时 export default 导致无法被 commonjs 规范的文件正确引用的问题 ([f47a2c5](https://github.com/eleme/morjs/commit/f47a2c5ed3779daedf055355280b841c2aeee647))

### Features

- **plugin-compiler:** 新增编译时自动检测运行时入口函数和 sourceType 类型是否匹配 ([#22](https://github.com/eleme/morjs/issues/22)) ([1096bad](https://github.com/eleme/morjs/commit/1096bad220a1f4807bf657755b18544a241fb39f))

## [1.0.29](https://github.com/eleme/morjs/compare/v1.0.28...v1.0.29) (2023-04-20)

### Bug Fixes

- **plugin-composer:** 修复不同配置的集成结果文件 compose-results.json 会相互覆盖的问题 ([fb91ac7](https://github.com/eleme/morjs/commit/fb91ac761783df647b31e16e66bb299cde1c641c))

## [1.0.28](https://github.com/eleme/morjs/compare/v1.0.27...v1.0.28) (2023-04-20)

### Features

- **cli:** 对外暴露 generateComposeModuleHash 方法方便定制集成能力 ([993d66f](https://github.com/eleme/morjs/commit/993d66fea7421a5503b810b1032fec0eb1ad7ddd))

## [1.0.27](https://github.com/eleme/morjs/compare/v1.0.26...v1.0.27) (2023-04-19)

### Bug Fixes

- spell error ([b8d5c4c](https://github.com/eleme/morjs/commit/b8d5c4c9158260e90273b25891761ddb61207bf7))

### Features

- 添加蓝牙转换方法 ([fd6fcc4](https://github.com/eleme/morjs/commit/fd6fcc461bc32ec5cb89cfb3444728c2e6774189))
- **example:** 添加蓝牙转换用例 ([cd87efe](https://github.com/eleme/morjs/commit/cd87efe43f035bda35083022f9be1b1b84c97032))
- **plugin-composer:** 完善集成临时文件存储逻辑，基于配置名称区分，避免多配置模式下集成缓存冲突 ([cbefb55](https://github.com/eleme/morjs/commit/cbefb55664c89ea94e8e199aca440a3c885603e2))
- **runtime-mini:** 支付宝&微信蓝牙方法交叉兼容 ([20251dc](https://github.com/eleme/morjs/commit/20251dc1d268b84f9ed1724c2bd6c97ae4b55685))
- **runtime-mini:** openBluetoothAdapter 返回值兼容 ([f38c46e](https://github.com/eleme/morjs/commit/f38c46ed411abf38e19aa9206f33592ce7a29ea4))
- **utils:** 提供通用 execCommands 方法便于执行脚本及错误处理 ([36dfc64](https://github.com/eleme/morjs/commit/36dfc64342f3dff3b240ced7b3f4335c60cd7180))

### Performance Improvements

- 删除不必要用例 ([a306be7](https://github.com/eleme/morjs/commit/a306be7b7229e513110e9bb08dc8956538228272))

## [1.0.26](https://github.com/eleme/morjs/compare/v1.0.25...v1.0.26) (2023-04-18)

### Bug Fixes

- **plugin-compiler:** 修复开启 processNodeModules 时错误将 runtime-base 中的接口转端从而引发报错的问题 ([f7fd9db](https://github.com/eleme/morjs/commit/f7fd9dbb0bb0cff69c0babdf0e07ad95f6f4c867))
- **plugin-generator:** 修改 morjs 依赖为 \* 以处理无 beta 版本引发的 install 报错 ([#21](https://github.com/eleme/morjs/issues/21)) ([ff997b4](https://github.com/eleme/morjs/commit/ff997b4d68664083add0a66cadc209e669eaf11a))

### Features

- **runtime-web:** 修复转 Web 页面相对路径跳转支持 ([#20](https://github.com/eleme/morjs/issues/20)) ([c82b30d](https://github.com/eleme/morjs/commit/c82b30d34864a6f88c6bfd5c7193e8404eb6a2c9))

## [1.0.25](https://github.com/eleme/morjs/compare/v1.0.24...v1.0.25) (2023-04-18)

### Bug Fixes

- **plugin-generator:** 修复初始化脚手架时可能缺少 .gitignore 文件的问题 ([d4ae47c](https://github.com/eleme/morjs/commit/d4ae47c111ebb751a986bc0ff05a3a77417ec4ef))

### Features

- **plugin-generator:** create-mor 用户 git 信息改成非必选, 不做输入的校验 ([#15](https://github.com/eleme/morjs/issues/15)) ([fd26ef5](https://github.com/eleme/morjs/commit/fd26ef5ce89f5b70ced1ec6b8980b04008c9992d))
- **plugin-generator:** create-morjs 项目初始化后根据用户输入更新 package.json 的名称和描述 ([#16](https://github.com/eleme/morjs/issues/16)) ([abc41f6](https://github.com/eleme/morjs/commit/abc41f62c84cf7e7478234d4c23cbf58ae1538b7))

## [1.0.24](https://github.com/eleme/morjs/compare/v1.0.23...v1.0.24) (2023-04-17)

### Bug Fixes

- **plugin-generator:** 修复 create-mor 在当前目录项目初始化完成提示 ([#14](https://github.com/eleme/morjs/issues/14)) ([21c6df3](https://github.com/eleme/morjs/commit/21c6df387414415d7558a9ff2e0a568c5cbc1a19))

## [1.0.23](https://github.com/eleme/morjs/compare/v1.0.22...v1.0.23) (2023-04-14)

**Note:** Version bump only for package morjs-monorepo

## [1.0.22](https://github.com/eleme/morjs/compare/v1.0.21...v1.0.22) (2023-04-13)

### Bug Fixes

- **runtime-mini:** 修复微信转支付宝部分 Api 无法调用的问题 ([#12](https://github.com/eleme/morjs/issues/12)) ([b824c33](https://github.com/eleme/morjs/commit/b824c3332b3d716beabf51013848f723b73a5b7b))

## [1.0.21](https://github.com/eleme/morjs/compare/v1.0.20...v1.0.21) (2023-04-13)

### Bug Fixes

- **runtime-mini:** 修复支付宝转其他端时 created 生命周期未触发的问题 ([d03262c](https://github.com/eleme/morjs/commit/d03262cb3c768064144d3c661174163bf03fe897))

## [1.0.20](https://github.com/eleme/morjs/compare/v1.0.19...v1.0.20) (2023-04-11)

### Features

- **plugin-compiler-alipay:** 补充部分支付宝原生组件事件配置 ([b1b7f76](https://github.com/eleme/morjs/commit/b1b7f7625f018add0ace22cb338d6ac242ee623c))
- **plugin-compiler-alipay:** 完善支付宝 DSL 的模版字符串和样式对象支持 ([c748f83](https://github.com/eleme/morjs/commit/c748f8386336bd0206441b3b44bbc5ee9fee7c4f))

## [1.0.19](https://github.com/eleme/morjs/compare/v1.0.18...v1.0.19) (2023-03-31)

### Bug Fixes

- **takin:** 修复敏感日志过滤导致原对象或 Map 被修改的问题 ([f5210ba](https://github.com/eleme/morjs/commit/f5210baa07318d6ea983ddce8f9814b882cb1935))

### Features

- **plugin-composer:** 优化模块集成脚本变化判断逻辑，避免错误判断导致脚本重复执行 ([b4c08fd](https://github.com/eleme/morjs/commit/b4c08fd149943d432b3cb25323c30f426a1df071))

## [1.0.18](https://github.com/eleme/morjs/compare/v1.0.17...v1.0.18) (2023-03-31)

### Features

- **plugin-compiler:** 优化幽灵依赖和自动注入功能兼容性 ([e5f97e3](https://github.com/eleme/morjs/commit/e5f97e38787a10c3f780e1b0b3a2931d5a0ef4fe))

## [1.0.17](https://github.com/eleme/morjs/compare/v1.0.16...v1.0.17) (2023-03-30)

**Note:** Version bump only for package morjs-monorepo

## [1.0.16](https://github.com/eleme/morjs/compare/v1.0.15...v1.0.16) (2023-03-29)

### Features

- **plugin-compiler:** 添加幽灵依赖检测功能 ([#7](https://github.com/eleme/morjs/issues/7)) ([9899827](https://github.com/eleme/morjs/commit/989982731d490922bc8f7dbc272ce63461693a28))
- **runtime-mini:** 修复微信转支付宝 data 更新未触发 observers 的问题 ([#9](https://github.com/eleme/morjs/issues/9)) ([8b8ac97](https://github.com/eleme/morjs/commit/8b8ac97ce378273a9f23b807d025c34b39474cc0))

## [1.0.15](https://github.com/eleme/morjs/compare/v1.0.14...v1.0.15) (2023-03-28)

### Bug Fixes

- **plugin-compiler:** 修复开启 importHelpers 可能失败的问题 ([56a662e](https://github.com/eleme/morjs/commit/56a662e6bfbf5df1d930deb65ddfba2ca738b3a8))

## [1.0.14](https://github.com/eleme/morjs/compare/v1.0.13...v1.0.14) (2023-03-28)

### Features

- **plugin-compiler:** 完善小程序转端运行时自动注入逻辑和兜底检查支持 ([433d43c](https://github.com/eleme/morjs/commit/433d43c85931c93dd05b60065e4dbaa30896fbb8))

## [1.0.13](https://github.com/eleme/morjs/compare/v1.0.12...v1.0.13) (2023-03-28)

### Bug Fixes

- **runtime-web:** 修复 switchTab 无法关闭之前打开的页面 ([#8](https://github.com/eleme/morjs/issues/8)) ([ed5e632](https://github.com/eleme/morjs/commit/ed5e6325ce8e3c0e0fb1c6330486a651f4644759))

## [1.0.12](https://github.com/eleme/morjs/compare/v1.0.11...v1.0.12) (2023-03-28)

### Features

- **plugin-compiler:** 完善 transform 编译支持以及允许通过 customEntries 添加额外需要编译的页面或组件 ([82fecc5](https://github.com/eleme/morjs/commit/82fecc524cf87534d213e065c07423133aefe88c))
- **plugin-compiler:** consumes 和 shared 配置增加别名配置支持 ([fb955ad](https://github.com/eleme/morjs/commit/fb955ad9f0bd964e06357add616e53561dba1190))

## [1.0.11](https://github.com/eleme/morjs/compare/v1.0.10...v1.0.11) (2023-03-24)

### Bug Fixes

- **core:** 完善 invokeHook 方法兜底检查，找不到 hook 时打印错误日志，不直接抛错 ([f9f361b](https://github.com/eleme/morjs/commit/f9f361b1f88dee845abb4571d22bf4714e287626))

## [1.0.10](https://github.com/eleme/morjs/compare/v1.0.9...v1.0.10) (2023-03-20)

### Bug Fixes

- **plugin-compiler:** 修复 esm 版本的运行时无法被正确注入小程序转端能力支持的问题 ([b97071d](https://github.com/eleme/morjs/commit/b97071dfc01f39cdf2acf1dd4c99399b06345ef8))
- **runtime-web:** 修复 hidden 使用 important 修饰符导致业务对元素布局方式修改失效以及 selectQuery 结果遍历支持 ([ef0cd46](https://github.com/eleme/morjs/commit/ef0cd4666b0302102bc10713547b5d060916a9c3))

## [1.0.9](https://github.com/eleme/morjs/compare/v1.0.8...v1.0.9) (2023-03-17)

### Bug Fixes

- **cli:** 修复配置变更自动重启可能会触发多次的问题 ([444d453](https://github.com/eleme/morjs/commit/444d45384cef3bcc9f85eb3251148d0cb9600de5))
- **plugin-compiler-web:** 修复 @babel/runtime 依赖缺失 ([93b478f](https://github.com/eleme/morjs/commit/93b478f9cf18848e286ca751dcd30377438a9582))
- **plugin-compiler:** 修复由于 peerDependencies 导致的 webpack 多实例问题 ([#4](https://github.com/eleme/morjs/issues/4)) ([323b70b](https://github.com/eleme/morjs/commit/323b70b7826650fb3f90d2efa88d0215fee62da6))

## [1.0.8](https://github.com/eleme/morjs/compare/v1.0.7...v1.0.8) (2023-03-15)

### Bug Fixes

- **plugin-compiler:** fix case where alias is an empty object ([#5](https://github.com/eleme/morjs/issues/5)) ([f1fec85](https://github.com/eleme/morjs/commit/f1fec8522bc9b832f025c67c0d6733960e2f0a83))

## [1.0.7](https://github.com/eleme/morjs/compare/v1.0.6...v1.0.7) (2023-03-10)

### Bug Fixes

- **plugin-compiler:** 修复同一个项目中混用支付宝或微信 DSL 可能会导致样式冲突的问题 ([4f0577a](https://github.com/eleme/morjs/commit/4f0577a1a248256c167df5f9dc1d72a2340b73fa))

## [1.0.6](https://github.com/eleme/morjs/compare/v1.0.5...v1.0.6) (2023-03-10)

### Bug Fixes

- **runtime-mini:** replace @morjs/api with @morjs/runtime-base to avoid cycle references ([84b4a0c](https://github.com/eleme/morjs/commit/84b4a0cef834e8bfabad4e2821b3f6414dd89ab9))

## [1.0.5](https://github.com/eleme/morjs/compare/v1.0.4...v1.0.5) (2023-03-10)

### Features

- **plugin-compiler-web:** .json 文件支持条件编译 ([#3](https://github.com/eleme/morjs/issues/3)) ([d717375](https://github.com/eleme/morjs/commit/d717375bbad95413c9a23e639a78ec086d07b6e8))

## [1.0.4](https://github.com/eleme/morjs/compare/v1.0.3...v1.0.4) (2023-03-09)

### Bug Fixes

- **core:** fix wechat npm build support ([32af3e2](https://github.com/eleme/morjs/commit/32af3e2f772909e46e8be84bc4f60820dd00d604))
- **runtime-mini:** fix wechat npm build support ([096fb7c](https://github.com/eleme/morjs/commit/096fb7ce31547c71eac1e2c2f316a9f438c7da52))

## [1.0.3](https://github.com/eleme/morjs/compare/v1.0.2...v1.0.3) (2023-03-07)

### Bug Fixes

- **plugin-compiler:** 修复错误将 npm 组件中样式文件作为普通样式文件解析的问题 ([de6935e](https://github.com/eleme/morjs/commit/de6935e03634383283240e4924d610192b506a8f))

## [1.0.2](https://github.com/eleme/morjs/compare/v1.0.1...v1.0.2) (2023-03-06)

### Bug Fixes

- **plugin-compiler:** transform 编译模式下允许找不到 npm 中的多端组件 ([4cef590](https://github.com/eleme/morjs/commit/4cef5901625070da88067a1973d65b2b4ab36dbb))

## [1.0.1](https://github.com/eleme/morjs/compare/v1.0.0...v1.0.1) (2023-02-27)

### Bug Fixes

- **plugin-compiler:** 修复 getApp 注入逻辑中 getLaunchOptionsSync 可能不是一个函数的问题 ([d2a3ef9](https://github.com/eleme/morjs/commit/d2a3ef93971845c17a05245eeaae66a7290fd1e3))

### Features

- **plugin-composer:** 增加 --target, --compile-type, --output-path 命令行选项支持 ([4fc9e0a](https://github.com/eleme/morjs/commit/4fc9e0aa7fa927066089f2dfaf1d08886f98bdff))

# 1.0.0 (2023-02-22)

**Note:** Version bump only for package morjs-monorepo
