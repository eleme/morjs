import {
  fsExtra as fs,
  logger,
  Plugin,
  Runner,
  tsTransformerFactory,
  typescript as ts,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import { NODE_MODULE_REGEXP } from '../constants'

/**
 * 检测项目中的幽灵依赖
 * 以下情况直接跳过该文件的检测
 * - 生产环境
 * - phantomDependency 为 false 时
 * - 该文件为 node_modules 文件
 * - 文件不在当前 pwd 运行路径内
 */
export class PhantomDependencyPlugin implements Plugin {
  name = 'PhantomDependencyPlugin'
  webpackWrapper: WebpackWrapper

  apply(runner: Runner<any>) {
    runner.hooks.webpackWrapper.tap(this.name, (webpackWrapper) => {
      this.webpackWrapper = webpackWrapper
    })

    const usedDependencies: Record<string, string> = {}

    runner.hooks.beforeRun.tap(this.name, () => {
      const { phantomDependency } = runner.userConfig
      if (!phantomDependency) return

      runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
        const fileInfoPath = options.fileInfo.path || ''
        if (
          !NODE_MODULE_REGEXP.test(fileInfoPath) &&
          fileInfoPath.includes(runner.getCwd())
        ) {
          this.handlePhantomTransformer(
            transformers,
            fileInfoPath,
            usedDependencies
          )
        }
        return transformers
      })

      runner.hooks.sjsParser.tap(this.name, (transformers, options) => {
        const fileInfoPath = options.fileInfo.path || ''
        if (
          !NODE_MODULE_REGEXP.test(fileInfoPath) &&
          fileInfoPath.includes(runner.getCwd())
        ) {
          this.handlePhantomTransformer(
            transformers,
            fileInfoPath,
            usedDependencies
          )
        }
        return transformers
      })
    })

    runner.hooks.done.tap(this.name, () => {
      const {
        alias,
        srcPaths,
        phantomDependency,
        externals = [],
        consumes = [],
        watch
      } = runner.userConfig
      if (!phantomDependency) return

      let allDependencies = { ...this.getPkgDepend(runner.getCwd()) }
      ;(srcPaths || []).map((srcPath) => {
        allDependencies = { ...allDependencies, ...this.getPkgDepend(srcPath) }
      })

      // 跳过 alias 及以 alias 中以 key 开头的依赖包
      const aliasAll = {
        ...alias,
        ...this.webpackWrapper?.config?.resolve?.alias
      }
      for (const aliasKey in aliasAll) {
        if (aliasKey.endsWith('$')) {
          aliasAll[aliasKey.substring(0, aliasKey.length - 1)] =
            aliasAll[aliasKey]
          delete aliasAll[aliasKey]
        }
      }

      // 跳过在 externals 或 consumes 中配置的包
      const otherDepends = [...externals, ...consumes].map((item) =>
        this.getExternalsPkgName(item)
      )

      const table = {
        head: ['依赖名', '引用地址'],
        rows: []
      }

      // 跳过已在 package.json 和 phantomDependency.exclude 中配置的依赖
      for (const depKey in usedDependencies) {
        if (
          !(phantomDependency.exclude || []).includes(depKey) &&
          !allDependencies[depKey] &&
          !aliasAll[depKey] &&
          !aliasAll[depKey.split('/')[0]] &&
          !otherDepends.includes(depKey)
        ) {
          table.rows.push([depKey, usedDependencies[depKey]])
        }
      }

      if (table.rows.length > 0) {
        if (phantomDependency.mode === 'error') {
          logger.error('检测到幽灵依赖，请添加到 package.json')
          logger.table(table, 'error')

          if (!watch) {
            // 非 watch 状态下，确保 error 模式，可以异常退出
            const error = new Error()
            error['isErrorLogged'] = true
            error.stack = ''
            throw error
          }
        } else {
          logger.warnOnce('检测到幽灵依赖，请添加到 package.json')
          logger.table(table, 'warn')
        }
      }
    })
  }

  // 检查 script 和 sjs 文件 获取 import 和 require 的依赖进行检测
  handlePhantomTransformer(transformers, fileInfoPath, usedDependencies) {
    transformers.before.push(
      tsTransformerFactory((node) => {
        if (!node) return node

        // 处理 import 节点
        if (
          ts.isImportDeclaration(node) &&
          ts.isStringLiteral(node.moduleSpecifier)
        ) {
          const pkgName = this.getPkgName(node.moduleSpecifier?.text)
          // 跳过以 . / @/ @@/ 开头的本地文件引用
          if (!/^(\.|\/|@\/|@@\/)/.test(pkgName))
            usedDependencies[pkgName] = fileInfoPath
        }

        // 处理 require 节点
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression?.escapedText === 'require' &&
          ts.isStringLiteral(node.arguments?.[0])
        ) {
          const pkgName = this.getPkgName(node.arguments?.[0].text)
          // 跳过以 . / @/ @@/ 开头的本地文件引用
          if (!/^(\.|\/|@\/|@@\/)/.test(pkgName))
            usedDependencies[pkgName] = fileInfoPath
        }
        return node
      })
    )
  }

  /**
   * 获取依赖的 npm 包名
   * @param source - string 被使用依赖
   */
  getPkgName(source: string) {
    const arr = source.split('/')
    if (source.startsWith('@')) return arr[1] ? arr[0] + '/' + arr[1] : arr[0]
    return arr[0]
  }

  /**
   * 获取指定路径 package.json 内的所有依赖
   * @param path 路径
   */
  getPkgDepend(filePath: string) {
    if (fs.existsSync(path.join(filePath, 'package.json'))) {
      const pkgJson = fs.readJSONSync(path.join(filePath, 'package.json'))
      return { ...pkgJson.devDependencies, ...pkgJson.dependencies }
    }
    return {}
  }

  /**
   * 获取 externals 或 consumes 的依赖名
   * @param item 配置子项
   */
  getExternalsPkgName(item) {
    if (typeof item === 'string') return item
    if (Object.prototype.toString.call(item) === '[object Object]') {
      return Object.keys(item)[0]
    }
  }
}
