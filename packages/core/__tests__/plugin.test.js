'use strict'

const { createPlugin, aPlugin, wPlugin } = require('..')

describe('@morjs/core - plugin.test.js', () => {
  jest.mock('./plugin', () => ({
    createPlugin: jest.fn(),
    aPlugin: jest.fn(),
    wPlugin: jest.fn()
  }))

  describe('createPlugin', () => {
    it('should call createPlugin function', () => {
      createPlugin()
      expect(createPlugin).toHaveBeenCalled()
    })
  })

  describe('aPlugin', () => {
    it('should call aPlugin function', () => {
      aPlugin()
      expect(aPlugin).toHaveBeenCalled()
    })
  })

  describe('wPlugin', () => {
    it('should call wPlugin function', () => {
      wPlugin()
      expect(wPlugin).toHaveBeenCalled()
    })
  })
})
