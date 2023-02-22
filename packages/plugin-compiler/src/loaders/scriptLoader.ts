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

/**
 * 支持 ts 和 esbuild 两种编译方式
 * 1. 如果没有插件的情况下, 自动使用 esbuild 以构建速度为主
 * 2. 如果有外部插件 或 需求输出 declaration 则使用 ts 编译
 */
export default async function ScriptLoader(
  this: webpack.LoaderContext<CustomLoaderOptions>,
  fileContent: string
): Promise<void> {
  const cb = this.async()
  const options = this.getOptions()
  const { userConfig, entryBuilder, runner } = options

  const entry = entryBuilder.getEntryByFilePath(this.resourcePath)

  let code: string
  let sourceMap: string
  let transformers: ts.CustomTransformers

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

  // ts 插件支持
  if (
    shouldProcessFileByPlugins(
      this.resourcePath,
      userConfig.processNodeModules,
      options.processNodeModules
    ) &&
    runner.hooks.scriptParser.isUsed()
  ) {
    transformers = runner.hooks.scriptParser.call(
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
      EntryFileType.script,
      parserInfo,
      transformers
    )

    code = res.code
    sourceMap = res.sourceMap
  } catch (err) {
    const error = new Error(
      `文件 ${this.resourcePath} 编译失败, 原因: ${err?.message || ''}`
    )
    error.stack = err.stack
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
