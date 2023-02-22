import { EntryFileType, EntryType, webpack } from '@morjs/utils'
import { extname } from 'path'
import { CompileModes, CustomLoaderOptions } from '../constants'

// 后置处理 loader
export default async function PostprocessLoader(
  this: webpack.LoaderContext<CustomLoaderOptions>,
  fileContent: string,
  sourceMap?: string
): Promise<void> {
  const cb = this.async()

  const filePath = this.resourcePath
  const { userConfig, runner, entryBuilder } = this.getOptions() || {}
  const { compileMode } = userConfig

  const entry = entryBuilder.getEntryByFilePath(filePath)

  try {
    let result: string

    // 在 preprocess 之前调用 插件
    if (runner.hooks.postprocessorParser.isUsed()) {
      result = await runner.hooks.postprocessorParser.promise(fileContent, {
        userConfig,
        loaderContext: this,
        fileInfo: {
          path: filePath,
          content: fileContent,
          extname: entry ? entry.extname : extname(filePath),
          entryName: entry ? entry.fullEntryName : undefined,
          entryFileType: entry ? entry.entryFileType : undefined,
          entryType: entry ? entry.entryType : EntryType.unknown
        }
      })
    } else {
      result = fileContent
    }

    // bundle 模式下所有文件均交给 webpack 处理并打包
    // transform 模式下, 手动处理 js entry, 绕过 webpack
    // 后续会在 webpack.compiler.hooks.processAssets 阶段重写 assets
    // 参见 compile.ts 文件
    if (
      compileMode !== CompileModes.bundle &&
      entry &&
      entry.entryFileType === EntryFileType.script &&
      entry.fullEntryName
    ) {
      entryBuilder.setEntrySource(entry.fullEntryName, result, 'replace')
      cb(null, '')
    } else {
      cb(null, result, sourceMap)
    }
  } catch (error) {
    cb(error)
  }
}
