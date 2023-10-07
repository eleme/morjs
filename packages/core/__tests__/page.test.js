'use strict'

const { createPage, enhancePage, aPage } = require('..')

describe('@morjs/core - page.test.js', () => {
  jest.mock('./page', () => ({
    createPage: jest.fn(),
    enhancePage: jest.fn(),
    aPage: jest.fn()
  }))

  describe('createPage', () => {
    it('should call createPage function', () => {
      createPage()
      expect(createPage).toHaveBeenCalled()
    })
  })

  describe('enhancePage', () => {
    it('should call enhancePage function', () => {
      enhancePage()
      expect(enhancePage).toHaveBeenCalled()
    })
  })

  describe('aPage', () => {
    it('should call aPage function', () => {
      aPage()
      expect(aPage).toHaveBeenCalled()
    })
  })
})
