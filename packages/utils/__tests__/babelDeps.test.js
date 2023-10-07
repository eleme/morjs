'use strict'

const {
  babelCore,
  babelGenerator,
  babelParser,
  babelTemplate,
  babelTraverse,
  babelTypes
} = require('..')

describe('@morjs/utils - babelDeps.test.js', () => {
  describe('babel modules', () => {
    it('should export correct babelCore module', () => {
      expect(babelCore).toBeDefined()
    })

    it('should export correct babelGenerator module', () => {
      expect(babelGenerator).toBeDefined()
    })

    it('should export correct babelParser module', () => {
      expect(babelParser).toBeDefined()
    })

    it('should export correct babelTemplate module', () => {
      expect(babelTemplate).toBeDefined()
    })

    it('should export correct babelTraverse module', () => {
      expect(babelTraverse).toBeDefined()
    })

    it('should export correct babelTypes module', () => {
      expect(babelTypes).toBeDefined()
    })
  })
})
