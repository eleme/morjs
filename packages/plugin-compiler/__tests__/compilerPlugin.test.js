'use strict'

const { getCompilerPluginByTarget } = require('../compilerPlugin')

describe('@morjs/plugin-compiler - compilerPlugin.test.js', () => {
  describe('getCompilerPluginByTarget', () => {
    it('should return the matching compiler plugin for the given target', () => {
      const target = 'wechat'

      const result = getCompilerPluginByTarget(target)

      expect(result).toBeDefined()
      expect(result?.target).toBe(target)
    })

    it('should return undefined if no matching compiler plugin is found', () => {
      const target = 'unknown'

      const result = getCompilerPluginByTarget(target)

      expect(result).toBeUndefined()
    })
  })
})
