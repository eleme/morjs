import {
  EntryFileType,
  EntryType,
  typescript as ts,
  webpack
} from '@morjs/utils'
import path from 'path'
import { CustomLoaderOptions } from '../constants'
import {
  generateSourceMap,
  scriptTransformer
} from '../transformers/scriptTransformer'
import { shouldProcessFileByPlugins } from '../utils'

export default async function SjsLoader(
  this: webpack.LoaderContext<CustomLoaderOptions>,
  fileContent: string
): Promise<void> {
  const cb = this.async()
  const options = this.getOptions()
  const { userConfig, entryBuilder, runner } = options

  const entry = entryBuilder.getEntryByFilePath(this.resourcePath)

  let code: string
  let sourceMap: string

  const parserInfo = {
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

  // sjs 插件支持
  let transformers: ts.CustomTransformers
  if (
    shouldProcessFileByPlugins(
      this.resourcePath,
      userConfig.processNodeModules,
      options.processNodeModules
    ) &&
    runner.hooks.sjsParser.isUsed()
  ) {
    transformers = runner.hooks.sjsParser.call(
      {
        before: [],
        after: [],
        afterDeclarations: []
      },
      parserInfo
    )
  }

  try {
    const res = await scriptTransformer(
      fileContent,
      EntryFileType.sjs,
      parserInfo,
      transformers
    )

    code = res.code
    sourceMap = res.sourceMap
  } catch (error) {
    return cb(error)
  }

  const res = generateSourceMap(
    sourceMap,
    code,
    this.resourcePath,
    fileContent,
    this.remainingRequest
  )

  cb(null, res.code, res.sourceMap)
}
