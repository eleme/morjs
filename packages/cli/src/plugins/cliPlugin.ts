import {
  chalk,
  Cli,
  enableDebugger,
  fsExtra as fs,
  mor,
  Plugin,
  Runner,
  Takin
} from '@morjs/utils'
import path from 'path'

function generateMorBanner() {
  const RAINBOW_COLORS = [
    '#FF5757',
    '#FFFF57',
    '#57FF57',
    '#57FFFF',
    '#5757FF',
    '#FF57FF'
  ]

  // 给 Mor banner 上个 🌈 彩虹色 ^_^
  // prettier-ignore
  return [
    ' __  __ ',  '  ___  ',  ' ____         ',   '____ ',  ' _     ', ' ___ ',
    '|  \\/  |', ' / _ \\ ', '|  _ \\       ',  '/ ___|',  '| |    ', '|_ _|',
    '| |\\/| |', '| | | |',  '| |_) |     ',    '| |    ', '| |    ', ' | | ',
    '| |  | |',  '| |_| |',  '|  _ <      ',    '| |___ ', '| |___ ', ' | | ',
    '|_|  |_|', ' \\___/',  ' |_| \\_\\      ', '\\____|', '|_____|', '|___|'
  ]
    .map((line, i) => {
      const colorIndex = i % 6
      let lineWithColor = chalk.hex(RAINBOW_COLORS[colorIndex]).bold(line)
      if (colorIndex === 0) lineWithColor = '\n' + lineWithColor
      return lineWithColor
    })
    .join('')
}

// NOTE: Mor 使用示例 待完善
const MOR_EXAMPLE = `
  使用 mor create 命令来快速初始化一个小程序项目
`

/**
 * 命令行版本号
 */
let VERSION: string

/**
 * 获取命令行版本号
 */
export function getCliVersion(): string {
  if (VERSION) return VERSION
  const pkgPath = path.resolve(__dirname, '../../package.json')
  const pkg = fs.readJSONSync(pkgPath)
  VERSION = pkg.version
  return VERSION
}

/**
 * 设置当前命令行版本号
 * @param version 版本号
 */
export function setCliVersion(version: string): void {
  VERSION = version
}

/**
 * 配置相关的插件，负责初始化的配置设置
 */
export default class ConfigPlugin implements Plugin {
  name = 'MorCliPlugin'

  runner: Runner

  onUse(takin: Takin) {
    takin.hooks.configFiltered.tap(
      this.name,
      function (userConfigs, commandOptions) {
        // 如果是查询版本号或帮助, 则忽略用户配置
        if (
          commandOptions?.options?.v ||
          commandOptions?.options?.version ||
          commandOptions?.options?.h ||
          commandOptions?.options?.help
        ) {
          return []
        } else {
          return userConfigs
        }
      }
    )
  }

  apply(runner: Runner) {
    this.runner = runner

    runner.hooks.cli.tap(
      {
        name: this.name,
        stage: -1000
      },
      (cli) => this.registerCli(cli)
    )

    // 开启详细日志
    runner.hooks.matchedCommand.tap(this.name, function (command) {
      if (command?.options?.verbose) {
        enableDebugger(`${mor.name},${mor.name}:*`)
      }
    })

    // 如果查询 帮助 或 版本信息，则不执行 runner
    runner.hooks.shouldRun.tap(this.name, function () {
      const opts = runner.commandOptions || {}
      if (opts?.help || opts?.h || opts?.v || opts?.version) return false
    })

    // 如果定位到 默认 command 则不检查用户配置，只输出帮助
    runner.hooks.shouldValidateUserConfig.tap(this.name, function () {
      if (!runner.commandName) return false
    })
  }

  registerCli(cli: Cli) {
    const runner = this.runner

    cli.option('--verbose', '开启框架调试日志')

    cli.usage(
      '小程序多端研发工具, 详细使用文档可在官网查看 👉🏻  https://morjs.org'
    )

    // 定制 Help 信息
    cli.help(function (sections) {
      sections.forEach((section, i) => {
        // 输出 Mor banner
        if (i === 0) section.body = generateMorBanner()

        // 输出中文提示
        if (section.title === 'Options') {
          section.body = section.body
            .replace('Display this message', '显示帮助信息')
            .replace('Display version number', '显示版本信息')
            .replace(/\(default:/g, '(默认:')
        }

        if (
          section.title ===
          'For more info, run any command with the `--help` flag'
        ) {
          section.title = '更多信息可通过 `--help` 选项，运行下方命令获取'
        }

        // 移除默认选项的帮助信息, 只是为了好看 ^_^
        if (section.title === 'Commands') {
          section.body = section.body.replace(/ +默认选项描述\n/, '')
        }

        if (section.title === 'Usage') section.title = '用法'
        if (section.title === 'Options') section.title = '选项'
        if (section.title === 'Commands') section.title = '命令'
        if (section.title === 'Exampls') section.title = '举例'
      })
    })

    // 举例
    cli.example(MOR_EXAMPLE)

    // 输出版本信息
    cli.version(getCliVersion())

    // 设置默认命令
    cli.command('', '默认选项描述').action(() => {
      // 获取未知命令名称
      const commandOptions = this.runner.getCommandOptions()
      const unknownCommand = commandOptions?.name || commandOptions?.args?.[0]
      if (unknownCommand) {
        this.runner.logger.error(
          chalk.red(`无效的命令: ${unknownCommand}, 请查看下方帮助信息 👇`)
        )
      }

      // 控制是否需要输出帮助信息
      if (
        unknownCommand ||
        runner.context.get('shouldOutputHelpForDefaultCommand') !== false
      ) {
        cli.outputHelp()
        // 输出帮助信息后自动退出
        process.exit(unknownCommand ? 1 : 0)
      }
    })
  }
}
