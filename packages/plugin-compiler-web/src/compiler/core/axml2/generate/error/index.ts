import { DataBindingNode } from '../../ast/types'
import DataBindingNotBinding from './databinding-need'

export function checkDataBinding(
  dataBinding: DataBindingNode,
  prefix?: string
) {
  if (!dataBinding.hasBinding) {
    throw new DataBindingNotBinding(dataBinding, prefix)
  }
}
