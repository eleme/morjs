import {
  CompileModuleKind,
  CompileModuleKindType,
  CompileTypes,
  EntryBuilderHelpers,
  makeImportClause,
  MOR_APP_FILE,
  MOR_GLOBAL_FILE,
  MOR_RUNTIME_FILE,
  Plugin,
  Runner,
  webpack
} from '@morjs/utils'
import { getComposedCompilerPlugins } from '../compilerPlugins'
import { CompileModes, CompilerUserConfig } from '../constants'

type CachedSource = webpack.sources.CachedSource
type ConcatSource = webpack.sources.ConcatSource

// 模块包装的所在函数的参数替换映射
const MODULE_FACTORY_ARGS_REPLACEMENTS = new Map([
  [0, '__unused_webpack_module, __webpack_exports__, __webpack_require__'],
  [1, '__webpack_exports__, __webpack_require__'],
  [2, '__webpack_require__'],
  [3, '']
])

// Webpack JS 模块类型
const WEBPACK_JS_TYPES = new Set([
  'javascript/auto',
  'javascript/esm',
  'javascript/dynamic'
])

// 生成给 插件 和 分包用的 模拟 getApp 的方法
// 用于提供 getApp 的兜底
// 并检查是否存在 onLaunch 方法，自动调用并传递启动参数
// 方法 getLaunchOptionsSync 在百度小程序中不存在，兜底兼容有待进一步测试
function generateGlobalScript(
  moduleKind: CompileModuleKindType,
  globalObject: string
) {
  let exportClause: string

  if (moduleKind === CompileModuleKind.CommonJS) {
    exportClause = 'module.exports ='
  } else {
    exportClause = 'export default'
  }

  return `var $app;

// 模拟全局 getApp
function fetchApp () {
  if ($app != null) return $app;
  if (typeof getApp === 'function') return getApp();
};

// 模拟 app.js 初始化
function initApp (app) {
  if ($app != null) return;
  $app = app || {};

  // 如果 getApp 方法存在, 则将 getApp 的实例写入到 $app 的 __proto__ 和 $host 中
  // 实现方法共用
  if (typeof getApp === 'function') {
    $app.__proto__ = getApp();
    if (!$app.$host) $app.$host = $app.__proto__;
  }

  if ($app.$morHooks) {
    var HOOK_NAME = 'MOR_GLOBAL_APP';

    // 模拟 app.onShow 调用
    if (typeof $app.onShow === 'function') {
      $app.$morHooks.pageOnShow.tap(HOOK_NAME, function() {
        $app.onShow.apply($app, arguments);
      });
    }
  }

  // 模拟 app.onLaunch 调用
  if (typeof $app.onLaunch === 'function') {
    // 注意此处为同步方法
    var fn = ${globalObject}['getLaunchOptionsSync'];
    $app.onLaunch(typeof fn === 'function' ? fn() : {});
  }
};

${exportClause} {
  fetchApp: fetchApp,
  initApp: initApp
};
`
}

/**
 * 针对插件模式 注入 getApp 调用
 */
export class InjectGetAppPlugin implements Plugin {
  name = 'InjectGetAppPlugin'

  apply(runner: Runner) {
    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {
      runner.hooks.compiler.tap(this.name, (compiler) => {
        this.applyWebpackPlugin(
          compiler,
          entryBuilder,
          runner.userConfig as CompilerUserConfig
        )
      })
    })
  }

  applyWebpackPlugin(
    compiler: webpack.Compiler,
    entryBuilder: EntryBuilderHelpers,
    userConfig: CompilerUserConfig
  ) {
    const {
      target,
      compileMode,
      compileType,
      compilerOptions: { module: defaultModuleKind }
    } = userConfig

    // 仅 bundle 模式 和 插件/分包类型下生效
    if (compileMode !== CompileModes.bundle) return
    if (compileType === CompileTypes.miniprogram) return

    // web 模式下禁用该插件
    if (target === 'web') return

    const composedPlugins = getComposedCompilerPlugins()
    const globalObject = composedPlugins.globalObject[target]

    // 注入的引用优先按照编译插件中定义的 compileModuleKind 来注入
    const moduleKind = userConfig['originalCompilerModule'] || defaultModuleKind

    // 插件或分包的模拟 app 名称
    const MOR_APP_ENTRY_NAME = MOR_APP_FILE()

    // 添加模拟的 global 文件
    entryBuilder.setEntrySource(
      MOR_GLOBAL_FILE() + '.js',
      generateGlobalScript(moduleKind, globalObject),
      'additional'
    )

    compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
      const jsHooks =
        webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
          compilation
        )

      jsHooks.render.tap(this.name, (source, context) => {
        const { chunk } = context
        // mockAppEntry 文件的顶部插入代码
        // var morGlobal = require("./mor.global.js");
        if (chunk.name === MOR_APP_ENTRY_NAME) {
          if (entryBuilder.globalScriptFilePath) {
            return new webpack.sources.ConcatSource(
              makeImportClause(
                moduleKind,
                `./${MOR_GLOBAL_FILE()}.js`,
                'morGlobal'
              ),
              source
            )
          }
        }

        if (chunk.name === MOR_RUNTIME_FILE()) {
          return new webpack.sources.ConcatSource(
            makeImportClause(
              moduleKind,
              `./${MOR_GLOBAL_FILE()}.js`,
              'morGlobal'
            ),
            source
          )
        }

        return source
      })

      // 运行时 runtime.js 中追加 getApp 作为 webpack 的闭包调用参数
      jsHooks.renderRequire.tap(this.name, function (source, renderContext) {
        const { chunk, chunkGraph } = renderContext
        const runtimeRequirements = chunkGraph.getTreeRuntimeRequirements(chunk)
        // 需要判断不同的 runtime 调用逻辑
        if (runtimeRequirements.has(webpack.RuntimeGlobals.thisAsExports)) {
          return source.replace(
            '__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);',
            '__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__, morGlobal.fetchApp);'
          )
        } else {
          return source.replace(
            '__webpack_modules__[moduleId](module, module.exports, __webpack_require__);',
            '__webpack_modules__[moduleId](module, module.exports, __webpack_require__, morGlobal.fetchApp);'
          )
        }
      })

      // 替换插件逻辑，在闭包调用中追加 getApp 参数
      // (function(module, __webpack_exports__, __webpack_require__, getApp) {}
      // 参见 lib/javascript/JavascriptModulesPlugin.js 中的 renderModule 源码
      const MODULE_RUNTIME_REPLACE_REGEXP = /function\((?<funcArgs>.+)?\)/
      const replacementCache: Record<string, string> = {}
      jsHooks.renderModuleContainer.tap(
        this.name,
        function (source: CachedSource, module) {
          // 只处理 js 文件
          if (!WEBPACK_JS_TYPES.has(module.type)) return source

          const originalSource = source?.original?.() as ConcatSource
          const sourceStr = originalSource
            ?.getChildren?.()?.[0]
            ?.source?.() as string

          if (sourceStr) {
            let newSourceStr = replacementCache[sourceStr]

            // 替换 webpack 生成的 js 文件中的闭包参数
            const matchResult = sourceStr.match(MODULE_RUNTIME_REPLACE_REGEXP)
            if (matchResult) {
              const allArgs: string = (
                matchResult?.groups?.funcArgs || ''
              ).trim()
              const argsLength = allArgs ? allArgs.split(',').length : 0
              if (argsLength > 3) return source

              let restArgs = MODULE_FACTORY_ARGS_REPLACEMENTS.get(argsLength)
              restArgs =
                restArgs.length > 0 && allArgs.length
                  ? `, ${restArgs}`
                  : restArgs

              const replacement = `function(${allArgs + restArgs + ', getApp'})`
              newSourceStr = sourceStr.replace(matchResult[0], replacement)

              // 缓存替换结果
              originalSource[sourceStr] = newSourceStr

              // 替换
              originalSource.getChildren()[0] = new webpack.sources.RawSource(
                newSourceStr
              )
            }
          }

          return source
        }
      )
    })
  }
}
