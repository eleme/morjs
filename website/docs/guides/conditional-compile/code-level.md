# 条件编译 (代码维度)

## 背景

目前对于多端代码有适配难题或者期望能够根据当前环境来构建输出不同的代码。因此 MorJS 支持根据注释来实现条件编译, 编译后会把符合条件的代码直接清空。

## 语法支持

### 目前支持的语法

- `#if`（判断变量值）
- `#ifdef` （判断是否有变量）
- `#ifndef` （判断是否无变量）
- `#endif` （结束语句, **必须要有！**）

### 目前支持的文件类型

- `js`
- `ts`
- `wxss`
- `acss`
- `less`
- `scss`
- `wxml`
- `axml`
- `jsonc`
- `json5`

### 尚未支持的文件类型

目前由于 `json` 文件不支持注释语句, 针对 `json` 文件的条件编译, 可以使用 `jsonc` 或 `json5` 的代码纬度条件编译或者 `json` 的文件纬度条件编译。

### 默认注入的变量

- `name`（`mor.config.ts` 中的每项配置的 `name`）
- `[name]: true` （配置的 `name` 会转成一个 key）
  - 例如: `name: 'ali'`，那么就会有一个 `ali: true`，主要用于 `ifdef` 的场景
- `production` 是否是生产环境的配置，生产环境下默认为 `true`，开发环境下默认为 `undefined`
- `target` （`mor.config.ts` 中的每项配置的 `target`）
- `[target]: true` （配置中的 `target` 会自动转换成为一个 key）
  - 例如：`target: 'alipay'`，那么就会有一个 `alipay: true`，主要用于 `ifdef` 的场景

例如：

当用户配置（`mor.config.ts`）为如下内容时：

```typescript
import { defineConfig } from '@morjs/cli'
export default defineConfig([
  {
    name: 'ali',
    mode: 'production',
    target: 'alipay'
  }
])
```

条件编译的上下文会自动注入如下变量：

```javascript
{
  name: 'ali',
  ali: true,
  production: true,
  target: 'alipay',
  alipay: true
}
```

### 自定义条件编译变量

如果默认注入的变量无法满足你的诉求, 业务可以在`mor.config.ts`中自定义条件编译的变量值, 请参考代码示例中的`conditionalCompile.context`配置。

- 请注意, 如果有多个编译方案, `conditionalCompile.context` 建议是都需要设置, 且里面的 `key` 都必须存在在所有 `conditionalCompile.context` 中。
- 如果缺失 `conditionalCompile.context` 值或者 `conditionalCompile.context` 中没有该 `key`, MorJS 会把 `#if test == '123'` 这种条件默认当成`false`处理。

## 代码示例

### mor.config.ts 配置示例

```javascript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'alipay',
    conditionalCompile: {
      context: {
        test: '123'
      }
    }
  },
  {
    name: 'wechat',
    // 自定义条件编译的变量
    conditionalCompile: {
      context: {
        test: '456'
      }
    }
  }
])
```

### #ifdef（判断是否有变量）

#### js/ts 文件类型

```javascript
/* #ifdef wechat */
console.log('这句话只会在微信上显示')
/* #endif */
/* #ifdef alipay */
console.log('这句话只会在支付宝上显示')
/* #endif */
```

#### acss/less 文件类型

在微信下背景是红色, 在支付宝下是蓝色背景

```less
.index-page {
  /* #ifdef wechat */
  background: red;
  /* #endif */
  /* #ifdef alipay */
  background: blue;
  /* #endif */
}
```

#### wxml/axml 文件类型

```html
<!-- #ifdef wechat -->
<view>只会在微信上显示</view>
<!-- #endif -->
<!-- #ifdef alipay -->
<view>只会在支付宝上显示</view>
<!-- #endif -->
```

### #ifndef（判断是否无变量）

#### js/ts 文件类型

```javascript
/* #ifndef wechat */
console.log('除了在微信以外的端都展示')
/* #endif */
```

#### wxss/acss/less/scss 文件类型

```less
.index-page {
  /* #ifndef wechat */
  background: red;
  /* #endif */
}
```

#### wxml/axml 文件类型

```html
<!-- #ifndef wechat -->
<view>除了在微信以外的端都展示</view>
<!-- #endif -->
```

#### jsonc/json5 文件类型

```javascript
{
  "component": true,
  "usingComponents": {
    // #ifndef wechat
    "any-component": "./wechat-any-component",
    // #endif

    "other-component": "./other-component"
  }
}
```

### #if（判断变量值）

#### js/ts 文件类型

```javascript
/* #if name == 'wechat' */
console.log('这句话只会在微信上显示')
/* #endif */

/* #if name == 'alipay' */
console.log('这句话只会在支付宝上显示')
/* #endif */
```

#### wxss/acss/less/scss 文件类型

```less
.index-page {
  /* #if name == 'wechat' */
  background: red;
  /* #endif */

  /* #if name == 'alipay' */
  background: blue;
  /* #endif */
}
```

#### wxml/axml 文件类型

```html
<!-- #if name == 'wechat' -->
<view>只会在微信上显示</view>
<!-- #endif -->

<!-- #if name == 'alipay' -->
<view>只会在支付宝上显示</view>
<!-- #endif -->
```

#### jsonc/json5 文件类型

```javascript
{
  "component": true,
  "usingComponents": {
    // #if name == 'wechat'
    "any-component": "./wechat-any-component",
    // #endif

    // #if name == 'alipay'
    "any-component": "./alipay-any-component",
    // #endif

    "other-component": "./other-component"
  }
}
```
