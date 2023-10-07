'use strict'

const {
  asArray,
  compose,
  generateId,
  getSharedProperty,
  hasOwnProperty,
  transformApis
} = require('..')

describe('@morjs/runtime-base - utils.test.js', () => {
  it('asArray', () => {
    expect(asArray(1)).toEqual([1])
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3])
    expect(asArray(null)).toEqual([])
    expect(asArray(undefined)).toEqual([])
    expect(asArray(true)).toEqual([true])
    expect(asArray(false)).toEqual([false])
    expect(asArray('')).toEqual([''])
    expect(asArray('abc')).toEqual(['a', 'b', 'c'])
    expect(asArray(1, 2, 3)).toEqual([1, 2, 3])
  })
  it('compose', () => {
    expect(compose(1, 2, 3)).toEqual(6)
    expect(compose(1, 2, 3, 4)).toEqual(10)
    expect(compose(1, 2, 3, 4, 5)).toEqual(15)
  })
  it('generateId', () => {
    expect(generateId()).toMatch(/^mor-/)
  })
  it('getSharedProperty', () => {
    const obj = { a: 1, b: 2 }
    expect(getSharedProperty(obj, 'a')).toEqual(1)
    expect(getSharedProperty(obj, 'b')).toEqual(2)
    expect(getSharedProperty(obj, 'c')).toEqual(undefined)
  })
  it('hasOwnProperty', () => {
    const obj = { a: 1, b: 2 }
    expect(hasOwnProperty(obj, 'a')).toEqual(true)
    expect(hasOwnProperty(obj, 'b')).toEqual(true)
    expect(hasOwnProperty(obj, 'c')).toEqual(false)
  })
  it('transformApis', () => {
    const obj = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 4
      }
    }
    expect(transformApis(obj, 'a')).toEqual(1)
    expect(transformApis(obj, 'b')).toEqual(2)
    expect(transformApis(obj, 'c')).toEqual({ d: 3, e: 4 })
    expect(transformApis(obj, 'c.d')).toEqual(3)
    expect(transformApis(obj, 'c.e')).toEqual(4)
    expect(transformApis(obj, 'c.f')).toEqual(undefined)
    expect(transformApis(obj, 'd')).toEqual(undefined)
    expect(transformApis(obj, 'e')).toEqual(undefined)
    expect(transformApis(obj, 'f')).toEqual(undefined)
  })
})
