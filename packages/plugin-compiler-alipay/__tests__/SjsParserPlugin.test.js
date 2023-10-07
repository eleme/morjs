'use strict'

const { getModuleExportsName } = require('../plugins/SjsParserPlugin')

describe('@morjs/plugin-compiler-alipay - SjsParserPlugin.test.js', () => {
  describe('getModuleExportsName', () => {
    it('should extract variable names from module.exports.xxx statements', () => {
      const content = `
        module.exports.foo = 'bar';
        module.exports.baz = 123;
        module.exports.qux = true;
      `

      const result = getModuleExportsName(content)

      expect(result).toEqual(['foo', 'baz', 'qux'])
    })

    it('should return an empty array if no module.exports.xxx statements are found', () => {
      const content = `
        const x = 10;
        const y = 'hello';
      `

      const result = getModuleExportsName(content)

      expect(result).toEqual([])
    })
  })
})
