import fs from 'fs-extra'
import { pathToFileURL } from 'url'
import { logger } from '../logger'
import { bundleMjsOrTsFile } from './bundleMjsOrTsFile'
import { interopRequireDefault } from './interopRequireDefault'
import { requireResolve } from './requireResolve'

/**
 * 载入并解析 js、mjs 或 ts 文件
 * @returns import 的结果
 */
export async function importJsOrMjsOrTsFromFile({
  cwd,
  filePath,
  isMjs,
  isTs,
  tempFilePath,
  autoDeleteTempFile = false
}: {
  cwd: string
  filePath: string
  isMjs: boolean
  isTs: boolean
  tempFilePath: string
  autoDeleteTempFile?: boolean
}) {
  let importedFile: any

  const start = Date.now()

  if (!importedFile && isMjs) {
    const fileUrl = pathToFileURL(filePath)
    if (isTs) {
      // 参见: https://nodejs.org/docs/latest-v12.x/api/esm.html#esm_experimental_loaders
      // 为了避免让用户在使用 node 的时候手动添加 --experimental-loader
      // 这里需要做一点 hack:
      // 把 ts 转换为 js 并写入到文件中,
      // 使用 node 原生的 esm 加载文件, 然后删除.
      const code = await bundleMjsOrTsFile(cwd, filePath, true)

      await fs.outputFile(tempFilePath, code, 'utf-8')

      importedFile = (
        await eval(`import('${pathToFileURL(tempFilePath)}?t=${Date.now()}')`)
      ).default
      logger.debug(
        `TS + native esm 文件已加载, 耗时: ${Date.now() - start}ms`,
        fileUrl
      )
    } else {
      importedFile = (await eval(`import(fileUrl + '?t=${Date.now()}')`))
        .default
      logger.debug(
        `native esm 文件已加载, 耗时: ${Date.now() - start}ms`,
        fileUrl
      )
    }
  }

  if (!importedFile && !isTs && !isMjs) {
    // 1. 假设为 commonjs, 直接引用
    try {
      // 清理 require 缓存
      delete require.cache[requireResolve(filePath)]
      importedFile = require(filePath)
      logger.debug(`cjs 文件已加载, 耗时: ${Date.now() - start}ms`, filePath)
    } catch (e) {
      const ignored = new RegExp(
        [
          `Cannot use import statement`,
          `Must use import to load ES Module`,
          // some Node 12.x versions don't have esm detection
          // so it throws normal syntax errors when encountering esm syntax
          `Unexpected token`,
          `Unexpected identifier`
        ].join('|')
      )
      if (!ignored.test((e as Error).message)) {
        throw e
      }
    }
  }

  if (!importedFile) {
    // 2. 如果运行到这里, 则代表文件为 ts 或者使用了 es import 语法
    const code = await bundleMjsOrTsFile(cwd, filePath)
    await fs.outputFile(tempFilePath, code, 'utf-8')
    delete require.cache[requireResolve(tempFilePath)]
    importedFile = interopRequireDefault(require(tempFilePath))?.default
    logger.debug(`ts 或 esm 文件已加载, 耗时 ${Date.now() - start}ms`, filePath)
  }

  // 自动删除临时文件
  if (autoDeleteTempFile) {
    if (await fs.pathExists(tempFilePath)) {
      await fs.remove(tempFilePath)
    }
  }

  return importedFile
}
