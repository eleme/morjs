import { z, ZodIssueCode } from 'zod'

function joinValues<T extends any[]>(array: T, separator = ' 或 '): string {
  return array
    .map((val) => (typeof val === 'string' ? `'${val}'` : val))
    .join(separator)
}

/**
 * 自定义 zod 错误
 */
z.setErrorMap((issue, ctx) => {
  let message: string
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') {
        message = '不能为空'
      } else {
        message = `期望是 ${issue.expected}, 实际是 ${issue.received}`
      }
      break
    case ZodIssueCode.invalid_literal:
      message = `无效的字面量, 期望是 ${JSON.stringify(issue.expected)}`
      break
    case ZodIssueCode.unrecognized_keys:
      message = `对象包含未知属性: ${issue.keys
        .map((k) => `'${k}'`)
        .join(', ')}`
      break
    case ZodIssueCode.invalid_union:
      message = `无效的输入`
      break
    case ZodIssueCode.invalid_union_discriminator:
      message = `无效的类型识别码, 期望是 ${joinValues(issue.options)}`
      break
    case ZodIssueCode.invalid_enum_value:
      message = `无效的值. 期望是 ${joinValues(issue.options)}, 实际是 ${
        typeof ctx.data === 'string' ? `'${ctx.data}'` : ctx.data
      }`
      break
    case ZodIssueCode.invalid_arguments:
      message = `无效的函数参数`
      break
    case ZodIssueCode.invalid_return_type:
      message = `无效的函数返回类型`
      break
    case ZodIssueCode.invalid_date:
      message = `无效的日期`
      break
    case ZodIssueCode.invalid_string:
      if (issue.validation !== 'regex') message = `${issue.validation} 无效`
      else message = '无效'
      break
    case ZodIssueCode.too_small:
      if (issue.type === 'array')
        message = `元素数量 ${issue.inclusive ? `不能少于` : `应多于`} ${
          issue.minimum
        } 个`
      else if (issue.type === 'string')
        message = `字符数量 ${issue.inclusive ? `不能少于` : `应多于`} ${
          issue.minimum
        } 个`
      else if (issue.type === 'number')
        message = `值应大于 ${issue.inclusive ? `或等于 ` : ``}${issue.minimum}`
      else message = '无效的输入'
      break
    case ZodIssueCode.too_big:
      if (issue.type === 'array')
        message = `元素数量 ${issue.inclusive ? `不能多于` : `最多为`} ${
          issue.maximum
        } 个`
      else if (issue.type === 'string')
        message = `字符数量 ${issue.inclusive ? `不能多于` : `最多为`} ${
          issue.maximum
        } 个`
      else if (issue.type === 'number')
        message = `值应小于 ${issue.inclusive ? `或等于 ` : ``}${issue.maximum}`
      else message = '无效的输入'
      break
    case ZodIssueCode.custom:
      message = `无效的输入`
      break
    case ZodIssueCode.invalid_intersection_types:
      message = `交叉结果无法合并`
      break
    case ZodIssueCode.not_multiple_of:
      message = `应当为 ${issue.multipleOf} 的倍数`
      break
    default:
      message = ctx.defaultError || '校验错误'
      throw new Error(message)
  }
  return { message }
})
