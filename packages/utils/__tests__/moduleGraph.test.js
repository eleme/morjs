'use strict'

const { ModuleGroup, ModuleItem, ModuleGraph } = require('..')

describe('@morjs/utils - moduleGraph.test.js', () => {
  describe('ModuleGroup', () => {
    describe('addModule', () => {
      it('should add a module to the group', () => {
        const group = new ModuleGroup('group')
        const module = new ModuleItem('module', new ModuleGraph())
        group.addModule(module)

        expect(group.modules.size).toEqual(1)
        expect(group.modules.has(module)).toBe(true)
      })
    })
  })

  describe('ModuleItem', () => {
    describe('linkGroup', () => {
      it('should link the module to the group', () => {
        const group = new ModuleGroup('group')
        const module = new ModuleItem('module', new ModuleGraph())
        module.linkGroup(group)

        expect(module.groups.size).toEqual(1)
        expect(module.groups.has(group)).toBe(true)
        expect(group.modules.size).toEqual(1)
        expect(group.modules.has(module)).toBe(true)
      })
    })
  })
})
