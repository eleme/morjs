import { CliError } from '../errors'
import { logger } from '../logger'
import { Cli } from './index'
import { platformInfo } from './node'
import Option, { OptionConfig } from './option'
import {
  camelcaseOptionName,
  findAllBrackets,
  findLongest,
  padRight,
  removeBrackets
} from './utils'

interface CommandArg {
  required: boolean
  value: string
  variadic: boolean
}

interface HelpSection {
  title?: string
  body: string
}

interface CommandConfig {
  allowUnknownOptions?: boolean
  ignoreOptionDefaultValue?: boolean
}

type HelpCallback = (sections: HelpSection[]) => void | HelpSection[]

type CommandExample = ((bin: string) => string) | string

/**
 * 子命令及参数
 */
export type CommandOptions = {
  /**
   * 子命令名称, 如 compile
   */
  name?: string
  /**
   * 子命令参数, 如: compile filename 中的 filename
   */
  args?: readonly string[]
  /**
   * 子命令选项, 如 compile filename --verbose 中的 --verbose
   */
  options?: Record<string, any>
}

export type CommandActionCallback = (cmd: CommandOptions) => any

class Command {
  options: Option[]
  aliasNames: string[]
  /* Parsed command name */
  name: string
  args: CommandArg[]
  commandAction?: (...args: any[]) => any
  usageText?: string
  versionNumber?: string
  examples: CommandExample[]
  helpCallback?: HelpCallback
  globalCommand?: GlobalCommand

  constructor(
    public rawName: string,
    public description: string,
    public config: CommandConfig = {},
    public cli: Cli
  ) {
    this.options = []
    this.aliasNames = []
    this.name = removeBrackets(rawName)
    this.args = findAllBrackets(rawName)
    this.examples = []
  }

  usage(text: string) {
    this.usageText = text
    return this
  }

  allowUnknownOptions() {
    this.config.allowUnknownOptions = true
    return this
  }

  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true
    return this
  }

  version(
    version: string,
    customFlags = '-v, --version',
    description?: string
  ) {
    this.versionNumber = version
    this.option(customFlags, description || '显示版本信息')
    return this
  }

  example(example: CommandExample) {
    this.examples.push(example)
    return this
  }

  /**
   * Add a option for this command
   * @param rawName Raw option name(s)
   * @param description Option description
   * @param config Option config
   */
  option(rawName: string, description: string, config?: OptionConfig) {
    const option = new Option(rawName, description, config)
    this.options.push(option)
    return this
  }

  alias(name: string) {
    const tokenCommand = this.cli.commands.get(name)

    if (tokenCommand) {
      throw new CliError(
        `命令 '${this.name}' 的别名 '${name}' 已被插件 '${tokenCommand.pluginName}' ` +
          `注册的 '${tokenCommand.command.name}' 占用, 请更换.`
      )
    } else {
      this.cli.commands.set(name, {
        pluginName: this.cli.pluginName,
        command: this
      })
      this.aliasNames.push(name)
    }

    return this
  }

  action(callback: CommandActionCallback) {
    const cli = this.cli
    const commandName = this.name

    if (!this.commandAction) {
      // 将 runner 中注册的 run hook 作为实际需要执行的 callback
      // 这里并不会实际执行, 以防万一, 会将 runner 实际执行的方法作为 cli 的 action
      this.commandAction = async function (...args: any[]) {
        const options = args.pop()
        await cli.runner.invokeCommandAction({
          name: commandName,
          args,
          options
        })
      }
    }

    // 注册 hook
    cli.runner.addCommandAction({
      name: commandName,
      pluginName: cli.pluginName,
      callback
    })

    return this
  }

  /**
   * Check if a command name is matched by this command
   * @param name Command name
   */
  isMatched(name: string) {
    return this.name === name || this.aliasNames.includes(name)
  }

  get isDefaultCommand() {
    return this.name === '' || this.aliasNames.includes('!')
  }

  get isGlobalCommand(): boolean {
    return this instanceof GlobalCommand
  }

  /**
   * Check if an option is registered in this command
   * @param name Option name
   */
  hasOption(name: string) {
    return !!this.getOption(name)
  }

  /**
   * 获取已设置的命令行选项
   * @param name - 选项名称(需要为驼峰形式, 如 outputPath)
   * @returns 选项实例
   */
  getOption(name: string): Option | undefined {
    name = name.split('.')[0]
    return this.options.find((option) => {
      return option.names.includes(name)
    })
  }

  /**
   * 为 option 设置别名
   * @param name - option 名称
   * @param alias - option 别名
   */
  aliasOption(name: string, alias: string) {
    const names = removeBrackets(name)
      .split(',')
      .map((v: string) => {
        let name = v.trim().replace(/^-{1,2}/, '')
        if (name.startsWith('no-')) {
          name = name.replace(/^no-/, '')
        }

        return camelcaseOptionName(name)
      })

    let option: Option | undefined
    for (const name of names) {
      option = this.getOption(name)
      if (option) break
    }

    if (option) {
      option.alias(alias)
    } else {
      logger.debug(
        `设置命令选项 ${name} 的别名 ${alias} 失败, 原因: 未找到选项`
      )
    }

    return this
  }

  outputHelp() {
    const { name } = this.cli
    const commands: Command[] = []

    // 过滤 alias 名称
    this.cli.commands.forEach(function (c, k) {
      if (!c.command.aliasNames.includes(k)) {
        commands.push(c.command)
      }
    })

    const {
      versionNumber,
      options: globalOptions,
      helpCallback
    } = this.cli.globalCommand

    let sections: HelpSection[] = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ''}`
      }
    ]

    sections.push({
      title: '用法',
      body: `  $ ${name} ${this.usageText || this.rawName}`
    })

    const showCommands =
      (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0

    if (showCommands) {
      const longestCommandName = findLongest(
        commands.map((command) => command.rawName)
      )
      sections.push({
        title: '命令',
        body: commands
          .map((command) => {
            return `  ${padRight(
              command.rawName,
              longestCommandName.length
            )}  ${command.description}`
          })
          .join('\n')
      })
      sections.push({
        title: '更多信息可通过 `--help` 选项，运行下方命令获取',
        body: commands
          .map(
            (command) =>
              `  $ ${name}${
                command.name === '' ? '' : ` ${command.name}`
              } --help`
          )
          .join('\n')
      })
    }

    let options = this.isGlobalCommand
      ? globalOptions
      : [...this.options, ...(globalOptions || [])]
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== 'version')
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(
        options.map((option) => option.rawName)
      )
      sections.push({
        title: '选项',
        body: options
          .map((option) => {
            return `  ${padRight(option.rawName, longestOptionName.length)}  ${
              option.description
            } ${
              option.config.default === undefined
                ? ''
                : `(默认: ${option.config.default})`
            }`
          })
          .join('\n')
      })
    }

    if (this.examples.length > 0) {
      sections.push({
        title: '举例',
        body: this.examples
          .map((example) => {
            if (typeof example === 'function') {
              return example(name)
            }
            return example
          })
          .join('\n')
      })
    }

    if (helpCallback) {
      sections = helpCallback(sections) || sections
    }

    console.log(
      sections
        .map((section) => {
          return section.title
            ? `${section.title}:\n${section.body}`
            : section.body
        })
        .join('\n\n')
    )
  }

  outputVersion() {
    const { name } = this.cli
    const { versionNumber } = this.cli.globalCommand
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`)
    }
  }

  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length

    if (this.cli.args.length < minimalArgsCount) {
      throw new CliError(`缺少必填的命令参数 \`${this.rawName}\``)
    }
  }

  /**
   * Check if the parsed options contain any unknown options
   *
   * Exit and output error when true
   */
  checkUnknownOptions() {
    const { options, globalCommand } = this.cli

    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (
          name !== '--' &&
          !this.hasOption(name) &&
          !globalCommand.hasOption(name)
        ) {
          throw new CliError(
            `未知的命令行选项 \`${name.length > 1 ? `--${name}` : `-${name}`}\``
          )
        }
      }
    }
  }

  /**
   * Check if the required string-type options exist
   */
  checkOptionValue() {
    const { options: parsedOptions, globalCommand } = this.cli
    const options = [...globalCommand.options, ...this.options]
    for (const option of options) {
      const value = parsedOptions[option.name.split('.')[0]]
      // Check required option value
      if (option.required) {
        const hasNegated = options.some(
          (o) => o.negated && o.names.includes(option.name)
        )
        if (value === true || (value === false && !hasNegated)) {
          throw new CliError(`缺少选项 \`${option.rawName}\` 的值`)
        }
      }
    }
  }
}

class GlobalCommand extends Command {
  constructor(cli: Cli) {
    super('@@global@@', '', {}, cli)
  }
}

export type { HelpCallback, CommandExample, CommandConfig }
export { GlobalCommand }

export default Command
