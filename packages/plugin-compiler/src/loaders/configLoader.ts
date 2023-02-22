import { EntryType, lodash as _, logger, webpack } from '@morjs/utils'
import { extname } from 'path'
import { CompileTypes, CustomLoaderOptions } from '../constants'
import { parseJsonLike } from '../utils'

export default async function ConfigLoader(
  this: webpack.LoaderContext<CustomLoaderOptions>,
  fileContent: string
): Promise<void> {
  const cb = this.async()

  const options = this.getOptions()
  const { userConfig, entryBuilder, runner } = options
  const { compileType, minimize } = userConfig || {}
  let entry = entryBuilder.getEntryByFilePath(this.resourcePath)

  // 这里拿到的 this.resourcePath 可能和 entryBuilder 中记录的不一致
  // 参见 config.ts 文件中生成文件配置 generatorOptions 部分的注释
  if (!entry && this?._module?.rawRequest) {
    entry = entryBuilder.getEntryByFilePath(this._module.rawRequest)
  }

  // 如果不是 entry 则不做任何处理
  if (!entry) return cb(null, fileContent)

  let fullEntryName = entry.fullEntryName
  let entryType = entry.entryType

  let json = {} as Record<string, any>
  try {
    // 如果当前构建类型是分包或小程序
    // 需要检查当前的配置是否由 app.json 生成
    // 如果是, 则需要将 app.json 替换为相应的分包或插件配置
    if (
      compileType !== CompileTypes.miniprogram &&
      entry.entryType === EntryType.app
    ) {
      if (compileType === CompileTypes.plugin) {
        json = _.cloneDeep(entryBuilder.pluginJson)
        fullEntryName = fullEntryName.replace(/app\.json$/, 'plugin.json')
        entryType = EntryType.plugin
      } else {
        json = _.cloneDeep(entryBuilder.subpackageJson)
        fullEntryName = fullEntryName.replace(/app\.json$/, 'subpackage.json')
        entryType = EntryType.subpackage
      }
    } else {
      json = parseJsonLike(fileContent, extname(this.resourcePath))
    }

    // 如果是 entry 且有插件
    if (runner.hooks.configParser.isUsed()) {
      json = await runner.hooks.configParser.promise(json, {
        userConfig,
        loaderContext: this,
        fileInfo: {
          path: this.resourcePath,
          content: fileContent,
          extname: entry.extname,
          entryName: fullEntryName,
          entryType,
          entryFileType: entry.entryFileType
        }
      })
    }

    const code = JSON.stringify(json, null, minimize ? 0 : 2)

    // web 且 bundle 模式下不输出 json 文件
    if (!(userConfig.target === 'web' && userConfig.compileMode === 'bundle')) {
      // 生成 json 文件
      this.emitFile(fullEntryName, code)
    }

    cb(null, code)
  } catch (error) {
    logger.error(`json 文件格式有误，请检查文件: ${this.resourcePath}`, {
      error
    })
    cb(error)
  }
}
