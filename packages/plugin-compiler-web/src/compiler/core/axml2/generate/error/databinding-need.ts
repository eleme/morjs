import { DataBindingNode } from '../../ast/types'

export default class DataBindingNotBinding extends Error {
  constructor(databinding: DataBindingNode, prefix: string) {
    super(
      `${prefix || ''} 内容必须是绑定绑定表达式。 当前表达式: ${
        databinding.express
      }`
    )
  }
}
