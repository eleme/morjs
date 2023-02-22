import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: {
    name: process.cwd(),
    color: 'cyan'
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**'],
  coverageReporters: ['lcov', 'json'],
  transform: {
    '.(ts|js)x?$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'
    }
  }
}

export default config
