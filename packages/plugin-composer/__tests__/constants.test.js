'use strict'

const { ComposeModes, ComposeUserConfigSchema } = require('../constants')

describe('@morjs/plugin-generator - constants.test.js', () => {
  describe('YourModule', () => {
    describe('ComposeUserConfigSchema', () => {
      test('should validate a valid user config', () => {
        const validConfig = {
          compose: true,
          combineModules: false,
          host: {
            name: 'host',
            git: 'https://github.com/your-repo/host',
            dist: 'dist/host',
            mode: ComposeModes.compose
          },
          modules: [
            {
              type: 'subpackage',
              name: 'subpackage1',
              git: 'https://github.com/your-repo/subpackage1',
              dist: 'dist/subpackage1',
              mode: ComposeModes.compile
            },
            {
              type: 'subpackage',
              name: 'subpackage2',
              git: 'https://github.com/your-repo/subpackage2',
              dist: 'dist/subpackage2',
              mode: ComposeModes.compose
            }
          ]
        }

        expect(() => {
          ComposeUserConfigSchema.parse(validConfig)
        }).not.toThrow()
      })

      test('should throw validation error for an invalid user config', () => {
        const invalidConfig = {
          compose: 'true', // should be a boolean
          combineModules: 'false', // should be a boolean
          host: {
            name: '', // should not be empty
            git: 'https://github.com/your-repo/host',
            dist: 'dist/host',
            mode: 'invalid' // should be a valid ComposeModes value
          },
          modules: [
            {
              type: 'subpackage',
              name: 'subpackage1',
              git: 'https://github.com/your-repo/subpackage1',
              dist: 'dist/subpackage1',
              mode: 'invalid' // should be a valid ComposeModes value
            },
            {
              type: 'unknown', // should be a valid ModuleTypes value
              name: 'subpackage2',
              git: 'https://github.com/your-repo/subpackage2',
              dist: 'dist/subpackage2',
              mode: ComposeModes.compose
            }
          ]
        }

        expect(() => {
          ComposeUserConfigSchema.parse(invalidConfig)
        }).toThrow()
      })
    })
  })
})
