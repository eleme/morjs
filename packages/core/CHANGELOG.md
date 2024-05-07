# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.86](https://github.com/eleme/morjs/compare/v1.0.85...v1.0.86) (2023-11-07)


### Reverts

* Revert "feat(core): 微信转支付宝页面behaviors无效 (#122)" ([e0e3c0e](https://github.com/eleme/morjs/commit/e0e3c0e925ab8079614b2fa4defda84cc6fb226f)), closes [#122](https://github.com/eleme/morjs/issues/122)





## [1.0.85](https://github.com/eleme/morjs/compare/v1.0.84...v1.0.85) (2023-11-06)


### Features

* **core:** 微信转支付宝页面behaviors无效 ([#122](https://github.com/eleme/morjs/issues/122)) ([0ea297b](https://github.com/eleme/morjs/commit/0ea297be5051b8e8e2b7be13899c0e026b13e123))





## [1.0.84](https://github.com/eleme/morjs/compare/v1.0.83...v1.0.84) (2023-10-31)


### Bug Fixes

* **core:** mixin 数组被转换成了对象 ([#117](https://github.com/eleme/morjs/issues/117)) ([c895e30](https://github.com/eleme/morjs/commit/c895e30b5b8bdddd2eb8ab6b537888b4291738b2))





## [1.0.69](https://github.com/eleme/morjs/compare/v1.0.68...v1.0.69) (2023-07-17)

**Note:** Version bump only for package @morjs/core





## [1.0.68](https://github.com/eleme/morjs/compare/v1.0.67...v1.0.68) (2023-07-14)


### Bug Fixes

* **core:** 修复 invokeHook 参数 hookName 的类型报错 ([#78](https://github.com/eleme/morjs/issues/78)) ([3e1cfcb](https://github.com/eleme/morjs/commit/3e1cfcb8d886f509b567383d84c5b087fb512809))


### Features

* **runtime-base:** 新增 hooks 的 pause、resume 方法，用于暂停/恢复部分 hooks 生命周期的执行 ([#77](https://github.com/eleme/morjs/issues/77)) ([aa712eb](https://github.com/eleme/morjs/commit/aa712ebf2603ecd5b1340f77c0d79e2e709476ad))





## [1.0.53](https://github.com/eleme/morjs/compare/v1.0.52...v1.0.53) (2023-06-07)

**Note:** Version bump only for package @morjs/core





## [1.0.52](https://github.com/eleme/morjs/compare/v1.0.51...v1.0.52) (2023-06-05)


### Bug Fixes

* **core:** 修复支付宝 DSL 下 lifetimes 无值可能导致报错的问题 ([#51](https://github.com/eleme/morjs/issues/51)) ([644f9b2](https://github.com/eleme/morjs/commit/644f9b208ca50af5158ac39af9216465d0dda638))





## [1.0.46](https://github.com/eleme/morjs/compare/v1.0.45...v1.0.46) (2023-05-19)


### Features

* **runtime-mini:** 对齐最新 lifetimes 的官方功能，优先使用官方提供的 lifetimes 方法，兜底使用 mor 的自实现 ([#38](https://github.com/eleme/morjs/issues/38)) ([0044d4a](https://github.com/eleme/morjs/commit/0044d4a8cc86fc619c505f664d098c033fb7d8a7))





## [1.0.34](https://github.com/eleme/morjs/compare/v1.0.33...v1.0.34) (2023-04-25)

**Note:** Version bump only for package @morjs/core





## [1.0.26](https://github.com/eleme/morjs/compare/v1.0.25...v1.0.26) (2023-04-18)

**Note:** Version bump only for package @morjs/core





## [1.0.11](https://github.com/eleme/morjs/compare/v1.0.10...v1.0.11) (2023-03-24)


### Bug Fixes

* **core:** 完善 invokeHook 方法兜底检查，找不到 hook 时打印错误日志，不直接抛错 ([f9f361b](https://github.com/eleme/morjs/commit/f9f361b1f88dee845abb4571d22bf4714e287626))





## [1.0.6](https://github.com/eleme/morjs/compare/v1.0.5...v1.0.6) (2023-03-10)

**Note:** Version bump only for package @morjs/core





## [1.0.4](https://github.com/eleme/morjs/compare/v1.0.3...v1.0.4) (2023-03-09)


### Bug Fixes

* **core:** fix wechat npm build support ([32af3e2](https://github.com/eleme/morjs/commit/32af3e2f772909e46e8be84bc4f60820dd00d604))





# 1.0.0 (2023-02-22)

**Note:** Version bump only for package @morjs/core
