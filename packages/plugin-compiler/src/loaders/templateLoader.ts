import { EntryType, webpack } from '@morjs/utils'
import path from 'path'
import { CustomLoaderOptions } from '../constants'
import {
  PostHtmlCustomPlugin,
  templateTransformer
} from '../transformers/templateTransformer'

export default async function TemplateLoader(
  this: webpack.LoaderContext<
    CustomLoaderOptions & {
      singleTags: string[]
      closingSingleTag?: '' | 'slash' | 'tag'
      customTemplateRender?: (tree?, options?) => string
    }
  >,
  fileContent: string
): Promise<void> {
  const cb = this.async()
  const {
    userConfig,
    entryBuilder,
    runner,
    singleTags,
    closingSingleTag,
    customTemplateRender
  } = this.getOptions()

  const entry = entryBuilder.getEntryByFilePath(this.resourcePath)
  const pluginInfo = {
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

  // template 插件支持
  let parser: PostHtmlCustomPlugin
  if (runner.hooks.templateParser.isUsed()) {
    parser = (tree) => runner.hooks.templateParser.promise(tree, pluginInfo)
  }

  try {
    fileContent = await templateTransformer(
      fileContent,
      pluginInfo,
      singleTags,
      closingSingleTag,
      parser,
      customTemplateRender
    )
  } catch (error) {
    return cb(error)
  }

  cb(null, fileContent)
}
