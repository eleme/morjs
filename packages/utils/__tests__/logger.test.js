'use strict'

const { logger, CLI_NAME } = require('..')

describe('@morjs/utils - logger.test.js', () => {
  describe('logger', () => {
    it('should call init method with correct arguments', () => {
      const initSpy = jest.spyOn(logger, 'init')
      logger.init('info', {
        debugPrefix: CLI_NAME,
        prefix: `[]`
      })

      expect(initSpy).toHaveBeenCalledTimes(1)
      expect(initSpy).toHaveBeenCalledWith('info', {
        debugPrefix: CLI_NAME,
        prefix: `[]`
      })

      // 恢复原始的init方法
      initSpy.mockRestore()
    })
  })
})
