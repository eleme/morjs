import { isSimilarTarget } from '@morjs/plugin-compiler-alipay'
import {
  EntryType,
  fsExtra as fs,
  lodash as _,
  Plugin,
  posthtml,
  Runner,
  SourceTypes,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import * as path from 'path'
import { COMPILE_COMMAND_NAME } from '../constants'

export class AutomaticPropsType implements Plugin {
  name = 'AutomaticPropsType'
  componentsUsedMap = {}

  apply(runner: Runner) {
    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      const { sourceType, target } = runner.userConfig
      const isAlipaySimilarTarget = isSimilarTarget(target)

      // 仅当 js 是 支付宝 DSL 且 编译目标不是 类支付宝小程序 时才执行后续逻辑
      if (sourceType !== SourceTypes.alipay) return
      if (sourceType === target) return
      if (isAlipaySimilarTarget) return

      runner.hooks.afterBuildEntries.tapPromise(
        this.name,
        async (entries, entryBuilder) => {
          for await (const [
            key,
            value
          ] of entryBuilder?.componentsUsedMap?.entries() || []) {
            value.map(async (item) => {
              try {
                const sourceText = await fs.readFile(
                  `${path.parse(item.fullPath).dir}/${
                    path.parse(item.fullPath).name
                  }.axml`,
                  'utf-8'
                )
                if (sourceText.includes(item.name)) {
                  posthtml()
                    .use((tree) => {
                      tree.match({ tag: item.name }, (node) => {
                        // 保存组件的所有 props 参数，key 为组件 fullPath，value 为所有参数的键值对
                        this.componentsUsedMap[key] = {
                          ...(this.componentsUsedMap[key] || {}),
                          ...(node?.attrs || {})
                        }
                        return node
                      })
                    })
                    .process(sourceText)
                    .then((res) => res)
                }
              } catch (e) {}
            })
          }
          return entries
        }
      )

      // 给组件的 js 文件自动注入缺少的 props
      runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
        if (
          options?.fileInfo?.entryType === EntryType.component &&
          !_.isEmpty(this.componentsUsedMap?.[options?.fileInfo?.path])
        ) {
          const componentProps =
            this.componentsUsedMap?.[options?.fileInfo?.path]

          ;((transformers || {}).before || []).push(
            tsTransformerFactory((node, context) => {
              const factory = context.factory
              if (
                ts.isPropertyAssignment(node) &&
                ts.isIdentifier(node.name) &&
                node.name.escapedText === 'props' &&
                ts.isObjectLiteralExpression(node.initializer)
              ) {
                const nodePropsList = node.initializer.properties
                // 删除组件已有的 props 项
                for (const item of nodePropsList) {
                  if (
                    ts.isPropertyAssignment(item) &&
                    ts.isIdentifier(item.name)
                  ) {
                    delete componentProps[item.name.escapedText]
                  }
                }

                const args = [...nodePropsList]
                for (const key in componentProps) {
                  if (/^\{\{(.+?)\}\}/g.test(componentProps[key])) {
                    // 补全缺少的 props 项
                    args.push(
                      factory.createPropertyAssignment(
                        key,
                        factory.createNull()
                      )
                    )
                  }
                }

                return factory.createPropertyAssignment(
                  node.name,
                  factory.updateObjectLiteralExpression(node.initializer, args)
                )
              }
              return node
            })
          )
          return transformers
        }
        return transformers
      })
    })
  }
}
