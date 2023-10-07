'use strict'

const { ModuleTypes, ModuleManager, ModuleItem } = require('..')

describe('@morjs/api - moduleManager.test.js', () => {
  describe('ModuleItem', () => {
    it('should create a ModuleItem object with correct properties', () => {
      const module = {
        name: 'testModule',
        type: ModuleTypes.STATIC_PLUGIN,
        routes: {}
      }
      const moduleItem = new ModuleItem(module)
      expect(moduleItem).toBeDefined()
      expect(moduleItem.isLoaded).toBe(false)
      expect(moduleItem.name).toBe(module.name)
      expect(moduleItem.type).toBe(module.type)
      expect(moduleItem.routes).toBe(module.routes)
    })

    it('should set or update properties of a ModuleItem object', () => {
      const module = {
        name: 'testModule',
        type: ModuleTypes.STATIC_PLUGIN,
        routes: {}
      }
      const moduleItem = new ModuleItem(module)
      const updatedModule = {
        name: 'updatedModule',
        type: ModuleTypes.SUBPACKAGE,
        routes: { '/path': 'Component' }
      }
      moduleItem.setOrUpdate(updatedModule)
      expect(moduleItem.name).toBe(updatedModule.name)
      expect(moduleItem.type).toBe(updatedModule.type)
      expect(moduleItem.routes).toBe(updatedModule.routes)
    })
  })

  describe('ModuleManager', () => {
    let moduleManager

    beforeEach(() => {
      moduleManager = new ModuleManager({})
    })

    it('should register a module', () => {
      const module = {
        name: 'testModule',
        type: ModuleTypes.STATIC_PLUGIN,
        routes: {}
      }
      const moduleItem = moduleManager.register(module)
      expect(moduleItem).toBeDefined()
      expect(moduleItem.name).toBe(module.name)
      expect(moduleItem.type).toBe(module.type)
      expect(moduleItem.routes).toBe(module.routes)
    })

    it('should get a module by name', () => {
      const module = {
        name: 'testModule',
        type: ModuleTypes.STATIC_PLUGIN,
        routes: {}
      }
      moduleManager.register(module)
      const moduleItem = moduleManager.getModule(module.name)
      expect(moduleItem).toBeDefined()
      expect(moduleItem.name).toBe(module.name)
      expect(moduleItem.type).toBe(module.type)
      expect(moduleItem.routes).toBe(module.routes)
    })

    it('should get all modules', () => {
      const module1 = {
        name: 'module1',
        type: ModuleTypes.STATIC_PLUGIN,
        routes: {}
      }
      const module2 = {
        name: 'module2',
        type: ModuleTypes.SUBPACKAGE,
        routes: {}
      }
      moduleManager.register(module1)
      moduleManager.register(module2)
      const modules = moduleManager.getAllModules()
      expect(modules).toHaveLength(2)
      expect(modules[0].name).toBe(module1.name)
      expect(modules[1].name).toBe(module2.name)
    })

    it('should check if a module is loaded', () => {
      const module = {
        name: 'testModule',
        type: ModuleTypes.STATIC_PLUGIN,
        routes: {}
      }
      const moduleItem = moduleManager.register(module)
      expect(moduleManager.isLoaded(module.name)).toBe(false)
      moduleItem.isLoaded = true
      expect(moduleManager.isLoaded(module.name)).toBe(true)
    })

    it('should initialize modules', () => {
      const module1 = {
        name: 'module1',
        type: ModuleTypes.STATIC_PLUGIN,
        routes: {}
      }
      const module2 = {
        name: 'module2',
        type: ModuleTypes.SUBPACKAGE,
        routes: {}
      }
      const module3 = {
        name: 'module3',
        type: ModuleTypes.DYNAMIC_PLUGIN,
        routes: {}
      }
      const module4 = {
        name: 'module4',
        type: ModuleTypes.DYNAMIC_PLUGIN,
        routes: {}
      }
      const modules = [module1, module2, module3, module4]
      moduleManager.init(modules)
      expect(moduleManager.isLoaded(module1.name)).toBe(true)
      expect(moduleManager.isLoaded(module2.name)).toBe(true)
      expect(moduleManager.isLoaded(module3.name)).toBe(true)
      expect(moduleManager.isLoaded(module4.name)).toBe(true)
    })
  })
})
