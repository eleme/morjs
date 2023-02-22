import fs from 'fs-extra'
import path from 'path'
import { asArray } from '../utils/asArray'

export interface ILookUpFileOptions {
  /**
   * 是否只返回路径, 默认为 false
   */
  pathOnly?: boolean
  /**
   * 查找深度，默认为 1, 如果为 0 则不查找
   */
  depth?: number
}

/**
 * 查找文件
 * @param dirs - 目录地址
 * @param files - 文件名
 * @param extnames - 后缀名
 * @param options - 查找选项
 * @returns `undefined` 或 文件路径 或 文件内容
 */
export function lookupFile(
  dirs: string | string[],
  files: string[],
  extnames: string[],
  options: ILookUpFileOptions = {}
): string | undefined {
  const { pathOnly = false, depth = 1 } = options

  if (depth === 0) return

  for (const dir of asArray(dirs)) {
    for (const file of files) {
      for (const extname of extnames) {
        const fullPath = [path.join(dir, file), extname].join('')
        if (fs.pathExistsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          return pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
        }
      }
    }

    const parentDir = path.dirname(dir)

    if (parentDir !== dir) {
      const res = lookupFile(parentDir, files, extnames, {
        pathOnly,
        depth: depth - 1
      })
      if (res != null) return res
    }
  }
}
