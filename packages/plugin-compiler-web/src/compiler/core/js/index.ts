import * as babel from '@babel/core'
import generate from '@babel/generator'
import { WEB_RUNTIMES } from '../../../constants'
import { defCondition, isEndIf, isIfDef } from '../../utils/comment'
import { getAxmlResourcePath } from '../../utils/file-utils'
import { BuildOptions } from '../option'
import ComponentPlugin from './component'

export default function (content, options: BuildOptions) {
  const { isAtomicMode, templateFilePath, name } = options
  const config = options.config || {}

  if (templateFilePath) {
    content = `
    ${
      isAtomicMode ? 'import "' + WEB_RUNTIMES.api + '"\r\n' : ''
    }import $rm from "${WEB_RUNTIMES.runtime}";
    const $componentInfo$ = require("${getAxmlResourcePath(options)}");
    ${content}
    export default $rm.${
      config.component ? 'Component' : 'Page'
    }($componentInfo$, $rm.mergeConfig(${
      options.hasAppConfig ? 'require("@/app.json")' : '{}'
    }, ${
      Object.keys(config).length === 0 ? '{}' : `require("${`./${name}.json`}")`
    }))
    `
  }

  const plugins = [[ComponentPlugin, { options }]]
  if (options?.compilerPlugins?.js?.length) {
    options.compilerPlugins.js.forEach((plugin) => {
      plugins.push([plugin, { options }])
    })
  }
  const jsString = transformFromCode(content, plugins, options)
  return jsString
}

function transformFromCode(code: string, plugins, options: BuildOptions) {
  let ast = babel.parse(code, {
    // plugins: [require('@babel/plugin-transform-react-jsx'), require('@babel/plugin-proposal-class-properties')]
  })
  const newCode = skipConditionalCompilation(code, ast, options)
  if (newCode.length !== code.length) {
    code = newCode
    //  重新生成ast
    ast = babel.parse(code)
  }

  const babelConfig = {
    compact: false,
    generatorOpts: { comments: false },
    ast: true,
    plugins
  }

  const tramformResult = babel.transformFromAstSync(ast, code, babelConfig)

  const result = generate(tramformResult.ast)

  return result.code
}

/**
 * 过滤条件编译的代码
 * @param code
 */
function skipConditionalCompilation(code: string, ast, options: BuildOptions) {
  const removePostions: { start; end }[] = []
  let startDefComment
  if (ast.comments && ast.comments.length > 0) {
    for (const comment of ast.comments) {
      if (comment.type === 'CommentBlock') {
        if (isIfDef(comment.value)) {
          const conditional = defCondition(comment.value).toLowerCase()
          if (conditional !== options.platform) {
            startDefComment = comment
          }
        } else if (isEndIf(comment.value)) {
          if (startDefComment) {
            removePostions.push({
              start: startDefComment.start,
              end: comment.end
            })
            startDefComment = null
          }
        }
      }
    }
  }

  if (removePostions.length > 0) {
    let removeLength = 0
    removePostions.forEach((item) => {
      code =
        code.substring(0, item.start - removeLength) +
        code.substring(item.end - removeLength)
      removeLength = item.end - item.start
    })
  }
  return code
}
