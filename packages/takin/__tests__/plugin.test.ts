import { Plugin, PluginEnforceTypes } from '../src'

describe('__tests__/plugin.test.ts', () => {
  it('PluginEnforceTypes', () => {
    expect(PluginEnforceTypes).toHaveProperty('pre', 'pre')
    expect(PluginEnforceTypes).toHaveProperty('post', 'post')
  })

  it('Plugin Class', () => {
    class Clazz implements Plugin {
      name = 'clazz'
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      apply() {}
    }

    const clazz = new Clazz()
    expect(clazz.name).toEqual('clazz')
    expect(clazz).toHaveProperty('apply')
  })
})
