import {
  EntryBuilderHelpers,
  logger,
  Plugin,
  Runner,
  slash
} from '@morjs/utils'
import path from 'path'
import { getRelativePath } from '../utils'

/**
 * Template 兼容插件
 * 1. 替换 模版和 sjs 为正确的路径
 * 2. 将文件纬度条件编译的结果应用到文件本身
 */
export class TemplateCompatiblePlugin implements Plugin {
  name = 'MorWebTemplateCompatiblePlugin'
  constructor(public entryBuilder: EntryBuilderHelpers) {}
  apply(runner: Runner<any>) {
    // 替换 模版和 sjs 为正确的路径
    // 将文件纬度条件编译的结果应用到文件本身
    // NOTE: sjs 引用路径需要支持替换
    runner.hooks.templateParser.tap(this.name, (tree, options) => {
      const entryBuilder = this.entryBuilder

      return tree.walk((node) => {
        if (node.tag === 'import' || node.tag === 'include') {
          if (
            node.attrs &&
            node.attrs.src &&
            typeof node.attrs.src === 'string'
          ) {
            const importPath = node.attrs.src
            const realPath = entryBuilder.getFullPathOfReferenceFile(
              options.fileInfo.path,
              importPath
            )

            if (realPath) {
              let relativePath = path.relative(
                path.dirname(options.fileInfo.path),
                realPath
              )
              relativePath = slash(
                relativePath.startsWith('.')
                  ? relativePath
                  : './' + relativePath
              )
              node.attrs.src = relativePath
            } else {
              node.attrs.src = importPath
            }
          } else {
            logger.warn(
              'import/include 标签需要设置 src 属性' +
                `文件路径: ${options.fileInfo.path}`
            )
          }
        } else if (node.tag === 'image') {
          if (
            node.attrs &&
            node.attrs.src &&
            typeof node.attrs.src === 'string'
          ) {
            node.attrs.src = getRelativePath(node.attrs.src)
          }
        }

        return node
      })
    })
  }
}
