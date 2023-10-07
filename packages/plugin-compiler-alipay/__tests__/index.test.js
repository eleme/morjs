'use strict'

const AlipayCompilerPlugin = require('..')
const AlipayCompilerSjsParserPlugin = require('../plugins/SjsParserPlugin')
const AlipayCompilerStyleParserPlugin = require('../plugins/StyleParserPlugin')
const AlipayCompilerConfigParserPlugin = require('../plugins/ConfigParserPlugin')
const AlipayCompilerTemplateParserPlugin = require('../plugins/TemplateParserPlugin')

describe('@morjs/plugin-compiler-alipay - index.test.js', () => {
  describe('AlipayCompilerPlugin', () => {
    it('should apply all plugins when the plugin is applied', () => {
      const runner = {
        hook: jest.fn()
      }

      const plugin = new AlipayCompilerPlugin()
      plugin.apply(runner)

      expect(runner.hook.mock.calls.length).toBe(4)
      expect(runner.hook.mock.calls[0][0]).toBeInstanceOf(
        AlipayCompilerSjsParserPlugin
      )
      expect(runner.hook.mock.calls[1][0]).toBeInstanceOf(
        AlipayCompilerStyleParserPlugin
      )
      expect(runner.hook.mock.calls[2][0]).toBeInstanceOf(
        AlipayCompilerConfigParserPlugin
      )
      expect(runner.hook.mock.calls[3][0]).toBeInstanceOf(
        AlipayCompilerTemplateParserPlugin
      )
    })
  })
})
