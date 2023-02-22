import AnalyzerPlugin from '@morjs/plugin-analyzer'
import CompilerPlugin, { CompilerUserConfig } from '@morjs/plugin-compiler'
import ComposerPlugin, { ComposerUserConfig } from '@morjs/plugin-composer'
import GeneratorPlugin from '@morjs/plugin-generator'
import MockerPlugin, { MockerUserConfig } from '@morjs/plugin-mocker'
import {
  CommandOptions,
  MaybePromise,
  mor,
  RunnerContext,
  UserConfigSchema,
  WebpackPlugin,
  WebpackUserConfig,
  zod as z
} from '@morjs/utils'
import AutoReloadPlugin from './plugins/autoReloadPlugin'
import CleanPlugin from './plugins/cleanPlugin'
import CliPlugin from './plugins/cliPlugin'
import PrettyErrorPlugin from './plugins/prettyErrorPlugin'

export * from '@morjs/plugin-compiler'
export * from '@morjs/utils'
/**
 * 允许通过API修改命令行版本号
 */
export { getCliVersion, setCliVersion } from './plugins/cliPlugin'

// 开启 .env 支持
mor.env.enable()

// 开启多配置支持
mor.enableMultipleConfig({ by: 'name' })

// 开启 package.json 配置支持
mor.enablePackageJsonConfig()

// 支持 mor.config.*
mor.setSupportConfigFileNames(['mor.config'])

// 初始化内部插件
mor.use([
  new CliPlugin(),
  new CleanPlugin(),
  new WebpackPlugin(),
  new CompilerPlugin(),
  new ComposerPlugin(),
  new GeneratorPlugin(),
  new AnalyzerPlugin(),
  new AutoReloadPlugin(),
  new PrettyErrorPlugin(),
  new MockerPlugin()
])

const TakinConfig = z.object(UserConfigSchema)
type BaseUserConfig = z.infer<typeof TakinConfig>

/**
 * 用户配置
 */
export type UserConfig = BaseUserConfig &
  WebpackUserConfig &
  CompilerUserConfig &
  ComposerUserConfig &
  MockerUserConfig

/**
 * 允许自定义配置
 */
type UserConfigWithCustomProps = UserConfig & {
  /**
   * 允许自定义配置
   */
  [k: string]: any
}

/**
 * 执行 mor 相关子命令, 分为如下几个步骤
 * 1. 尝试载入配置文件, 只执行一次
 * 2. 基于多配置的设定，获取 filters
 * 3. 基于 filters 筛选 用户配置
 * 4. 基于不同的用户配置分别运行 Runner
 * 5. 获取结果并返回
 * @param command - 命令参数, 可选, 如不填写则自动从命令行读取
 * @param userConfigs - 用户配置, 可选, 如不填写则使用 config 中载入的用户配置
 * @param context - Runner 上下文, 可用于初始化时候传入 Runner
 * @return 命令执行结果
 */
export async function run<R = any>(
  command?: CommandOptions,
  userConfigs?: UserConfigWithCustomProps[],
  context?: RunnerContext | Record<string, any>
): Promise<(R | undefined)[]> {
  return mor.run(command, userConfigs, context)
}

// 对外 export, 允许直接通过接口调用命令
export default mor

/**
 * Mor 用户配置
 */
type MorConfig =
  | UserConfigWithCustomProps
  | UserConfigWithCustomProps[]
  | (() => MaybePromise<MorConfig>)
/**
 * 用于定义 mor 配置的快捷方法, 便于 ts 推导类型
 * @param userConfig 用户配置
 * @returns 用户配置
 */
export function defineConfig(userConfig: MorConfig): MorConfig {
  return userConfig
}
