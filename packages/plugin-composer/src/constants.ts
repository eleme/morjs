import {
  ComposeModuleStates,
  NAME_REGEXP,
  objectEnum,
  zod as z
} from '@morjs/utils'

export const COMMAND_NAME = 'compose'

/**
 * 特殊的下载类型, 用于忽略模块的下载
 */
export const DOWNLOAD_TYPE_FOR_COMPILE = 'fromCompile'

/**
 * 集成信息存储文件名称
 */
export const COMPOSE_INFO_FILE = 'mor.compose.json'

/**
 * 模块类型描述
 */
export const MODULE_TYPE_NAMES = {
  host: '宿主',
  main: '主包',
  subpackage: '分包',
  plugin: '插件'
}

/**
 * 模块集成模式描述
 */
export const MODULE_MODE_NAMES = {
  compile: '编译',
  compose: '组合'
}

/**
 * 配置文件名称映射
 */
export const MODULE_CONFIG_NAMES = {
  host: 'app.json',
  main: 'subpackage.json',
  subpackage: 'subpackage.json',
  plugin: 'plugin.json'
}

/**
 * 集成状态描述
 */
export const ComposeModuleStatesDesc = {
  [ComposeModuleStates.initial]: '初始',
  [ComposeModuleStates.downloaded]: '已下载',
  [ComposeModuleStates.beforeScriptsExecuted]: '已执行前置脚本',
  [ComposeModuleStates.configLoaded]: '已载入配置',
  [ComposeModuleStates.copiedOrCompiled]: '已复制或编译',
  [ComposeModuleStates.afterScriptsExecuted]: '已执行后置脚本',
  [ComposeModuleStates.composed]: '已集成'
}

/**
 * 模块类型
 * - 声明为 主包(main) 的模块，会将页面插入到 app.json 的 pages 中
 * - 声明为 分包(subpackage) 的模块，会将页面插入到 app.json 的 subPackages 中
 * - 声明为 插件(plugin) 的模块，会将插件的配置拉取下来，并写入到路由跳转的支持中
 */
const ModuleTypes = objectEnum(['main', 'subpackage', 'plugin'])

/**
 * 集成模式
 * - compose: 通过 compose 方式集成在宿主小程序中, 通过拷贝的方式复制到产物目录
 * - compile: 通过 compile 方式集成在宿主小程序中, 需要通过 mor 编译流程
 */
export const ComposeModes = objectEnum(['compose', 'compile'])

const GitDownloaderSchema = z
  .object({
    url: z.string(),
    branch: z.string().default('master'),
    commit: z.string().optional(),
    tag: z.string().optional()
  })
  .or(z.string())
  .optional()

const NpmDownloaderSchema = z
  .object({
    name: z.string(),
    version: z.string().default('latest'),
    registry: z.string().optional()
  })
  .or(z.string())
  .optional()

const FileOrLinkDownloaderSchema = z
  .object({
    path: z.string()
  })
  .or(z.string())
  .optional()

const TarDownloaderSchema = z
  .union([z.object({ url: z.string() }), z.record(z.any())])
  .or(z.string())
  .optional()

// 脚本命令
const ScriptCommandSchema = z.string().or(
  z.object({
    command: z.string(),
    env: z.record(z.string(), z.string()).optional(),
    // 脚本选项 execaOptions
    options: z.record(z.any()).optional()
  })
)

const ScriptsSchema = z
  .object({
    // 模块编译或拷贝前执行脚本
    before: z.array(ScriptCommandSchema).default([]),
    // 执行脚本时的环境变量
    env: z.record(z.string(), z.string()).optional(),
    // 模块编译完成后或拷贝后执行脚本
    after: z.array(ScriptCommandSchema).default([]),
    // 所有模块完成集成之后执行脚本
    composed: z.array(ScriptCommandSchema).default([]),
    // 脚本选项 execaOptions
    options: z.record(z.any()).optional()
  })
  .optional()

const BaseModuleSchema = z.object({
  name: z.string().min(1).regex(NAME_REGEXP).optional(),
  git: GitDownloaderSchema,
  npm: NpmDownloaderSchema,
  tar: TarDownloaderSchema,
  file: FileOrLinkDownloaderSchema,
  link: FileOrLinkDownloaderSchema,
  dist: z.string().optional(),
  scripts: ScriptsSchema,
  /**
   * 模块集成模式
   * - compose: 通过 compose 方式集成在宿主小程序中, 通过拷贝的方式复制到产物目录
   * - compile: 通过 compile 方式集成在宿主小程序中, 需要通过 mor 编译流程
   */
  mode: z.nativeEnum(ComposeModes).default(ComposeModes.compose),
  /**
   * 对应 subpackage.json / plugin.json / app.json 的内容
   */
  config: z.record(z.string(), z.any()).optional()
})

export type BaseModuleSchemaType = z.infer<typeof BaseModuleSchema>

export const ComposeUserConfigSchema = z.object({
  /**
   * 是否开启 compose 功能
   * 主要用于开关 compile 命令中的 compose 功能
   */
  compose: z.boolean().default(false),
  /**
   * 是否合并所有分包配置 (用于将分包页面合并至主包中)
   */
  combineModules: z.boolean().default(false),
  /**
   * 宿主配置
   */
  host: BaseModuleSchema.optional(),
  /**
   * 模块配置
   */
  modules: z
    .array(
      z
        .object({
          type: z.nativeEnum(ModuleTypes).default(ModuleTypes.subpackage)
        })
        .merge(BaseModuleSchema)
    )
    .default([])
})

export type ComposerUserConfig = z.infer<typeof ComposeUserConfigSchema>
