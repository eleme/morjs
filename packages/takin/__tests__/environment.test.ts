import path from 'path'
import { Environment } from '../src'

jest.mock('fs')

describe('__tests__/environment.test.ts', () => {
  let env: Environment
  let fs: any
  beforeEach(async function () {
    fs = await import('fs')
    fs._setMockFiles({
      [path.join(process.cwd(), '.env')]: `
      TAKIN_ENV=test
      SOME_FALSE_ENV_VALUE=none
      SOME_ARRAY_ENV_VALUE=one, two, three four,five
      `
    })

    env = new Environment()
  })

  it('environment default options', () => {
    expect(env.options).toMatchObject({
      override: true,
      falsyValues: ['', 'none', 'false', '0', 'undefined', 'null'],
      arraySeparators: [',', ' ']
    })
  })

  it('environment load before enabled', () => {
    env.load()
    expect(env.get('TAKIN_ENV')).toBe(undefined)
    expect(env.get('SOME_FALSE_ENV_VALUE')).toBe(undefined)
    expect(env.get('SOME_ARRAY_ENV_VALUE')).toBe(undefined)
  })

  it('environment load after enabled', () => {
    env.enable().load()
    expect(env.has('TAKIN_ENV')).toBe(true)
    expect(env.has('SOME_FALSE_ENV_VALUE')).toBe(true)
    expect(env.has('SOME_ARRAY_ENV_VALUE')).toBe(true)
    expect(env.has('NON_EXISTS_ENV')).toBe(false)

    expect(env.get('TAKIN_ENV')).toBe('test')
    expect(env.get('SOME_FALSE_ENV_VALUE')).toBe('none')
    expect(env.get('SOME_ARRAY_ENV_VALUE')).toBe('one, two, three four,five')
    expect(env.get('NON_EXISTS_ENV')).toBe(undefined)
  })

  it('environment isFalsy', () => {
    env.enable().load()
    expect(env.isFalsy('SOME_FALSE_ENV_VALUE')).toBeTruthy()
    expect(env.isFalsy('NON_EXISTS_ENV')).toBeFalsy()
  })

  it('environment isTruthy', () => {
    env.enable().load()
    expect(env.isTruthy('TAKIN_ENV')).toBeTruthy()
    expect(env.isTruthy('NON_EXISTS_ENV')).toBeFalsy()
  })

  it('environment array value', () => {
    env.enable().load()
    expect(env.array('SOME_ARRAY_ENV_VALUE')).toMatchObject([
      'one',
      'two',
      'three',
      'four',
      'five'
    ])
  })

  it('environment arrayify', () => {
    env.enable().load()
    expect(env.arrayify('1 2 ,3 4,  5')).toMatchObject([
      '1',
      '2',
      '3',
      '4',
      '5'
    ])
  })
})
