import chalk from 'chalk'
import debug from 'debug'
import * as esbuild from 'esbuild'
import execa from 'execa'
import fastGlob from 'fast-glob'
import fsExtra from 'fs-extra'
import * as got from 'got'
import * as json5 from 'json5'
import * as jsoncParser from 'jsonc-parser'
import lodash from 'lodash'
import prompts from 'prompts'
import * as tapable from 'tapable'
import * as tarFs from 'tar-fs'
import * as zod from 'zod'

// 依赖库开放，避免重复依赖
export {
  chalk,
  debug,
  execa,
  esbuild,
  fastGlob,
  fsExtra,
  got,
  json5,
  jsoncParser,
  lodash,
  prompts,
  tapable,
  tarFs,
  zod
}
