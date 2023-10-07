'use strict'

const module = require('..')
const { BaiduCompilerPlugin } = require('../plugin')
const constants = require('../constants')
const runtimeConfig = require('../runtimeConfig')
const { templateProcessor } = require('../templateProcessor')

describe('@morjs/plugin-compiler-baidu - index.test.js', () => {
  describe('your-module', () => {
    it('should export the correct Plugin', () => {
      expect(module.Plugin).toBe(BaiduCompilerPlugin)
    })

    it('should export all members from constants', () => {
      expect(module).toMatchObject(constants)
    })

    it('should export all members from runtimeConfig', () => {
      expect(module).toMatchObject(runtimeConfig)
    })

    it('should export the correct templateProcessor', () => {
      expect(module.templateProcessor).toBe(templateProcessor)
    })
  })
})
