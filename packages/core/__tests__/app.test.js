'use strict'

const { createApp, aApp } = require('..')

describe('@morjs/core - app.test.js', () => {
  jest.mock('./app', () => ({
    createApp: jest.fn(),
    aApp: jest.fn()
  }))

  describe('createApp', () => {
    it('should call createApp function', () => {
      createApp()
      expect(createApp).toHaveBeenCalled()
    })
  })

  describe('aApp', () => {
    it('should call aApp function', () => {
      aApp()
      expect(aApp).toHaveBeenCalled()
    })
  })
})
