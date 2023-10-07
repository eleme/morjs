'use strict'

const { aPageToComponent, wPageToComponent } = require('..')

describe('@morjs/core - pageToComponent.test.js', () => {
  jest.mock('./pageToComponent', () => ({
    aPageToComponent: jest.fn(),
    wPageToComponent: jest.fn()
  }))

  describe('aPageToComponent', () => {
    it('should call aPageToComponent function', () => {
      aPageToComponent()
      expect(aPageToComponent).toHaveBeenCalled()
    })
  })

  describe('wPageToComponent', () => {
    it('should call wPageToComponent function', () => {
      wPageToComponent()
      expect(wPageToComponent).toHaveBeenCalled()
    })
  })
})
