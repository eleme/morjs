import { EntryFileType, webpack } from '@morjs/utils'
import { CustomLoaderOptions } from '../constants'
import styleLoader from './styleLoader'
import templateLoader from './templateLoader'

// 处理目标平台原生模版和样式文件
export default async function NativeLoader(
  this: webpack.LoaderContext<
    CustomLoaderOptions & {
      singleTags: string[]
      closingSingleTag?: '' | 'slash' | 'tag'
    }
  >,
  fileContent: string
): Promise<void> {
  const options = this.getOptions()
  const { entryBuilder } = options

  const entry = entryBuilder.getEntryByFilePath(this.resourcePath)

  // 移交 template 和 style
  if (entry) {
    if (entry.entryFileType === EntryFileType.template) {
      return templateLoader.call(this, fileContent)
    } else if (entry.entryFileType === EntryFileType.style) {
      return styleLoader.call(this, fileContent)
    }
  }

  // 其他情况, 暂不处理
  const cb = this.async()
  cb(null, fileContent)
}
