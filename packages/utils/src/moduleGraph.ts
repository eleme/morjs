import { logger } from './logger'

type FilePathCallBack = (filePath: string) => void

/**
 * 小程序主包所代表的分组名称, 这里以 空字符串 作为名称
 */
export const MAIN_GROUP_NAME = ''

/**
 * 根模块名称, 即 root
 */
export const ROOT_MODULE_NAME = 'root'

/**
 * ModuleItem 的 JSON 序列化类型
 */
type ModuleJSON = {
  filePath: string
  dependencies: string[]
  groups: string[]
}

/**
 * 模块 分组信息
 * 主要用于分包，一个分包对应一个组
 */
export class ModuleGroup {
  name: string
  modules: Set<ModuleItem>

  constructor(name: string) {
    this.name = name
    this.modules = new Set()
  }

  addModule(module: ModuleItem) {
    this.modules.add(module)
  }

  removeModule(module: ModuleItem) {
    this.modules.delete(module)
  }

  hasModule(module: ModuleItem): boolean {
    return this.modules.has(module)
  }
}

/**
 * 一个文件是一个 module
 * 以 文件的全路径作为 module 标识
 */
export class ModuleItem {
  // 全路径
  filePath: string
  // 分组信息, 主要基于 分包
  groups: Set<ModuleGroup>
  // 依赖的模块
  dependencies: Set<ModuleItem>
  // 被xx个模块依赖
  parents: Set<ModuleItem>
  // 依赖图
  moduleGraph: ModuleGraph
  // 是否已被删除
  isRemoved: boolean

  constructor(filePath: string, moduleGraph: ModuleGraph) {
    this.filePath = filePath
    this.groups = new Set()
    this.dependencies = new Set()
    this.parents = new Set()
    this.moduleGraph = moduleGraph
    this.isRemoved = false
  }

  linkGroup(group: ModuleGroup) {
    if (this.groups.has(group)) return

    group.addModule(this)
    this.groups.add(group)
  }

  // 清空并设置 group
  clearAndLinkGroup(group: ModuleGroup) {
    this.clearGroups()
    this.linkGroup(group)
  }

  clearGroups() {
    this.groups.forEach((group) => group.removeModule(this))
    this.groups.clear()
  }

  unlinkGroup(group: ModuleGroup) {
    if (this.groups.has(group)) {
      this.groups.delete(group)
      group.removeModule(this)
    }
  }

  addDependency(dependency: ModuleItem) {
    if (this.dependencies.has(dependency)) return
    this.dependencies.add(dependency)
    dependency.addParent(this)
  }

  addParent(parent: ModuleItem) {
    if (this.parents.has(parent)) return
    this.parents.add(parent)
    parent.addDependency(this)
  }

  removeDependency(dependency: ModuleItem, mutual: boolean = true) {
    if (this.dependencies.has(dependency)) {
      this.dependencies.delete(dependency)
      if (mutual) dependency.removeParent(this)
    }
  }

  removeParent(parent: ModuleItem, mutual: boolean = true) {
    if (this.parents.has(parent)) {
      this.parents.delete(parent)
      if (mutual) parent.removeDependency(this, mutual)

      // 当一个模块不被任何其他模块依赖, 则应当从依赖图中删除该模块
      if (this.parents.size === 0) this.moduleGraph.removeModule(this)
    }
  }

  remove() {
    if (this.isRemoved) return
    this.isRemoved = true
    this.clearGroups()

    // 清理依赖
    this.dependencies.forEach((m) => m.removeParent(this, false))
    this.dependencies.clear()

    // 清理被依赖
    this.parents.forEach((m) => m.removeDependency(this, false))
    this.parents.clear()

    this.filePath = undefined
    this.moduleGraph = undefined
  }

  getAllDependentFiles(files: Set<string>, callback?: FilePathCallBack) {
    this.dependencies.forEach(function (module) {
      // 文件只添加一次
      if (files.has(module.filePath)) return

      files.add(module.filePath)
      if (callback) callback(module.filePath)

      // 继续添加依赖中的文件
      module.getAllDependentFiles(files, callback)
    })
  }
}

/**
 * 模块依赖图
 *
 * 主要用于 Entry 构建的依赖关系建立和动态分组
 *
 * 包含:
 *   - 一个 mainGroup: 无法被删除, 一般指代 小程序主包
 *   - 一个 rootModule: 无法被删除, 用于形成带顶端的树状结构, 可减少循环次数及明确父类归属
 *   - N 个普通 Module: 随 Entry 分析及文件变化动态删减
 *   - N 个普通 Group: 主要用于 各个分包
 *   - N 个 无效的 Module: 用于标记被变更或被删除的模块
 *
 * 其中:
 *   - 每个 Module 中包含 文件地址、依赖信息、被依赖信息 及 分组信息
 *   - 每个 Group 中包含 名称以及相关的模块
 */
export class ModuleGraph {
  // 主 group 当一个模块出现在多个组时, 则自动添加到 主 Group 中
  mainGroup: ModuleGroup

  // 根模块, 形成树状
  private rootModule: ModuleItem

  // 所有分组
  groups: Map<ModuleGroup['name'], ModuleGroup>

  // 所有模块
  private modules: Map<ModuleItem['filePath'], ModuleItem>

  // 用于标记那些模块已无效 如 删除或修改
  private invalidModules: Set<ModuleItem>

  // 上传获取所有模块文件的记录
  private prevFiles?: Set<string>

  constructor() {
    this.groups = new Map()
    this.modules = new Map()
    this.invalidModules = new Set()
    this.rootModule = this.createOrFetchModule(ROOT_MODULE_NAME)
    this.mainGroup = this.createGroup(MAIN_GROUP_NAME)
  }

  /**
   * 判断是否是 rootModule
   * @param module - 模块
   */
  isRootModule(module: ModuleItem) {
    return this.rootModule === module
  }

  /**
   * 判断是否为 主 group
   */
  isMainGroup(group: ModuleGroup): boolean {
    return group === this.mainGroup
  }

  /**
   * 返回当前文件所在组
   *   1. 如果文件出现在多个组中，则返回 mainGroup
   *   2. 如果文件未出现在任何组中, 则返回 mainGroup
   *   3. 其他情况直接返回文件所在组
   * @param filePath - 文件地址
   */
  getGroup(filePath: string): ModuleGroup {
    const module = this.getModuleByFilePath(filePath)
    if (!module) return this.mainGroup
    if (module.groups.size > 1) return this.mainGroup
    if (module.groups.size === 0) return this.mainGroup

    // 返回第一个
    for (const group of module.groups) {
      return group
    }
  }

  /**
   * 标记文件及其依赖无效
   * 原因:
   *   1. 当一个文件被改变，那么现有的依赖则不确定依然存在, 会同时被标记为 invalid
   *   2. 并且 其 父级别模块对该文件的依赖也存在不确定性, 需要同时标记为 invalid
   * 并在当前修改或删除文件被重新解析的过程中，逐步确立并恢复依赖关系
   * @param filePath - 文件路径
   */
  invalidate(filePath: string) {
    const module = this.getModuleByFilePath(filePath)

    // 标记所有父级为 无效
    const invalidateAllParents = (module: ModuleItem) => {
      module.parents.forEach((parent) => {
        if (parent === this.rootModule) return
        if (this.invalidModules.has(parent)) return
        this.invalidModules.add(parent)
        invalidateAllParents(parent)
      })
    }

    if (module) {
      this.invalidModules.add(module)
      // 标记直接依赖为 无效
      module.dependencies.forEach((dep) => {
        // 检查当前依赖只要存在一个 父模块且父模块为被标记为 invalid
        // 则当前 dep 不标记为 invalid
        for (const p of dep.parents) {
          if (p !== module && !this.invalidModules.has(p)) return
        }

        this.invalidModules.add(dep)
      })

      // 标记当前模块的所有父级模块为 invalid
      invalidateAllParents(module)
    }
  }

  /**
   * 是否为无效文件
   * @param filePath - 文件路径
   */
  isInvalid(filePath: string): boolean {
    const module = this.getModuleByFilePath(filePath)
    // 模块如果不存在也视为无效
    if (module == null) return true
    return this.invalidModules.has(module)
  }

  /**
   * 清理无效的模块
   * 清理无效的模块会同时清理这个模块中的所有依赖关系、分组信息
   * 且 当一个模块在清理依赖关系的过程中出现了不被任何其他模块依赖的情况时, 会删除该模块
   * 以此循环往复，直到所有模块被清理完成
   */
  clearAllInvalidModules() {
    // 清理所有被标记为无效的模块
    this.invalidModules.forEach((module) => this.removeModule(module))
    this.invalidModules.clear()
  }

  /**
   * 获取依赖图中所有的文件
   * @param callback - 回调函数, 接收 文件路径 作为参数
   */
  getAllFiles(callback?: FilePathCallBack): Set<string> {
    const files = new Set<string>()
    this.rootModule.getAllDependentFiles(files, callback)
    return files
  }

  /**
   * 获取 diff 文件变更
   * 接收 onAdd 和 onDelete 两个回调函数
   * 返回 addedFiles 和 deletedFiles 文件清单
   */
  getDiffFiles({
    onAdd,
    onDelete
  }: {
    onAdd?: FilePathCallBack
    onDelete?: FilePathCallBack
  }): {
    addedFiles: Set<string>
    deletedFiles: Set<string>
  } {
    const addedFiles = new Set<string>()
    const deletedFiles = new Set<string>()

    // 如果是第一次运行, 只执行 onAdd
    if (!this.prevFiles) {
      this.prevFiles = this.getAllFiles(onAdd)
      return { addedFiles: this.prevFiles, deletedFiles }
    }

    const newFiles = this.getAllFiles((filePath) => {
      if (this.prevFiles.has(filePath)) {
        // 删除已存在的文件
        this.prevFiles.delete(filePath)
      } else {
        addedFiles.add(filePath)
      }
    })

    // 检查被删除的文件
    this.prevFiles.forEach((filePath) => {
      deletedFiles.add(filePath)
      if (onDelete) onDelete(filePath)
    })

    this.prevFiles = newFiles

    return { addedFiles, deletedFiles }
  }

  /**
   * 在依赖图中添加依赖
   * 当没有 父 模块文件路径时 会以 rootModule 作为父模块
   * @param parentPath - 父 模块文件路径
   * @param dependencyPath - 子 模块文件路径
   * @param groupName - 文件所在组
   */
  addDependencyFor(
    parentPath: string | undefined,
    dependencyPath: string,
    groupName?: string
  ): ModuleGroup {
    if (parentPath === dependencyPath) {
      logger.debug(
        '检测到文件自引用, 可能会导致 Bug, 请检查\n' + `文件路径: ${parentPath}`
      )
      return
    }

    const parentModule = parentPath
      ? this.createOrFetchModule(parentPath)
      : this.rootModule
    const childModule = this.createOrFetchModule(dependencyPath)

    parentModule.addDependency(childModule)

    // 设置 group 信息
    let group: ModuleGroup
    if (groupName != null) {
      group = this.createGroup(groupName)
      // 如果 parentModule 不在任何 group 中且不是 rootModule
      // 则为父模块设置当前 group
      if (parentModule.groups.size === 0 && parentModule !== this.rootModule) {
        parentModule.linkGroup(group)
      }
    }

    // 如果未指定 groupName
    // 则 自动继承父 module 所在的 group
    else {
      group = this.getGroup(parentModule.filePath)
    }

    childModule.linkGroup(group)

    return group
  }

  /**
   * 创建或获取已有模块并将模块标记为正常
   * @param filePath 文件地址
   */
  createOrFetchModule(filePath: string): ModuleItem {
    let module: ModuleItem
    if (this.modules.has(filePath)) {
      module = this.modules.get(filePath)
    } else {
      module = new ModuleItem(filePath, this)
      this.modules.set(filePath, module)
    }

    // 从 无效模块中移除, 代表当前模块被正常引用
    if (this.invalidModules.has(module)) {
      this.invalidModules.delete(module)
    }

    return module
  }

  createGroup(name: string) {
    if (this.groups.has(name)) return this.groups.get(name)
    const group = new ModuleGroup(name)
    this.groups.set(name, group)
    return group
  }

  /**
   * 获取文件路径对应的 module
   * @param filePath 文件路径
   */
  getModuleByFilePath(filePath: string) {
    return this.modules.get(filePath)
  }

  /**
   * 通过文件路径删除关联的 module
   * @param filePath 文件路径
   */
  removeModuleByFilePath(filePath: string) {
    let module = this.modules.get(filePath)
    if (module) {
      this.modules.delete(filePath)
      module.remove()
      module = undefined
    }
  }

  /**
   * 删除模块
   * @param module 模块
   */
  removeModule(module: ModuleItem) {
    // rootModule 不能被删除
    if (this.rootModule === module) return
    this.removeModuleByFilePath(module.filePath)
  }

  /**
   * 将 moduleGraph 序列化
   */
  toJSON(): ModuleJSON[] {
    const modules: ModuleJSON[] = []
    this.modules.forEach((module) => {
      if (module.isRemoved) return

      const dependencies: string[] = []
      module.dependencies.forEach((dep) => {
        if (dep.isRemoved) return
        dependencies.push(dep.filePath)
      })
      const groups: string[] = []
      module.groups.forEach((group) => {
        groups.push(group.name)
      })
      modules.push({
        filePath: module.filePath,
        dependencies,
        groups
      })
    })

    return modules
  }

  private connectParentAndChild(
    parentPath: string | undefined,
    dependencyPath: string
  ) {
    const parentModule = parentPath
      ? this.createOrFetchModule(parentPath)
      : this.rootModule
    const childModule = this.createOrFetchModule(dependencyPath)
    parentModule.addDependency(childModule)
  }

  /**
   * 从序列化中恢复
   */
  static restore(modules: ModuleJSON[]) {
    const moduleGraph = new ModuleGraph()
    for (const module of modules) {
      const { filePath, dependencies, groups } = module

      const moduleItem = moduleGraph.createOrFetchModule(filePath)

      for (const dep of dependencies) {
        moduleGraph.connectParentAndChild(filePath, dep)
      }

      for (const group of groups) {
        moduleItem.linkGroup(moduleGraph.createGroup(group))
      }
    }

    return moduleGraph
  }

  /**
   * 重置整个依赖图
   */
  reset() {
    this.modules.forEach((m) => m.remove())
    this.modules.clear()
    this.groups.clear()
    this.invalidModules.clear()
    this.rootModule = this.createOrFetchModule(ROOT_MODULE_NAME)
    this.mainGroup = this.createGroup(MAIN_GROUP_NAME)
  }
}
