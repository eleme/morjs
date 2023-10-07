'use strict'

const { env } = require('..')

describe('@morjs/runtime-base - env.test.js', () => {
  it('should return env', () => {
    expect(env).toEqual(process.env)
  })
})
