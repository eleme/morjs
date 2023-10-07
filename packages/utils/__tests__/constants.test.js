'use strict'

const {
  CLI_NAME,
  mor,
  COMMAND_TIMEOUT,
  RETRY_TIMES,
  SourceTypes,
  CompileModuleKind,
  CompileScriptTarget,
  CompileTypes,
  EntryFileType,
  EntryType,
  MOR_GLOBAL_FILE,
  MOR_RUNTIME_FILE,
  MOR_INIT_FILE,
  MOR_VENDOR_FILE,
  MOR_COMMON_FILE,
  MOR_APP_FILE,
  MOR_HELPER_FILE,
  MOR_SHARED_FILE,
  MOR_COMPOSED_APP_FILE,
  MOR_RUNTIME_WEB_FILE
} = require('..')

describe('@morjs/utils - constants.test.js', () => {
  describe('CLI_NAME', () => {
    it('should equal "mor"', () => {
      expect(CLI_NAME).toEqual('mor')
    })
  })

  describe('mor', () => {
    it('should be initialized', () => {
      expect(mor).toBeDefined()
    })
  })

  describe('COMMAND_TIMEOUT', () => {
    it('should equal 1800000', () => {
      expect(COMMAND_TIMEOUT).toEqual(1800000)
    })
  })

  describe('RETRY_TIMES', () => {
    it('should equal 1', () => {
      expect(RETRY_TIMES).toEqual(1)
    })
  })

  describe('SourceTypes', () => {
    it('should contain "wechat" and "alipay"', () => {
      expect(SourceTypes).toEqual({
        wechat: 'wechat',
        alipay: 'alipay'
      })
    })
  })

  describe('CompileModuleKind', () => {
    it('should contain "CommonJS", "ES2015", "ES2020", "ESNext"', () => {
      expect(CompileModuleKind).toEqual({
        CommonJS: 'CommonJS',
        ES2015: 'ES2015',
        ES2020: 'ES2020',
        ESNext: 'ESNext'
      })
    })
  })

  describe('CompileScriptTarget', () => {
    it('should contain "ES5", "ES2015", "ES2016", "ES2017", "ES2018", "ES2019", "ES2020", "ES2021", "ESNext", "Latest"', () => {
      expect(CompileScriptTarget).toEqual({
        ES5: 'ES5',
        ES2015: 'ES2015',
        ES2016: 'ES2016',
        ES2017: 'ES2017',
        ES2018: 'ES2018',
        ES2019: 'ES2019',
        ES2020: 'ES2020',
        ES2021: 'ES2021',
        ESNext: 'ESNext',
        Latest: 'Latest'
      })
    })
  })

  describe('CompileTypes', () => {
    it('should contain "miniprogram", "plugin", "subpackage", "component"', () => {
      expect(CompileTypes).toEqual({
        miniprogram: 'miniprogram',
        plugin: 'plugin',
        subpackage: 'subpackage',
        component: 'component'
      })
    })
  })

  describe('EntryFileType', () => {
    it('should contain "script", "template", "style", "config", "sjs"', () => {
      expect(EntryFileType).toEqual({
        script: 'script',
        template: 'template',
        style: 'style',
        config: 'config',
        sjs: 'sjs'
      })
    })
  })

  describe('EntryType', () => {
    it('should contain "app", "plugin", "subpackage", "page", "component", "npmComponent", "pluginComponent", "project", "sitemap", "theme", "preload", "ext", "custom", "unknown"', () => {
      expect(EntryType).toEqual({
        app: 'app',
        plugin: 'plugin',
        subpackage: 'subpackage',
        page: 'page',
        component: 'component',
        npmComponent: 'npmComponent',
        pluginComponent: 'pluginComponent',
        project: 'project',
        sitemap: 'sitemap',
        theme: 'theme',
        preload: 'preload',
        ext: 'ext',
        custom: 'custom',
        unknown: 'unknown'
      })
    })
  })

  describe('MOR_GLOBAL_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_GLOBAL_FILE()).toEqual(mor.name + '.' + 'g')
      expect(MOR_GLOBAL_FILE('surfix')).toEqual(
        mor.name + '.' + 'g' + '.' + 'surfix'
      )
    })
  })

  describe('MOR_RUNTIME_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_RUNTIME_FILE()).toEqual(mor.name + '.' + 'r')
      expect(MOR_RUNTIME_FILE('surfix')).toEqual(
        mor.name + '.' + 'r' + '.' + 'surfix'
      )
    })
  })

  describe('MOR_INIT_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_INIT_FILE()).toEqual(mor.name + '.' + 'i')
      expect(MOR_INIT_FILE('surfix')).toEqual(
        mor.name + '.' + 'i' + '.' + 'surfix'
      )
    })
  })

  describe('MOR_VENDOR_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_VENDOR_FILE()).toEqual(mor.name + '.' + 'v')
      expect(MOR_VENDOR_FILE('surfix')).toEqual(
        mor.name + '.' + 'v' + '.' + 'surfix'
      )
    })
  })

  describe('MOR_COMMON_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_COMMON_FILE()).toEqual(mor.name + '.' + 'c')
      expect(MOR_COMMON_FILE('surfix')).toEqual(
        mor.name + '.' + 'c' + '.' + 'surfix'
      )
    })
  })

  describe('MOR_APP_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_APP_FILE()).toEqual(mor.name + '.' + 'a')
      expect(MOR_APP_FILE('surfix')).toEqual(
        mor.name + '.' + 'a' + '.' + 'surfix'
      )
    })
  })

  describe('MOR_HELPER_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_HELPER_FILE()).toEqual(mor.name + '.' + 'h')
      expect(MOR_HELPER_FILE('surfix')).toEqual(
        mor.name + '.' + 'h' + '.' + 'surfix'
      )
    })
  })

  describe('MOR_SHARED_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_SHARED_FILE()).toEqual(mor.name + '.' + 's')
      expect(MOR_SHARED_FILE('surfix')).toEqual(
        mor.name + '.' + 's' + '.' + 'surfix'
      )
    })
  })

  describe('MOR_COMPOSED_APP_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_COMPOSED_APP_FILE()).toEqual(mor.name + '.' + 'p')
    })
  })

  describe('MOR_RUNTIME_WEB_FILE', () => {
    it('should return the correct file name', () => {
      expect(MOR_RUNTIME_WEB_FILE()).toEqual(mor.name + '.' + 'w')
      expect(MOR_RUNTIME_WEB_FILE('surfix')).toEqual(
        mor.name + '.' + 'w' + '.' + 'surfix'
      )
    })
  })
})
