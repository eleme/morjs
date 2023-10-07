'use strict'

const { getRuntimeFiles } = require('../runtimeConfig')

describe('@morjs/plugin-compiler-alipay - runtimeConfig.test.js', () => {
  jest.mock('./constants', () => ({
    isSimilarTarget: jest.fn(),
    target: 'alipay'
  }))

  jest.mock('./constants', () => ({
    isSimilarTarget: jest.fn(),
    target: 'alipay'
  }))

  jest.mock('path', () => ({
    resolve: jest.fn((dir, fileName) => `${dir}/${fileName}`)
  }))

  describe('getRuntimeFiles', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return Alipay to Other runtime files for Alipay to Other conversion', () => {
      expect(getRuntimeFiles('alipay', 'wechat')).toEqual({
        api: 'alipay/apisToOther',
        app: undefined,
        page: 'alipay/pageToOther',
        component: 'alipay/componentToOther',
        behavior: 'common/behaviorOrMixin',
        mixin: undefined
      })
    })

    it('should return Alipay to Alipay runtime files for Other to Alipay conversion', () => {
      expect(getRuntimeFiles('wechat', 'alipay')).toEqual({
        api: 'alipay/apisToAlipay',
        app: undefined,
        page: 'alipay/pageToAlipay',
        component: 'alipay/componentToAlipay',
        behavior: undefined,
        mixin: 'common/behaviorOrMixin'
      })
    })

    it('should return undefined for same source and target', () => {
      expect(getRuntimeFiles('alipay', 'alipay')).toEqual({
        api: undefined,
        app: undefined,
        page: undefined,
        component: undefined,
        behavior: undefined,
        mixin: undefined
      })

      expect(getRuntimeFiles('wechat', 'wechat')).toEqual({
        api: undefined,
        app: undefined,
        page: undefined,
        component: undefined,
        behavior: undefined,
        mixin: undefined
      })
    })
  })
})
