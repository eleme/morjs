'use strict'

const { createApi, mor, registerFactory, init } = require('..')

describe('@morjs/api - api.test.js', () => {
  describe('createApi', () => {
    it('should create a MorAPI object with correct properties', () => {
      const api = createApi()
      expect(api).toBeDefined()
      expect(api.global).toBeDefined()
      expect(api.env).toBeDefined()
      expect(api.getApp).toBeDefined()
      expect(api.getCurrentPages).toBeDefined()
      expect(api.requirePlugin).toBeDefined()
      expect(api.getEnv).toBeDefined()
      expect(api.override).toBeDefined()
    })

    it('should override default MorAPI object', () => {
      const api = createApi()
      const overriddenApi = api.override()
      expect(overriddenApi).toBe(mor)
    })
  })

  describe('registerFactory', () => {
    it('should register a factory function', () => {
      const factoryName = 'testFactory'
      const factoryFunction = jest.fn()
      registerFactory(factoryName, factoryFunction)
      expect(FACTORIES[factoryName]).toBe(factoryFunction)
    })
  })

  describe('init', () => {
    it('should initialize a new MorAPI instance', () => {
      const options = { testOption: 'testValue' }
      const newMor = init(options)
      expect(newMor).toBeDefined()
      expect(newMor).not.toBe(mor)
      expect(FACTORIES[factoryName]).toHaveBeenCalled()
    })
  })
})
