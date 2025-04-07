import fs from 'fs-extra'
import * as json5 from 'json5'
import * as jsoncParser from 'jsonc-parser'
import path from 'path'
import { SupportConfigExtensions } from '../constants'

/**
 * 读取类 json 文件
 * 支持 json / jsonc / json5 三种格式
 * @param filePath - 类 json 文件
 * @returns json 文件内容
 */
export async function readJsonLike(filePath: string): Promise<any> {
  const extname = path.extname(filePath)
  if (extname === SupportConfigExtensions.json) {
    return await fs.readJson(filePath)
  }

  const fileContent = (await fs.readFile(filePath)).toString('utf-8')

  if (extname === SupportConfigExtensions.jsonc) {
    return jsoncParser.parse(fileContent)
  }

  return json5.parse(fileContent)
}
