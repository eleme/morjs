'use strict'

const os = require('os')
const PQueue = require('p-queue').default
const { DEFAULT_CONCURRENCY, QUEUE } = require('..')

describe('@morjs/utils - queue.test.js', () => {
  test('DEFAULT_CONCURRENCY_BY_MEM should be a number', () => {
    const DEFAULT_CONCURRENCY_BY_MEM = Math.floor(
      os.totalmem() / 1073741824 / 2
    )
    expect(DEFAULT_CONCURRENCY_BY_MEM).toEqual(expect.any(Number))
  })

  test('DEFAULT_CONCURRENCY_BY_CPUS should be a number', () => {
    const DEFAULT_CONCURRENCY_BY_CPUS = Math.floor(os.cpus().length / 2)
    expect(DEFAULT_CONCURRENCY_BY_CPUS).toEqual(expect.any(Number))
  })

  test('DEFAULT_CONCURRENCY should be a number', () => {
    expect(DEFAULT_CONCURRENCY).toEqual(expect.any(Number))
  })

  test('QUEUE should be an instance of PQueue', () => {
    expect(QUEUE).toBeInstanceOf(PQueue)
  })
})
