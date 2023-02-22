# 运行时

基于源代码来做的静态转换过程中，很难去处理动态内容，所以 MorJS 提出了 **编译时** + **运行时** 的综合方案，其中针对 JS 的部分，提供了 **运行时** 的封装打包，在执行的时候动态适配。

## 动态运行时示例

在运行时，针对源码类型不同，`@morjs/core` 提供不了同的方式来替换原生的 `App`、`Page`、`Component`

- 支付宝小程序 DSL 中，提供 `aApp`、`aPage`、`aComponent`
  - `aApp`: 提供了最顶层的入口，作为业务的 solution 执行地方，注册 MorJS 的运行时插件体系
  - `aPage`: 提供了额外的 mixins 能力来拓展业务，并拓展和自定义组件的函数执行抹平
  - `aComponent`: 提供了额外的 mixins 能力来拓展业务，提供了完整的自定义组件的多端抹平能力
- 微信小程序 DSL 中，提供 `wApp`、`wPage`、`wComponent`
  - `wApp`: 提供了最顶层的入口，作为业务的 solution 执行地方，注册 MorJS 的运行时插件体系
  - `wPage`: 提供了额外的 mixins 能力来拓展业务，并拓展和自定义组件的函数执行抹平
  - `wComponent`: 提供了额外的 mixins 能力来拓展业务，提供了完整的自定义组件的多端抹平能力

### 安装与使用

1. 安装依赖: `npm install @morjs/core --save`
2. 引用依赖:

- 支付宝 DSL: `import { aApp, aPage, aComponent } from '@morjs/core'`
- 微信 DSL: `import { wApp, wPage, wComponent } from '@morjs/core'`

3. 全局替换:

- 支付宝 DSL: `App -> aApp` / `Page -> aPage` / `Component -> aComponent`
- 微信 DSL: `App -> wApp` / `Page -> wPage` / `Component -> wComponent`

<img src="https://img.alicdn.com/imgextra/i4/O1CN01VnYRen1NTZ2DQnoIz_!!6000000001571-2-tps-5679-2088.png" width="1200" />

### 扩展能力使用

在 MorJS 中默认集成了 contextPlugin 以及 eventPlugin 插件，因此在 `getApp()` 上，默认会挂载有 `$context` 及 `$event` 的属性

```typescript
import { aPage } from '@morjs/core'

aPage({
  onLoad() {
    const { appQuery } = getApp().$context
    console.log('app.js 的 onLaunch 中的全局参数:', appQuery)

    const { all, emit, off, on, once } = getApp().$event
    // 全局事件支持，提供 emit, off, on, once 方法进行绑定
  }
})
```

## aApp/wApp

通过 `aApp(options, solution)` / `wApp(options, solution)` 作为小程序业务逻辑的入口逻辑收拢，实现底层抹平能力的调用及插件话能力输出，并提供拓展能力，同时支持业务自定义 `solution` 的集成。

### 基础使用

`aApp` / `wApp` 的第一个参数 `options` 和微信/支付宝小程序的 `App` 一致，具体使用请参考小程序文档:

- [微信官方文档-小程序框架接口-小程序 App](https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html)
- [支付宝文档中心-小程序全局配置-app.js 注册小程序](https://opendocs.alipay.com/mini/framework/app-detail)

```typescript
import { aApp } from '@morjs/core'

aApp({
  onLaunch() {
    console.log('当小程序初始化完成时触发，全局只触发一次')
  },
  onShow() {
    console.log('当小程序启动，或从后台进入前台显示时触发')
  },
  onHide() {
    console.log('当当前页面被隐藏时触发，例如跳转、按下设备 Home 键离开')
  },
  onError() {
    console.log('当小程序发生 js 错误时触发')
  }
})
```

`aApp` / `wApp` 的第二个参数 `solution` 可以提供业务自身业务域的运行时 `solution` 或运行时插件 `runtime-plugin`

```typescript
import { aApp } from '@morjs/core'
import SolutionXXX from 'mor-runtime-solution-xxx'
import PluginXXX from 'mor-runtime-plugin-xxx'

aApp(
  {
    onLaunch() {
      console.log('当小程序初始化完成时触发，全局只触发一次')
    }
  },
  [
    SolutionXXX(),
    () => {
      return {
        plugins: [new PluginXXX()]
      }
    }
  ]
)
```

## aPage/wPage

通过 `aPage(options)` / `wPage(options)` 作为页面业务逻辑的统一收口，实现多端的底层转换抹平，并提供如 `mixins` 等拓展能力。

### 基础使用

`aPage` / `wPage` 在基础功能上和微信/支付宝小程序的 `Page` 一致，具体请参考小程序文档:

- [微信官方文档 - 小程序框架接口 - 小程 序 Page](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html)
- [支付宝文档中心 - 小程序全局配置 - page.js 注册小程序](https://opendocs.alipay.com/mini/framework/page-detail)

```typescript
import { aPage } from '@morjs/core'

aPage({
  data: {
    title: 'Alipay'
  },
  onLoad(query) {
    console.log('当页面初始化完成时触发')
  },
  onShow() {
    console.log('当页面启动，或从后台进入前台显示时触发')
  }
})
```

### 生命周期拓展

`aPage` / `wPage` 除已有的小程序生命周期外，还增加实现了 `appLifetimes` 用于监听 `App` 的 `onShow` 和 `onHide` 生命周期事件，示例用法如下:

```typescript
import { aPage } from '@morjs/core'

aPage({
  appLifetimes: {
    show() {
      console.log('app onShow', 'index-page', this)
    },
    hide() {
      console.log('app onHide', 'index-page', this)
    }
  }
})
```

### Mixins 支持

小程序在 `Component` 的维度上支持的 `mixins`，使用 `mixins` 能够解耦业务可复用逻辑，因此 MorJS 在 `Page` 的维度上也实现了 `mixins` 的机制，使用上基本与 `Component` 一致，提供 `{ mixins: [mixin1, mixin2] }` 的 `mixin` 数组即可。有以下的注意点:

- `mixin` 必须是一个对象，里面是希望给 `aPage` / `wPage` 合并的各种属性
- `data` 等 `Object` 类型的对象属性均会合并
- 生命周期的钩子函数会合并依次执行，`aPage` / `wPage` 选项的生命周期最后执行
- 非 `Object` 类型的属性（如：函数）会被同名的属性覆盖，`aPage` / `wPage` 选项的属性优先级最高

```typescript
import { aPage } from '@morjs/core'

const mixinA = {
  data: {
    x: 1,
    y: 2
  },
  onLoad() {
    console.log('mixina', 'onLoad')
  },
  foo() {
    console.log('mixina', 'foo')
  },
  test: {
    t: 1,
    o: 3
  },
  no: 'xxxx'
}

const mixinB = {
  data: {
    z: 3
  },
  onLoad() {
    console.log('mixinb', 'onLoad')
  },
  mixinBMethod() {
    console.log('mixinb', 'mixinBMethod')
  },
  foo() {
    console.log('mixinb', 'foo')
  },
  test: {
    t: 2
  },
  no: 'hahaha'
}

aPage({
  mixins: [mixinA, mixinB],
  onLoad() {
    // 生命周期依次打印 mixina onLoad -> mixinb onLoad -> page onLoad
    console.log('page', 'onLoad')
    // 执行的是 mixinB 的 foo 方法
    this.foo()
    // { x: 1, y: 2, z: 3 } mixinA 和 mixinB 的 data 会合并
    console.log(this.data)
    // { o: 3, t: 2 } mixinA 和 minxinB 都设置了 test 的 t
    // mixinB 的 test.t 会覆盖 mixinA 的 test.t
    console.log(this.test)
    // hahaha minxinB 会覆盖 minxinA 的同名属性
    console.log(this.no)
    // 当前实例会有 mixin 提供的方法
    console.log(this.mixinBMethod)
  }
})
```

### $eventListener 语法糖

针对 eventPlugin 插件上用到的高频用到的事件监听和取消监听，MorJS 拓展了语法，可以直接在 `aPage` / `wPage` 中直接使用。

- `$eventListener` 会在 `Page` 的 `onLoad` 生命周期中进行事件的绑定，在 `onUnload` 生命周期中进行事件的解绑，业务可以不用再去关心事件的解绑逻辑
- `$eventListener` 会在内部处理好 `this` 对象，直接指向当前的实例，不需要业务去关心绑定，业务请勿在事件的回调函数中使用箭头函数，否则会导致 `this` 对象异常
- `$eventListener` 是一个对象: `key` 是事件名，`value` 是事件的回调函数
- `$eventListener` 只针对需要多次监听的事件，对于只需要监听一次的，请参考 `event` 插件的 `once` 的用法

以下示例代码以常见的刷新页面数据为例，其中 refreshPage 是事件名

```typescript
import { aPage } from '@morjs/core'

aPage({
  // 会自动做事件的绑定和解绑
  $eventListener: {
    // refreshPage是监听的事件名
    refreshPage: function (storeId) {
      console.log('in page $eventListener refreshPage', storeId)
    }
  }
})
```

触发代码示例:

```typescript
import { aPage } from '@morjs/core'

aPage({
  data: {
    storeId: '123'
  },
  onStoreChange: function () {
    // 调用方依然只需要根据$event插件的方式，直接调用即可
    getApp().$event.emit('refreshPage', this.data.storeId)
  }
})
```

## aComponent/wComponent

通过 `aComponent(options)` / `wComponent(options)` 作为自定义组件业务逻辑的统一收口，实现多端的底层转换抹平，并提供如 `mixins` 等拓展能力。

### 基础使用

`aComponent(options)` / `wComponent(options)` 在基础功能上和微信/支付宝小程序的 `Component` 一致，具体请参考小程序文档:

- [微信官方文档 - 小程序框架接口 - 小程序 Component](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html)
- [支付宝文档中心 - 小程序全局配置 - 自定义组件介绍](https://opendocs.alipay.com/mini/framework/custom-component-overview)

```typescript
import { aComponent } from '@morjs/core'

aComponent({
  // 组件内部数据
  data: { x: 1 },
  // 可给外部传入的属性添加默认值
  props: { y: 1 },
  // 生命周期函数
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  // 自定义方法
  methods: {
    handleTap() {
      // 可使用 setData 改变内部属性
      this.setData({ x: this.data.x + 1 })
    }
  }
})
```

### 生命周期拓展

`aComponent` / `wComponent` 除已有的小程序生命周期外，还增加实现了 `pageLifetimes` 用于监听 `Page` 的 `onShow` 和 `onHide` 生命周期事件，示例用法如下:

```typescript
import { aComponent } from '@morjs/core'

aComponent({
  pageLifetimes: {
    show() {
      console.log('页面触发 onShow')
    },
    hide() {
      console.log('页面触发 onHide')
    }
  }
})
```

### Mixins 支持

小程序在 `Component` 的维度上支持的 `mixins`，使用 `mixins` 能够解耦业务可复用逻辑，因此 MorJS 在 `Component` 的维度上也同样支持 `mixins` 的机制，使用上基本与 `Component` 一致，提供 `{ mixins: [mixin1, mixin2] }` 的 `mixin` 数组即可。有以下的注意点:

- `mixin` 必须是一个对象，里面是希望给 `aPage` / `wPage` 合并的各种属性
- `data` 等 `Object` 类型的对象属性均会合并
- 生命周期的钩子函数会合并依次执行，`aPage` / `wPage` 选项的生命周期最后执行
- 非 `Object` 类型的属性（如：函数）会被同名的属性覆盖，`aPage` / `wPage` 选项的属性优先级最高

```typescript
import { aComponent } from '@morjs/core'

const mixinA = {
  data: {
    x: 1
  },
  didMount() {
    console.log('mixina', 'didMount')
  },
  methods: {
    foo() {
      console.log('mixina', 'foo')
    }
  }
}

const mixinB = {
  data: {
    y: 2
  },
  didMount() {
    console.log('mixinb', 'didMount')
  },
  methods: {
    foo() {
      console.log('mixinb', 'foo')
    }
  }
}

aComponent({
  mixins: [mixinA, mixinB],
  didMount() {
    // 生命周期依次打印 mixina didMount -> mixinb didMount -> component didMount
    console.log('component', 'didMount')
    // 执行的是 mixinB 的 foo 方法
    this.foo()
    // { x: 1, y: 2, z: 3 } mixinA 和 mixinB 的 data 会合并
    console.log(this.data)
  }
})
```

### $eventListener 语法糖

针对 eventPlugin 插件上用到的高频用到的事件监听和取消监听，MorJS 拓展了语法，可以直接在 `aComponent` / `wComponent` 中直接使用。

- `$eventListener` 会在 `Component` 的 `didMount` 生命周期中进行事件的绑定，在 `didUnmount` 生命周期中进行事件的解绑，业务可以不用再去关心事件的解绑逻辑
- `$eventListener` 会在内部处理好 `this` 对象，直接指向当前的实例，不需要业务去关心绑定，业务请勿在事件的回调函数中使用箭头函数，否则会导致 `this` 对象异常
- `$eventListener` 是一个对象: `key` 是事件名，`value` 是事件的回调函数
- `$eventListener` 只针对需要多次监听的事件，对于只需要监听一次的，请参考 `event` 插件的 `once` 的用法

以下以修改了页面的门店为例，其中 changeStore 是事件名

```typescript
import { aComponent } from '@morjs/core'

aComponent({
  // 会自动做事件的绑定和解绑
  $eventListener: {
    // changeStore是监听的事件名
    changeStore: function (storeId) {
      console.log('in component $eventListener changeStore', storeId)
    }
  }
})
```

触发代码示例:

```typescript
import { aComponent } from '@morjs/core'

aPage({
  data: {
    storeId: '123'
  },
  onStoreChange: function () {
    // 调用方依然只需要根据$event插件的方式，直接调用即可
    getApp().$event.emit('changeStore', this.data.storeId)
  }
})
```

### 注意事项

由于在微信小程序和支付宝小程序的自定义组件差异较大，因此有部分事项是需要特别注意的

1. props 必须完整

- 问题表现：在支付宝小程序中，你可以在 `props` 中没有定义某个属性，但是在实际使用中直接引用 `this.props.xx`，但是由于在微信等端外小程序中需要对 `props` 进行分析并动态赋值，因此必须要有完整的 `props` 列表
- 解决方案：将所有使用到的 `props` 属性都声明在 `props` 中

1. `props` 中的函数名字必须为 on 开头的 onEvent 格式

- 问题表现：在支付宝中，自定义组件对外的函数入参都必须要求以 on 开头
- 解决方案：

```typescript
import { aComponent } from '@morjs/core'

aComponent({
  props: {
    onClick() {} // 必须为onX的格式
  }
})
```
