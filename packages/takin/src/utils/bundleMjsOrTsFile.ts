import { build as esbuild } from 'esbuild'
import fs from 'fs-extra'
import path from 'path'

/**
 * 使用 esbuild 读取 ts 或 mjs 文件内容
 * @param cwd - 当前工作目录
 * @param fileName - 配置文件路径
 * @param mjs - 是否为 mjs 文件类型
 * @returns 返回解析后的代码字符串
 */
export async function bundleMjsOrTsFile(
  cwd: string,
  fileName: string,
  mjs: boolean = false
): Promise<string> {
  const result = await esbuild({
    absWorkingDir: cwd,
    entryPoints: [fileName],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    target: ['node12.2.0'],
    bundle: true,
    format: mjs ? 'esm' : 'cjs',
    sourcemap: 'inline',
    metafile: true,
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              return {
                external: true
              }
            }
          })
        }
      },
      {
        name: 'replace-import-meta',
        setup(build) {
          build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
            const contents = await fs.readFile(args.path, 'utf8')
            return {
              loader: args.path.endsWith('.ts') ? 'ts' : 'js',
              contents: contents
                .replace(
                  /\bimport\.meta\.url\b/g,
                  JSON.stringify(`file://${args.path}`)
                )
                .replace(
                  /\b__dirname\b/g,
                  JSON.stringify(path.dirname(args.path))
                )
                .replace(/\b__filename\b/g, JSON.stringify(args.path))
            }
          })
        }
      }
    ]
  })

  const { text } = result.outputFiles[0]

  return text
}
