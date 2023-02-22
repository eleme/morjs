import { mor } from './api'
import { ENV_TYPE, getEnv, getGlobalObject } from './env'
import { logger } from './logger'

/**
 * 模块类型
 */
export enum ModuleTypes {
  /**
   * 分包模块
   */
  SUBPACKAGE = 'SUBPACKAGE',
  /**
   * 动态插件模块, 仅支付宝支持
   */
  DYNAMIC_PLUGIN = 'DYNAMIC_PLUGIN',
  /**
   * 静态插件模块
   */
  STATIC_PLUGIN = 'STATIC_PLUGIN'
}

export interface IModuleItem {
  /**
   * 模块名称, 唯一
   */
  name: string
  /**
   * 模块 ID
   * 对应 插件 ID
   */
  id?: string
  /**
   * 模块类型
   */
  type: ModuleTypes
  /**
   * 模块版本
   */
  version?: string
  /**
   * 模块路由
   */
  routes: Record<string, string>
  /**
   * 宿主拓展给插件的能力
   *
   * @type {Record<string, any>}
   */
  extend?: Record<string, any>

  /**
   * 模块入口实例
   */
  instance?: any
  /**
   * 插件调用成功回调，仅针对动态插件调用
   * @param isInit 首次初始化并载入成功
   */
  success?: (isInit?: boolean) => void

  /**
   * 插件调用失败回调，仅针对动态插件调用
   */
  fail?: (err: Error) => void
}

/**
 * 模块
 * 分包或插件
 */
class ModuleItem implements IModuleItem {
  /**
   * 是否已载入
   * 载入代表已初始化
   */
  isLoaded: boolean = false

  name: string
  id?: string
  type: ModuleTypes
  version?: string
  routes: Record<string, string>
  extend?: Record<string, any>
  instance?: Record<string, any>
  success?: (isLoaded?: boolean) => void
  fail?: (err: Error) => void

  constructor(module: IModuleItem) {
    this.setOrUpdate(module)
  }

  setOrUpdate({
    name,
    id,
    type,
    version,
    routes,
    extend,
    instance,
    success,
    fail
  }: IModuleItem) {
    this.name = name
    this.id = id
    this.type = type
    this.version = version
    this.routes = routes
    this.extend = extend
    this.instance = instance
    this.success = success
    this.fail = fail
  }
}

/**
 * 模块管理
 * 用于 获取当前小程序中的插件、分包和模块等
 */
export class ModuleManager {
  /**
   * 代表 小程序宿主实例
   */
  host: Record<string, any>
  /**
   * 所有模块
   */
  modules: Record<ModuleItem['name'], ModuleItem>
  /**
   *
   * @param modules 模块信息
   */
  constructor(host: Record<string, any>, modules?: IModuleItem[]) {
    this.host = host

    if (modules?.length) {
      for (const m of modules) {
        this.register(m)
      }
    }
  }

  /**
   * 获取 模块
   * @param name
   */
  getModule(name: string): ModuleItem {
    return this.modules[name]
  }

  /**
   * 获取所有模块
   */
  getAllModules(): ModuleItem[] {
    const modules: ModuleItem[] = []
    for (const name of Object.keys(this.modules)) {
      modules.push(this.modules[name])
    }
    return modules
  }

  /**
   * 注册模块
   * @param module 模块信息
   */
  register(module: IModuleItem): ModuleItem | void {
    if (!module?.name) {
      return logger.warn('模块注册失败, 原因: 缺少名称')
    }

    let moduleItem = this.modules[module.name]
    // 不重复初始化
    if (moduleItem == null) {
      moduleItem = new ModuleItem(module)
    } else {
      // 更新模块信息
      moduleItem.setOrUpdate(module)
    }

    return moduleItem
  }

  /**
   * 检查模块是否已载入
   * @param moduleNameOrModule 模块名称 或 模块实例
   * @returns 是否已载入
   */
  isLoaded(moduleNameOrModule: string | ModuleItem): boolean {
    if (moduleNameOrModule instanceof ModuleItem) {
      return moduleNameOrModule.isLoaded
    } else {
      return this.modules[moduleNameOrModule]?.isLoaded === true
    }
  }

  /**
   * 初始化模块, 并注入宿主能力
   * @param modules - 模块信息
   */
  init(modules: IModuleItem | IModuleItem[]) {
    modules = Array.isArray(modules)
      ? modules
      : modules == null
      ? []
      : [modules]

    if (modules?.length) return logger.warn('请传入需要初始化的分包或插件')

    modules.forEach((moduleInfo) => {
      const module = this.register(moduleInfo)
      // 未注册成功, 通常是缺少
      if (!module) return

      // 前置检查, 仅 支付宝小程序 支持动态插件
      if (
        module.type === ModuleTypes.DYNAMIC_PLUGIN &&
        getEnv() !== ENV_TYPE.ALIPAY
      ) {
        return logger.error(
          `目前仅支付宝支持动态插件, 插件名称: ${module.name}`
        )
      }

      const isDynamicPlugin = module.type === ModuleTypes.DYNAMIC_PLUGIN

      // 支持插件调用方感知调用成功, 仅针对动态插件调用
      // isInit 用于标记是否是第一次初始化
      const onPluginLoaded = function (isInit: boolean): void {
        if (!isDynamicPlugin) return
        if (typeof module.success === 'function') module.success(isInit)
      }

      // 支持插件调用方感知调用失败, 仅针对动态插件调用
      const onPluginFailed = function (error: Error): void {
        if (!isDynamicPlugin) return
        if (typeof module.fail === 'function') module.fail(error)
      }

      // 如果插件已成功载入, 则不需要跳过后续步骤, 避免多次初始化
      // 动态插件直接触发 success 回调
      if (this.isLoaded(module.name)) return onPluginLoaded(false)

      const global = getGlobalObject()

      // 动态插件初始化
      // 仅适用于 支付宝且非 IDE 的情况下
      if (
        isDynamicPlugin &&
        global?.canIuse &&
        global.canIuse('plugin.dynamic') &&
        !global.isIDE
      ) {
        try {
          global.loadPlugin({
            plugin: `${module.id}@${module.version}`,
            success: () => {
              this.mountPlugin(module, `dynamic-plugin://${module.id}`)
              onPluginLoaded(true)
            },
            fail(err: Error) {
              onPluginFailed(err)
            }
          })
        } catch (error) {
          onPluginFailed(error)
        }
      } else {
        if (module.type === ModuleTypes.STATIC_PLUGIN) {
          // 静态插件初始化
          this.mountPlugin(module, module.name)
        } else {
          this.mountModule(module)
        }
      }
    })
  }

  /**
   * Mor 插件初始化及能力注入
   */
  private mountPlugin = (module: ModuleItem, identity: string): void => {
    const plugin = mor.requirePlugin(identity) || {}

    // es6 export default 兜底支持
    if (plugin && plugin.__esModule && plugin.default) {
      Object.assign(plugin, plugin.default)
    }

    // 检查是否为 mor 插件工程
    if (!plugin?.$isMorPlugin) {
      logger.error('mor.moduleManager.init', '目前只支持配置 mor 的插件')
      return
    }

    module.instance = plugin

    this.mountModule(module)
  }

  /**
   * 标记模块为已加载
   */
  private markModuleAsLoaded(module: ModuleItem) {
    if (module) module.isLoaded = true
  }

  /**
   * 模块
   * @param module 模块
   * @param extend 拓展能力信息
   */
  private mountModule(module: ModuleItem) {
    this.markModuleAsLoaded(module)

    // mor 旧版兼容
    if (module?.instance?.internalInit && this.host?.$event) {
      module.instance.internalInit({ $event: this.host.$event })
    }

    // 宿主能力注入
    if (module?.instance?.morInit && module?.extend) {
      module.instance.morInit(module.extend)
    }
  }
}
