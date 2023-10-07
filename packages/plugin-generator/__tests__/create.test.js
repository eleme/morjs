'use strict'

const create = require('../create')
const { execa, logger } = require('@morjs/utils')
const path = require('path')

jest.mock('@morjs/utils', () => ({
  execa: {
    command: jest.fn()
  },
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    success: jest.fn()
  }
}))

describe('@morjs/plugin-generator - create.test.js', () => {
  describe('create', () => {
    const runner = {
      getCwd: jest.fn(),
      logger,
      generator: {
        run: jest.fn()
      },
      methods: {
        has: jest.fn(),
        invoke: jest.fn()
      }
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('should create a project with default options', async () => {
      const command = {}
      const expectedOptions = {
        from: path.resolve(
          __dirname,
          '../templates/projects/miniprogram-wechat-ts-sass'
        ),
        to: '.',
        baseDir: expect.any(String),
        questions: [],
        prompted: expect.any(Function),
        written: expect.any(Function)
      }

      runner.generator.run.mockResolvedValue()

      await create(command, runner)

      expect(runner.generator.run).toHaveBeenCalledTimes(1)
      expect(runner.generator.run).toHaveBeenCalledWith(expectedOptions)
    })

    test('should create a project with specified template', async () => {
      const command = {
        options: {
          template: 'custom-template'
        }
      }
      const expectedOptions = {
        from: 'custom-template',
        to: '.',
        baseDir: expect.any(String),
        questions: [],
        prompted: expect.any(Function),
        written: expect.any(Function)
      }

      runner.generator.run.mockResolvedValue()

      await create(command, runner)

      expect(runner.generator.run).toHaveBeenCalledTimes(1)
      expect(runner.generator.run).toHaveBeenCalledWith(expectedOptions)
    })

    test('should call fetchCustomGeneratorOptions if the method exists', async () => {
      const command = {}
      const expectedOptions = {
        from: path.resolve(
          __dirname,
          '../templates/projects/miniprogram-wechat-ts-sass'
        ),
        to: '.',
        baseDir: expect.any(String),
        questions: [],
        prompted: expect.any(Function),
        written: expect.any(Function)
      }

      runner.generator.run.mockResolvedValue()

      runner.methods.has.mockReturnValueOnce(true)
      runner.methods.invoke.mockResolvedValueOnce({
        from: 'custom-template',
        customOption: 'value'
      })

      await create(command, runner)

      expect(runner.methods.has).toHaveBeenCalledTimes(1)
      expect(runner.methods.has).toHaveBeenCalledWith(
        'fetchCustomGeneratorOptions'
      )

      expect(runner.methods.invoke).toHaveBeenCalledTimes(1)
      expect(runner.methods.invoke).toHaveBeenCalledWith(
        'fetchCustomGeneratorOptions',
        expectedOptions,
        undefined,
        undefined
      )

      expect(runner.generator.run).toHaveBeenCalledTimes(1)
      expect(runner.generator.run).toHaveBeenCalledWith({
        ...expectedOptions,
        from: 'custom-template',
        customOption: 'value'
      })
    })

    test('should not call fetchCustomGeneratorOptions if the method does not exist', async () => {
      const command = {}
      const expectedOptions = {
        from: path.resolve(
          __dirname,
          '../templates/projects/miniprogram-wechat-ts-sass'
        ),
        to: '.',
        baseDir: expect.any(String),
        questions: [],
        prompted: expect.any(Function),
        written: expect.any(Function)
      }

      runner.generator.run.mockResolvedValue()

      runner.methods.has.mockReturnValueOnce(false)

      await create(command, runner)

      expect(runner.methods.has).toHaveBeenCalledTimes(1)
      expect(runner.methods.has).toHaveBeenCalledWith(
        'fetchCustomGeneratorOptions'
      )

      expect(runner.methods.invoke).not.toHaveBeenCalled()

      expect(runner.generator.run).toHaveBeenCalledTimes(1)
      expect(runner.generator.run).toHaveBeenCalledWith(expectedOptions)
    })

    test('should install npm dependencies after project creation', async () => {
      const command = {
        options: {
          npmClient: 'yarn'
        }
      }

      runner.generator.run.mockResolvedValue()
      execa.command.mockResolvedValue()

      await create(command, runner)

      expect(execa.command).toHaveBeenCalledTimes(1)
      expect(execa.command).toHaveBeenCalledWith('yarn add', {
        cwd: expect.any(String),
        stdio: 'inherit'
      })

      expect(logger.info).toHaveBeenCalledTimes(2)
      expect(logger.info).toHaveBeenNthCalledWith(
        1,
        '自动安装 node_modules 中...'
      )
      expect(logger.info).toHaveBeenNthCalledWith(2, '安装 node_modules 完成 !')
    })
  })
})
