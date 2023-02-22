import { z } from 'zod'
import { PluginEnforceTypes } from './plugin'
import { Runner } from './runner'

export const DEFAULT_NAME = 'takin'

export const DEFAULT_CONFIG_OPTION_NAME = 'config'

export const DEFAULT_CONFIG_OPTION_NAME_ALIAS = 'c'

export const DEFAULT_MULTIPLE_CONFIG_FIELD = 'name'

export const DEFAULT_ROOT = process.cwd()

export const PKG_FILE = 'package.json'

export const SupportConfigExtensions = {
  ts: '.ts',
  js: '.js',
  mjs: '.mjs',
  json: '.json',
  jsonc: '.jsonc',
  json5: '.json5'
} as const

export const NAME_REGEXP = /^[a-zA-Z0-9_-]+$/

// 插件 schema 和 ./plugin 保持一致
const PluginSchema = z
  .object({
    name: z.string(),
    enforce: z.nativeEnum(PluginEnforceTypes).optional(),
    apply: z.function().args(z.instanceof(Runner)).returns(z.void())
  })
  .or(z.string())
  .or(z.tuple([z.string(), z.any()]))

// takin 中支持的用户配置
export const UserConfigSchema = {
  name: z.string().min(1).regex(NAME_REGEXP).optional(),
  plugins: z.union([z.array(PluginSchema), PluginSchema]).optional()
}
