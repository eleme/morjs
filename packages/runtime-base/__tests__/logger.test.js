'use strict'

const { logger } = require('..')

describe('@morjs/runtime-base - logger.test.js', () => {
  describe('Logger', () => {
    let consoleWarnSpy
    let consoleLogSpy
    let consoleErrorSpy
    let consoleInfoSpy
    let consoleDebugSpy

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
      consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    })

    afterEach(() => {
      consoleWarnSpy.mockRestore()
      consoleLogSpy.mockRestore()
      consoleErrorSpy.mockRestore()
      consoleInfoSpy.mockRestore()
      consoleDebugSpy.mockRestore()
    })

    it('should log a warning', () => {
      logger.warn('This is a warning')
      expect(consoleWarnSpy).toHaveBeenCalledWith('[mor]', 'This is a warning')
    })

    it('should log a log message', () => {
      logger.log('This is a log')
      expect(consoleLogSpy).toHaveBeenCalledWith('[mor]', 'This is a log')
    })

    it('should log an error', () => {
      logger.error('This is an error')
      expect(consoleErrorSpy).toHaveBeenCalledWith('[mor]', 'This is an error')
    })

    it('should log an info message', () => {
      logger.info('This is an info')
      expect(consoleInfoSpy).toHaveBeenCalledWith('[mor]', 'This is an info')
    })

    it('should log a debug message', () => {
      logger.debug('This is a debug')
      expect(consoleDebugSpy).toHaveBeenCalledWith('[mor]', 'This is a debug')
    })

    it('should log a deprecated warning', () => {
      const deprecatedFn = logger.deprecated(
        'This function is deprecated',
        () => {
          // Function logic
        }
      )

      deprecatedFn()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[mor]',
        'This function is deprecated'
      )
    })

    it('should time the code execution', () => {
      const timerLabel = 'Timer1'

      logger.time(timerLabel)

      // Simulate code execution
      for (let i = 0; i < 1000000; i++) {
        Math.sqrt(i)
      }

      logger.timeEnd(timerLabel)

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[mor]',
        `${timerLabel} 耗时: expect.any(Number)ms`
      )
    })
  })
})
