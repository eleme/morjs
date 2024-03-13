# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 1.0.102-alpha.0 (2024-03-13)


### Bug Fixes

* **plugin-compiler:** 修复由于 peerDependencies 导致的 webpack 多实例问题 ([#4](https://github.com/eleme/morjs/issues/4)) ([323b70b](https://github.com/eleme/morjs/commit/323b70b7826650fb3f90d2efa88d0215fee62da6))
* **utils:** 升级 sass 版本为 1.60.0 确保对 node 12 的支持 ([4e3928e](https://github.com/eleme/morjs/commit/4e3928ed2d5a7efb6ba0ef98655c3e4460ecc016))


### Features

* **plugin-compiler-bytedance:** 新增抖音分包异步化编译支持 ([#46](https://github.com/eleme/morjs/issues/46)) ([6e2ede2](https://github.com/eleme/morjs/commit/6e2ede2782bdbdc259d81deb603fccabc3f8f136))
* **plugin-compiler-web:** .json 文件支持条件编译 ([#3](https://github.com/eleme/morjs/issues/3)) ([d717375](https://github.com/eleme/morjs/commit/d717375bbad95413c9a23e639a78ec086d07b6e8))
* **plugin-compiler:** 完善 setEntrySource 对写入内存文件的逻辑支持 ([3bb4a92](https://github.com/eleme/morjs/commit/3bb4a922cbf7a42a3547d85d07c0304b1c6b4368))
* **plugin-compiler:** 新增多端组件构建模式支持 ([#75](https://github.com/eleme/morjs/issues/75)) ([3307838](https://github.com/eleme/morjs/commit/3307838d278607d300c390877abe48e40f117acd))
* **utils:** 全局文件名称常量方法支持配置后缀用于规避文件冲突 ([7d99e50](https://github.com/eleme/morjs/commit/7d99e5097d3a49537e2335c58656c4a1f81d055f))
* **utils:** 提供通用 execCommands 方法便于执行脚本及错误处理 ([36dfc64](https://github.com/eleme/morjs/commit/36dfc64342f3dff3b240ced7b3f4335c60cd7180))
* **utils:** 优化全局集成应用信息的名称生成规则 ([fcbc491](https://github.com/eleme/morjs/commit/fcbc491dd7b44178b8c5f9a5f30e00a1d7cf1257))





## [1.0.71](https://github.com/eleme/morjs/compare/v1.0.70...v1.0.71) (2023-07-26)

**Note:** Version bump only for package @morjs/utils





## [1.0.69](https://github.com/eleme/morjs/compare/v1.0.68...v1.0.69) (2023-07-17)


### Features

* **plugin-compiler:** 完善 setEntrySource 对写入内存文件的逻辑支持 ([3bb4a92](https://github.com/eleme/morjs/commit/3bb4a922cbf7a42a3547d85d07c0304b1c6b4368))





## [1.0.68](https://github.com/eleme/morjs/compare/v1.0.67...v1.0.68) (2023-07-14)


### Features

* **plugin-compiler:** 新增多端组件构建模式支持 ([#75](https://github.com/eleme/morjs/issues/75)) ([3307838](https://github.com/eleme/morjs/commit/3307838d278607d300c390877abe48e40f117acd))





## [1.0.57](https://github.com/eleme/morjs/compare/v1.0.56...v1.0.57) (2023-06-21)


### Features

* **utils:** 优化全局集成应用信息的名称生成规则 ([fcbc491](https://github.com/eleme/morjs/commit/fcbc491dd7b44178b8c5f9a5f30e00a1d7cf1257))
* **utils:** 全局文件名称常量方法支持配置后缀用于规避文件冲突 ([7d99e50](https://github.com/eleme/morjs/commit/7d99e5097d3a49537e2335c58656c4a1f81d055f))





## [1.0.54](https://github.com/eleme/morjs/compare/v1.0.53...v1.0.54) (2023-06-09)

**Note:** Version bump only for package @morjs/utils





## [1.0.50](https://github.com/eleme/morjs/compare/v1.0.49...v1.0.50) (2023-05-31)


### Features

* **plugin-compiler-bytedance:** 新增抖音分包异步化编译支持 ([#46](https://github.com/eleme/morjs/issues/46)) ([6e2ede2](https://github.com/eleme/morjs/commit/6e2ede2782bdbdc259d81deb603fccabc3f8f136))





## [1.0.31](https://github.com/eleme/morjs/compare/v1.0.30...v1.0.31) (2023-04-21)


### Bug Fixes

* **utils:** 升级 sass 版本为 1.60.0 确保对 node 12 的支持 ([4e3928e](https://github.com/eleme/morjs/commit/4e3928ed2d5a7efb6ba0ef98655c3e4460ecc016))





## [1.0.27](https://github.com/eleme/morjs/compare/v1.0.26...v1.0.27) (2023-04-19)


### Features

* **utils:** 提供通用 execCommands 方法便于执行脚本及错误处理 ([36dfc64](https://github.com/eleme/morjs/commit/36dfc64342f3dff3b240ced7b3f4335c60cd7180))





## [1.0.19](https://github.com/eleme/morjs/compare/v1.0.18...v1.0.19) (2023-03-31)

**Note:** Version bump only for package @morjs/utils





## [1.0.9](https://github.com/eleme/morjs/compare/v1.0.8...v1.0.9) (2023-03-17)


### Bug Fixes

* **plugin-compiler:** 修复由于 peerDependencies 导致的 webpack 多实例问题 ([#4](https://github.com/eleme/morjs/issues/4)) ([323b70b](https://github.com/eleme/morjs/commit/323b70b7826650fb3f90d2efa88d0215fee62da6))





## [1.0.5](https://github.com/eleme/morjs/compare/v1.0.4...v1.0.5) (2023-03-10)


### Features

* **plugin-compiler-web:** .json 文件支持条件编译 ([#3](https://github.com/eleme/morjs/issues/3)) ([d717375](https://github.com/eleme/morjs/commit/d717375bbad95413c9a23e639a78ec086d07b6e8))





## [1.0.4](https://github.com/eleme/morjs/compare/v1.0.3...v1.0.4) (2023-03-09)

**Note:** Version bump only for package @morjs/utils





## [1.0.1](https://github.com/eleme/morjs/compare/v1.0.0...v1.0.1) (2023-02-27)

**Note:** Version bump only for package @morjs/utils





# 1.0.0 (2023-02-22)

**Note:** Version bump only for package @morjs/utils
