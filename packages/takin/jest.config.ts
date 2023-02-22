import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: {
    name: process.cwd(),
    color: 'cyan'
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**'],
  coverageReporters: ['lcov', 'json'],
  transform: {
    '.(ts|js)x?$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      // tsConfig: '../../tsconfig.test.json',
    }
  },
  setupFiles: ['./jest.setup.ts']
}

export default config
