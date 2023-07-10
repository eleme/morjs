import { sjsSrcAttrName, sjsTagName } from '@morjs/plugin-compiler-alipay'
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
    const entryBuilder = this.entryBuilder
    function transformFilePath(importPath: string, requestPath: string) {
      const realPath = entryBuilder.getFullPathOfReferenceFile(
        requestPath,
        importPath
      )

      if (realPath) {
        let relativePath = path.relative(path.dirname(requestPath), realPath)
        relativePath = slash(
          relativePath.startsWith('.') ? relativePath : './' + relativePath
        )
        return relativePath
      } else {
        return importPath
      }
    }
    // 替换 模版和 sjs 为正确的路径
    // 将文件纬度条件编译的结果应用到文件本身
    // NOTE: sjs 引用路径需要支持替换
    runner.hooks.templateParser.tap(
      {
        name: this.name,
        stage: 0
      },
      (tree, options) => {
        return tree.walk((node) => {
          // 移除所有的注释
          if (node.content?.length) {
            node.content = node.content.filter((content) => {
              if (
                typeof content === 'string' &&
                content.trim().startsWith('<!--')
              ) {
                return false
              }
              return true
            })
          }

          if (node.tag === 'import' || node.tag === 'include') {
            if (
              node.attrs &&
              node.attrs.src &&
              typeof node.attrs.src === 'string'
            ) {
              node.attrs.src = transformFilePath(
                node.attrs.src,
                options.fileInfo.path
              )
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
          // sjs 支持
          else if (node.tag === sjsTagName || node.tag === 'wxs') {
            // 支付宝 DSL 兼容
            if (node.attrs?.[sjsSrcAttrName]) {
              node.attrs[sjsSrcAttrName] = transformFilePath(
                node.attrs[sjsSrcAttrName],
                options.fileInfo.path
              )
            }
            // 微信 DSL 兼容
            if (node.attrs?.['src']) {
              node.attrs['src'] = transformFilePath(
                node.attrs['src'],
                options.fileInfo.path
              )
            }
          }

          return node
        })
      }
    )
  }
}
