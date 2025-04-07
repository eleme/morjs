# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.114-beta.20](https://github.com/eleme/morjs/compare/v1.0.114-beta.19...v1.0.114-beta.20) (2025-04-07)


### Bug Fixes

* 修复分包未下载时获取分包配置异常的问题 ([38992ac](https://github.com/eleme/morjs/commit/38992ac41c60cbb06e91cbaa90282f3bf81eb576))


### Features

* 优化多分包拆解子包执行时机，兼容本地研发compose场景 ([a17c5ed](https://github.com/eleme/morjs/commit/a17c5edd4d10cd5156d1bb38413eeaa2a434405a))





## [1.0.114-beta.18](https://github.com/eleme/morjs/compare/v1.0.114-beta.17...v1.0.114-beta.18) (2025-03-07)


### Bug Fixes

* 修复子分包产物路径匹配问题 ([b8a088d](https://github.com/eleme/morjs/commit/b8a088d7ff5143b6c2de22036ac13f03ca1647f1))





## [1.0.114-beta.17](https://github.com/eleme/morjs/compare/v1.0.114-beta.16...v1.0.114-beta.17) (2025-03-06)


### Features

* compose 支持单一分包工程产物里输出多分包的情况 ([403f087](https://github.com/eleme/morjs/commit/403f087cceb58d54dc5faa2657dff007c86d6b4c))





## [1.0.114-beta.15](https://github.com/eleme/morjs/compare/v1.0.114-beta.14...v1.0.114-beta.15) (2024-12-26)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.72](https://github.com/eleme/morjs/compare/v1.0.71...v1.0.72) (2023-08-01)


### Features

* **plugin-composer:** 支持在 CI 环境下打印更多的集成信息 ([#91](https://github.com/eleme/morjs/issues/91)) ([9b70c32](https://github.com/eleme/morjs/commit/9b70c32c2621fbe8690d7a306a231d057dd0fb57))





## [1.0.71](https://github.com/eleme/morjs/compare/v1.0.70...v1.0.71) (2023-07-26)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.69](https://github.com/eleme/morjs/compare/v1.0.68...v1.0.69) (2023-07-17)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.68](https://github.com/eleme/morjs/compare/v1.0.67...v1.0.68) (2023-07-14)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.60](https://github.com/eleme/morjs/compare/v1.0.59...v1.0.60) (2023-06-25)


### Bug Fixes

* **plugin-composer:** 修复监听状态下集成编译可能会错误将当前宿主或分包模块产物进行二次编译的问题 ([0e846c4](https://github.com/eleme/morjs/commit/0e846c4dff0f6bd8a82755306d6344df673548c1))





## [1.0.57](https://github.com/eleme/morjs/compare/v1.0.56...v1.0.57) (2023-06-21)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.54](https://github.com/eleme/morjs/compare/v1.0.53...v1.0.54) (2023-06-09)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.50](https://github.com/eleme/morjs/compare/v1.0.49...v1.0.50) (2023-05-31)


### Features

* **plugin-compiler-bytedance:** 新增抖音分包异步化编译支持 ([#46](https://github.com/eleme/morjs/issues/46)) ([6e2ede2](https://github.com/eleme/morjs/commit/6e2ede2782bdbdc259d81deb603fccabc3f8f136))





## [1.0.31](https://github.com/eleme/morjs/compare/v1.0.30...v1.0.31) (2023-04-21)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.29](https://github.com/eleme/morjs/compare/v1.0.28...v1.0.29) (2023-04-20)


### Bug Fixes

* **plugin-composer:** 修复不同配置的集成结果文件 compose-results.json 会相互覆盖的问题 ([fb91ac7](https://github.com/eleme/morjs/commit/fb91ac761783df647b31e16e66bb299cde1c641c))





## [1.0.28](https://github.com/eleme/morjs/compare/v1.0.27...v1.0.28) (2023-04-20)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.27](https://github.com/eleme/morjs/compare/v1.0.26...v1.0.27) (2023-04-19)


### Features

* **plugin-composer:** 完善集成临时文件存储逻辑，基于配置名称区分，避免多配置模式下集成缓存冲突 ([cbefb55](https://github.com/eleme/morjs/commit/cbefb55664c89ea94e8e199aca440a3c885603e2))





## [1.0.19](https://github.com/eleme/morjs/compare/v1.0.18...v1.0.19) (2023-03-31)


### Features

* **plugin-composer:** 优化模块集成脚本变化判断逻辑，避免错误判断导致脚本重复执行 ([b4c08fd](https://github.com/eleme/morjs/commit/b4c08fd149943d432b3cb25323c30f426a1df071))





## [1.0.9](https://github.com/eleme/morjs/compare/v1.0.8...v1.0.9) (2023-03-17)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.5](https://github.com/eleme/morjs/compare/v1.0.4...v1.0.5) (2023-03-10)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.4](https://github.com/eleme/morjs/compare/v1.0.3...v1.0.4) (2023-03-09)

**Note:** Version bump only for package @morjs/plugin-composer





## [1.0.1](https://github.com/eleme/morjs/compare/v1.0.0...v1.0.1) (2023-02-27)


### Features

* **plugin-composer:** 增加 --target, --compile-type, --output-path 命令行选项支持 ([4fc9e0a](https://github.com/eleme/morjs/commit/4fc9e0aa7fa927066089f2dfaf1d08886f98bdff))





# 1.0.0 (2023-02-22)

**Note:** Version bump only for package @morjs/plugin-composer
