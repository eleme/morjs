# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
