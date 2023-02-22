import path from 'path'
import type { Generator, GeneratorConstructor } from 'takin'

export default function (GeneratorClass: GeneratorConstructor) {
  return class extends GeneratorClass {
    // 载入自定义生成器之后执行
    async customized(generator: Generator) {
      generator.from = path.resolve(__dirname, 'templates')

      const { execa } = generator.utils

      let gitUser = ''
      let gitEmail = ''

      try {
        gitUser = (await execa.command('git config user.name')).stdout
        gitEmail = (await execa.command('git config user.email')).stdout
      } catch (error) {
        generator.logger.debug('获取当前 Git 用户和邮箱失败', error)
      }

      // 设置问题
      generator.questions = [
        {
          type: 'text',
          name: 'name',
          message: '请输入项目名称',
          validate(val) {
            if (
              /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
                val || ''
              )
            ) {
              return true
            } else {
              return '无效的项目名称, 支持 字母、数字、下划线、中划线、 @ 和 / 符号'
            }
          }
        },
        {
          type: 'text',
          name: 'desc',
          message: '请输入项目描述',
          initial: '',
          validate: (v) => v != null
        },
        {
          type: 'text',
          name: 'user',
          message: '用户名',
          initial: gitUser,
          validate: (v) => !!v
        },
        {
          type: 'text',
          name: 'email',
          message: '邮箱',
          initial: gitEmail,
          validate: (v) => !!v
        },
        {
          type: 'text',
          name: 'git',
          message: '请输入 Git 仓库地址',
          initial: '',
          validate: (v) => v != null
        }
      ]
    }

    // 弹出问题且获取到用户 answers 之后执行
    prompted(generator: Generator) {
      //
    }

    // 写入到目标地址后执行
    async written(generator: Generator) {
      const { execa, chalk } = generator.utils

      generator.logger.info('安装 node_modules 中...')
      await execa.command('npm i', {
        cwd: generator.to,
        stdio: 'inherit'
      })
      generator.logger.success('安装 node_modules 完成!')

      const projectDir = path.relative(generator.baseDir, generator.to)

      generator.logger.success('项目初始化完成 ^_^')
    }
  }
}
