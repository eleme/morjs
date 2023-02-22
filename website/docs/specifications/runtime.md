# 多端运行时基础库规范

## 概要

MorJS 的运行时插件体系主要是基于:

- 小程序生命周期的维度
- 复杂小程序多形态支持

两个方面的需求，来开发和实现的。

请注意，MorJS 要求所有运行时插件都必须微信小程序、支付宝小程序等，如果仅支持单端，请务必说明，以免对使用方造成不必要的麻烦。

依赖库的开发需要遵循 [小程序 JS 依赖库规范](/specifications/js)，请务必查看。

关于复杂小程序多形态支持，参见文档 [复杂小程序集成](/guides/advance/complex-miniprogram-integration.md) 和 [小程序形态一体化](/guides/advance/unity-of-forms.md)

## 基础规范

- 命名：运行时插件名称请都采用 `mor-runtime-plugin-`开头，保持统一
- 版本：都以 `1.x` 为开始
- 文档：请在插件的 `README.md` 上面提供完整的使用说明文档及多端支持情况

## 注意事项

- 插件的初始化、逻辑等耗时需要密切关注，不能过长，因为项目的逻辑执行顺序是在插件的 `hook` 之后
- 插件逻辑不能强依赖业务输入，务必做好异常或者参数缺失等的兜底处理，并在异常情况下提供友好的带指引的消息提醒
  - 建议的格式为 `console.warn('[plugin-xx]: 消息内容')`
- 插件请使用 `TypeScript`，并通过 `tsc` 输出 `ES5` 版本的代码
- MorJS 会通过 `hooks` 对象开放对应的生命周期的 `hook` 注册监听。
- 除了 `appOnConstruct`、`pageOnConstruct`、`componentOnConstruct` 这三个生命周期以外，其余均是标准的小程序生命周期
  - 在标准的小程序生命周期 `hook` 中，插件均能完整拿到对应的参数，比如在 `appOnLaunch` 中，插件可以获取到一个`options` 对象，里面有 `query`、`scene`、`path` 等参数。其他生命周期如此类推，直接看小程序的官方文档即可
  - 在 `appOnConstruct`、`pageOnConstruct`、`componentOnConstruct` 这三个生命周期中，插件可以获取到当前传入给 `aApp/wApp`、`aPage/wPage`、`aComponent/wComponent` 的 `options` 对象实例，请谨慎修改

## 生命周期列表

| 类型                     | 生命周期 Hook 名称                       | 说明                                                                                                 |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| wApp 或 aApp             | appOnConstruct                           | 在应用初始化前执行，请注意不要进行长时间耗时的任务                                                   |
|                          | appOnLaunch                              | 在 `wApp` 或 `aApp` 的 `onLaunch` 生命周期触发                                                       |
|                          | appOnError                               | 在 `wApp` 或 `aApp` 的 `onError` 生命周期触发                                                        |
|                          | appOnShow                                | 在 `wApp` 或 `aApp` 的 `onShow` 生命周期触发                                                         |
|                          | appOnHide                                | 在 `wApp` 或 `aApp` 的 `onHide` 生命周期触发                                                         |
| wPage 或 aPage           | pageOnConstruct                          | 在页面初始化前执行，请注意这个生命周期会在应用启动后就立刻执行，并不是等用户切换到对应的页面才会执行 |
|                          | pageOnLoad                               | 在 `wPage` 或 `aPage` 的 `onLoad` 生命周期触发                                                       |
|                          | pageOnReady                              | 在 `wPage` 或 `aPage` 的 `onReady` 生命周期触发                                                      |
|                          | pageOnShow                               | 在 `wPage` 或 `aPage` 的 `onShow` 生命周期触发                                                       |
|                          | pageOnHide                               | 在 `wPage` 或 `aPage` 的 `onHide` 生命周期触发                                                       |
|                          | pageOnUnload                             | 在 `wPage` 或 `aPage` 的 `onUnload` 生命周期触发                                                     |
| wComponent 或 aComponent | componentOnConstruct                     | 在组件初始化前执行，请注意这个生命周期会在应用启动后就立刻执行，并不是等组件渲染的时候才执行         |
|                          | componentOnInit, componentOnCreated      | 在 `wComponent` 的 `created` 或 `aComponent` 的 `onInit` 生命周期触发                                |
|                          | componentDidMount, componentOnReady      | 在 `wComponent` 的 `ready` 或 `aComponent` 的 `didMount` 生命周期触发                                |
|                          | componentDidUnmount, componentOnDetached | 在 `wComponent` 的 `detached` 或 `aComponent` 的 `didUnmount` 生命周期触发                           |

### `hook` 函数

在插件的 `apply` 函数中，会得到一个 `hooks` 对象，对象中会有上面的所有生命周期列表的 `hook`。

插件请用 `tap` 来注册对应的 `hook`, `tap` 接受两个参数：

- `pluginName`：插件名
- `pluginHandle`：插件逻辑

```typescript
$hooks.appOnLaunch.tap(pluginName, pluginHandle)
```

详情可以参考下面的插件源代码示例。

## 插件示例

### 初始化

MorJS 已经提供脚手架，请通过以下命令来快速初始化。

```bash
mor init your_custom_runtime_plugin
```

并选择 `MorJS 多端组件库工程`。

### 类型声明

MorJS 提供了 `@morjs/api` 基础库，插件项目直接引用这个库即可。

可以参考该 `tsconfig.json` 示例：

```typescript
{
  "compilerOptions": {
    "declaration": true,
    "target": "ES5",
    "importHelpers": true,
    "module": "CommonJS",
    "moduleResolution": "Node",
    "rootDir": "./src",
    "outDir": "./lib",
    "lib": ["ES6", "ESNext", "DOM"]
  },
  "include": ["src"]
}
```

### 插件源代码示例

- 如果插件需要有设置参数，请务必将 `options` 的 `interface` `export` 出去，方便可能需要集成的使用方引用
- 插件需要声明为一个 `class`，同时实现 `MorJSPlugin` 这个 `interface`
- 插件必须要有 `apply` 函数
- 插件调用方不能保证 `apply` 函数里面的 `this` 指向，因此建议都 `class` 下面的方法**都用箭头函数**，避免 `this` 指向问题
- `hook` 里面的监听函数必须用普通函数，因为在 `hook` 调用的时候会动态修改 `this` 指向，指向当前的 `app`、`page`、`component` 实例

```typescript
import type { MorJSPlugin, MorJSHooks } from '@morjs/api'

// export 出去，方便使用方集成
export interface IRuntimePluginExampleOptions {}

export default class RuntimePluginExample implements MorJSPlugin {
  // 必须要有插件名字
  pluginName = 'RuntimePluginExample'

  options: IRuntimePluginExampleOptions

  /**
   * 根据插件特性决定是否需要开放选项配置
   */
  constructor(public options: IRuntimePluginExampleOptions = {}) {}

  /**
   * 必须要有 apply 函数
   * class 下面的方法用 arrow function
   */
  apply = (hooks: MorJSHooks): void => {
    // 注意，这里是 arrow function

    // hooks 里面包含上面生命周期列表中的所有hook
    // 请用 tap 来做 hook 的事件监听注册
    // 传入的插件执行函数必须是 function(){}, 因为会动态修改 this 指向
    hooks.appOnLaunch.tap(
      this.pluginName,
      function (
        this: tinyapp.IAppInstance<any>,
        options: tinyapp.IAppLaunchOptions
      ) {
        // 这里可以拿到对应生命周期里面的参数
        console.log(options)
      }
    )
  }
}
```

### 插件编译输出

- 请采用 `tsc` 输出 `ES5` 代码
- 如果运行时插件可以同时兼容多端，直接输出单个 `lib` 目录即可
- 如果运行时插件不能同时兼容多端，请参考分端加载规范

完整规范请查看 [小程序 JS 依赖库规范](/specifications/js.md)

### 使用方式

通过 MorJS 提供的 `aApp` 或 `wApp` 来使用插件的方法：

```javascript
// 在小程序的 app.js 中
import aApp from '@morjs/core'
import YourCustomRuntimePlugin from 'your_custom_runtime_plugin'

aApp(
  {
    onLaunch() {}
  },
  [
    () => {
      plugins: [new YourCustomRuntimePlugin()]
    }
  ]
)
```
