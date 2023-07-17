import {
  babelParser as parser,
  babelTraverse as traverse,
  babelTypes as t,
  logger
} from '@morjs/utils'
import { getOptionalChainCode } from '../../generate/utils'
import { DataBindingNode } from '../types'

interface ExpPartInfo {
  code: string //表达式片段
  binding?: boolean //是否是绑定
}

export default class DataBinding implements DataBindingNode {
  type = 'DataBindingNode' as const

  private _express: string
  get express() {
    return this._express
  }

  private _hasBinding = false
  /**
   * 是否有绑定
   */
  get hasBinding() {
    return this._hasBinding
  }

  private _bindingVars = new Set<string>()
  get bindingVars() {
    return this._bindingVars
  }

  private _bindingExpression = undefined
  get bindingExpression() {
    return this._bindingExpression
  }

  constructor(express: string) {
    this._express = express
    this._bindingExpression = this.parse(express)
  }

  private expParts: Array<ExpPartInfo> = []

  private parse(text: string): string {
    if (!text) return
    text = text.trim().replace(/\{\{\{/, '{{ {')
    let exp = text
    // const expParts: Array<ExpPartInfo> = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (exp.length === 0) break
      // 整体是从右往左扫描。如果从左往右扫描会可能会有bug，比如: {{ {a:{a:1}} }}
      const idx1 = exp.lastIndexOf('{{')
      const idx2 = exp.lastIndexOf('}}')
      if (idx1 === -1 || idx2 === -1 || idx2 < idx1) {
        this.expParts.push({ code: `${exp}` })
        break
      }
      // 如果idx2 非字符串最后位置,那么说明}} 后面又一段普通字符串
      if (idx2 < exp.length - 2) {
        this.expParts.push({ code: `${exp.substring(idx2 + 2)}` })
      }
      // 提取表达式
      const bindExp = exp.substring(idx1 + 2, idx2).trim()
      this.expParts.push({ code: bindExp, binding: true })
      exp = exp.substring(0, idx1)
    }
    this.expParts.reverse()

    // 提取表达式，以及 对 对象 的提取
    this.expParts.forEach((p) => {
      let code = p.code
      if (p.binding) {
        let res = this.parseExp(code)
        // 如果变量提取失败，那么默认为是对象表达式
        if (!res.isOK) {
          code = `{ ${code} }`
          res = this.parseExp(code)
          // 再次提取变量
          if (!res.isOK) {
            logger.error(`绑定表达式: ${code.trim()} 不符合 JS 表达式规范`)
          }
        }
        if (res.code) {
          code = res.code
        }
        const isComplexExp = /\?|\+|-|\*|\/|&&|\|\|/.test(code)
        if (isComplexExp) {
          code = `(${code})`
        }
        this._hasBinding = true
      } else {
        code = code.replace(/[\r\n]/g, '')
        if (code.indexOf('{') >= 0 || code.indexOf('}') >= 0) {
          this._hasBinding = true
          code = `\`${code}\``
        } else {
          // 普通字符串 添加 ""
          code = `"${code.replace(/"/g, '\\"')}"` // 替换引号，防止会出现bug
        }
      }
      p.code = code
    })

    if (this._hasBinding) {
      return this.expParts.map((p) => p.code).join(' + ')
    }
    return this.express
  }

  // 提取变量
  private parseExp(exp: string) {
    const res = { isOK: false, code: undefined }
    if (!exp) return res
    try {
      const ast = parser.parse(`var _=(${exp})`)
      res.isOK = true
      traverse.default(ast, {
        ReferencedIdentifier: (path) => {
          // 检索出引用标识符
          this._bindingVars.add(path.node.name)
        },
        SequenceExpression() {
          res.isOK = false
        }
      } as any)
    } catch (e) {
      res.isOK = false
    }
    return res
  }

  getExpressionAst(options?) {
    if (this.hasBinding) {
      let ast = this.expressionAst(`(${this.bindingExpression})`)
      if (options && options.forceObject) {
        if (ast && !t.isObjectExpression(ast)) {
          ast = this.expressionAst(
            `_={${this.bindingExpression}}`
          ) as t.AssignmentExpression
          return ast && ast.right
        }
      }
      return ast
    }
    return null
  }

  private expressionAst(bindingExpression) {
    try {
      const exp = parser.parse(bindingExpression).program.body[0]
      if (t.isExpressionStatement(exp)) {
        return exp.expression
      } else {
        logger.error('绑定表达式错误: ' + this.express)
        return null
      }
    } catch (e) {
      return null
    }
  }

  getExpressionAstForText() {
    if (this.hasBinding) {
      const bindingExpression = `${this.expParts
        .map((p) => {
          if (p.binding) {
            return `$rm.getString(${getOptionalChainCode(p.code)})`
          } else {
            return p.code
          }
        })
        .join(' + ')}`
      return this.expressionAst(bindingExpression)
    }
    return null
  }
}
