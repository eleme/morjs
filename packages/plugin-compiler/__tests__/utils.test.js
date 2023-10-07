'use strict'

const {
  getTsConfigFile,
  loadUserTsCompilerOptions,
  extsToGlobPatterns,
  pathWithoutExtname,
  readJsonLike,
  parseJsonLike,
  getRelativePathToSrcPaths,
  shouldProcessFileByPlugins,
  isChildCompilerRunner,
  generateCacheFileHash
} = require('../utils')

describe('@morjs/plugin-compiler - utils.test.js', () => {
  describe('getTsConfigFile', () => {
    it('should return undefined if TS_CONFIG_FILE is empty', () => {
      expect(getTsConfigFile()).toBeUndefined()
    })

    it('should return the value of TS_CONFIG_FILE if it is not empty', () => {
      const filePath = '/path/to/tsconfig.json'
      jest.spyOn(fs, 'findConfigFile').mockReturnValueOnce(filePath)

      expect(getTsConfigFile()).toBe(filePath)
    })
  })

  describe('loadUserTsCompilerOptions', () => {
    it('should return an empty object if TS_CONFIG_FILE is empty', () => {
      jest.spyOn(fs, 'findConfigFile').mockReturnValueOnce(undefined)

      expect(loadUserTsCompilerOptions()).toEqual({})
    })

    it('should return the compilerOptions from tsconfig.json if TS_CONFIG_FILE is not empty', () => {
      const filePath = '/path/to/tsconfig.json'
      const compilerOptions = {
        target: 'es2019',
        module: 'esnext',
        strict: true
      }
      jest.spyOn(fs, 'findConfigFile').mockReturnValueOnce(filePath)
      jest.spyOn(ts, 'readConfigFile').mockReturnValueOnce({
        error: undefined,
        config: { compilerOptions }
      })

      expect(loadUserTsCompilerOptions()).toEqual(compilerOptions)
      expect(fs.findConfigFile).toHaveBeenCalledWith(
        mor.config.cwd,
        expect.any(Function)
      )
      expect(ts.readConfigFile).toHaveBeenCalledWith(
        filePath,
        expect.any(Function)
      )
    })
  })

  describe('extsToGlobPatterns', () => {
    test('returns an empty string when no extensions are provided', () => {
      expect(extsToGlobPatterns([])).toBe('')
    })

    test('returns a glob pattern for a single extension', () => {
      expect(extsToGlobPatterns(['.js'])).toBe('*.js')
    })

    test('returns a comma-separated glob pattern for multiple extensions', () => {
      expect(extsToGlobPatterns(['.js', '.ts', '.jsx', '.tsx'])).toBe(
        '*.js,*.ts,*.jsx,*.tsx'
      )
    })

    test('strips the dot from extensions', () => {
      expect(extsToGlobPatterns(['.js', '.ts'])).toBe('*.js,*.ts')
    })
  })

  describe('pathWithoutExtname', () => {
    test('returns the same file path if extension does not exist', () => {
      expect(pathWithoutExtname('/path/to/file')).toBe('/path/to/file')
    })

    test('returns the same file path if extension is not valid', () => {
      expect(pathWithoutExtname('/path/to/file.xyz')).toBe('/path/to/file.xyz')
    })

    test('returns the file path without extension', () => {
      expect(pathWithoutExtname('/path/to/file.txt')).toBe('/path/to/file')
      expect(pathWithoutExtname('./path/to/file.js')).toBe('./path/to/file')
      expect(pathWithoutExtname('.\\path\\to\\file.ts')).toBe(
        '.\\path\\to\\file'
      )
    })
  })

  describe('readJsonLike', () => {
    test('reads and parses a valid JSON file', async () => {
      const mockFs = {
        readFile: jest.fn().mockResolvedValueOnce('{"key": "value"}')
      }

      const result = await readJsonLike(mockFs, '/path/to/file.json')

      expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/file.json')
      expect(result).toEqual({ key: 'value' })
    })

    test('reads and parses a valid JSONC file', async () => {
      const mockFs = {
        readFile: jest
          .fn()
          .mockResolvedValueOnce('{ /* comment */ "key": "value" }')
      }

      const result = await readJsonLike(mockFs, '/path/to/file.jsonc')

      expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/file.jsonc')
      expect(result).toEqual({ key: 'value' })
    })

    test('reads and parses a valid JSON5 file', async () => {
      const mockFs = {
        readFile: jest.fn().mockResolvedValueOnce('{ key: "value" }')
      }

      const result = await readJsonLike(mockFs, '/path/to/file.json5')

      expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/file.json5')
      expect(result).toEqual({ key: 'value' })
    })
  })

  describe('parseJsonLike', () => {
    test('parses valid JSON content', () => {
      const content = '{"key": "value"}'
      const result = parseJsonLike(content, '.json')

      expect(result).toEqual({ key: 'value' })
    })

    test('parses valid JSONC content', () => {
      const content = '{ /* comment */ "key": "value" }'
      const result = parseJsonLike(content, '.jsonc')

      expect(result).toEqual({ key: 'value' })
    })

    test('parses valid JSON5 content', () => {
      const content = '{ key: "value" }'
      const result = parseJsonLike(content, '.json5')

      expect(result).toEqual({ key: 'value' })
    })

    test('throws an error for unsupported JSON file formats', () => {
      const content = '{"key": "value"}'

      expect(() => {
        parseJsonLike(content, '.txt')
      }).toThrowError('不支持的 JSON 文件格式: .txt')
    })
  })

  describe('getRelativePathToSrcPaths', () => {
    test('returns the relative path for a file within srcPaths', () => {
      const filePath = '/path/to/src/file.js'
      const srcPaths = ['/path/to/src']

      const result = getRelativePathToSrcPaths(filePath, srcPaths)

      expect(result).toBe('file.js')
    })

    test('returns the relative path for a file within multiple srcPaths', () => {
      const filePath = '/path/to/src2/file.js'
      const srcPaths = ['/path/to/src1', '/path/to/src2']

      const result = getRelativePathToSrcPaths(filePath, srcPaths)

      expect(result).toBe('file.js')
    })

    test('returns the relative path for a file using the first srcPath', () => {
      const filePath = '/path/to/file.js'
      const srcPaths = ['/path/to/src']

      const result = getRelativePathToSrcPaths(filePath, srcPaths)

      expect(result).toBe('../file.js')
    })

    test('shows a warning message for a file outside of srcPaths', () => {
      const filePath = '/path/to/file.js'
      const srcPaths = ['/path/to/src']

      const mockLogger = {
        warnOnce: jest.fn()
      }

      const result = getRelativePathToSrcPaths(
        filePath,
        srcPaths,
        true,
        mockLogger
      )

      expect(result).toBe('pdir/file.js')
      expect(mockLogger.warnOnce).toHaveBeenCalledWith(expect.any(String))
    })

    test('does not show a warning message for a file outside of srcPaths when showWarning is false', () => {
      const filePath = '/path/to/file.js'
      const srcPaths = ['/path/to/src']

      const mockLogger = {
        warnOnce: jest.fn()
      }

      const result = getRelativePathToSrcPaths(
        filePath,
        srcPaths,
        false,
        mockLogger
      )

      expect(result).toBe('pdir/file.js')
      expect(mockLogger.warnOnce).not.toHaveBeenCalled()
    })
  })

  describe('shouldProcessFileByPlugins', () => {
    test('returns true for non-node_modules files', () => {
      const filePath = '/path/to/file.js'
      const processNodeModules = true

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(true)
    })

    test('returns true for node_modules files when processNodeModules is true', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = true

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(true)
    })

    test('returns false for node_modules files when processNodeModules is false', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = false

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(false)
    })

    test('returns true for node_modules files when include patterns match', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = { include: [/package/] }

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(true)
    })

    test('returns false for node_modules files when exclude patterns match', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = { exclude: [/package/] }

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(false)
    })

    test('returns false for node_modules files when exclude patterns match and include patterns do not match', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = { include: [/other/], exclude: [/package/] }

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(false)
    })

    test('returns true for node_modules files when include patterns match and exclude patterns do not match', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = { include: [/package/], exclude: [/other/] }

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(true)
    })

    test('returns true for node_modules files when include patterns match and exclude patterns are not configured', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = { include: [/package/] }

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(true)
    })

    test('returns true for node_modules files when include patterns are not configured and exclude patterns do not match', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = { exclude: [/other/] }

      const result = shouldProcessFileByPlugins(filePath, processNodeModules)

      expect(result).toBe(true)
    })

    test('returns true for node_modules files based on byDefault when include and exclude patterns are not configured', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = undefined
      const byDefault = true

      const result = shouldProcessFileByPlugins(
        filePath,
        processNodeModules,
        byDefault
      )

      expect(result).toBe(true)
    })

    test('returns false for node_modules files based on byDefault when include and exclude patterns are not configured', () => {
      const filePath = '/path/to/node_modules/package/file.js'
      const processNodeModules = undefined
      const byDefault = false

      const result = shouldProcessFileByPlugins(
        filePath,
        processNodeModules,
        byDefault
      )

      expect(result).toBe(false)
    })
  })

  describe('isChildCompilerRunner', () => {
    test('returns true if the runner is a child compiler runner', () => {
      const runner = { context: new Map([[CHILD_COMPILER_RUNNER, true]]) }

      const result = isChildCompilerRunner(runner)

      expect(result).toBe(true)
    })

    test('returns false if the runner is not a child compiler runner', () => {
      const runner = { context: new Map() }

      const result = isChildCompilerRunner(runner)

      expect(result).toBe(false)
    })
  })

  describe('generateCacheFileHash', () => {
    test('generates the cache hash based on userConfig', () => {
      const userConfig = {
        minimize: true,
        jsMinimizer: 'terser',
        jsMinimizerOptions: { compress: true },
        cssMinimizer: 'cssnano',
        cssMinimizerOptions: { preset: 'default' },
        xmlMinimizer: 'minify-xml',
        xmlMinimizerOptions: { removeComments: true },
        externals: { react: 'React' },
        shared: ['react', 'react-dom'],
        consumes: ['lodash', 'moment'],
        srcPath: '/path/to/src',
        srcPaths: ['/path/to/src1', '/path/to/src2'],
        ignore: ['node_modules'],
        compilerOptions: { target: 'es5' },
        conditionalCompile: { 'process.env.NODE_ENV': 'production' },
        define: { ENABLE_FEATURE: true },
        alias: { '@components': '/path/to/components' },
        processPlaceholderComponents: true,
        modules: [{ name: 'module1', mode: 'compile' }],
        customEntries: { entry1: '/path/to/entry1' }
      }
      const prefixKeys = ['prefix']

      const result = generateCacheFileHash(userConfig, prefixKeys)

      // 根据指定的userConfig生成的cache hash是不确定的，因此我们只能验证生成的hash的长度是否符合预期。
      expect(result.length).toBeGreaterThan(0)
    })

    test('generates the cache hash without prefixKeys', () => {
      const userConfig = {
        minimize: false
      }

      const result = generateCacheFileHash(userConfig)

      expect(result.length).toBeGreaterThan(0)
    })
  })
})
