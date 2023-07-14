import {
  cjsToEsmTransformer,
  CompileModuleKind,
  EntryBuilderHelpers,
  Plugin,
  Runner,
  tsTransformerFactory,
  typescript as ts
} from '@morjs/utils'
import { getComposedCompilerPlugins } from '../compilerPlugins'
import { CompilerUserConfig, COMPILE_COMMAND_NAME } from '../constants'

/**
 * 多端编译的 sjs 解析和转换
 * 这里仅提供通用的处理, 端的差异由编译插件来解决
 */
export class SjsParserPlugin implements Plugin {
  name = 'SjsParserPlugin'

  entryBuilder: EntryBuilderHelpers

  apply(runner: Runner) {
    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {
      this.entryBuilder = entryBuilder
    })

    // 放在 beforeRun 有助于保证拿到的是最终用户配置
    runner.hooks.beforeRun.tap(this.name, () => {
      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      const { target, sourceType } = runner.userConfig as CompilerUserConfig
      // 如果同源编译，不做处理
      if (target === sourceType) return

      const composedPlugins = getComposedCompilerPlugins()

      runner.hooks.sjsParser.tap(this.name, (transformers, options) => {
        // 添加 commonjs => esm 转换
        // 不处理 目标为 CommonJS 的文件
        // 如果源码平台和目标平台 模块类型一致 则不处理
        if (
          composedPlugins.compileModuleKind[target] !==
            CompileModuleKind.CommonJS &&
          composedPlugins.compileModuleKind[sourceType] !==
            composedPlugins.compileModuleKind[target]
        ) {
          transformers.before.unshift(cjsToEsmTransformer())
        }

        // 修改引用路径
        if (
          options.fileInfo.content.includes('import') ||
          options.fileInfo.content.includes('require')
        ) {
          this.alterImportOrRequirePath(transformers, options.fileInfo.path)
        }

        return transformers
      })
    })
  }

  /**
   * 修改 require 或 import 的引用路径
   */
  alterImportOrRequirePath(
    transformers: ts.CustomTransformers,
    filePath: string
  ) {
    transformers.before.push(
      tsTransformerFactory((node, context) => {
        const factory = context.factory

        if (ts.isImportDeclaration(node)) {
          /**
           * import 引用替换为正确的路径
           */
          if (
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
          ) {
            const importPath = node.moduleSpecifier.text
            const realImportPath = this.entryBuilder.getRealReferencePath(
              filePath,
              importPath,
              true
            )
            if (realImportPath) {
              return factory.updateImportDeclaration(
                node,
                node.decorators,
                node.modifiers,
                node.importClause,
                factory.createStringLiteral(realImportPath)
              )
            }
          }
        } else if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.escapedText === 'require'
        ) {
          if (!node.arguments?.length) return node
          const arg = node.arguments[0]
          if (!ts.isStringLiteral(arg)) return node
          let importPath = arg.getText()
          if (!importPath) return node

          // 修正链接
          importPath = importPath.replace(/^('|")/, '').replace(/('|")$/, '')

          const realImportPath = this.entryBuilder.getRealReferencePath(
            filePath,
            importPath,
            true
          )

          if (realImportPath) {
            return factory.updateCallExpression(
              node,
              node.expression,
              node.typeArguments,
              [factory.createStringLiteral(realImportPath)]
            )
          }
        }

        return node
      })
    )
  }
}
