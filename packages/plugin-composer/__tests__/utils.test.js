'use strict'

const { overrideUserConfig, isCIENV } = require('..')
const { logger } = require('@morjs/utils')

describe('@morjs/plugin-generator - utils.test.js', () => {
  describe('overrideUserConfig', () => {
    const optionNames = ['option1', 'option2']
    const commandOptions = {
      option1: 'value1',
      option2: 'value2'
    }
    const userConfig = {
      option1: 'default1',
      option2: 'default2'
    }

    it('should override user config with command options', () => {
      const result = overrideUserConfig({
        optionNames,
        commandOptions,
        userConfig
      })

      expect(result.option1).toBe(commandOptions.option1)
      expect(result.option2).toBe(commandOptions.option2)
    })

    it('should log a warning if user config is overridden', () => {
      const warnSpy = jest.spyOn(logger, 'warn')

      // Set user config to a different value than command options
      userConfig.option1 = 'differentValue'

      overrideUserConfig({ optionNames, commandOptions, userConfig })

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('被命令行参数 --option1 的值'),
        expect.any(Object)
      )

      warnSpy.mockRestore()
    })
  })

  describe('isCIENV', () => {
    it('should return true if CI environment variables are set', () => {
      process.env.CI = 'true'

      const result = isCIENV()

      expect(result).toBe(true)
    })

    it('should return true if CLOUDBUILD environment variable is set', () => {
      process.env.CLOUDBUILD = 'true'

      const result = isCIENV()

      expect(result).toBe(true)
    })

    it('should return false if no CI environment variables are set', () => {
      process.env.CI = undefined
      process.env.CLOUDBUILD = undefined

      const result = isCIENV()

      expect(result).toBe(false)
    })
  })
})
