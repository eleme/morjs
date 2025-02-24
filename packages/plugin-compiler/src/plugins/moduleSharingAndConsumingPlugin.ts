import {
  asArray,
  CompileModuleKindType,
  EntryBuilderHelpers,
  lodash as _,
  logger,
  makeImportClause,
  MOR_SHARED_FILE,
  Plugin,
  Runner,
  slash,
  webpack,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import { CompileModes, CompilerUserConfig } from '../constants'

const SHARING_MODULES = 'mor_shared'

/**
 * 展开并遍历 字符串和对象 组成的数组
 */
function flattenedForEach(
  array: (string | Record<string, string>)[],
  callback: (value: string, key: string, index: number) => void,
  name: string
) {
  let i = 0
  _.forEach(array, function (value) {
    if (typeof value === 'string') {
      callback(value, value, i++)
    } else if (_.isPlainObject(value)) {
      _.forEach(value, function (v, k) {
        callback(v, k, i++)
      })
    } else {
      logger.warnOnce(`不支持的 ${name} 配置，仅支持 字符串 或 对象`)
    }
  })
}

/**
 * 处理小程序 consumes 和 shared 配置
 * 主要用于小程序主分包间共享 node_modules 依赖
 */
export class ModuleSharingAndConsumingPlugin implements Plugin {
  name = 'ModuleSharingAndConsumingPlugin'

  runner: Runner
  wrapper: WebpackWrapper
  entryBuilder: EntryBuilderHelpers

  apply(runner: Runner<any>) {
    this.prepare(runner)
    this.processConsumes()
    this.processShared()
  }

  prepare(runner: Runner) {
    this.runner = runner

    // 获取 webpack wrapper
    this.runner.hooks.webpackWrapper.tap(this.name, (w) => {
      this.wrapper = w
    })
  }

  // 处理 consumes
  // 原理: 通过标记 consumes 中的 node_modules  依赖为 var 模式的 externals
  //      来将特定的 module 更换为通过全局变量来获取
  processConsumes() {
    this.runner.hooks.userConfigValidated.tap(
      `${this.name}:processConsumes`,
      (userConfig: CompilerUserConfig) => {
        if (!this.isPluginEnabled()) return
        const { globalNameSuffix } = userConfig || {}
        const sharedFileEntry = MOR_SHARED_FILE(globalNameSuffix)

        if (userConfig.consumes?.length) {
          const sharingFileName = sharedFileEntry + '.js'
          const sharingContainer = this.getSharingContainer()
          const chain = this.wrapper.chain
          const externals = asArray(
            chain.get('externals') as webpack.Configuration['externals']
          )
          const sharingExternals: Record<string, string> = {}

          flattenedForEach(
            userConfig.consumes,
            (target, source) => {
              sharingExternals[source] = `var ${sharingContainer}['${target}']`
            },
            'consumes'
          )

          // 添加 externals 支持
          externals.push(function ({ request, contextInfo }, callback) {
            // 避免 consumes 和 shared 同时配置时, mor.s.js 文件本身的依赖被 external
            if (contextInfo?.issuer?.endsWith?.(sharingFileName)) {
              return callback()
            }

            if (sharingExternals[request]) {
              return callback(null, sharingExternals[request])
            }

            callback()
          })

          chain.externals(externals)
        }
      }
    )
  }

  // 生成 MOR_SHARED_FILE() 文件
  processShared() {
    this.runner.hooks.userConfigValidated.tap(
      `${this.name}:processShared`,
      (userConfig) => {
        if (!this.isPluginEnabled()) return

        this.ignoreSharedFile()

        const {
          compilerOptions: { module: defaultModuleKind },
          globalNameSuffix
        } = userConfig as CompilerUserConfig

        const sharedFileEntry = MOR_SHARED_FILE(globalNameSuffix)

        const moduleKind = (userConfig['originalCompilerModule'] ||
          defaultModuleKind) as CompileModuleKindType

        let currentEntries: Record<string, any> = {}

        this.runner.hooks.afterBuildEntries.tap(this.name, (entries, eb) => {
          // 保存 entryBuilder
          this.entryBuilder = eb

          const filePath = this.generateSharedFileContent()
          if (filePath) {
            entries[sharedFileEntry] = filePath
            currentEntries = entries
          }

          return entries
        })

        // 在主包初始化文件中注入共享文件的引用
        this.runner.hooks.generateInitFiles.tap(
          this.name,
          (fileContent, group) => {
            if (
              this.entryBuilder.moduleGraph.isMainGroup(group) &&
              currentEntries[sharedFileEntry]
            ) {
              return `${fileContent}${makeImportClause(
                moduleKind,
                './' + sharedFileEntry + '.js'
              )}`
            }
            return fileContent
          }
        )
      }
    )
  }

  /**
   * 判断插件是否符合开启条件
   */
  isPluginEnabled() {
    const { compileMode, target } = this.runner.userConfig as CompilerUserConfig
    // 仅 bundle 模式下生效
    if (compileMode !== CompileModes.bundle) return false
    // web 模式下禁用该插件
    if (target === 'web' || target === 'web-pro' || target === 'weex-pro')
      return false
    return true
  }

  /**
   * 获取共享 node_modules 的公共变量
   * @returns 如 my.mor_shared 或 wx.mor_shared
   */
  getSharingContainer() {
    const userConfig = this.runner.userConfig as CompilerUserConfig
    const globalObject = userConfig.globalObject
    return `${globalObject}.${SHARING_MODULES}`
  }

  /**
   * 忽略 mor shared 虚拟文件
   */
  ignoreSharedFile() {
    const watchOptions = this.wrapper.chain.get('watchOptions') || {}
    const watchIgnored: string[] = watchOptions.ignored || []
    const sharedFilePath = slash(this.getSharedFilePath())
    if (!watchIgnored.includes(sharedFilePath)) {
      watchIgnored.push(sharedFilePath)
    }
    this.wrapper.chain.watchOptions({ ...watchOptions, ignored: watchIgnored })
  }

  getSharedFilePath() {
    const userConfig = this.runner.userConfig as CompilerUserConfig
    const { srcPath, globalNameSuffix } = userConfig
    return path.join(srcPath, `./${MOR_SHARED_FILE(globalNameSuffix)}.js`)
  }

  // 返回生成共享 node_modules 文件地址
  // 这里采用虚拟文件, 即写在内存里的文件
  generateSharedFileContent(): string | void {
    const userConfig = this.runner.userConfig as CompilerUserConfig
    const globalObject = userConfig.globalObject
    if (!globalObject) return

    if (userConfig.shared?.length) {
      const sharedFilePath = this.getSharedFilePath()
      const shareImports: string[] = []
      const shareInjects: string[] = []
      const sharingContainer = this.getSharingContainer()

      flattenedForEach(
        userConfig.shared,
        (target, source, i) => {
          const moduleName = `shared${i + 1}`
          shareImports.push(`import * as ${moduleName} from '${source}';`)
          shareInjects.push(
            `!${sharingContainer}['${target}'] && ${sharingContainer}['${target}'] = ${moduleName};`
          )
        },
        'shared'
      )

      const importAllShared = shareImports.join('\n')
      const injectAllShared = shareInjects.join('\n')

      // 写入内存文件
      this.wrapper.fs.mem.mkdirpSync(path.dirname(sharedFilePath))
      this.wrapper.fs.mem.writeFileSync(
        sharedFilePath,
        `${importAllShared}
${sharingContainer} = ${sharingContainer} || {};
${injectAllShared}`
      )

      return sharedFilePath
    }

    return
  }
}
