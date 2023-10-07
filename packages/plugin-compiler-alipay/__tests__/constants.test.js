'use strict'

const {
  isSimilarTarget,
  addSimilarTarget,
  removeSimilarTarget
} = require('../constants')

describe('@morjs/plugin-compiler-alipay - constants.test.js', () => {
  describe('isSimilarTarget', () => {
    it('should return true for similar target', () => {
      expect(isSimilarTarget('alipay')).toBe(true)
      addSimilarTarget('wechat')
      expect(isSimilarTarget('wechat')).toBe(true)
    })

    it('should return false for non-similar target', () => {
      expect(isSimilarTarget('wechat')).toBe(false)
    })
  })

  describe('addSimilarTarget', () => {
    it('should add similar target', () => {
      addSimilarTarget('wechat')
      expect(isSimilarTarget('wechat')).toBe(true)
    })

    it('should not add similar target if already exists', () => {
      addSimilarTarget('wechat')
      expect(isSimilarTarget('wechat')).toBe(true)
      addSimilarTarget('wechat')
      expect(isSimilarTarget('wechat')).toBe(true)
    })
  })

  describe('removeSimilarTarget', () => {
    it('should remove similar target', () => {
      addSimilarTarget('wechat')
      expect(isSimilarTarget('wechat')).toBe(true)

      removeSimilarTarget('wechat')
      expect(isSimilarTarget('wechat')).toBe(false)
    })

    it('should not remove similar target if not exists', () => {
      expect(isSimilarTarget('wechat')).toBe(false)
      removeSimilarTarget('wechat')
      expect(isSimilarTarget('wechat')).toBe(false)
    })

    it('should not remove alipay target', () => {
      expect(isSimilarTarget('alipay')).toBe(true)
      removeSimilarTarget('alipay')
      expect(isSimilarTarget('alipay')).toBe(true)
    })
  })
})
