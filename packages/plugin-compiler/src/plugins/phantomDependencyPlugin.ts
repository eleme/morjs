import {
  logger,
  Plugin,
  Runner,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import { NODE_MODULE_REGEXP } from '../constants'

/**
 * 检测项目中的幽灵依赖
 * 1. 生产环境和 phantomDependency 为 false 时关闭检测
 * 2. 跳过 node_modules 文件的检测
 * 3. 获取 import 和 require 的依赖进行检测
 *   3.1 跳过以 . / @/ @@/ 开头的本地文件引用
 *   3.2 跳过已在 package.json 中配置的依赖
 *   3.3 跳过配置在 phantomDependency.exclude 的包
 *   3.4 针对检测模式进行 error | warn(默认)
 */
export class PhantomDependencyPlugin implements Plugin {
  name = 'PhantomDependencyPlugin'

  apply(runner: Runner<any>) {
    runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
      const { phantomDependency, mode } = runner.userConfig
      if (mode === 'production' || !phantomDependency) return transformers

      if (!NODE_MODULE_REGEXP.test(options.fileInfo.path)) {
        transformers.before.push(
          tsTransformerFactory((node) => {
            if (!node) return node
            const pkg = runner.config.pkg || {}

            // 处理 import 节点
            if (
              ts.isImportDeclaration(node) &&
              ts.isStringLiteral(node.moduleSpecifier)
            ) {
              const npmName = node.moduleSpecifier?.text
              this.checkDependency(npmName, pkg, phantomDependency)
            }

            // 处理 require 节点
            if (
              ts.isCallExpression(node) &&
              ts.isIdentifier(node.expression) &&
              node.expression?.escapedText === 'require' &&
              ts.isStringLiteral(node.arguments?.[0])
            ) {
              const npmName = node.arguments?.[0].text
              this.checkDependency(npmName, pkg, phantomDependency)
            }
            return node
          })
        )
      }
      return transformers
    })
  }

  /**
   * 检查所引用的依赖是否存在 package.json 里
   * @param npmName - 使用的 npm 包名
   * @param pkg - 项目 package.json 配置
   * @param phantomDependency - config 中的配置项
   */
  checkDependency(npmName, pkg, phantomDependency) {
    if (/^(\.|\/|@\/|@@\/)/.test(npmName)) return

    const pkgName = this.getPkgName(npmName)
    if (pkg?.dependencies[pkgName] || pkg?.devDependencies[pkgName]) return

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
}
