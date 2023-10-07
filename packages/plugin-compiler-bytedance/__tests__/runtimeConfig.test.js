'use strict'

const { getRuntimeFiles } = require('../runtimeConfig')
const { target: WechatTarget } = require('../@morjs/plugin-compiler-wechat')

describe('@morjs/plugin-compiler-bytedance - runtimeConfig.test.js', () => {
  describe('getRuntimeFiles', () => {
    test('returns the correct runtime files for same source and target', () => {
      const sourceType = 'bytedance'
      const target = 'bytedance'

      const result = getRuntimeFiles(sourceType, target)

      expect(result.api).toBeUndefined()
      expect(result.app).toBeUndefined()
      expect(result.page).toBeUndefined()
      expect(result.component).toBeUndefined()
      expect(result.behavior).toBeUndefined()
      expect(result.mixin).toBeUndefined()
    })

    test('returns the correct runtime files for different source and target', () => {
      const sourceType = WechatTarget
      const target = 'bytedance'

      const result = getRuntimeFiles(sourceType, target)

      expect(result.api).toBe(
        'resolved/@morjs/runtime-mini/lib/bytedance/apis.js'
      )
      expect(result.app).toBeUndefined()
      expect(result.page).toBe(
        'resolved/@morjs/runtime-mini/lib/wechat/pageToOther.js'
      )
      expect(result.component).toBe(
        'resolved/@morjs/runtime-mini/lib/wechat/componentToOther.js'
      )
      expect(result.behavior).toBeUndefined()
      expect(result.mixin).toBe(
        'resolved/@morjs/runtime-mini/lib/common/behaviorOrMixin.js'
      )
    })
  })
})
