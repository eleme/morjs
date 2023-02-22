import type { Plugin, Runner } from '@morjs/cli'

/*
 * 若插件有设置参数 IRuntimePlugin<%= _.upperFirst(_.camelCase(name)) %>Options
 * 请将 options 的 interface 给 export 出去，方便可能需要集成的使用方进行引用
 */
export interface IMorPlugin<%= _.upperFirst(_.camelCase(name)) %>Options {
  // 插件 Options 配置
}

export default class MorPlugin<%= _.upperFirst(_.camelCase(name)) %> implements Plugin {
  name = 'MorPlugin<%= _.upperFirst(_.camelCase(name)) %>'
  pluginOptions: IMorPlugin<%= _.upperFirst(_.camelCase(name)) %>Options

  /* 初始化插件 Options 配置 */
  constructor(options: IMorPlugin<%= _.upperFirst(_.camelCase(name)) %>Options) {
    this.pluginOptions = {
      ...options,
    }
  }

  apply(runner: Runner) {
    /* takin 内置 hook */
    // initialize: 初始化, 当 runner 被初始化并完成插件加载之后运行
    runner.hooks.initialize.tap(this.name, () => {})

    // cli: 构建命令行时运行，可运行命令行注册，获取匹配的命令
    runner.hooks.cli.tap(this.name, (cli) => {})

    // matchedCommand: 获取到匹配命令的阶段
    runner.hooks.matchedCommand.tap(this.name, (command) => {})

    // loadConfig: 加载用户 config 阶段
    runner.hooks.loadConfig.tap(this.name, (command) => {})

    // modifyUserConfig: 可基于命令行选项修改用户配置
    runner.hooks.modifyUserConfig.tap(this.name, (userConfig, command) => {})

    // registerUserConfig: 注册用户配置及校验 schema
    runner.hooks.registerUserConfig.tap(this.name, (schema) => {})

    // shouldRun: 是否需要运行后续逻辑(执行的时机为 校验用户配置之前)
    runner.hooks.shouldRun.tap(this.name, () => {})

    // shouldValidateUserConfig: 是否校验用户配置, 部分不使用配置的命令
    // 可使用该 hook 结合 runner 的上下文，来选择是否跳过用户配置校验
    runner.hooks.shouldValidateUserConfig.tap(this.name, () => {})

    // userConfigValidated: 用户配置校验完成之后执行
    runner.hooks.userConfigValidated.tap(this.name, (userConfig) => {})

    // beforeRun: 开始 run 之前的 hook, 可用于准备一些运行命令需要的数据或内容
    runner.hooks.beforeRun.tap(this.name, () => {})

    // run: 运行命令逻辑
    runner.hooks.run.tap(this.name, (command) => {})

    // done: runner 运行完成
    runner.hooks.done.tap(this.name, () => {})

    // failed: runner 运行失败
    runner.hooks.failed.tap(this.name, () => {})

    // shutdown: runner 主动关闭 runner 时执行
    runner.hooks.shutdown.tap(this.name, () => {})

    /* 集成相关 compose hook */
    // moduleDownloaded: 下载模块阶段, 完成后触发
    runner.hooks.moduleDownloaded.tapPromise(this.name, (moduleInfo) => {})

    // moduleBeforeScriptsExecuted: 前置脚本阶段, 完成后触发
    runner.hooks.moduleBeforeScriptsExecuted.tapPromise(this.name, (moduleInfo) => {})

    // moduleCopiedOrCompiled: 配置载入阶段, 完成后触发
    runner.hooks.moduleCopiedOrCompiled.tapPromise(this.name, (moduleInfo) => {})

		// moduleConfigLoaded: 复制编译阶段, 完成后触发
    runner.hooks.moduleConfigLoaded.tapPromise(this.name, (moduleInfo) => {})

  	// moduleAfterScriptsExecuted: 后置脚本阶段, 完成后触发
    runner.hooks.moduleAfterScriptsExecuted.tapPromise(this.name, (moduleInfo) => {})

  	// moduleComposed: 模块集成阶段, 完成后触发
    runner.hooks.moduleComposed.tapPromise(this.name, (moduleInfo) => {})

  	// moduleFailedAttempt: 失败重试阶段，模块集成失败后将自动尝试修复
    runner.hooks.moduleFailedAttempt.tapPromise(this.name, (moduleInfo) => {})

    /* 编译时 compile hook */
    // webpackWrapper: 用于获取 webpackWrapper
    runner.hooks.webpackWrapper.tap(this.name, (webpackWrapper) => {})

    // compiler: 用于获取 webpack compiler
    runner.hooks.compiler.tap(this.name, (compiler) => {})

    // entryBuilder: 用于获取 entryBuilder
    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {})

		// shouldAddPageOrComponent: 用于判断是否要处理页面或组件
    runner.hooks.shouldAddPageOrComponent.tap(this.name, (pageOrComponent) => {})

  	// addEntry: 添加 entry 时触发, 可用于修改 entry 相关信息
    runner.hooks.addEntry.tap(this.name, (entryInfo) => {})

  	// beforeBuildEntries: 解析所有 entries 文件之后, 生成 entries 之前执行
    runner.hooks.beforeBuildEntries.tap(this.name, (entryBuilder) => {})

  	// afterBuildEntries: 用于获取并修改构建出来的 entries
    runner.hooks.afterBuildEntries.tap(this.name, (entries, entryBuilder) => {})

    /* 单文件解析处理 hook */
    // configParser: config(json) 文件解析 hook
    runner.hooks.configParser.tap(this.name, (config, options) => {})

    // scriptParser: script(js/ts) 文件解析 hook
    runner.hooks.scriptParser.tap(this.name, (transformers, options) => {})

    // templateParser: template(*xml) 文件解析 hook
    runner.hooks.templateParser.tap(this.name, (tree, options) => {})

		// styleParser: style(*css) 文件解析 hook
    runner.hooks.styleParser.tap(this.name, (plugins, options) => {})

  	// sjsParser: sjs(wxs/sjs) 文件解析 hook
    runner.hooks.sjsParser.tap(this.name, (transformers, options) => {})

  	// preprocessorParser: 文件预处理器 hook，该阶段会处理条件编译
    runner.hooks.preprocessorParser.tap(this.name, (fileContent, context, options) => {})

  	// postprocessorParser: 文件后置处理器 hook
    runner.hooks.postprocessorParser.tap(this.name, (fileContent, options) => {})
  }
}
