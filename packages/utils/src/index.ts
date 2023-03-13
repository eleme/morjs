import { Expression } from '@babel/types'
import { cjsToEsmTransformer } from 'cjstoesm'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import type CssMinimizerPluginType from 'css-minimizer-webpack-plugin'
import type HtmlMinimizerPluginType from 'html-minimizer-webpack-plugin'
import micromatch from 'micromatch'
import * as pQueue from 'p-queue'
import pRetry from 'p-retry'
import * as postcss from 'postcss'
import posthtml from 'posthtml'
import slash from 'slash'
import * as takin from 'takin'
import { fastGlob } from 'takin'
import type TerserPluginType from 'terser-webpack-plugin'
import typescript from 'typescript'
import webpack from 'webpack'
import WebpackChain from 'webpack-chain-5'
import WebpackDevServer from 'webpack-dev-server'

/**
 * 扩展 posthtml Options 需要允许透传 htmlparser2 参数
 */
declare module 'posthtml' {
  interface Options {
    sync?: boolean
    skipParse?: boolean
    recognizeSelfClosing?: boolean
    quoteStyle?: 0 | 1 | 2
    replaceQuote?: boolean
    closingSingleTag?: 'slash' | 'tag' | ''
    singleTags?: string[]
    recognizeNoValueAttribute?: boolean
  }
}

export * from 'takin'
export * from './babelDeps'
export * from './constants'
export * from './hooks'
export * from './moduleGraph'
export * from './queue'
export * from './types'
export * from './utils'
export * from './webpack'
export {
  /* 第三方依赖 */
  WebpackChain,
  webpack,
  WebpackDevServer,
  fastGlob as glob,
  posthtml,
  typescript,
  micromatch,
  postcss,
  slash,
  /**
   * @deprecated 请直接引用，而不是从 takin 中引用
   */
  takin,
  pRetry,
  pQueue,
  // NOTE: typescript 4.5 版本对 esm 的接口支持发生了变更
  // 参见: https://github.com/microsoft/TypeScript/wiki/API-Breaking-Changes#typescript-45
  // 会导致 cjstoesm 报错, 具体原因有待排查, 所以我们暂时停留在 4.4 版本
  cjsToEsmTransformer,
  HtmlMinimizerPluginType,
  CssMinimizerPluginType,
  TerserPluginType,
  CopyWebpackPlugin,
  Expression
}
