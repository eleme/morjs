import { createLogger } from '../src'

describe('__tests__/logger.test.ts', () => {
  it('logger table', () => {
    const logger = createLogger()
    logger.table({
      head: ['id', 'title'],
      rows: [
        ['1', 'x'],
        ['2', 'y']
      ]
    })
  })

  it('logger methods', () => {
    const logger = createLogger()
    expect(logger).toHaveProperty('info')
    expect(logger).toHaveProperty('warn')
    expect(logger).toHaveProperty('error')
    expect(logger).toHaveProperty('table')
    expect(logger).toHaveProperty('time')
    expect(logger).toHaveProperty('timeEnd')
    expect(logger).toHaveProperty('debug')
  })
  it('info', () => {
    const info = jest.spyOn(console, 'log').mockImplementation(() => {})
    const logger = createLogger()
    const obj = {
      '1-1': {
        val: 'l1',
        '2-1': {
          val: 'l2',
          '3-1': {
            val: 'l3',
            '4-1': {
              val: 'l4'
            }
          }
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    function fn() {}
    logger.info('xxoo')
    logger.info(() => {})
    logger.info(999)
    logger.info(fn)
    logger.info(obj, { depth: 4 })
    logger.info(obj, { depth: 2 })
    expect(info.mock.calls[0][0]).toContain('xxoo')
    expect(info.mock.calls[1][0]).toContain('[Function')
    expect(info.mock.calls[2][0]).toContain('999')
    expect(info.mock.calls[3][0]).toContain('[Function: fn]')
    expect(info.mock.calls[4][0]).toContain('l4')
    expect(info.mock.calls[5][0]).not.toContain('l4')
  })
})
