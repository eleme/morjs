'use strict'

const { EntryBuilder, Runner, webpack } = require('@morjs/utils')
const utils = require('@morjs/utils')
const { compileIndependentSubpackages } = require('../compile')

describe('@morjs/plugin-compiler - compile.test.js', () => {
  jest.mock('@morjs/utils', () => ({
    EntryBuilder: jest.fn(),
    Runner: jest.fn(),
    webpack: jest.fn(),
    fsExtra: jest.fn(),
    logger: jest.fn(),
    mor: jest.fn()
  }))

  jest.mock('path', () => ({
    join: jest.fn()
  }))

  const mockedUtils = utils

  describe('compileIndependentSubpackages', () => {
    let entryBuilder
    let runner
    let compiler

    beforeEach(() => {
      entryBuilder = new mockedUtils.EntryBuilder()
      runner = new mockedUtils.Runner()
      compiler = new mockedUtils.webpack.Compiler()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it("should not compile independent subpackages if compileMode is not 'bundle' or target is 'web'", () => {
      // Arrange
      runner.userConfig = { compileMode: 'dev', target: 'web' }

      // Act
      compileIndependentSubpackages(entryBuilder, runner, compiler)

      // Assert
      expect(entryBuilder.independentSubpackages).not.toBeCalled()
      expect(runner.hooks.beforeBuildEntries.tapPromise).not.toBeCalled()
      expect(compiler.hooks.emit.tap).not.toBeCalled()
    })

    it("should compile independent subpackages when compileMode is 'bundle' and target is not 'web'", () => {
      // Arrange
      runner.userConfig = { compileMode: 'bundle', target: 'ios' }

      // Act
      compileIndependentSubpackages(entryBuilder, runner, compiler)

      // Assert
      expect(runner.hooks.beforeBuildEntries.tapPromise).toBeCalled()
      expect(compiler.hooks.emit.tap).toBeCalled()
    })
  })
})
