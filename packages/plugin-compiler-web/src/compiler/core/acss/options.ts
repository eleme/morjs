import { BuildOptions } from '../option'

export interface AcssOptions extends BuildOptions {
  plugins?: string[]
  needRpx?: boolean // 是否需要rpx 转换。默认true
  syntax?: any // 自定义语法处理程序
  enableCombineImportStyles?: boolean // 是否需要解析@import导入的样式
}
