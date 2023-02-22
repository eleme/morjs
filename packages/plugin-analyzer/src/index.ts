import {
  CommandOptions,
  logger,
  mor,
  objectEnum,
  Plugin,
  Runner,
  validKeysMessage
} from '@morjs/utils'

// 依赖分析相关
const AnalyzerModes = objectEnum(['server', 'static', 'json', 'disabled'])
const AnalyzerDefaultSizes = objectEnum(['stat', 'parsed', 'gzip'])
const AnalyzerLogLevel = objectEnum(['info', 'warn', 'error', 'silent'])

// 命令行配置别名
const NAME_ALIAS = {
  analyzerMode: 'mode',
  analyzerHost: 'host',
  analyzerPort: 'port'
}

const COMMAND_NAME = 'analyze'

// 选项和 webpack-bundle-analyzer 选项基本上一一对应
const AnalyzeOptions = {
  analyzerMode: {
    name: '依赖分析模式',
    cliOption: '--mode <analyzerMode>',
    valuesDesc: validKeysMessage(AnalyzerModes)
  },
  analyzerHost: {
    name: '依赖分析 HTTP 服务域名',
    cliOption: '--host <analyzerHost>',
    desc: '仅在 mode 为 server 时生效'
  },
  analyzerPort: {
    name: '依赖分析 HTTP 服务端口号',
    cliOption: '--port <analyzerPort>',
    desc: '仅在 mode 为 server 时生效'
  },
  reportFilename: {
    name: '生成报告文件的名称',
    cliOption: '--report-filename <reportFilename>',
    desc: '仅在 mode 为 static 时生效'
  },
  reportTitle: {
    name: '生成报告文件的标题',
    cliOption: '--report-title <reportTitle>',
    desc: '仅在 mode 为 static 时生效'
  },
  defaultSizes: {
    name: '分析报告中展示模块大小的定义方式',
    cliOption: '--default-sizes <defaultSizes>',
    valuesDesc: validKeysMessage(AnalyzerDefaultSizes)
  },
  open: {
    name: '浏览器中打开',
    cliOption: '--open'
  },
  noOpen: {
    name: '不在浏览器中打开',
    cliOption: '--no-open'
  },
  generateStatsFile: {
    name: '是否生成 stats 文件',
    cliOption: '--generate-stats-file'
  },
  statsFilename: {
    name: 'stats 文件名称',
    cliOption: '--stats-filename <statsFilename>'
  },
  logLevel: {
    name: '日志级别',
    valuesDesc: validKeysMessage(AnalyzerLogLevel)
  }
}

/**
 * Mor 分析插件
 * 这里仅提供命令行支持
 */
export default class MorAnalyzerPlugin implements Plugin {
  name = 'MorAnalyzerPlugin'
  runner?: Runner
  apply(runner: Runner) {
    this.runner = runner
    this.registerCli()

    // 如果是调用的当前命令, 跳过校验用户配置
    // 原因为当前命令无用户配置
    runner.hooks.shouldValidateUserConfig.tap(this.name, function () {
      if (runner.commandName === COMMAND_NAME) return false
    })
  }

  registerCli() {
    this.runner.hooks.cli.tap(this.name, (cli) => {
      const command = cli.command(COMMAND_NAME, '分析小程序相关 bundle 信息')

      // 注册 options
      for (const option in AnalyzeOptions) {
        const optionSchema = AnalyzeOptions[option]

        // 如未配置 cliOption 则跳过
        if (!optionSchema.cliOption) continue

        const options = {} as { default: any }

        // 拼接完整描述
        let optionDesc = optionSchema.name

        if (optionSchema.desc)
          optionDesc = `${optionDesc}, ${optionSchema.desc}`

        if (optionSchema.valuesDesc)
          optionDesc = `${optionDesc}, ${optionSchema.valuesDesc}`

        command.option(optionSchema.cliOption, optionDesc, options)
      }

      // 运行命令
      command.action(async (options) => await this.runAnalyze(options))
    })
  }

  async runAnalyze(command: CommandOptions) {
    const options = command.options ? command.options : {}

    if (this.runner.config.userConfig.length > 1 && options.name == null) {
      return logger.error('请指定配置名称 --name configName')
    }

    // 强制 开启 analyze
    options.analyze = true
    // 强制 compileMode 为 bundle 模式
    options.compileMode = 'bundle'

    const analyzer = {} as Record<string, any>

    // 覆盖用户配置
    for (const name in AnalyzeOptions) {
      const optionName = NAME_ALIAS[name] || name

      // 是否打开浏览器
      if (optionName === 'open') {
        if (options.open === false) {
          analyzer.openAnalyzer = false
        } else {
          analyzer.openAnalyzer = true
        }
      }
      // 覆盖其他 analyze 配置
      else {
        if (optionName in options) {
          analyzer[name] = options[optionName]
        }
      }
      // 删除选项
      delete options[optionName]
    }

    // 需要解决无法透传的问题
    options.analyze = analyzer

    // analyzer 的产物放在单独的目录
    this.runner.userConfig.outputPath = 'dist/analyzer'

    // 运行 compile 命令
    // analyzer 实际功能在 compile 命令中
    await mor.run(
      {
        name: 'compile',
        options
      },
      [this.runner.userConfig]
    )
  }
}
