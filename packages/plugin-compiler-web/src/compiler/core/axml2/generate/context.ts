import { DataBindingNode } from '../ast/types'
import { AXMLOptions } from '../options'

export default class Context {
  readonly options: AXMLOptions

  constructor(options: AXMLOptions) {
    this.options = options
  }

  /**
   * 数据绑定的中引用的变量名称
   */
  dataBindingVars = new Set<string>()

  /**
   * 将数据绑定中用到的变量，合并到Context 中
   * @param node
   */
  mergeDatabindingVars(node: DataBindingNode) {
    if (node) {
      node.bindingVars.forEach((v) => {
        this.dataBindingVars.add(v)
      })
    }
  }
}
