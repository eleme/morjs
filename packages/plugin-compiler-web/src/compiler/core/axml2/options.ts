import { BuildOptions } from '../option'

export interface AXMLOptions extends BuildOptions {
  hasStyleFile: boolean //是否存在样式文件
  hasAppStyle: boolean //是否存在 全局样式文件
}
