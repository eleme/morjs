'use strict'

const { Runner } = require('@morjs/utils')
const { createRequire } = require('module')
const path = require('path')
const MorMockerPlugin = require('..')

jest.mock('@morjs/utils', () => ({
  CompileModuleKind: jest.fn(),
  EntryBuilderHelpers: jest.fn(),
  logger: {
    warnOnce: jest.fn(),
    error: jest.fn()
  },
  makeImportClause: jest.fn(),
  Plugin: jest.fn(),
  Runner: jest.fn(),
  slash: jest.fn(),
  WebpackWrapper: jest.fn()
}))
jest.mock('module', () => ({
  createRequire: jest.fn()
}))
jest.mock('path', () => ({
  resolve: jest.fn(),
  join: jest.fn()
}))
jest.mock('./Mocker', () => jest.fn())

describe('@morjs/plugin-mocker - index.test.js', () => {
  describe('Mocker', () => {
    let runner
    let mocker

    beforeEach(() => {
      runner = new Runner()
      mocker = new Mocker(runner, 'test')
    })

    it('should set the runner and name properties', () => {
      expect(mocker.runner).toBe(runner)
      expect(mocker.name).toBe('test')
    })

    describe('getInitMockFilePath', () => {
      it('should return the path of the init mock file', () => {
        runner.userConfig = { outputPath: 'dist' }
        const result = mocker.getInitMockFilePath()
        expect(result).toBe(path.join('dist', './mor.mock.js'))
      })
    })

    describe('ignoreMockFileChange', () => {
      it('should ignore the mock file change', () => {
        const watchOptions = { ignored: [] }
        mocker.wrapper = {
          chain: { get: jest.fn(() => watchOptions), watchOptions: jest.fn() }
        }
        const mockFilePath = path.join('dist', './mor.mock.js')

        mocker.ignoreMockFileChange()

        expect(mocker.wrapper.chain.watchOptions).toHaveBeenCalledWith({
          ...watchOptions,
          ignored: [mockFilePath]
        })
      })

      it('should not add the mock file to ignored list if it is already included', () => {
        const watchOptions = { ignored: ['dist/mor.mock.js'] }
        mocker.wrapper = {
          chain: { get: jest.fn(() => watchOptions), watchOptions: jest.fn() }
        }
        const mockFilePath = path.join('dist', './mor.mock.js')

        mocker.ignoreMockFileChange()

        expect(mocker.wrapper.chain.watchOptions).toHaveBeenCalledWith(
          watchOptions
        )
      })
    })

    describe('generateInitMockFileContent', () => {
      let userConfig
      let globalObject
      let userConfigFilePath
      let cwd
      let mockOptions
      let adapterImports
      let createRequireMock
      let resolveMock
      let mkdirpSyncMock
      let writeFileSyncMock

      beforeEach(() => {
        userConfig = {
          globalObject: 'global',
          mock: { path: './mock', adapters: [] }
        }
        globalObject = userConfig.globalObject
        userConfigFilePath = 'config.ts'
        cwd = 'project'
        mockOptions = userConfig.mock
        adapterImports = []

        runner.userConfig = userConfig
        runner.config = { userConfigFilePath, cwd }

        createRequireMock = createRequire
        createRequireMock.mockReturnValueOnce({ resolve: jest.fn() })
        resolveMock = path.resolve
        resolveMock.mockReturnValueOnce('resolved-path')
        resolveMock.mockReturnValueOnce('resolved-path-adapter')
        mkdirpSyncMock = jest.fn()
        writeFileSyncMock = jest.fn()
        mocker.wrapper = {
          fs: {
            mem: {
              mkdirpSync: mkdirpSyncMock,
              writeFileSync: writeFileSyncMock
            }
          }
        }
      })

      it('should not generate init mock file content if globalObject is not provided', () => {
        delete userConfig.globalObject
        const result = mocker.generateInitMockFileContent()
        expect(result).toBeUndefined()
      })

      it('should generate init mock file content', () => {
        const mockFilePath = path.join('dist', './mor.mock.js')
        const expectedContent = `import Mock from '';
  ${adapterImports.join(';\n')}
  var mockContext = require.context("resolved-path", true, /\.(cjs|js|json|json5|jsonc|mjs|ts)$/);
  var adapters = [];
  var mock = new Mock(mockContext, ${JSON.stringify(mockOptions)}, , adapters);
  mock.run();`

        const result = mocker.generateInitMockFileContent()

        expect(result).toBe(mockFilePath)
        expect(createRequireMock).toHaveBeenCalledWith(userConfigFilePath)
        expect(resolveMock).toHaveBeenCalledWith(cwd, mockOptions.path)
        expect(mkdirpSyncMock).toHaveBeenCalledWith(path.dirname(mockFilePath))
        expect(writeFileSyncMock).toHaveBeenCalledWith(
          mockFilePath,
          expectedContent
        )
      })

      it('should generate init mock file content with adapters', () => {
        const mockFilePath = path.join('dist', './mor.mock.js')
        userConfig.mock.adapters = [
          ['adapter-path', { option: 'value' }],
          'adapter-path-2'
        ]
        adapterImports = [
          `import adapter0 from 'resolved-path-adapter';`,
          `import adapter1 from 'resolved-path-adapter-2';`
        ]
        const expectedContent = `import Mock from '';
  ${adapterImports.join(';\n')}
  var mockContext = require.context("resolved-path", true, /\.(cjs|js|json|json5|jsonc|mjs|ts)$/);
  var adapters = [new adapter0({"option":"value"}), new adapter1()];
  var mock = new Mock(mockContext, ${JSON.stringify(mockOptions)}, , adapters);
  mock.run();`

        const result = mocker.generateInitMockFileContent()

        expect(result).toBe(mockFilePath)
        expect(createRequireMock).toHaveBeenCalledWith(userConfigFilePath)
        expect(resolveMock).toHaveBeenCalledWith(cwd, mockOptions.path)
        expect(resolveMock).toHaveBeenCalledWith(
          'resolved-path',
          'adapter-path'
        )
        expect(resolveMock).toHaveBeenCalledWith(
          'resolved-path',
          'adapter-path-2'
        )
        expect(mkdirpSyncMock).toHaveBeenCalledWith(path.dirname(mockFilePath))
        expect(writeFileSyncMock).toHaveBeenCalledWith(
          mockFilePath,
          expectedContent
        )
      })

      it('should return undefined if globalObject is not provided', () => {
        delete userConfig.globalObject
        const result = mocker.generateInitMockFileContent()
        expect(result).toBeUndefined()
      })
    })
  })

  describe('MorMockerPlugin', () => {
    let runner
    let morMockerPlugin

    beforeEach(() => {
      runner = new Runner()
      morMockerPlugin = new MorMockerPlugin()
      morMockerPlugin.apply(runner)
    })

    it('should set the name property', () => {
      expect(morMockerPlugin.name).toBe('MorMockerPlugin')
    })

    it('should create a new Mocker instance', () => {
      expect(Mocker).toHaveBeenCalledTimes(1)
      expect(Mocker.mock.instances[0].constructor).toHaveBeenCalledWith(
        runner,
        'MorMockerPlugin'
      )
    })
  })
})
