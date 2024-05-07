import {
  asArray,
  CompileModuleKind,
  EntryBuilderHelpers,
  EntryType,
  fsExtra as fs,
  makeImportClause,
  MOR_COMPOSED_APP_FILE,
  Plugin,
  Runner,
  webpack,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import { CompilerUserConfig } from '../constants'

const APP_CONIFG_NAME = 'MOR_APP_CONFIG'

/**
 * 处理 app.json 在编译时和集成时的更新能力
 * 场景:
 *   - 基于主子分包分别编译的情况下 app.json 存在延迟更新的情况
 *   - 编译时会生成 mor.p.js 文件代表 app.json
 *   - 集成完成时会自动更新 mor.p.js 文件，以确保 app.json 的信息始终为最新
 */
export class GenerateComposedAppJsonFilePlugin implements Plugin {
  name = 'MorGenerateComposedAppJsonFilePlugin'
  runner: Runner
  apply(runner: Runner) {
    this.runner = runner
    let wrapper: WebpackWrapper
    let entryBuilder: EntryBuilderHelpers

    const composedAppFileName = MOR_COMPOSED_APP_FILE() + '.js'

    runner.hooks.webpackWrapper.tap(this.name, (ww) => {
      wrapper = ww
    })
    runner.hooks.entryBuilder.tap(this.name, (eb) => {
      entryBuilder = eb
    })

    // 替换 app.xx.json 以及 app.json|c|5 文件为 MOR_COMPOSED_APP_FILE
    runner.hooks.userConfigValidated.tap(
      {
        name: this.name,
        stage: -200
      },
      (userConfig) => {
        if (this.shouldIgnorePlugin()) return

        // 条件编译后缀
        const fileExts = asArray(userConfig.conditionalCompile?.fileExt)
        const moduleType =
          userConfig.originalCompilerModule ||
          userConfig.compilerOptions?.module ||
          CompileModuleKind.CommonJS
        const globalObject = userConfig.globalObject
        const chain = wrapper.chain
        const externals = asArray(
          chain.get('externals') as webpack.Configuration['externals']
        )
        const fileExtsPattern = fileExts.length
          ? `(${fileExts.map((e) => '\\' + e).join('|')})?`
          : ''
        const appJsonRegExp = new RegExp(
          `[\\\\/]app${fileExtsPattern}.json(c|5)?$`
        )
        let externalType: string

        // global Object 存在的情况下优先使用变量的方式
        if (globalObject) {
          externalType = 'var'
        } else {
          externalType =
            moduleType === CompileModuleKind.CommonJS ? 'commonjs' : 'commonjs2'
        }

        // 添加 externals 支持
        externals.push(function ({ request, contextInfo }, callback) {
          // 如果无 issuer 则可能为文件自身
          if (!contextInfo?.issuer) return callback()

          if (appJsonRegExp.test(request)) {
            const externalValue =
              externalType === 'var'
                ? `${globalObject}.${APP_CONIFG_NAME}`
                : request.replace(appJsonRegExp, `/${composedAppFileName}`)
            return callback(null, `${externalType} ${externalValue}`)
          }

          callback()
        })

        chain.externals(externals)

        // 编译时生成 MOR_COMPOSED_APP_FILE 文件
        runner.hooks.configParser.tap(
          {
            name: this.name,
            // 较晚处理, 确保拿到的是转端之后的
            stage: -100000000
          },
          (config, options) => {
            if (
              options.fileInfo.entryType === EntryType.app &&
              options.userConfig.compileType === 'miniprogram'
            ) {
              entryBuilder.setEntrySource(
                composedAppFileName,
                this.generateComposedAppFileContent(config),
                'additional'
              )
            }

            return config
          }
        )

        // 在主包初始化文件中注入 mor.p.js 的引用
        this.runner.hooks.generateInitFiles.tap(
          this.name,
          (fileContent, group) => {
            if (
              entryBuilder.moduleGraph.isMainGroup(group) &&
              entryBuilder.additionalEntrySources.has(composedAppFileName)
            ) {
              return `${fileContent}${makeImportClause(
                moduleType,
                './' + composedAppFileName
              )}`
            }
            return fileContent
          }
        )
      }
    )

    // 集成完成是自动更新 MOR_COMPOSED_APP_FILE 文件
    runner.hooks.moduleComposed.tapPromise(this.name, async (moduleInfo) => {
      if (this.shouldIgnorePlugin()) return

      // 不处理非宿主的模块
      if (moduleInfo.type !== 'host') return
      // 无输出目录不处理
      if (!moduleInfo.output?.to) return

      const composedApp = moduleInfo.config || {}

      // 集成产物中更新 mor.p.js 文件
      await fs.outputFile(
        path.join(runner.getCwd(), moduleInfo.output.to, composedAppFileName),
        this.generateComposedAppFileContent(composedApp),
        { encoding: 'utf-8' }
      )
    })
  }

  // 是否忽略当前插件逻辑
  shouldIgnorePlugin() {
    const userConfig = this.runner.userConfig as CompilerUserConfig
    if (userConfig.target === 'web' || userConfig.target === 'web-pro')
      return true
    if (userConfig.generateAppJSONScript === false) return true
    return false
  }

  /**
   * 生成集成 app 配置文件内容, 将 json 内容生成为可引用的 js 文件
   * @param composedApp - 集成 app 配置内容
   * @returns 生成的内容
   */
  generateComposedAppFileContent(composedApp: Record<string, any>) {
    const userConfig = this.runner.userConfig || {}
    const globalObject = userConfig.globalObject
    const opts = userConfig.compilerOptions || {}
    const moduleType =
      userConfig.originalCompilerModule ||
      opts.module ||
      CompileModuleKind.CommonJS

    const configVar = 'appConfig'

    const moduleExport =
      moduleType === CompileModuleKind.CommonJS
        ? `module.exports = ${configVar};`
        : `export default ${configVar};`

    const lines: string[] = [
      `var ${configVar} = ${JSON.stringify(composedApp, null, 2)};`
    ]

    // 如果有全局对象
    if (globalObject) {
      lines.push(`${globalObject}.${APP_CONIFG_NAME} = ${configVar};`)
    }

    lines.push(moduleExport)

    return lines.join('\n')
  }
}
