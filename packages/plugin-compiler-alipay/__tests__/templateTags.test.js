'use strict'

const { isFormTag, isNativeTag } = require('../templateTags')

describe('@morjs/plugin-compiler-alipay - templateTags.test.js', () => {
  describe('isFormTag', () => {
    test('should return true for formTag', () => {
      expect(isFormTag('input')).toBe(true)
    })

    test('should return false for non-formTag', () => {
      expect(isFormTag('view')).toBe(false)
    })
  })

  describe('isNativeTag', () => {
    test('should return true for nativeTag', () => {
      expect(isNativeTag('view')).toBe(true)
    })

    test('should return false for non-nativeTag', () => {
      expect(isNativeTag('custom-component')).toBe(false)
    })
  })
})
