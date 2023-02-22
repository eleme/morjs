import { EntryType, webpack } from '@morjs/utils'
import { extname } from 'path'
import { CustomLoaderOptions } from '../constants'
import { preprocess } from '../preprocessors/codePreprocessor'

// 预处理 loader
// 主要用途是 文件内的代码条件编译
export default async function PreprocessLoader(
  this: webpack.LoaderContext<CustomLoaderOptions>,
  fileContent: string
): Promise<void> {
  const cb = this.async()

  const filePath = this.resourcePath
  const { userConfig, runner, entryBuilder } = this.getOptions() || {}

  const {
    conditionalCompile: { context = {} }
  } = userConfig

  const entry = entryBuilder.getEntryByFilePath(filePath)

  try {
    let result: string
    const fileExt = extname(filePath)

    // 允许针对不同文件自定义条件编译的 context
    const conditionalCompileContext = {}

    // 在 preprocess 之前调用 插件
    if (runner.hooks.preprocessorParser.isUsed()) {
      result = await runner.hooks.preprocessorParser.promise(
        fileContent,
        conditionalCompileContext,
        {
          userConfig,
          loaderContext: this,
          fileInfo: {
            path: filePath,
            content: fileContent,
            extname: entry ? entry.extname : fileExt,
            entryName: entry ? entry.fullEntryName : undefined,
            entryFileType: entry ? entry.entryFileType : undefined,
            entryType: entry ? entry.entryType : EntryType.unknown
          }
        }
      )
    } else {
      result = fileContent
    }

    // 代码 条件编译逻辑
    result = preprocess(
      result,
      { ...context, ...conditionalCompileContext },
      fileExt,
      filePath
    )

    cb(null, result)
  } catch (error) {
    cb(error)
  }
}
