import { EventEmitter } from 'events'
import mri from 'mri'
import type { Runner } from '../runner'
import Command, {
  CommandActionCallback,
  CommandConfig,
  CommandExample,
  CommandOptions,
  GlobalCommand,
  HelpCallback
} from './command'
import { processArgs } from './node'
import { OptionConfig } from './option'
import {
  camelcaseOptionName,
  getFileName,
  getMriOptions,
  removeBrackets,
  setByType,
  setDotProp
} from './utils'

interface ParsedArgv {
  args: ReadonlyArray<string>
  options: {
    [k: string]: any
  }
}

export { Command, CommandOptions, CommandActionCallback }

type CommandName = string
export type PluginProvidedCommand = {
  pluginName: string
  command: Command
}

export class Cli extends EventEmitter {
  /** The program name to display in help and version message */
  name: string
  pluginName: string = ''
  readonly runner: Runner
  commands: Map<CommandName, PluginProvidedCommand>
  globalCommand: GlobalCommand
  matchedCommand?: Command
  matchedCommandName?: string
  /**
   * Raw CLI arguments
   */
  rawArgs: string[]
  /**
   * Parsed CLI arguments
   */
  args: ParsedArgv['args']
  /**
   * Parsed CLI options, camelCased
   */
  options: ParsedArgv['options']

  showHelpOnExit?: boolean
  showVersionOnExit?: boolean

  /**
   * @param name The program name to display in help and version message
   */
  constructor(name = '', runner: Runner) {
    super()
    this.name = name
    this.runner = runner
    this.commands = new Map()
    this.rawArgs = []
    this.args = []
    this.options = {}
    this.globalCommand = new GlobalCommand(this)
    this.globalCommand.usage('<command> [options]')
  }

  /**
   * Add a global usage text.
   *
   * This is not used by sub-commands.
   */
  usage(text: string) {
    this.globalCommand.usage(text)
    return this
  }

  /**
   * 添加子命令
   */
  command(
    rawName: string,
    description?: string,
    config?: CommandConfig
  ): Command {
    const name = removeBrackets(rawName)

    if (this.commands.has(name)) {
      return this.commands.get(name)?.command as Command
    }

    const command = new Command(rawName, description || '', config || {}, this)

    const pluginName = this.pluginName

    command.globalCommand = this.globalCommand
    this.commands.set(command.name, { pluginName, command })
    return command
  }

  /**
   * Add a global CLI option.
   *
   * Which is also applied to sub-commands.
   */
  option(rawName: string, description: string, config?: OptionConfig) {
    this.globalCommand.option(rawName, description, config)
    return this
  }

  /**
   * Show help message when `-h, --help` flags appear.
   *
   */
  help(callback?: HelpCallback) {
    this.globalCommand.option('-h, --help', '显示帮助信息')
    this.globalCommand.helpCallback = callback
    this.showHelpOnExit = true
    return this
  }

  /**
   * Show version number when `-v, --version` flags appear.
   *
   */
  version(version: string, customFlags = '-v, --version') {
    this.globalCommand.version(version, customFlags)
    this.showVersionOnExit = true
    return this
  }

  /**
   * Add a global example.
   *
   * This example added here will not be used by sub-commands.
   */
  example(example: CommandExample) {
    this.globalCommand.example(example)
    return this
  }

  /**
   * Output the corresponding help message
   * When a sub-command is matched, output the help message for the command
   * Otherwise output the global one.
   *
   */
  outputHelp() {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp()
    } else {
      this.globalCommand.outputHelp()
    }
  }

  /**
   * Output the version number.
   *
   */
  outputVersion() {
    this.globalCommand.outputVersion()
  }

  private setParsedInfo(
    { args, options }: ParsedArgv,
    matchedCommand?: Command,
    matchedCommandName?: string
  ) {
    this.args = args
    this.options = options
    if (matchedCommand) {
      this.matchedCommand = matchedCommand
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName
    }
    return this
  }

  /**
   * 自定义 setParsedInfo
   * @param param0 - ParsedArgv 已解析的 argv
   * @param matchedCommand - 匹配的 命令实例
   * @param matchedCommandName - 匹配的命令名称
   */
  private setParsedInfo2(
    { args, options }: ParsedArgv,
    matchedCommand?: Command,
    matchedCommandName?: string
  ): void {
    this.args = args
    this.options = options
    if (matchedCommand) {
      this.matchedCommand = matchedCommand
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName
    }
  }

  unsetMatchedCommand() {
    this.matchedCommand = undefined
    this.matchedCommandName = undefined
  }

  /**
   * Parse argv
   */
  parse(
    argv = processArgs,
    {
      /** Whether to run the action for matched command */
      run = true
    } = {}
  ): ParsedArgv {
    this.rawArgs = argv
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : 'cli'
    }

    let shouldParse = true

    // Search sub-commands
    for (const [, { command }] of this.commands) {
      const parsed = this.mri(argv.slice(2), command)

      const commandName = parsed.args[0]
      if (command.isMatched(commandName)) {
        shouldParse = false
        const parsedInfo = {
          ...parsed,
          args: parsed.args.slice(1)
        }
        this.setParsedInfo(parsedInfo, command, commandName)
        this.emit(`command:${commandName}`, command)
      }
    }

    if (shouldParse) {
      // Search the default command
      for (const [, { command }] of this.commands) {
        if (command.name === '') {
          shouldParse = false
          const parsed = this.mri(argv.slice(2), command)
          this.setParsedInfo(parsed, command)
          this.emit(`command:!`, command)
        }
      }
    }

    if (shouldParse) {
      const parsed = this.mri(argv.slice(2))
      this.setParsedInfo(parsed)
    }

    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp()
      run = false
      this.unsetMatchedCommand()
    }

    if (
      this.options.version &&
      this.showVersionOnExit &&
      this.matchedCommandName == null
    ) {
      this.outputVersion()
      run = false
      this.unsetMatchedCommand()
    }

    const parsedArgv = { args: this.args, options: this.options }

    if (run) {
      this.runMatchedCommand()
    }

    if (!this.matchedCommand && this.args[0]) {
      this.emit('command:*')
    }

    return parsedArgv
  }

  // 直接解析指定的命令
  parseByCommand(command: CommandOptions): ParsedArgv {
    let shouldParse = true
    const { name: commandName = '', args = [], options = {} } = command

    const parsedInfo: ParsedArgv = { args, options }

    for (const [, { command }] of this.commands) {
      if (command.isMatched(commandName)) {
        shouldParse = false
        this.setParsedInfo2(parsedInfo, command, commandName)
        this.emit(`command:${commandName}`, command)
      }
    }

    if (shouldParse) {
      for (const [, { command }] of this.commands) {
        if (command.name === '') {
          shouldParse = false

          this.setParsedInfo2(parsedInfo, command)
          this.emit(`command:!`, command)
        }
      }
    }
    if (shouldParse) {
      this.setParsedInfo2(parsedInfo)
    }
    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp()
      this.unsetMatchedCommand()
    }
    if (this.options.version && this.showVersionOnExit) {
      this.outputVersion()
      this.unsetMatchedCommand()
    }
    const parsedArgv = { args: this.args, options: this.options }
    if (!this.matchedCommand && this.args[0]) {
      this.emit('command:*')
    }
    return parsedArgv
  }

  /**
   * 准备匹配的命令选项
   * @returns 匹配的命令选项
   */
  prepareMatchedCommandAndArgs(): void | CommandOptions {
    const { args, options = {}, matchedCommand: command } = this
    // 如果没有命中的 command
    // 则仅返回 args 和 options
    if (!command || !command.commandAction) {
      return { name: undefined, args, options }
    }

    command.checkUnknownOptions()
    command.checkOptionValue()
    command.checkRequiredArgs()

    const actionArgs: any[] = []
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index))
      } else {
        actionArgs.push(args[index])
      }
    })

    return { name: command?.name, args: actionArgs, options }
  }

  private mri(
    argv: string[],
    /** Matched command */ command?: Command
  ): ParsedArgv {
    // All added options
    const cliOptions = [
      ...this.globalCommand.options,
      ...(command ? command.options : [])
    ]
    const mriOptions = getMriOptions(cliOptions)

    // Extract everything after `--` since mri doesn't support it
    let argsAfterDoubleDashes: string[] = []
    const doubleDashesIndex = argv.indexOf('--')
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1)
      argv = argv.slice(0, doubleDashesIndex)
    }

    let parsed = mri(argv, mriOptions)
    parsed = Object.keys(parsed).reduce(
      (res, name) => {
        return {
          ...res,
          [camelcaseOptionName(name)]: parsed[name]
        }
      },
      { _: [] }
    )

    const args = parsed._

    const options: { [k: string]: any } = {
      '--': argsAfterDoubleDashes
    }

    // Set option default value
    const ignoreDefault =
      command && command.config.ignoreOptionDefaultValue
        ? command.config.ignoreOptionDefaultValue
        : this.globalCommand.config.ignoreOptionDefaultValue

    const transforms = Object.create(null)

    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== undefined) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default
        }
      }

      // If options type is defined
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === undefined) {
          transforms[cliOption.name] = Object.create(null)

          transforms[cliOption.name]['shouldTransform'] = true
          transforms[cliOption.name]['transformFunction'] =
            cliOption.config.type[0]
        }
      }
    }

    // Set option values (support dot-nested property name)
    for (const key of Object.keys(parsed)) {
      if (key !== '_') {
        const keys = key.split('.')
        setDotProp(options, keys, parsed[key])
        setByType(options, transforms)
      }
    }

    return {
      args,
      options
    }
  }

  runMatchedCommand() {
    const { args, options, matchedCommand: command } = this

    if (!command || !command.commandAction) return

    command.checkUnknownOptions()

    command.checkOptionValue()

    command.checkRequiredArgs()

    const actionArgs: any[] = []
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index))
      } else {
        actionArgs.push(args[index])
      }
    })
    actionArgs.push(options)
    return command.commandAction.apply(this, actionArgs)
  }
}
