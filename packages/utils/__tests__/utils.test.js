'use strict'

const {
  validKeysMessage,
  hexToRgb,
  isLightColor,
  setNPMBinPATH,
  generateQrcodeForTerminal,
  expandExtsWithConditionalExt,
  makeImportClause,
  isCommonJsModule,
  getRelativePath,
  resolveDependency
} = require('..')

describe('@morjs/utils - utils.test.js', () => {
  describe('validKeysMessage', () => {
    it('should return correct message when keys is an array', () => {
      const keys = ['值1', '值2']
      const result = validKeysMessage(keys)
      expect(result).toBe('可选值为 值1, 值2')
    })

    it('should return correct message when keys is an object', () => {
      const keys = { key1: '值1', key2: '值2' }
      const result = validKeysMessage(keys)
      expect(result).toBe('可选值为 key1, key2')
    })

    it('should return correct message when keys is a string array', () => {
      const keys = ['值1', '值2']
      const result = validKeysMessage(keys)
      expect(result).toBe('可选值为 值1, 值2')
    })
  })

  describe('hexToRgb', () => {
    it('should convert hex color to rgb', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should return null for invalid hex color', () => {
      expect(hexToRgb('#zz0000')).toBeNull()
    })
  })

  describe('isLightColor', () => {
    it('should return true for light color', () => {
      expect(isLightColor(255, 255, 255)).toBe(true)
      expect(isLightColor(200, 200, 200)).toBe(true)
    })

    it('should return false for dark color', () => {
      expect(isLightColor(0, 0, 0)).toBe(false)
      expect(isLightColor(50, 50, 50)).toBe(false)
    })
  })

  describe('setNPMBinPATH', () => {
    it('should return the same env when projectPath is an empty string', () => {
      const env = { PATH: '/usr/local/bin:/usr/bin:/bin' }
      expect(setNPMBinPATH('', env)).toEqual(env)
    })

    it('should return the same env when path variable is not present in env', () => {
      const env = { SOME_VAR: 'some value' }
      expect(setNPMBinPATH('/path/to/project', env)).toEqual(env)
    })
  })

  describe('generateQrcodeForTerminal', () => {
    it('should return a promise that resolves with the qrcode string', async () => {
      const input = 'https://example.com'
      const result = await generateQrcodeForTerminal(input)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('expandExtsWithConditionalExt', () => {
    it('should return an array with only exts when conditionalExts is not provided', () => {
      const exts = ['.js', '.ts']
      const result = expandExtsWithConditionalExt(exts)
      expect(result).toEqual(exts)
    })
  })

  describe('makeImportClause', () => {
    it('should return correct import clause when importName is not provided', () => {
      const moduleKind = 'commonjs'
      const importPath = './module'
      const expected = `require('./module');\n`
      const result = makeImportClause(moduleKind, importPath)
      expect(result).toEqual(expected)
    })

    it('should return correct import clause when importName is provided but importAs is not provided', () => {
      const moduleKind = 'commonjs'
      const importPath = './module'
      const importName = 'moduleName'
      const expected = `var moduleName = require('./module');\n`
      const result = makeImportClause(moduleKind, importPath, importName)
      expect(result).toEqual(expected)
    })

    it('should return correct import clause when importName and importAs are provided', () => {
      const moduleKind = 'commonjs'
      const importPath = './module'
      const importName = 'moduleName'
      const importAs = 'alias'
      const expected = `var alias = require('./module').moduleName;\n`
      const result = makeImportClause(
        moduleKind,
        importPath,
        importName,
        importAs
      )
      expect(result).toEqual(expected)
    })
  })

  describe('isCommonJsModule', () => {
    it('should return true for CommonJS module', async () => {
      const fileContent = 'const fs = require("fs");'
      const moduleKind = 'CommonJS'
      const result = await isCommonJsModule(fileContent, moduleKind)
      expect(result).toBe(true)
    })

    it('should return false for ES module', async () => {
      const fileContent = 'import fs from "fs";'
      const moduleKind = 'ESM'
      const result = await isCommonJsModule(fileContent, moduleKind)
      expect(result).toBe(false)
    })

    it('should recheck when matched and file size is less than 500k', async () => {
      const fileContent = 'const fs = require("fs");'
      const moduleKind = 'CommonJS'
      const filePath = 'path/to/file.js'
      const result = await isCommonJsModule(
        fileContent,
        moduleKind,
        true,
        filePath
      )
      expect(result).toBe(true)
    })

    it('should recheck and return false when matched and recheck fails', async () => {
      const fileContent = 'import fs from "fs";'
      const moduleKind = 'ESM'
      const filePath = 'path/to/file.js'
      const result = await isCommonJsModule(
        fileContent,
        moduleKind,
        true,
        filePath
      )
      expect(result).toBe(false)
    })
  })

  describe('getRelativePath', () => {
    it('should return relative path with POSIX format by default', () => {
      const from = '/path/to/from'
      const to = '/path/to/file.js'
      const result = getRelativePath(from, to)
      expect(result).toBe('./file.js')
    })

    it('should return relative path with correct prefix for nested directories', () => {
      const from = '/path/to/from'
      const to = '/path/to/nested/file.js'
      const result = getRelativePath(from, to)
      expect(result).toBe('./nested/file.js')
    })
  })

  describe('resolveDependency', () => {
    it('should throw an error if the dependency is not found', () => {
      const depName = 'nonexistent-package'
      expect(() => {
        resolveDependency(depName)
      }).toThrow()
    })
  })
})
