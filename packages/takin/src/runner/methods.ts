import { RunnerMethodsError } from '../errors'

type MethodInfo = { pluginName: string }

/**
 * 用于插件间共享函数方法
 */
export class MethodsContainer {
  /**
   * 保存共享方法
   */
  private _methods: Map<string, (...args: any[]) => any>

  /**
   * 记录方法相关信息
   */
  private _infos: Map<string, MethodInfo>

  /**
   * 记录当前共享方法所使用的插件名称
   */
  private pluginName!: string

  /**
   * 父 container, 当存在时, 相关方法调用均会传递给 parent
   */
  private parent?: MethodsContainer

  constructor(parent?: MethodsContainer, pluginName?: string) {
    this._methods = new Map()
    this._infos = new Map()

    this.parent = parent

    if (pluginName) this.pluginName = pluginName
  }

  /**
   * 检查方法是否存在
   * @param name - 共享方法名称
   * @returns true or false
   */
  has(name: string): boolean {
    if (this.parent) return this.parent.has(name)
    return this._methods.has(name)
  }

  /**
   * 获取方法信息, 目前仅包含注册当前方法的插件名称
   * @param name - 共享方法名称
   * @returns 共享方法信息
   */
  getInfo(name: string): MethodInfo | undefined {
    if (this.parent) return this.parent.getInfo(name)
    return this._infos.get(name)
  }

  /**
   * 注册插件间共享方法
   * @param name - 共享方法名称
   * @param method - 共享方法函数体
   */
  register(
    name: string,
    method: (...args: any[]) => any,
    info?: MethodInfo
  ): void {
    if (this.has(name)) {
      let errMessage = `方法 ${name} 已被`
      const pluginName = this.getInfo(name)?.pluginName
      if (pluginName) errMessage = `插件 ${pluginName} 注册`
      errMessage = errMessage + '注册'
      throw new RunnerMethodsError(errMessage)
    }

    // 记录方式是由哪个插件注册的
    info = info || { pluginName: this.pluginName }

    if (this.parent) {
      this.parent.register(name, method, info)
    } else {
      this._methods.set(name, method)
      this._infos.set(name, info)
    }
  }

  /**
   * 执行插件间共享方法
   * @param name - 方法名称
   * @param args - 方法参数
   * @returns 方法执行结果
   */
  invoke<R = any>(name: string, ...args: any): R {
    if (this.has(name)) {
      if (this.parent) {
        return this.parent.invoke<R>(name, ...args)
      } else {
        return this._methods.get(name)?.(...args) as R
      }
    } else {
      throw new RunnerMethodsError(`方法 ${name} 不存在`)
    }
  }
}
