# Runtime Hooks

## 介绍

- 在插件的 `apply` 函数中，会得到一个 `morHooks` 对象，对象中会有下面的所有生命周期列表的 `hook`，插件可使用 `tap` 来注册对应的 `hook`，`tap` 接受两个参数:
  - `pluginName`: 插件名
  - `pluginHandle`: 插件逻辑
- 若插件有设置参数 `IRuntimePluginXXXOptions`，请将 `options` 的 `interface` 给 `export` 出去，方便可能需要集成的使用方进行引用
- 插件调用方不能保证 `apply` 函数里面的 `this` 指向，因此建议都 `class` 下面的方法都用箭头函数，避免 `this` 指向问题
- `hook` 里面的监听函数必须用普通函数，因为在 hook 调用的时候会动态修改 this 指向，指向当前的 `app`、`page`、`component` 实例
- `hook` 里面的监听函数带两个参数:
  - `this`: 可以指向当前的 `app`、`page`、`component` 实例
  - `options`: 可以拿到对应生命周期里面的参数

## Hooks 列表

```typescript
import type { MorJSHooks, MorJSPlugin } from '@morjs/api'

export interface IRuntimePluginXXXOptions {
  key: value
}

export default class RuntimePluginXXX implements MorJSPlugin {
  pluginName = 'RuntimePluginXXX'
  pluginOptions: IRuntimePluginXXXOptions

  constructor(options?: IRuntimePluginXXXOptions) {
    this.pluginOptions = {
      ...options
    }
  }

  apply = (morHooks: MorJSHooks): void => {
    /* App 相关 hooks */
    // appOnConstruct: 在应用初始化前执行，请注意不要进行长时间耗时的任务
    morHooks.appOnConstruct.tap(this.pluginName, function (this, options) {
      console.log('app 应用 onConstruct 生命周期，初始化前触发')
    })

    // appOnInit: 已废弃 出于兼容性暂不移除，请直接使用 appOnConstruct
    morHooks.appOnInit.tap(this.pluginName, function (this, options) {
      console.log('app 应用 onInit 生命周期，初始化阶段触发')
    })

    // appOnLaunch: 在 onLaunch 生命周期触发，建议一般组件在这个生命周期执行初始化
    morHooks.appOnLaunch.tap(this.pluginName, function (this, options) {
      console.log('app 应用 onLaunch 生命周期，初始化阶段完成时触发')
    })

    // appOnError: 在 App 的 onError 生命周期触发
    morHooks.appOnError.tap(this.pluginName, function (this, options) {
      console.log('app 应用 onError 生命周期，小程序发生 js 错误时触发')
    })

    // appOnShow: 在 App 的 onShow 生命周期触发
    morHooks.appOnShow.tap(this.pluginName, function (this, options) {
      console.log(
        'app 应用 onShow 生命周期，当小程序启动，或从后台进入前台显示时触发'
      )
    })

    // appOnHide: 在 App 的 onHide 生命周期触发
    morHooks.appOnHide.tap(this.pluginName, function (this, options) {
      console.log(
        'app 应用 onHide 生命周期，小程序被隐藏时触发，例如跳转、按下设备 Home 键离开等'
      )
    })

    // appOnPageNotFound: 在 App 的 onPageNotFound 被调用时触发
    morHooks.appOnPageNotFound.tap(this.pluginName, function (this, options) {
      console.log(
        'app 应用 onPageNotFound 生命周期，小程序要打开的页面不存在时触发'
      )
    })

    // appOnUnhandledRejection: 在 App 的 onUnhandledRejection 被调用时触发
    morHooks.appOnUnhandledRejection.tap(
      this.pluginName,
      function (this, options) {
        console.log(
          'app 应用 onUnhandledRejection 生命周期，当 Promise 被 reject 且没有 reject 处理器时触发'
        )
      }
    )

    /* Page 相关 hooks */
    // pageOnConstruct: 在页面初始化前执行，请注意这个生命周期会在应用启动后就立刻执行，并不是等用户切换到对应的页面才会执行
    morHooks.pageOnConstruct.tap(this.pluginName, function (this, options) {
      console.log('page 页面 onConstruct 生命周期，初始化前触发')
    })

    // pageOnInit: 已废弃 出于兼容性暂不移除，请直接使用 pageOnConstruct
    morHooks.pageOnInit.tap(this.pluginName, function (this, options) {
      console.log('page 页面 onInit 生命周期，初始化阶段触发')
    })

    // pageOnLoad: 在 Page 的 onLoad 生命周期触发
    morHooks.pageOnLoad.tap(this.pluginName, function (this, options) {
      console.log('page 页面 onLoad 生命周期，页面加载时触发')
    })

    // pageOnReady: 在 Page 的 onReady 生命周期触发
    morHooks.pageOnReady.tap(this.pluginName, function (this, options) {
      console.log('page 页面 onReady 生命周期，页面初次渲染完成时触发')
    })

    // pageOnShow: 在 Page 的 onShow 生命周期触发
    morHooks.pageOnShow.tap(this.pluginName, function (this, options) {
      console.log('page 页面 onShow 生命周期，页面显示时触发')
    })

    // pageOnHide: 在 Page 的 onHide 生命周期触发
    morHooks.pageOnHide.tap(this.pluginName, function (this, options) {
      console.log('page 页面 onHide 生命周期，页面隐藏时触发')
    })

    // pageOnUnload: 在 Page 的 onUnload 生命周期触发
    morHooks.pageOnUnload.tap(this.pluginName, function (this, options) {
      console.log('page 页面 onUnload 生命周期，页面卸载时触发')
    })

    /* Component 相关 hooks */
    // componentOnConstruct: 在 Component 创建前触发(组件注册的阶段)
    morHooks.componentOnConstruct.tap(
      this.pluginName,
      function (this, options) {
        console.log('component 组件 onConstruct 生命周期，注册阶段触发')
      }
    )

    // componentOnInit: 在 Component 的 onInit 生命周期触发
    morHooks.componentOnInit.tap(this.pluginName, function (this, options) {
      console.log('component 组件 onInit 生命周期，组件创建时触发')
    })

    // componentOnCreated: 在 Component 的 created 生命周期触发
    morHooks.componentOnCreated.tap(this.pluginName, function (this, options) {
      console.log('component 组件 created 生命周期，组件实例刚刚被创建时执行')
    })

    // componentDidMount: 在 Component 的 didMount 生命周期触发
    morHooks.componentDidMount.tap(this.pluginName, function (this, options) {
      console.log('component 组件 didMount 生命周期，组件创建完毕时触发')
    })

    // componentOnAttached: 在 Component 的 attached 生命周期触发
    morHooks.componentOnAttached.tap(this.pluginName, function (this, options) {
      console.log(
        'component 组件 attached 生命周期，在组件实例进入页面节点树时执行'
      )
    })

    // componentDidUnmount: 在 Component 的 didUnmount 生命周期触发
    morHooks.componentDidUnmount.tap(this.pluginName, function (this, options) {
      console.log('component 组件 didUnmount 生命周期，组件删除时触发')
    })

    // componentOnDetached: 在 Component 的 detached 生命周期触发
    morHooks.componentOnDetached.tap(this.pluginName, function (this, options) {
      console.log(
        'component 组件 detached 生命周期，在组件实例被从页面节点树移除时执行'
      )
    })

    // componentOnError: 在 Component 的 onError 生命周期触发
    morHooks.componentOnError.tap(this.pluginName, function (this, options) {
      console.log('component 组件 onError 生命周期，组件 JS 代码抛出错误时触发')
    })
  }
}
```
