# MorJS API

## tsTransformerFactory(visitor)

生成 ts 的 transformer 插件，提供 visitor 作为参数，遍历所有 Node 节点

- `visitor`: 自定义节点 visitor

## cssProcessorFactory(name, processor)

postcss 插件

- `name`: css 处理器作为 postcss 插件的名称
- `processor`: 自定义 css 处理器

## validKeysMessage(keys)

基于可选值生成描述信息

- `keys`: 可选值

## hexToRgb(hex)

将 16 进制的颜色值转换成 rgb 格式

- `hex`: 16 进制的颜色值

## isLightColor(r, g, b)

是否是浅色

- `r`: rgb 色值区域中的 red
- `g`: rgb 色值区域中的 green
- `b`: rgb 色值区域中的 blue

## senpmBinPATH(projectPath, env)

设置 NPM .bin 路径以复用 npm bin 文件

- `projectPath`: 项目路径
- `env`: 环境变量

## generateQrcodeForTerminal(input)

生成二维码字符串

- `input`: 用于生成二维码的字符串

## expandExtsWithConditionalExt(exts, conditionalExts)

将普通后缀扩展为普通后缀和带条件后缀的集合，条件后缀优先级高于普通后缀

- `exts`: 后缀列表
- `conditionalExts`: 条件后缀

## WebpackWrapper

webpack 封装，主要目的是 共用 webpack 的能力

```typescript
import { WebpackWrapper } from '@morjs/cli'

const webpack = new WebpackWrapper()
```

## WebpackChain

引用自 `webpack-chain-5` 的第三方依赖，直接 `export` 给开发者引用

## webpack

引用自 `webpack` 的第三方依赖，直接 `export` 给开发者引用

## glob

引用自 `takin` 的 `fastGlob` 对象，直接 `export` 给开发者引用

## posthtml

引用自 `posthtml` 的第三方依赖，直接 `export` 给开发者引用

## typescript

引用自 `typescript` 的第三方依赖，直接 `export` 给开发者引用

## micromatch

引用自 `micromatch` 的第三方依赖，直接 `export` 给开发者引用

## postcss

引用自 `postcss` 的第三方依赖，直接 `export` 给开发者引用

## slash

引用自 `slash` 的第三方依赖，直接 `export` 给开发者引用

## takin

引用自 `takin` 的依赖，直接 `export` 给开发者引用

## pRetry

引用自 `p-retry` 的第三方依赖，直接 `export` 给开发者引用

## pQueue

引用自 `p-queue` 的第三方依赖，直接 `export` 给开发者引用

## cjsToEsmTransformer

引用自 `cjstoesm` 的 `cjsToEsmTransformer` 对象，直接 `export` 给开发者引用
