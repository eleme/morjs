'use strict'

const {
  tsTransformerFactory,
  cssProcessorFactory,
  registerHook,
  isHookRegistered,
  ComposeModuleStates,
  typescript: ts,
  tapable: t
} = require('..')

describe('@morjs/utils - hooks.test.js', () => {
  describe('your-code-file', () => {
    describe('tsTransformerFactory', () => {
      it('should return undefined if visitor is not provided', () => {
        const transformerFactory = tsTransformerFactory(undefined)
        expect(transformerFactory).toBeUndefined()
      })

      it('should call visitor for each node', () => {
        const visitor = jest.fn()
        const transformerFactory = tsTransformerFactory(visitor)
        const ctx = {}
        const sourceFile = {}
        const visitNodeSpy = jest
          .spyOn(ts, 'visitNode')
          .mockImplementation((node, visit) => {
            visit(node)
            return node
          })

        transformerFactory(ctx)(sourceFile)

        expect(visitNodeSpy).toHaveBeenCalledWith(
          sourceFile,
          expect.any(Function)
        )
        expect(visitor).toHaveBeenCalled()

        visitNodeSpy.mockRestore()
      })
    })

    describe('cssProcessorFactory', () => {
      it('should return a postcss plugin', () => {
        const name = 'test-plugin'
        const processor = jest.fn()

        const plugin = cssProcessorFactory(name, processor)

        expect(plugin).toHaveProperty('postcssPlugin', name)
        expect(typeof plugin.Once).toBe('function')
      })

      it('should call processor with root and helpers', async () => {
        const name = 'test-plugin'
        const processor = jest.fn()

        const plugin = cssProcessorFactory(name, processor)
        const root = {}
        const helpers = {}

        await plugin.Once(root, helpers)

        expect(processor).toHaveBeenCalledWith(root, helpers)
      })
    })

    describe('FileParserOptions', () => {
      it('should have correct properties', () => {
        const userConfig = {}
        const loaderContext = {}
        const fileInfo = {
          path: '/path/to/file',
          content: 'file content',
          extname: '.ts'
        }

        const options = {
          userConfig,
          loaderContext,
          fileInfo
        }

        expect(options).toHaveProperty('userConfig', userConfig)
        expect(options).toHaveProperty('loaderContext', loaderContext)
        expect(options).toHaveProperty('fileInfo', fileInfo)
      })
    })

    describe('ComposeModuleScriptCommand', () => {
      it('should have correct properties', () => {
        const command = 'npm run build'
        const env = { NODE_ENV: 'development' }
        const options = { stdio: 'inherit' }

        const scriptCommand = {
          command,
          env,
          options
        }

        expect(scriptCommand).toHaveProperty('command', command)
        expect(scriptCommand).toHaveProperty('env', env)
        expect(scriptCommand).toHaveProperty('options', options)
      })
    })

    describe('ComposeModuleInfo', () => {
      it('should have correct properties', () => {
        const name = 'test-module'
        const type = 'host'
        const mode = 'compose'
        const root = '/tmp/test-module'
        const source = '/tmp/test-module-hash'
        const hash = 'hash'
        const output = {
          from: 'dist',
          include: ['**/*'],
          exclude: ['node_modules'],
          to: 'output'
        }
        const state = ComposeModuleStates.initial
        const download = {
          type: 'git',
          options: {
            url: 'https://github.com/test-module.git'
          }
        }
        const config = {
          name: 'test-module',
          version: '1.0.0'
        }
        const scripts = {
          before: ['npm install'],
          after: ['npm run build'],
          composed: 'npm run test'
        }

        const moduleInfo = {
          name,
          type,
          mode,
          root,
          source,
          hash,
          output,
          state,
          download,
          config,
          scripts
        }

        expect(moduleInfo).toHaveProperty('name', name)
        expect(moduleInfo).toHaveProperty('type', type)
        expect(moduleInfo).toHaveProperty('mode', mode)
        expect(moduleInfo).toHaveProperty('root', root)
        expect(moduleInfo).toHaveProperty('source', source)
        expect(moduleInfo).toHaveProperty('hash', hash)
        expect(moduleInfo).toHaveProperty('output', output)
        expect(moduleInfo).toHaveProperty('state', state)
        expect(moduleInfo).toHaveProperty('download', download)
        expect(moduleInfo).toHaveProperty('config', config)
        expect(moduleInfo).toHaveProperty('scripts', scripts)
      })
    })

    describe('registerHook', () => {
      it('should register custom hooks', () => {
        const hookName = 'customHook'
        const hookFactory = jest.fn()

        registerHook(hookName, hookFactory)

        expect(isHookRegistered(hookName)).toBe(true)
      })
    })
  })
})
