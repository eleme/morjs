'use strict'

const apisToAlipay = require('../alipay/apisToAlipay')
const otherComponentToAlipay = require('../alipay/componentToAlipay')
const alipayComponentToOther = require('../alipay/componentToOther')
const pageToAlipay = require('../alipay/pageToAlipay')
const alipayPageToOther = require('../alipay/pageToOther')
const apisToBaidu = require('../baidu/apis')
const apisToKuaishou = require('../kuaishou/apis')
const apisToWechat = require('../wechat/apis')
const wechatComponentToOther = require('../wechat/componentToOther')
const wechatPageToOther = require('../wechat/pageToOther')
const { initAdapters } = require('..')

describe('@morjs/runtime-mini - index-test.js', () => {
  describe('initAdapters', () => {
    let options
    let createApiMock
    let registerComponentAdaptersMock
    let registerPageAdaptersMock

    beforeEach(() => {
      options = {
        sourceType: 'alipay',
        target: 'wechat',
        createApi: jest.fn(),
        registerComponentAdapters: jest.fn(),
        registerPageAdapters: jest.fn()
      }
      createApiMock = options.createApi
      registerComponentAdaptersMock = options.registerComponentAdapters
      registerPageAdaptersMock = options.registerPageAdapters
    })

    it('should not convert if sourceType and target are the same', () => {
      options.sourceType = 'alipay'
      options.target = 'alipay'

      initAdapters(options)

      expect(createApiMock).not.toHaveBeenCalled()
      expect(registerComponentAdaptersMock).not.toHaveBeenCalled()
      expect(registerPageAdaptersMock).not.toHaveBeenCalled()
    })

    it('should convert from alipay to wechat', () => {
      initAdapters(options)

      expect(createApiMock).toHaveBeenCalledWith([apisToWechat], {})
      expect(registerComponentAdaptersMock).toHaveBeenCalledWith([
        alipayComponentToOther
      ])
      expect(registerPageAdaptersMock).toHaveBeenCalledWith([alipayPageToOther])
    })

    it('should convert from alipay to other platforms', () => {
      options.target = 'baidu'
      initAdapters(options)

      expect(createApiMock).toHaveBeenCalledWith([apisToBaidu], {})
      expect(registerComponentAdaptersMock).toHaveBeenCalledWith([
        alipayComponentToOther
      ])
      expect(registerPageAdaptersMock).toHaveBeenCalledWith([alipayPageToOther])
    })

    it('should convert from wechat to alipay', () => {
      options.sourceType = 'wechat'
      options.target = 'alipay'
      initAdapters(options)

      expect(createApiMock).toHaveBeenCalledWith([apisToAlipay], {})
      expect(registerComponentAdaptersMock).toHaveBeenCalledWith([
        otherComponentToAlipay
      ])
      expect(registerPageAdaptersMock).toHaveBeenCalledWith([pageToAlipay])
    })

    it('should convert from wechat to other platforms', () => {
      options.sourceType = 'wechat'
      options.target = 'kuaishou'
      initAdapters(options)

      expect(createApiMock).toHaveBeenCalledWith([apisToKuaishou], {})
      expect(registerComponentAdaptersMock).toHaveBeenCalledWith([
        wechatComponentToOther
      ])
      expect(registerPageAdaptersMock).toHaveBeenCalledWith([wechatPageToOther])
    })
  })
})
