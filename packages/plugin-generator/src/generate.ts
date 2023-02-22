import {
  asArray,
  CommandOptions,
  fastGlob as glob,
  prompts,
  Runner
} from '@morjs/utils'
import path from 'path'

const SUPPORT_GENERATOR_TYPES = ['page', 'component']

async function generatePageOrComponent(
  type: 'page' | 'component',
  command: CommandOptions,
  runner: Runner
) {
  let sourceType = runner?.userConfig?.sourceType
  const questions = [
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
      type: 'toggle',
      name: 'typescript',
      message: '是否使用 Typescript',
      initial: true,
      active: '是',
      inactive: '否'
    },
    {
      type: 'select',
      name: 'cssParser',
      message: '请选择 CSS 预处理器',
      choices: [
        { title: 'less', value: 'less' },
        { title: 'sass', value: 'sass' },
        { title: 'css', value: '' }
      ]
    }
  ] as prompts.PromptObject[]

  const srcPath = runner.userConfig.srcPath

  const answers = await prompts(questions, {
    onCancel() {
      process.exit(0)
    }
  })

  sourceType = sourceType || answers.sourceType
  const tsOrJs = answers.typescript ? 'ts' : 'js'
  const css = answers.cssParser
  const parts = [sourceType, tsOrJs]
  if (css) parts.push(css)

  let runtimeName = '@morjs/core'
  // 允许插件通过 fetchCustomGeneratorOptions 方法定制
  if (runner.methods.has('fetchCustomCoreRuntimeLibraryName')) {
    runtimeName =
      (await runner.methods.invoke('fetchCustomCoreRuntimeLibraryName')) ||
      runtimeName
  }

  for await (const pageOrComponent of asArray(command?.args?.[1])) {
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
      const absTarget = path.join(srcPath, pageOrComponent) + extname
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
  const type = command?.args?.[0]
  if (!SUPPORT_GENERATOR_TYPES.includes(type)) {
    throw new Error(
      `错误的生成器类型, 支持的生成器为: ${SUPPORT_GENERATOR_TYPES.join(', ')}`
    )
  }

  // 如果用户配置数量大于 1 且未选择具体的配置, 则直接报错
  const configCount = runner.config.userConfig?.length || 1
  if (configCount > 1 && !command?.options?.name) {
    const names = runner.config.userConfig.map((c) => c.name)
    throw new Error(
      `检测到当前项目有多套配置，请选择通过 --name 选择具体的配置名称，可选配置有: ${names.join(
        ', '
      )}，如 --name ${names[0]}`
    )
  }

  if (type === 'page' || type === 'component') {
    await generatePageOrComponent(type, command, runner)
  }
}
