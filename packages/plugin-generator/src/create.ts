import type { CommandOptions, Generator, prompts, Runner } from '@morjs/utils'
import { chalk } from '@morjs/utils'
import path from 'path'

const PROJECT_NAME_REGEXP =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/

const PROJECT_TYPES = {
  miniprogram: '小程序',
  'miniprogram-plugin': '小程序插件',
  'miniprogram-subpackage': '小程序分包',
  'mor-cli-plugin': 'MorJS 工程插件',
  'mor-runtime-plugin': 'MorJS 运行时插件',
  'mor-runtime-solution': 'MorJS 运行时解决方案',
  'mor-components-library': 'MorJS 多端组件库',
  'mor-custom-generator': 'MorJS 自定义脚手架'
}

function isMiniProject(values: Record<string, any>) {
  return (
    values?.projectType === 'miniprogram' ||
    values?.projectType === 'miniprogram-plugin' ||
    values?.projectType === 'miniprogram-subpackage'
  )
}

/**
 * 创建/初始化 mor 项目、插件、脚手架等
 * 通过调用 fetchCustomGeneratorOptions 共享方法来提供额外的定制能力
 */
export default async function create(
  command: CommandOptions = {},
  runner: Runner
) {
  const to = command.args?.[0] || '.'

  // 获取默认的项目名称, 取符合要求的文件夹的名称
  let defaultProjectName =
    to === '.' || to == null ? undefined : path.basename(to)
  if (!PROJECT_NAME_REGEXP.test(defaultProjectName || '')) {
    defaultProjectName = undefined
  }

  // 如果指定了 template 则跳过问询
  const template = command?.options?.template

  const from = template
    ? template
    : path.resolve(
        __dirname,
        '../templates/projects/miniprogram-wechat-ts-sass'
      )

  const questions = template
    ? []
    : ([
        {
          type: 'select',
          name: 'projectType',
          message: `请选择工程类型`,
          choices: Object.keys(PROJECT_TYPES).map((key) => {
            return { title: PROJECT_TYPES[key], value: key }
          })
        },
        {
          type(_, values) {
            if (
              isMiniProject(values) ||
              values?.projectType === 'mor-components-library'
            ) {
              return 'select'
            } else {
              return null
            }
          },
          name: 'sourceType',
          message: `请选择源码类型`,
          choices: [
            { title: '微信小程序 DSL', value: 'wechat' },
            { title: '支付宝小程序 DSL', value: 'alipay' }
          ]
        },
        {
          type: (_, values) => {
            if (isMiniProject(values)) {
              return 'toggle'
            } else {
              return null
            }
          },
          name: 'typescript',
          message: '是否使用 Typescript',
          initial: true,
          active: '是',
          inactive: '否'
        },
        {
          type: (_, values) => {
            if (isMiniProject(values)) {
              return 'select'
            } else {
              return null
            }
          },
          name: 'cssParser',
          message: '请选择 CSS 预处理器',
          choices: [
            { title: 'less', value: 'less' },
            { title: 'sass', value: 'sass' },
            // { title: 'stylus', value: 'stylus' },
            { title: 'css', value: '' }
          ]
        },
        {
          name: 'name',
          message(_, values) {
            return `请输入 ${PROJECT_TYPES[values.projectType]} 的名称`
          },
          type: 'text',
          initial: defaultProjectName,
          validate(val) {
            if (PROJECT_NAME_REGEXP.test(val || '')) {
              return true
            } else {
              return '无效的项目名称, 支持 小写字母、数字、下划线、中划线、 @ . ~ / 符号'
            }
          },
          format(val) {
            return val
          }
        },
        {
          type: 'text',
          name: 'desc',
          message(_, values) {
            return `请输入 ${PROJECT_TYPES[values.projectType]} 的描述`
          },
          initial: '',
          validate: (v) => v != null
        },
        {
          name: 'npmClient',
          type: 'select',
          message: '请选择 npm 客户端',
          choices: [
            { title: 'npm', value: 'npm' },
            { title: 'pnpm', value: 'pnpm' },
            { title: 'yarn', value: 'yarn' }
          ]
        }
      ] as prompts.PromptObject[])

  // 脚手架选项
  let options = {
    from,
    to,
    baseDir: runner.getCwd(),
    questions,
    prompted(generator: Generator) {
      // 不处理自定义 template
      if (template) return

      const answers = generator.answers || {}

      if (isMiniProject(answers)) {
        const sourceType = answers.sourceType
        const tsOrJs = answers.typescript ? 'ts' : 'js'
        const css = answers.cssParser
        const parts = [answers.projectType, sourceType, tsOrJs]
        if (css) parts.push(css)
        generator.from = path.resolve(
          __dirname,
          '../templates/projects',
          parts.join('-')
        )
      } else if (answers?.projectType === 'mor-components-library') {
        generator.from = path.resolve(
          __dirname,
          '../templates/projects',
          answers.projectType,
          answers.sourceType
        )
      } else {
        generator.from = path.resolve(
          __dirname,
          '../templates/projects',
          answers.projectType
        )
      }
    },

    // 自动安装 npm
    async written(generator: Generator) {
      if (!generator?.answers?.npmClient) return

      const fs = generator.utils.fsExtra
      const execa = generator.utils.execa

      if (await fs.pathExists(path.join(generator.to, 'package.json'))) {
        let command: string
        let startCommand: string
        switch (generator.answers.npmClient) {
          case 'npm':
            command = 'npm i'
            startCommand = 'npm run dev'
            break
          case 'pnpm':
            command = 'pnpm i'
            startCommand = 'pnpm dev'
            break
          case 'yarn':
            command = 'yarn add'
            startCommand = 'yarn run dev'
            break
          default:
            command = 'npm i'
            startCommand = 'npm run dev'
        }
        runner.logger.info('自动安装 node_modules 中...')
        await execa.command(command, {
          cwd: generator.to,
          stdio: 'inherit'
        })
        runner.logger.info('安装 node_modules 完成 !')

        const projectDir = path.relative(generator.baseDir, generator.to)

        generator.logger.success(
          `项目初始化完成 ^_^\n\n` +
            chalk.green(`cd ${projectDir} && ${startCommand}\n\n`) +
            '即可开始开发。'
        )
      }
    }
  }

  if (command?.options?.custom !== false) {
    // 允许插件通过 fetchCustomGeneratorOptions 方法定制
    if (runner.methods.has('fetchCustomGeneratorOptions')) {
      options = await runner.methods.invoke(
        'fetchCustomGeneratorOptions',
        options,
        template,
        defaultProjectName
      )
    }
  }

  await runner.generator.run(options)
}
