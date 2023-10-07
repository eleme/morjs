'use strict'

const { createComponent, enhanceComponent, aComponent } = require('..')

describe('@morjs/core - component.test.js', () => {
  jest.mock('./component', () => ({
    createComponent: jest.fn(),
    enhanceComponent: jest.fn(),
    aComponent: jest.fn()
  }))

  describe('createComponent', () => {
    it('should call createComponent function', () => {
      createComponent()
      expect(createComponent).toHaveBeenCalled()
    })
  })

  describe('enhanceComponent', () => {
    it('should call enhanceComponent function', () => {
      enhanceComponent()
      expect(enhanceComponent).toHaveBeenCalled()
    })
  })

  describe('aComponent', () => {
    it('should call aComponent function', () => {
      aComponent()
      expect(aComponent).toHaveBeenCalled()
    })
  })
})
