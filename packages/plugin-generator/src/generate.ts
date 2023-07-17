import {
  asArray,
  CommandOptions,
  fastGlob as glob,
  prompts,
  Runner
} from '@morjs/utils'
import path from 'path'

const SUPPORT_GENERATOR_TYPES = ['page', 'component']
const SUPPORT_GENERATOR_TYPE_NAMES = {
  page: '页面',
  component: '组件'
}

async function generatePageOrComponent(
  command: CommandOptions,
  runner: Runner,
  fileNames: string[],
  type?: string
) {
  const opts = command?.options || {}
  let sourceType: string = opts.sourceType
  let srcPath: string = opts.srcPath
  const typescript: boolean = opts.typescript
  let cssParser: string =
    opts.sass || opts.scss ? 'sass' : opts.less ? 'less' : undefined

  const srcPaths: string[] = []
  const sourceTypes: string[] = []

  // 如果用户配置数量大于 1 且未选择具体的配置, 则自动判断并让用户选择
  const configCount = runner.config.userConfig?.length || 1
  if (configCount > 1 && !command?.options?.name) {
    runner.config.userConfig.forEach((c) => {
      const src = c.srcPath || 'src'
      if (!srcPaths.includes(src)) srcPaths.push(src)
      if (c.sourceType && !sourceTypes.includes(c.sourceType)) {
        sourceTypes.push(c.sourceType)
      }
    })
    if (srcPaths.length === 1 && !srcPath) srcPath = srcPaths[0]
    if (sourceTypes.length === 1 && !sourceType) sourceType = sourceTypes[0]
  } else {
    if (!sourceType) sourceType = runner?.userConfig?.sourceType
    if (!srcPath) srcPath = runner?.userConfig?.srcPath
  }

  const questions = [
    {
      type() {
        return type ? null : 'select'
      },
      name: 'type',
      message: `请选择生成器类型`,
      choices: [
        { title: '生成页面 (page)', value: 'page' },
        { title: '生成组件 (component)', value: 'component' }
      ]
    },
    {
      type() {
        return sourceType ? null : 'select'
      },
      name: 'sourceType',
      message: `请选择源码类型`,
      choices: [
        { title: '微信小程序 DSL', value: 'wechat' },
        { title: '支付宝小程序 DSL', value: 'alipay' }
      ]
    },
    {
      type() {
        return srcPath ? null : 'select'
      },
      name: 'srcPath',
      message(_, values) {
        return `请选择将${
          SUPPORT_GENERATOR_TYPE_NAMES[type || values.type]
        }生成到的目录`
      },
      choices: srcPaths.map((p) => {
        return { title: p, value: p }
      })
    },
    {
      type() {
        return typescript == null ? 'toggle' : null
      },
      name: 'typescript',
      message: '是否使用 Typescript',
      initial: true,
      active: '是',
      inactive: '否'
    },
    {
      type() {
        return cssParser ? null : 'select'
      },
      name: 'cssParser',
      message: '请选择 CSS 预处理器',
      choices: [
        { title: 'less', value: 'less' },
        { title: 'sass', value: 'sass' },
        { title: 'css', value: '' }
      ]
    }
  ] as prompts.PromptObject[]

  const answers = await prompts(questions, {
    onCancel() {
      process.exit(0)
    }
  })

  sourceType = sourceType || answers.sourceType
  type = type || answers.type
  srcPath = srcPath || answers.srcPath
  cssParser = cssParser || answers.cssParser

  const tsOrJs = typescript || answers.typescript ? 'ts' : 'js'
  const css = cssParser
  const parts = [sourceType, tsOrJs]
  if (css) parts.push(css)

  let runtimeName = '@morjs/core'
  // 允许插件通过 fetchCustomGeneratorOptions 方法定制
  if (runner.methods.has('fetchCustomCoreRuntimeLibraryName')) {
    runtimeName =
      (await runner.methods.invoke('fetchCustomCoreRuntimeLibraryName')) ||
      runtimeName
  }

  for await (const pageOrComponent of fileNames) {
    const templateDir = path.resolve(
      __dirname,
      `../templates/generators/${type}-${parts.join('-')}`
    )
    for await (const f of glob.stream('**/*', {
      dot: true,
      ignore: ['**/node_modules/**'],
      cwd: templateDir
    })) {
      const file = f.toString()
      const absFile = path.join(templateDir, file)
      const extname = path.extname(
        absFile.endsWith('.tpl') ? absFile.replace('.tpl', '') : absFile
      )
      const absTarget =
        path.join(path.resolve(runner.getCwd(), srcPath), pageOrComponent) +
        extname
      await runner.generator.run({
        from: absFile,
        to: absTarget,
        baseDir: runner.getCwd(),
        defaults: { runtimeName }
      })
    }
  }
}

/**
 * 微生成器, 用于生成组件、页面、配置等
 *
 * 示例：
 *  - mor g page1 page2
 */
export default async function generate(
  command: CommandOptions,
  runner: Runner
) {
  let type: string = command?.args?.[0]
  const fileNames: string[] = asArray(command?.args?.[1])

  // 如果 type 不符合要求，则将其作为要生成的组件或页面名称
  if (!SUPPORT_GENERATOR_TYPES.includes(type)) {
    fileNames.push(type)
    type = null
  }

  await generatePageOrComponent(command, runner, fileNames, type)
}
