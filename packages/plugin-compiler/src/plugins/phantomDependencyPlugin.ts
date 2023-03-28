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
      const { phantomDependency, mode } = runner.userConfig
      if (mode === 'production' || !phantomDependency) return

      runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
        const fileInfoPath = options.fileInfo.path || ''
        if (
          !NODE_MODULE_REGEXP.test(fileInfoPath) &&
          fileInfoPath.includes(process.cwd())
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
          fileInfoPath.includes(process.cwd())
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
      const { alias, srcPaths, phantomDependency } = runner.userConfig
      let allDependencies = { ...this.getPkgDepend(process.cwd()) }
      ;(srcPaths || []).map((srcPath) => {
        allDependencies = { ...allDependencies, ...this.getPkgDepend(srcPath) }
      })

      // 搜集 userConfig 和 webpack 里的 alias 配置
      const aliasAll = {
        ...alias,
        ...this.webpackWrapper?.config?.resolve?.alias
      }

      const table = {
        head: ['依赖名', '引用地址'],
        rows: []
      }

      // 跳过已在 package.json 和 phantomDependency.exclude 中配置的依赖
      // 跳过 alias 及以 alias 中以 key 开头的依赖包
      for (const depKey in usedDependencies) {
        if (
          !(phantomDependency.exclude || []).includes(depKey) &&
          !allDependencies[depKey] &&
          !aliasAll[depKey] &&
          !aliasAll[depKey.split('/')[0]]
        ) {
          table.rows.push([depKey, usedDependencies[depKey]])
        }
      }

      if (table.rows.length > 0) {
        if (phantomDependency.mode === 'error') {
          logger.error('检测到幽灵依赖')
        } else {
          logger.warnOnce('检测到幽灵依赖')
        }
        logger.table(table)
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
}
