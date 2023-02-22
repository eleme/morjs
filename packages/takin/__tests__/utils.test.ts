import { performance } from 'perf_hooks'
import {
  asArray,
  compose,
  interopRequireDefault,
  isObject,
  lookupFile,
  objectEnum
} from '../src'

describe('__tests__/utils.test.ts', () => {
  describe('lookupFile', () => {
    beforeEach(async () => {
      const fsExtra: any = await import('fs-extra')
      fsExtra._setMockFiles({
        '/mock/project/index.ts': 'index.ts',
        '/mock/project/index.js': 'index.js',
        '/mock/parent.js': 'parent.js',
        '/mock/folder1/index.js': 'index.js',
        '/mock/folder2/index.ts': 'index.ts'
      })
    })

    it('lookupFile', () => {
      expect(lookupFile('/mock/project', ['index'], ['.ts', '.js'])).toEqual(
        'index.ts'
      )

      expect(
        lookupFile(
          ['/mock/folder2', '/mock/folder1'],
          ['index'],
          ['.ts', '.js']
        )
      ).toEqual('index.ts')

      expect(lookupFile('/mock/project', ['index'], ['.json'])).toEqual(
        undefined
      )

      expect(
        lookupFile('/mock/project', ['index'], ['.ts', '.js'], {
          pathOnly: true
        })
      ).toEqual('/mock/project/index.ts')

      expect(
        lookupFile('/mock/project', ['parent'], ['.ts', '.js'], {
          depth: 2
        })
      ).toEqual('parent.js')

      expect(
        lookupFile('/mock/project', ['parent'], ['.ts', '.js'], {
          pathOnly: true,
          depth: 2
        })
      ).toEqual('/mock/parent.js')
    })
  })

  it('interopRequireDefault', () => {
    const fn = () => {}

    expect(interopRequireDefault(undefined)).toEqual({ default: undefined })
    expect(interopRequireDefault(null)).toEqual({ default: null })
    expect(interopRequireDefault({})).toEqual({ default: {} })
    expect(interopRequireDefault(fn)).toEqual({ default: fn })

    expect(
      interopRequireDefault({
        __esModule: true,
        x: 1,
        y: 2
      })
    ).toEqual({
      __esModule: true,
      x: 1,
      y: 2
    })

    fn.__esModule = true
    expect(interopRequireDefault(fn)).toEqual(fn)
  })

  it('isObject', () => {
    expect(isObject({})).toEqual(true)
    expect(isObject(Object.create(null))).toEqual(true)
    expect(isObject(Object.create({ x: 1 }))).toEqual(true)

    class Clazz {}
    expect(isObject(Clazz)).toEqual(false)
    expect(isObject(() => {})).toEqual(false)
    expect(isObject(true)).toEqual(false)
    expect(isObject('string')).toEqual(false)
    expect(isObject(123)).toEqual(false)
    expect(isObject(/d+/)).toEqual(false)
  })

  it('asArray', () => {
    expect(asArray(null)).toEqual([])
    expect(asArray(undefined)).toEqual([])

    expect(asArray(1)).toEqual([1])
    expect(asArray('string')).toEqual(['string'])
    expect(asArray(true)).toEqual([true])
    expect(asArray(/d+/)).toEqual([/d+/])
    const fn = () => {}
    expect(asArray(fn)).toEqual([fn])
    class Clazz {}
    expect(asArray(Clazz)).toEqual([Clazz])

    expect(asArray([1])).toEqual([1])
    expect(asArray(['string'])).toEqual(['string'])
    expect(asArray([true])).toEqual([true])
    expect(asArray([/d+/])).toEqual([/d+/])
    expect(asArray([fn])).toEqual([fn])
    expect(asArray([Clazz])).toEqual([Clazz])
  })

  it('compose', async () => {
    const fn1 = jest.fn(() => performance.now())
    const fn2 = jest.fn(() => performance.now())
    const fn3 = jest.fn(() => performance.now())

    const run = compose([fn1, fn2, fn3])

    const args = [
      {
        x: 1,
        y: 2
      },
      'second'
    ]
    await run(...args)

    expect(fn1).toHaveBeenCalled()
    expect(fn2).toHaveBeenCalled()
    expect(fn3).toHaveBeenCalled()

    expect(fn1).toBeCalledTimes(1)
    expect(fn2).toBeCalledTimes(1)
    expect(fn3).toBeCalledTimes(1)

    expect(fn1.mock.calls[0]).toEqual(args)
    expect(fn2.mock.calls[0]).toEqual(args)
    expect(fn3.mock.calls[0]).toEqual(args)

    expect(fn1.mock.results[0].value).toBeLessThan(fn2.mock.results[0].value)
    expect(fn2.mock.results[0].value).toBeLessThan(fn3.mock.results[0].value)
  })

  it('objectEnum', () => {
    expect(objectEnum(['x'])).toEqual({ x: 'x' })
    expect(objectEnum(['x', 'y'])).toEqual({ x: 'x', y: 'y' })

    expect(() => objectEnum('x' as any)).toThrowError()
  })
})
