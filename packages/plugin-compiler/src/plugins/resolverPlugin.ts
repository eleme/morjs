import { webpack } from '@morjs/utils'
import path from 'path'
import { NODE_MODULE_REGEXP } from '../constants'

const alreadyTriedSrcPath = Symbol('alreadyTriedSrcPath')

export interface ResolverPluginOptions {
  srcPaths: string[]
  // 小程序多端产物默认目录, 不同的端默认配置不一样
  defaultNpmMiniProgramDist?: string
}

/**
 * 获取对象字段值
 * @param content 对象
 * @param field 字段名称，可以是一个数组
 * @returns 字段值
 */
function getObjectFieldValue(
  content: Record<string, any>,
  field: string[]
): string | void {
  if (!content) return undefined

  if (Array.isArray(field)) {
    let current: string | undefined | null

    for (let j = 0; j < field.length; j++) {
      current = content?.[field[j]]

      if (current) return current
    }

    return current
  } else {
    return content?.[field]
  }
}

function forEachBail<T = any>(
  array: T[],
  iterator: (item: T, clk: (err?: Error, result?: any) => any) => any,
  callback: (...args: any[]) => any
) {
  if (array.length === 0) return callback()

  let i = 0
  const next = () => {
    let loop = undefined
    iterator(array[i++], (err: Error, result?: string) => {
      if (err || result !== undefined || i >= array.length) {
        return callback(err, result)
      }
      if (loop === false) while (next());
      loop = true
    })
    if (!loop) loop = false
    return loop
  }
  while (next());
}

/**
 * 排序之后的源码路径
 * @param srcPaths - 源码路径
 * @param request - 请求的文件
 * @returns 返回排序后的源码目录列表和相对路径
 */
function sortedSrcPaths(
  srcPaths: string[],
  requestPath: string
): {
  srcs: string[]
  relativePath?: string
} {
  const srcs = []
  let relativePath: string
  for (const src of srcPaths || []) {
    if (requestPath.startsWith(src)) {
      // 尝试获取当前文件相对于 srcPath 的路径
      const relative = path.relative(src, requestPath)
      if (!relativePath || relativePath.length > relative.length) {
        relativePath = relative
        srcs.unshift(src)
      } else {
        srcs.push(src)
      }
    } else {
      srcs.push(src)
    }
  }
  return { srcs, relativePath }
}

/**
 * webpack enhance-resolver 插件
 * 1. 将绝对路径的引用限制在 srcPath 之内
 * 2. 支持多端产物目录检索
 */
export default class ResolverPlugin {
  name = 'MorResolverPlugin'

  options: ResolverPluginOptions

  constructor(options: ResolverPluginOptions) {
    this.options = { ...options }
  }

  apply(resolver: webpack.Resolver): void {
    this.restrictToAndAllowMultipleSrcPaths(resolver)
    this.searchInMultiDist(resolver)
  }

  /**
   * 限制绝对路径文件查找 以及 允许多个 srcPaths 查询
   */
  restrictToAndAllowMultipleSrcPaths(resolver: webpack.Resolver) {
    const { srcPaths } = this.options
    const parsedResolveTarget = resolver.ensureHook('parsed-resolve')
    const directoryTarget = resolver.ensureHook('directory')
    const rawFileTarget = resolver.ensureHook('raw-file')

    /**
     * 绝对路径查询支持
     * 1. 优先查询当前文件所在 srcPath 的绝对路径
     * 2. 然后再查询其他 srcPaths 中的文件
     */
    resolver
      .getHook('resolve')
      .tapAsync(this.name, (request, resolveContext, callback) => {
        const parsed = resolver.parse(request.request)

        // 检查条件
        // 请求的文件(request) 为绝对路径, 且不在任意一个 src 中
        // 且存在 issuer
        if (
          request.request &&
          path.isAbsolute(request.request) &&
          request.path &&
          request['context']?.issuer
        ) {
          const { srcs, relativePath } = sortedSrcPaths(
            srcPaths,
            request.request
          )
          // 如果存在相对路径, 则代表当前请求的绝对路径位于某个 srcPath 中
          if (relativePath) return callback()

          forEachBail(
            srcs,
            (srcPath, clk) => {
              const obj = { ...request, ...parsed }
              if (obj.request.startsWith(srcPath)) {
                obj.request = path.resolve(srcPath, obj.request)
              } else {
                obj.request = path.join(srcPath, obj.request)
              }

              resolver.doResolve(
                parsedResolveTarget,
                obj,
                'try resolve absolute path in ' + srcPath,
                resolveContext,
                clk
              )
            },
            callback
          )
        } else {
          callback()
        }
      })

    /**
     * 支持多路径检索
     * 优先检索当前目录的路径, 然后扩展到其他源码目录中
     */
    resolver
      .getHook('described-relative')
      .tapAsync(this.name, (request, resolveContext, callback) => {
        if (request.request || !request.path) return callback()

        // 不处理 node_modules 中的路径
        if (NODE_MODULE_REGEXP.test(request.path)) return callback()

        const { srcs, relativePath } = sortedSrcPaths(srcPaths, request.path)

        // 如果未获取到相对路径，则代表当前文件不在任何一个 srcPath 中
        // 不做任何处理
        if (relativePath == null) return callback()

        forEachBail(
          srcs,
          (srcPath, clk) => {
            if (request[alreadyTriedSrcPath] === srcPath) return clk()

            // 使用新的 srcPath 组装备选文件路径
            const alternativePath = path.join(srcPath, relativePath)

            resolver.doResolve(
              request.directory ? directoryTarget : rawFileTarget,
              {
                ...request,
                [alreadyTriedSrcPath]: srcPath,
                path: alternativePath,
                relativePath: request.descriptionFileRoot
                  ? path.relative(request.descriptionFileRoot, alternativePath)
                  : undefined,
                request: undefined
              },
              'try load file in alternative srcPath ' + srcPath,
              resolveContext,
              clk
            )
          },
          callback
        )
      })
  }

  /**
   * 多端编译的 npm 查找支持, 适配 微信的 miniprogram_dist 逻辑
   */
  searchInMultiDist(resolver: webpack.Resolver) {
    const { defaultNpmMiniProgramDist } = this.options

    // 小程序多端 mainFields 对应的组件查询支持
    const target = resolver.ensureHook('resolve-in-existing-directory')

    const mainFields = resolver?.options?.mainFields || []

    // 合并 mainFields
    // 需要考虑 mainFields 可能是一个文件的情况
    // 另外如果一个 mainField 没有找到文件，需要能够falback到优先级更低的 mainField
    const allMainFields = mainFields.reduce(function (result, item) {
      return result.concat(item.name)
    }, [])

    resolver
      .getHook('resolve-in-package')
      .tapAsync(this.name, (request, resolveContext, callback) => {
        // 不处理 node_modules 以外的逻辑
        if (!request.descriptionFilePath) return callback()
        if (!request.descriptionFileData) return callback()

        // package.json 文件可能继承自 父 package
        // 代表当前 package 无 package.json 文件, 不处理这种情况
        if (request.relativePath !== '.') return callback()

        // 不处理 request 为空 或 以 .. 起始的情况
        if (!request.request || request.request.startsWith('..')) {
          return callback()
        }

        let multiDist =
          getObjectFieldValue(request.descriptionFileData, allMainFields) ||
          defaultNpmMiniProgramDist

        // 如果无值 或者 值不是字符串, 则忽略
        if (!multiDist || typeof multiDist !== 'string') return callback()

        // 如果配置的不是文件夹，而是一个文件
        if (path.extname(multiDist) !== '') {
          // 若默认产物目录存在，则优先使用
          if (defaultNpmMiniProgramDist) {
            multiDist = defaultNpmMiniProgramDist
          } else {
            // 否则, 不处理
            return callback()
          }
        }

        // 如果路径已经以 multiDist 作为起始, 则不处理
        if (
          request.request.startsWith(multiDist) ||
          request.request.startsWith('./' + multiDist)
        ) {
          return callback()
        }

        resolver.doResolve(
          target,
          {
            ...request,
            request: path.join(multiDist, request.request)
          },
          'try load file in ' + multiDist,
          resolveContext,
          callback
        )
      })
  }
}
