import {
  fsExtra as fs,
  logger,
  Plugin,
  Runner,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import path from 'path'
import { NODE_MODULE_REGEXP } from '../constants'

/**
 * 检测项目中的幽灵依赖
 * 1. 以下情况直接跳过该文件的检测
 *   1.1 生产环境
 *   1.2 phantomDependency 为 false 时
 *   1.3 该文件为 node_modules 文件
 *   1.4 文件不在当前 pwd 运行路径内
 * 2. 获取 import 和 require 的依赖进行检测
 *   2.1 跳过以 . / @/ @@/ 开头的本地文件引用
 *   2.2 跳过已在 package.json 中配置的依赖
 *   2.3 跳过配置在 phantomDependency.exclude 的包
 *   2.4 针对检测模式进行 error | warn(默认)
 */
export class PhantomDependencyPlugin implements Plugin {
  name = 'PhantomDependencyPlugin'

  apply(runner: Runner<any>) {
    runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
      const { phantomDependency, mode } = runner.userConfig
      const fileInfoPath = options.fileInfo.path || ''
      if (
        mode === 'production' ||
        !phantomDependency ||
        NODE_MODULE_REGEXP.test(fileInfoPath) ||
        !fileInfoPath.includes(process.cwd())
      )
        return transformers

      transformers.before.push(
        tsTransformerFactory((node) => {
          if (!node) return node

          // 处理 import 节点
          if (
            ts.isImportDeclaration(node) &&
            ts.isStringLiteral(node.moduleSpecifier)
          ) {
            const npmName = node.moduleSpecifier?.text
            this.checkDependency(npmName, fileInfoPath, phantomDependency)
          }

          // 处理 require 节点
          if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression?.escapedText === 'require' &&
            ts.isStringLiteral(node.arguments?.[0])
          ) {
            const npmName = node.arguments?.[0].text
            this.checkDependency(npmName, fileInfoPath, phantomDependency)
          }
          return node
        })
      )

      return transformers
    })
  }

  /**
   * 检查所引用的依赖是否存在 package.json 里
   * @param npmName - 使用的 npm 包名
   * @param pkg - 项目 package.json 配置
   * @param phantomDependency - config 中的配置项
   */
  checkDependency(npmName, fileInfoPath, phantomDependency) {
    if (/^(\.|\/|@\/|@@\/)/.test(npmName)) return

    const pkgName = this.getPkgName(npmName)
    const pkgDepends = this.getAllPkgDepends(fileInfoPath)

    if (pkgDepends[pkgName]) return

    if (
      Object.prototype.toString.call(phantomDependency) === '[object Object]'
    ) {
      if ((phantomDependency.exclude || []).includes(pkgName)) return
      if (phantomDependency.mode === 'error')
        throw new Error(`${pkgName} 是一个幽灵依赖，请在 package.json 中添加`)
    }
    logger.warnOnce(`${pkgName} 是一个幽灵依赖，建议在 package.json 中添加`)
  }

  /**
   * 获取依赖的 npm 包名
   * @param source - string 被使用依赖
   */
  getPkgName(source: string) {
    const arr = source.split('/')
    if (source.startsWith('@')) return arr[0] + '/' + arr[1]
    return arr[0]
  }

  /**
   * 获取从当前文件路径逐层往上直至 pwd 的所有 package.json 的依赖
   * @param source - string 当前文件的路径
   */
  getAllPkgDepends(fileInfoPath) {
    let pkgDepends = {}
    for (
      let currentPath = fileInfoPath;
      currentPath !== process.cwd() + '/';
      currentPath = path.join(currentPath, '../')
    ) {
      if (fs.existsSync(path.join(currentPath, '../package.json'))) {
        const pkgJson = fs.readJSONSync(
          path.join(currentPath, '../package.json')
        )
        pkgDepends = {
          ...pkgDepends,
          ...pkgJson.devDependencies,
          ...pkgJson.dependencies
        }
      }
    }
    return pkgDepends
  }
}
