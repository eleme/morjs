import { expandExtsWithConditionalExt, lookupFile, slash } from '@morjs/utils'
import * as path from 'path'
import { defaultConditionalFileExt } from '../../constants'
import type { BuildOptions } from '../core/option'

export function getAxmlResourcePath(options: BuildOptions) {
  if (options.templateFilePath) return options.templateFilePath

  const conditionalFileExt = options.conditionalCompileFileExt || [
    defaultConditionalFileExt
  ]

  const exts = expandExtsWithConditionalExt(['.axml'], conditionalFileExt)

  const dir = path.dirname(options.resourcePath)
  const filePath = lookupFile(dir, [options.name], exts, {
    pathOnly: true,
    depth: 1
  })

  if (filePath) {
    const axmlFile = './' + slash(path.relative(dir, filePath))
    return options.isAtomicMode ? axmlFile + '.js' : axmlFile
  }
}

function getStylePath(prefix: string, options: BuildOptions, isApp = false) {
  const conditionalFileExt = options.conditionalCompileFileExt || [
    defaultConditionalFileExt
  ]
  // .h5.acss  > .acss
  const exts = expandExtsWithConditionalExt(['.acss'], conditionalFileExt)

  const result = lookupFile(
    path.dirname(prefix),
    [isApp ? 'app' : path.basename(prefix)],
    exts,
    { pathOnly: true, depth: 1 }
  )

  if (result) {
    return './' + slash(path.relative(path.dirname(prefix), result))
  }
}

export function getCssResourcePath(options: BuildOptions) {
  if (options.styleFilePath) return options.styleFilePath
  const filePath = path.resolve(options.resourcePath, '../' + options.name)
  return getStylePath(filePath, options)
}

export function getAppCssResourceName(options: BuildOptions) {
  if (options.appStyleFilePath) return options.appStyleFilePath
  const appPath = path.resolve(options.rootPath, './app')
  return getStylePath(appPath, options, true)
}
