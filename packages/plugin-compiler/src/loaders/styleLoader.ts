import { EntryType, logger, postcss, webpack } from '@morjs/utils'
import path from 'path'
import { CustomLoaderOptions } from '../constants'

export default async function StyleLoader(
  this: webpack.LoaderContext<CustomLoaderOptions>,
  fileContent: string
): Promise<void> {
  const cb = this.async()
  const { userConfig, entryBuilder, runner } = this.getOptions()

  const entry = entryBuilder.getEntryByFilePath(this.resourcePath)

  const pluginOptions = {
    userConfig,
    loaderContext: this,
    fileInfo: {
      path: this.resourcePath,
      content: fileContent,
      extname: entry ? entry.extname : path.extname(this.resourcePath),
      entryName: entry ? entry.fullEntryName : undefined,
      entryFileType: entry ? entry.entryFileType : undefined,
      entryType: entry ? entry.entryType : EntryType.unknown
    }
  }

  // 构造 postcss 的插件
  const plugins = runner.hooks.styleParser.isUsed()
    ? await runner.hooks.styleParser.promise([], pluginOptions)
    : []

  if (plugins.length) {
    try {
      fileContent = (
        await postcss
          .default(plugins)
          .process(fileContent, {
            from: this.resourcePath
          })
          .async()
      ).css
    } catch (error) {
      logger.error(`处理样式出错: ${this.resourcePath}`, { error })
      return cb(error)
    }
  }

  cb(null, fileContent)
}
