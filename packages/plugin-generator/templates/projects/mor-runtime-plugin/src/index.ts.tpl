import type { MorHooks, MorPlugin } from '@morjs/api'

/*
 * 若插件有设置参数 IRuntimePlugin<%= _.upperFirst(_.camelCase(name)) %>Options
 * 请将 options 的 interface 给 export 出去，方便可能需要集成的使用方进行引用
 */
export interface IRuntimePlugin<%= _.upperFirst(_.camelCase(name)) %>Options {
  /* 插件 Options 配置 */
}

export default class RuntimePlugin<%= _.upperFirst(_.camelCase(name)) %> implements MorPlugin {
  pluginName = 'RuntimePlugin<%= _.upperFirst(_.camelCase(name)) %>'
  pluginOptions: IRuntimePlugin<%= _.upperFirst(_.camelCase(name)) %>Options

  /* 初始化插件 Options 配置 */
  constructor(options?: IRuntimePlugin<%= _.upperFirst(_.camelCase(name)) %>Options) {
    this.pluginOptions = {
      ...options,
    }
  }

  /*
   * 1. 插件调用方不能保证 apply 函数里面的 this 指向，因此建议 class 下面的方法使用箭头函数以规避 this 指向问题
   * 2. hook 里面的监听函数必须用普通函数，因为在 hook 调用的时候会动态修改 this 指向，指向当前的 app、page、component 实例
   * 3. hook 里面的监听函数带两个参数:
   *   3.1 this: 可以指向当前的 app、page、component 实例
   *   3.2 options: 可以拿到对应生命周期里面的参数
   */
  apply = (morHooks: MorHooks): void => {
    /* App 相关 hooks */
    /* appOnConstruct: 在应用初始化前执行，请注意不要进行长时间耗时的任务 */
    morHooks.appOnConstruct.tap(this.pluginName, function (this, options) {})

    /* appOnInit: 已废弃 出于兼容性暂不移除，请直接使用 appOnConstruct */
    morHooks.appOnInit.tap(this.pluginName, function (this, options) {})

    /* appOnLaunch: 在 onLaunch 生命周期触发，建议一般组件在这个生命周期执行初始化 */
    morHooks.appOnLaunch.tap(this.pluginName, function (this, options) {})

    /* appOnError: 在 App 的 onError 生命周期触发 */
    morHooks.appOnError.tap(this.pluginName, function (this, options) {})

    /* appOnShow: 在 App 的 onShow 生命周期触发 */
    morHooks.appOnShow.tap(this.pluginName, function (this, options) {})

    /* appOnHide: 在 App 的 onHide 生命周期触发 */
    morHooks.appOnHide.tap(this.pluginName, function (this, options) {})

    /* appOnPageNotFound: 在 App 的 onPageNotFound 被调用时触发 */
    morHooks.appOnPageNotFound.tap(this.pluginName, function (this, options) {})

    /* appOnUnhandledRejection: 在 App 的 onUnhandledRejection 被调用时触发 */
    morHooks.appOnUnhandledRejection.tap(this.pluginName, function (this, options) {})

    /* Page 相关 hooks */
    /* pageOnConstruct: 在页面初始化前执行，请注意这个生命周期会在应用启动后就立刻执行，并不是等用户切换到对应的页面才会执行 */
    morHooks.pageOnConstruct.tap(this.pluginName, function (this, options) {})

    /* pageOnInit: 已废弃 出于兼容性暂不移除，请直接使用 pageOnConstruct */
    morHooks.pageOnInit.tap(this.pluginName, function (this, options) {})

    /* pageOnLoad: 在 Page 的 onLoad 生命周期触发 */
    morHooks.pageOnLoad.tap(this.pluginName, function (this, options) {})

    /* pageOnReady: 在 Page 的 onReady 生命周期触发 */
    morHooks.pageOnReady.tap(this.pluginName, function (this, options) {})

    /* pageOnShow: 在 Page 的 onShow 生命周期触发 */
    morHooks.pageOnShow.tap(this.pluginName, function (this, options) {})

    /* pageOnHide: 在 Page 的 onHide 生命周期触发 */
    morHooks.pageOnHide.tap(this.pluginName, function (this, options) {})

    /* pageOnUnload: 在 Page 的 onUnload 生命周期触发 */
    morHooks.pageOnUnload.tap(this.pluginName, function (this, options) {})

    /* Component 相关 hooks */
    /* componentOnConstruct: 在 Component 创建前触发(组件注册的阶段) */
    morHooks.componentOnConstruct.tap(this.pluginName, function (this, options) {})

    /* componentOnInit: 在 Component 的 onInit 生命周期触发 */
    morHooks.componentOnInit.tap(this.pluginName, function (this, options) {})

    /* componentOnCreated: 在 Component 的 created 生命周期触发 */
    morHooks.componentOnCreated.tap(this.pluginName, function (this, options) {})

    /* componentDidMount: 在 Component 的 didMount 生命周期触发 */
    morHooks.componentDidMount.tap(this.pluginName, function (this, options) {})

    /* componentOnAttached: 在 Component 的 attached 生命周期触发 */
    morHooks.componentOnAttached.tap(this.pluginName, function (this, options) {})

    /* componentDidUnmount: 在 Component 的 didUnmount 生命周期触发 */
    morHooks.componentDidUnmount.tap(this.pluginName, function (this, options) {})

    /* componentOnDetached: 在 Component 的 detached 生命周期触发 */
    morHooks.componentOnDetached.tap(this.pluginName, function (this, options) {})

    /* componentOnError: 在 Component 的 onError 生命周期触发 */
    morHooks.componentOnError.tap(this.pluginName, function (this, options) {})
  }
}
