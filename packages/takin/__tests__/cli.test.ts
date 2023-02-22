import { Cli, Runner } from '../src'

describe('__tests__/cli.test.ts', () => {
  describe('Cli', () => {
    let runner: Runner
    let commandActions: any[] = []
    let addCommandActionFn: ReturnType<typeof jest.fn>
    let invokeCommandActionFn: ReturnType<typeof jest.fn>

    beforeEach(() => {
      commandActions = []
      addCommandActionFn = jest.fn((arg) => {
        return commandActions.push(arg)
      })
      invokeCommandActionFn = jest.fn()
      runner = {
        addCommandAction: addCommandActionFn,
        invokeCommandAction: invokeCommandActionFn
      } as unknown as Runner
    })

    it('instance', () => {
      const cli = new Cli('unitTest', runner)

      expect(cli).toBeInstanceOf(Cli)
      expect(cli.name).toEqual('unitTest')
    })

    describe('parseByCommand', () => {
      it('unmatched command', () => {
        const cli = new Cli('unitTest', runner)
        const fn = jest.fn()

        // 没有matched的command
        cli.on('command:*', fn)

        const parsedArgv = cli.parseByCommand({
          name: 'compile',
          args: ['./takin.config.js'],
          options: {
            verbose: true
          }
        })

        expect(cli.args).toEqual(['./takin.config.js'])
        expect(cli.options).toEqual({
          verbose: true
        })
        expect(parsedArgv).toEqual({
          args: ['./takin.config.js'],
          options: {
            verbose: true
          }
        })

        expect(fn).toHaveBeenCalled()
        expect(fn.mock.calls[0]).toEqual([])
      })

      it('help & version', () => {
        const cli = new Cli('unitTest', runner)

        const outputHelp = jest.fn()
        const outputVersion = jest.fn()

        cli.showHelpOnExit = true
        cli.showVersionOnExit = true
        cli.outputHelp = outputHelp
        cli.outputVersion = outputVersion
        cli.parseByCommand({
          name: 'compile',
          args: ['./takin.config.js'],
          options: {
            help: true,
            version: '1.0'
          }
        })

        expect(cli.matchedCommand).toEqual(undefined)
        expect(cli.matchedCommandName).toEqual(undefined)
        expect(outputHelp).toHaveBeenCalled()
        expect(outputVersion).toHaveBeenCalled()
      })

      it('matched command', () => {
        const cli = new Cli('unitTest', runner)
        const compileFn = jest.fn()
        const unmatchedFn = jest.fn()

        const compileCommand = cli.command('compile', '编译', {
          allowUnknownOptions: true
        })

        cli.on('command:compile', compileFn)
        cli.on('command:*', unmatchedFn)

        const parsedArgv = cli.parseByCommand({
          name: 'compile',
          args: ['./takin.config.js'],
          options: {
            verbose: true
          }
        })

        expect(compileFn).toHaveBeenCalled()
        expect(compileFn.mock.calls[0]).toEqual([compileCommand])
        expect(unmatchedFn).not.toHaveBeenCalled()
        expect(cli.matchedCommandName).toEqual('compile')
        expect(cli.matchedCommand).toEqual(compileCommand)
        expect(parsedArgv).toEqual({
          args: ['./takin.config.js'],
          options: {
            verbose: true
          }
        })
      })

      it('illegal command', () => {
        const cli = new Cli('unitTest', runner)

        const illegalCommand = cli.command('', '')

        const illegalFn = jest.fn()

        cli.on('command:!', illegalFn)

        const parsedArgv = cli.parseByCommand({
          name: 'compile',
          args: ['./takin.config.js'],
          options: {
            verbose: true
          }
        })

        expect(parsedArgv).toEqual({
          args: ['./takin.config.js'],
          options: {
            verbose: true
          }
        })
        expect(illegalFn).toHaveBeenCalled()
        expect(illegalFn.mock.calls[0]).toEqual([illegalCommand])
        expect(cli.matchedCommandName).toEqual(undefined)
        expect(cli.matchedCommand).toEqual(illegalCommand)
      })
    })

    describe('prepareMatchedCommandAndArgs', () => {
      it('unmatched command', () => {
        const cli = new Cli('unitTest', runner)

        cli.parseByCommand({
          name: 'compile',
          args: ['./takin.config.js'],
          options: {
            verbose: true
          }
        })

        const command = cli.prepareMatchedCommandAndArgs()

        expect(command).toEqual({
          name: undefined,
          args: ['./takin.config.js'],
          options: {
            verbose: true
          }
        })
      })

      it('matched command', () => {
        const cli = new Cli('unitTest', runner)
        const compileCommand = cli.command(
          'compile <configFile> --verbose [verbose]',
          '编译',
          {
            allowUnknownOptions: true
          }
        )

        const commandAction = jest.fn()
        const checkUnknownOptions = jest.fn()
        const checkOptionValue = jest.fn()
        const checkRequiredArgs = jest.fn()

        compileCommand.action(commandAction)
        compileCommand.checkUnknownOptions = checkUnknownOptions
        compileCommand.checkOptionValue = checkOptionValue
        compileCommand.checkRequiredArgs = checkRequiredArgs

        cli.parseByCommand({
          name: 'compile',
          args: ['./takin.config.js', 'true'],
          options: {
            verbose: true
          }
        })
        const matchedCommand = cli.prepareMatchedCommandAndArgs()

        expect(checkUnknownOptions).toHaveBeenCalled()
        expect(checkOptionValue).toHaveBeenCalled()
        expect(checkRequiredArgs).toHaveBeenCalled()
        expect(matchedCommand).toEqual({
          name: 'compile',
          args: ['./takin.config.js', 'true'],
          options: {
            verbose: true
          }
        })
      })
    })

    it('cli extends methods', () => {
      const cli = new Cli('unitTest', runner)
      const optionFn = jest.fn(cli.option)
      const helpFn = jest.fn(cli.help)
      const versionFn = jest.fn(cli.version)
      const exampleFn = jest.fn(cli.example)
      const usageFn = jest.fn(cli.usage)
      const outputHelpFn = jest.fn(cli.outputHelp)
      cli.option = optionFn
      cli.help = helpFn
      cli.version = versionFn
      cli.example = exampleFn
      cli.usage = usageFn
      cli.outputHelp = outputHelpFn

      expect(cli.option('name', 'description') === cli).toEqual(true)
      expect(optionFn).toHaveBeenCalled()
      expect(optionFn.mock.calls[0]).toEqual(['name', 'description'])

      const helpCallback = jest.fn()
      expect(cli.help(helpCallback) === cli).toEqual(true)
      expect(helpFn).toHaveBeenCalled()
      expect(helpFn.mock.calls[0]).toEqual([helpCallback])

      expect(cli.version('1.0') === cli).toEqual(true)
      expect(versionFn).toHaveBeenCalled()
      expect(versionFn.mock.calls[0]).toEqual(['1.0'])

      const exampleCallback = jest.fn()
      expect(cli.example(exampleCallback) === cli).toEqual(true)
      expect(exampleFn).toHaveBeenCalled()
      expect(exampleFn.mock.calls[0]).toEqual([exampleCallback])

      expect(cli.usage('test') === cli).toEqual(true)
      expect(usageFn).toHaveBeenCalled()
      expect(usageFn.mock.calls[0]).toEqual(['test'])

      expect(cli.outputHelp()).toEqual(undefined)
      expect(outputHelpFn).toHaveBeenCalled()
      expect(outputHelpFn.mock.calls[0]).toEqual([])
    })

    it('command', async () => {
      const cli = new Cli('unitTest', runner)

      cli.pluginName = 'unitTest'

      const compileCommand = cli.command(
        'compile <configFile> --verbose [verbose]',
        '编译',
        {
          allowUnknownOptions: true
        }
      )

      expect(cli.commands.get('compile')).toBeTruthy()
      expect(cli.commands.get('compile')).toEqual({
        pluginName: 'unitTest',
        command: compileCommand
      })
      expect(cli.commands.size).toEqual(1)

      const commandActionCallback = jest.fn()
      expect(compileCommand.action(commandActionCallback)).toEqual(
        compileCommand
      )
      expect(addCommandActionFn).toHaveBeenCalled()
      expect(addCommandActionFn.mock.calls[0]).toEqual([
        {
          name: 'compile',
          pluginName: 'unitTest',
          callback: commandActionCallback
        }
      ])
      expect(commandActions.length).toEqual(1)

      const compileCommand2 = cli.command(
        'compile <configFile> --verbose [verbose]',
        '编译',
        {
          allowUnknownOptions: true
        }
      )
      expect(compileCommand2).toEqual(compileCommand)
      expect(cli.commands.size).toEqual(1)

      expect(compileCommand.alias('compiler')).toEqual(compileCommand)
      expect(cli.commands.get('compiler')).toBeTruthy()
      expect(cli.commands.get('compiler')!.command).toEqual(compileCommand)
      expect(compileCommand.aliasNames.length).toEqual(1)
      expect(compileCommand.aliasNames[0]).toEqual('compiler')
      expect(() => compileCommand.alias('compile')).toThrowError()

      expect(compileCommand.commandAction).toBeTruthy()
      await compileCommand.commandAction!('x', 'y')
      expect(invokeCommandActionFn).toHaveBeenCalled()
    })
  })
})
