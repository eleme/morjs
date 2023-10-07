'use strict'

const { init } = require('..')

describe('@morjs/core - init.test.js', () => {
  jest.mock('./utils/init', () => ({
    init: jest.fn()
  }))

  describe('init', () => {
    it('should call init function', () => {
      init()
      expect(init).toHaveBeenCalled()
    })
  })
})
