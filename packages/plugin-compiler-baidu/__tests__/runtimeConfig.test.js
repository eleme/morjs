'use strict'

const { getRuntimeFiles } = require('../runtimeConfig')

describe('@morjs/plugin-compiler-baidu - runtimeConfig.test.js', () => {
  jest.mock('module', () => ({
    require: {
      resolve: jest.fn((path) => `resolved/`)
    }
  }))

  describe('getRuntimeFiles', () => {
    test('returns the correct runtime files for same source and target', () => {
      const sourceType = 'baidu'
      const target = 'baidu'

      const result = getRuntimeFiles(sourceType, target)

      expect(result.api).toBeUndefined()
      expect(result.app).toBeUndefined()
      expect(result.page).toBeUndefined()
      expect(result.component).toBeUndefined()
      expect(result.behavior).toBeUndefined()
      expect(result.mixin).toBeUndefined()
    })

    test('returns the correct runtime files for different source and target', () => {
      const sourceType = 'wechat'
      const target = 'baidu'

      const result = getRuntimeFiles(sourceType, target)

      expect(result.api).toBe('resolved/@morjs/runtime-mini/lib/baidu/apis.js')
      expect(result.app).toBeUndefined()
      expect(result.page).toBeUndefined()
      expect(result.component).toBeUndefined()
      expect(result.behavior).toBeUndefined()
      expect(result.mixin).toBe(
        'resolved/@morjs/runtime-mini/lib/common/behaviorOrMixin.js'
      )
    })
  })
})
