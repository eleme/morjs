# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
