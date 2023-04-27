import { mor, zod as z } from '@morjs/utils'
import path from 'path'

/**
 * 以下为 mor 编译插件需要
 */
export const target = 'web'
export const targetDescription = 'Web 应用'
export const globalObject = 'my'
export const resolveMainFields = ['webformini', 'module', 'main']
export const defaultConditionalFileExt = '.web'
export const defaultOutputDir = 'dist/web'
export const projectConfigFiles = []

// 转 web 自闭合标签的闭合方式设置为 tag
// 行为如下: <image /> => <image></image>
// 原因为: sax 解析时最后一个属性如果无值会导致闭合错误抛错 <image someProp />
export const templateSingleTagClosingType = 'tag'

/**
 * 静态资源支持
 */
export const ASSETS_REGEXP =
  /\.(jpg|jpeg|png|svg|bmp|ico|gif|webp|otf|ttf|woff|woff2|eot|cer|ogg|aac|mp4|wav|mp3)$/i

/**
 * 当前 npm 所包含的 node_modules 目录
 */
export const CURRENT_NODE_MODUELS = path.resolve(__dirname, '../node_modules')

export const RUNTIME_NPM_NAME = '@morjs/runtime-web'

export const WEB_RUNTIMES = {
  runtime: `${RUNTIME_NPM_NAME}/lib/runtime`,
  api: `${RUNTIME_NPM_NAME}/lib/api`,
  components: `${RUNTIME_NPM_NAME}/lib/components`,
  router: `${RUNTIME_NPM_NAME}/lib/router`,
  config: `${RUNTIME_NPM_NAME}/lib/components/config`
}

export const WEB_COMPILER_LOADERS = {
  template: path.resolve(__dirname, './loaders/template'),
  script: path.resolve(__dirname, './loaders/script'),
  style: path.resolve(__dirname, './loaders/style')
}

/**
 * 生成虚拟的 entry 根目录
 */
export function generateEntryRoot(srcPath: string) {
  return path.join(srcPath, `${mor.name}-entries`)
}

/**
 * 获取 webpack 文件名称配置
 */
export function fileNameConfig(mode: string) {
  return mode === 'production' ? '[name].[contenthash:6]' : '[name]'
}

/**
 * Web 相关用户配置
 */
export const UserConfigSchema = z.object({
  /**
   * web 编译相关配置
   */
  web: z
    .object({
      // 配置小程序组件名映射表
      globalComponentsConfig: z.record(z.string()).optional(),

      // 是否使用 rpx2rem 插件对 rpx 单位进行转换
      needRpx: z.boolean().optional(),

      // 是否需要样式隔离，如果开启该功能，在编译时会给样式加上唯一 hash 值，用于多页面解决样式冲突问题
      styleScope: z.boolean().optional(),

      // rpx 方案的 root value。默认是 32
      rpxRootValue: z.number().optional(),

      // 默认编译出来的样式会以 rem 为单位，
      // 配合 runtime 层提供的 setRootFontSizeForRem 方法可以实现移动端的响应式。
      // 如果不想将样式单位编译成 rem 可以配置该对象，
      // 对象中包含一个参数 ratio 用于指定 rpx 2 px 的转换比例。
      // 如 ratio 为 1， 那么 1rpx = 1px， 如果配置 ratio 为 2， 那么 1rpx = 0.5px
      usePx: z.object({ ratio: z.number() }).optional(),

      // 编译过程中可以引入第三方插件，目前仅支持在 js 文件打包过程中引入 babel 插件
      // compilerPlugins: z.object({ js: z.array(z.any()).optional() }).optional(),

      // extensions 配置，用于设置接口扩展
      // 可设置多个扩展路径，如 ['extension1', 'extension2', ['extension3', {}]]
      extensions: z
        .array(
          z.string().or(z.tuple([z.string(), z.record(z.any()).optional()]))
        )
        .optional(),

      // 配置可开启页面自动响应式（以375尺寸为准）
      responsiveRootFontSize: z.number().optional(),

      // 是否需要在导航栏展示返回按钮
      showBack: z
        .boolean()
        .or(z.array(z.string()))
        .or(z.function().args(z.string()).returns(z.boolean()))
        .default(false),

      // 是否需要导航栏
      showHeader: z
        .boolean()
        .or(z.array(z.string()))
        .or(z.function().args(z.string()).returns(z.boolean()))
        .default(true),

      // 产物通用路径
      publicPath: z.string().default('/'),

      // 开发服务器配置
      devServer: z.record(z.any()).optional(),

      // html-webpack-plugin 插件 配置
      // 支持配置多个 html 页面
      htmlOptions: z.array(z.record(z.any())).or(z.record(z.any())).optional(),

      // mini-css-extract-plugin 插件配置
      miniCssExtractOptions: z.record(z.any()).optional(),

      // 行内资源大小配置, 默认为 8k
      inlineAssetLimit: z.number().default(8192),

      // 是否自动生成 entries, 默认均开启
      // 如关闭, 则需要自行指定 webpack 配置的入口文件
      autoGenerateEntries: z.boolean().default(true),

      // 入口文件配置, 仅在 autoGenerateEntries 为 false 的情况下生效
      // 用于手动配置 webpack 入口文件地址
      // 若手动配置则需要用户自行组装页面及引用
      entry: z.any().optional(),

      // 是否输出中间产物
      emitIntermediateAssets: z.boolean().default(false),

      // 支持用户自定义运行时的一些行为，该字段将作为 $MOR_APP_CONFIG 写入到 window 对象中
      // 供运行时获取及消费
      appConfig: z
        .object({
          /**
           * 用于传递业务对某个组件的特殊配置, 比如 map 组件传递 key
           */
          components: z.record(z.any()).optional(),
          /* 用于传递业务对某个 api 的特殊配置，比如 clipboard 切换实现方式 */
          apis: z.record(z.any()).optional(),
          /**
           * 用于自定义 URL 中 query 部分的 tabBarKey 的实际名称，该 key 作用于 URL 的
           * query，并将拿到到值，用于获取 app.json 中的 tabbar 内容，以此实现通过 URL 参数
           * 切换不同 tabbar 的功能
           */
          customTabBarKey: z.string().default('tabBarKey'),
          /**
           * 用于配置是否允许覆盖全局对象中的方法
           */
          apiNoConflict: z.boolean().optional()
        })
        .default({})
    })
    .default({})
})

/**
 * Web 编译配置类型
 */
export type WebCompilerUserConfig = z.infer<typeof UserConfigSchema>
