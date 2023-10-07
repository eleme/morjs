'use strict'

const {
  CommandOptions,
  logger,
  mor,
  objectEnum,
  Plugin,
  Runner,
  validKeysMessage
} = require('@morjs/utils')
const MorAnalyzerPlugin = require('..')

describe('@morjs/plugin-analyzer - index.test.js', () => {
  jest.mock('@morjs/utils', () => ({
    CommandOptions: jest.fn(),
    logger: {
      error: jest.fn()
    },
    mor: {
      run: jest.fn()
    },
    objectEnum: jest.fn(),
    Plugin: jest.fn(),
    Runner: jest.fn(),
    validKeysMessage: jest.fn()
  }))

  describe('MorAnalyzerPlugin', () => {
    let runner
    let plugin

    beforeEach(() => {
      runner = new Runner()
      plugin = new MorAnalyzerPlugin()
    })

    describe('apply', () => {
      it('should register cli and tap into shouldValidateUserConfig', () => {
        runner.commandName = 'analyze'

        const hooksTapMock = jest.fn()
        runner.hooks = {
          shouldValidateUserConfig: {
            tap: hooksTapMock
          },
          cli: {
            tap: jest.fn((name, callback) => callback(runner))
          }
        }

        plugin.apply(runner)
        expect(hooksTapMock).toHaveBeenCalled()
        expect(runner.hooks.cli.tap).toHaveBeenCalled()
      })
    })

    describe('registerCli', () => {
      it('should register command options', () => {
        const options = {
          analyzerMode: {
            name: '依赖分析模式',
            cliOption: '--mode <analyzerMode>',
            valuesDesc: 'validKeysMessage(AnalyzerModes)'
          },
          analyzerHost: {
            name: '依赖分析 HTTP 服务域名',
            cliOption: '--host <analyzerHost>',
            desc: '仅在 mode 为 server 时生效'
          }
        }
        const optionsKeys = Object.keys(options)

        runner.hooks = {
          cli: {
            tap: jest.fn((name, callback) => {
              const cliMock = {
                command: jest.fn(() => ({
                  option: jest.fn(),
                  action: jest.fn()
                }))
              }
              callback(cliMock)
              expect(cliMock.command).toHaveBeenCalledWith(
                'analyze',
                '分析小程序相关 bundle 信息'
              )

              optionsKeys.forEach((option) => {
                const optionSchema = options[option]
                expect(cliMock.command().option).toHaveBeenCalledWith(
                  optionSchema.cliOption,
                  expect.any(String),
                  expect.any(Object)
                )
              })
            })
          }
        }

        plugin.registerCli()
        expect(runner.hooks.cli.tap).toHaveBeenCalled()
      })
    })

    describe('runAnalyze', () => {
      beforeEach(() => {
        runner.config = {
          userConfig: []
        }
      })

      it('should log error if userConfig has more than 1 and name is not specified', async () => {
        runner.commandName = 'analyze'
        const commandOptions = {
          options: {
            name: null
          }
        }

        await plugin.runAnalyze(commandOptions)
        expect(logger.error).toHaveBeenCalledWith(
          '请指定配置名称 --name configName'
        )
      })

      it('should call mor.run with correct options and userConfig', async () => {
        runner.commandName = 'analyze'
        const commandOptions = {
          options: {
            name: 'configName',
            open: true,
            analyzerMode: 'server',
            analyzerHost: 'localhost',
            analyzerPort: 8080,
            reportFilename: 'report.html',
            reportTitle: 'Bundle Report',
            defaultSizes: 'stat',
            generateStatsFile: true,
            statsFilename: 'stats.json',
            logLevel: 'info'
          }
        }

        plugin.runner = runner
        await plugin.runAnalyze(commandOptions)

        expect(mor.run).toHaveBeenCalledWith(
          {
            name: 'compile',
            options: {
              analyze: {
                openAnalyzer: true,
                analyzerMode: 'server',
                analyzerHost: 'localhost',
                analyzerPort: 8080,
                reportFilename: 'report.html',
                reportTitle: 'Bundle Report',
                defaultSizes: 'stat',
                generateStatsFile: true,
                statsFilename: 'stats.json',
                logLevel: 'info'
              },
              analyze: true,
              compileMode: 'bundle'
            }
          },
          [{}]
        )
      })
    })
  })
})
