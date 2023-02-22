# Runtime Core

## createApp(options, solution, extend)

注册 App

- `options`: MorJS 注册 App 的基础配置，必填 `object` 类型
- `solution`: 运行时 Solution 支持，非必填 `MorJSSolution | MorJSSolution[]` 类型
- `extend`: 模拟全局 App 构造函数，用于不存在 App 构造函数的环境，如 小程序插件

```typescript
import { createApp } from '@morjs/core'

createApp({
  onLaunch() {
    console.log('app onlaunch')
  }
})
```

## aApp(options, solution, extend)

注册支付宝小程序 App，用法和 createApp 一致

```typescript
import { aApp } from '@morjs/core'

aApp({
  onLaunch() {
    console.log('app onlaunch')
  }
})
```

## wApp(options, solution, extend)

注册微信小程序 App，用法和 createApp 一致

```typescript
import { wApp } from '@morjs/core'

wApp({
  onLaunch() {
    console.log('app onlaunch')
  }
})
```

## registerAppAdapters(adapters)

注册应用转端适配器

## createPage

Page 页面注册

- `options`: MorJS 注册 Page 的基础配置，必填 `object` 类型

```typescript
import { createPage } from '@morjs/core'

createPage({
  onLoad() {
    console.log('page onLoad')
  }
})
```

## aPage(options)

支付宝 Page 页面注册，用法和 createPage 一致

```typescript
import { aPage } from '@morjs/core'

aPage({
  onLoad() {
    console.log('page onLoad')
  }
})
```

## wPage(options)

微信 Page 页面注册，用法和 createPage 一致

```typescript
import { wPage } from '@morjs/core'

wPage({
  onLoad() {
    console.log('page onLoad')
  }
})
```

## registerPageAdapters(adapters)

注册页面转端适配器

## enhancePage(options, sourceType)

增强页面功能: 注入 adapters/hooks、转换声明周期等

- `options`: MorJS 注册 Page 的基础配置，必填 `object` 类型
- `sourceType`: 非必填配置，支持 `w`｜`a` 两种值，分别代表支付宝 DSL 与微信 DSL

```typescript
import { enhancePage } from '@morjs/core'

enhancePage(options, sourceType)
```

## createComponent(options, sourceType)

组件注册

- `options`: MorJS 注册 Component 组件的基础配置，必填 `object` 类型
- `sourceType`: 非必填配置，支持 `w`｜`a` 两种值，分别代表支付宝 DSL 与微信 DSL

```typescript
import { createComponent } from '@morjs/core'

createComponent({
  props: {},
  methods: {}
})
```

## aComponent(options, sourceType)

支付宝 Component 组件注册，用法和 createComponent 一致

```typescript
import { aComponent } from '@morjs/core'

aComponent({
  props: {},
  methods: {}
})
```

## wComponent(options, sourceType)

微信 Component 组件注册，用法和 createComponent 一致

```typescript
import { wComponent } from '@morjs/core'

wComponent({
  props: {},
  methods: {}
})
```

## registerComponentAdapters(adapters)

注册组件转端适配器

## enhanceComponent(options, sourceType, features)

增强组件功能: 注入 adapters/hooks、转换声明周期等

- `options`: 小程序组件配置
- `sourceType`: 小程序组件源码类型, 编译时由 MorJS 自动填充
- `features`: 功能特性配置

```typescript
import { enhanceComponent } from '@morjs/core'

enhanceComponent(options, sourceType, features)
```

## PageToComponent(pageOptions, sourceType, features)

将页面作为组件使用，仅供特殊场景下的使用，不保证完全的兼容性

- `pageOptions`: 页面配置
- `sourceType`: 源码类型
- `features`: 功能配置

```typescript
import { PageToComponent } from '@morjs/core'

PageToComponent(pageOptions, sourceType, features)
```

## aPageToComponent(pageOptions, features)

支付宝 Page 转组件辅助函数

- `pageOptions`: 页面配置
- `features`: 功能配置

```typescript
import { aPageToComponent } from '@morjs/core'

aPageToComponent(pageOptions, features)
```

## wPageToComponent(pageOptions, features)

微信 Page 页面转组件辅助函数

- `pageOptions`: 页面配置
- `features`: 功能配置

```typescript
import { wPageToComponent } from '@morjs/core'

wPageToComponent(pageOptions, features)
```

## createPlugin(options)

插件构造函数

- `options`: 插件选项
- `options.getApp`: 插件使用的 getApp 构造函数

```typescript
import { createPlugin } from '@morjs/core'

const plugin = createPlugin(options)
```

## aPlugin(options)

支付宝插件构造函数，用法和 createPlugin 一致

```typescript
import { aPlugin } from '@morjs/core'

const plugin = aPlugin(options)
```

## wPlugin(options)

微信插件构造函数，用法和 createPlugin 一致

```typescript
import { wPlugin } from '@morjs/core'

const plugin = wPlugin(options)
```

## init(solution)

初始化, 创建 $hooks 及应用 solutions

- `solution`: solution 解决方案

```typescript
import { init } from '@morjs/core'

const { $hooks, pluginsNames } = init(solution)
```
