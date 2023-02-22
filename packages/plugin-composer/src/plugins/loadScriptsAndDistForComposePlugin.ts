import {
  ComposeModuleInfo,
  fsExtra as fs,
  logger,
  Plugin,
  Runner
} from '@morjs/utils'
import path from 'path'
import { ComposerUserConfig } from '../constants'

export { ComposerUserConfig }

const LOAD_MODULES_SCRIPTS_AND_DIST_STAGE = 100
/**
 * 通过 package.json 载入模块的 scripts 和 dist 配置
 */
export class LoadScriptsAndDistForComposePlugin implements Plugin {
  name = 'MorLoadScriptsAndDistForComposePlugin'
  runner: Runner
  packageJsons: Map<string, Record<string, any>> = new Map()

  apply(runner: Runner) {
    this.runner = runner
    this.loadModulesScriptsAndDist()
  }

  loadModulesScriptsAndDist() {
    const cwd = this.runner.config.cwd

    /**
     * 获取模块的 scripts 配置
     * 如果产物目录不存在 则尝试基于 package.json 获取产物目录
     * 不同 target 读取的目录均为 [target] 字段
     * 如果未取到 target 对应的值, 则默认为 `dist/${target}`
     * 如果 target 也不存在 则默认为 `dist`
     */
    this.runner.hooks.moduleDownloaded.tapPromise(
      {
        name: this.name,
        stage: LOAD_MODULES_SCRIPTS_AND_DIST_STAGE
      },
      async (moduleInfo) => {
        const { target } = (this.runner.userConfig || {}) as { target: string }

        const packageJson = await this.getModulePackageJson(moduleInfo)

        const scripts = packageJson?.scripts
        if (!scripts) return

        moduleInfo.scripts = moduleInfo.scripts || {}
        moduleInfo.scripts.before = moduleInfo.scripts.before || []
        moduleInfo.scripts.after = moduleInfo.scripts.after || []
        moduleInfo.scripts.composed = moduleInfo.scripts.composed || []

        let beforeScript: string
        let afterScript: string
        let composedScript: string

        if (target) {
          beforeScript = scripts[`mor:compose:${target}:before`]
          afterScript = scripts[`mor:compose:${target}:after`]
          composedScript = scripts[`mor:compose:${target}:composed`]
        }

        beforeScript = beforeScript || scripts['mor:compose:before']
        afterScript = afterScript || scripts['mor:compose:after']
        composedScript = composedScript || scripts['mor:compose:composed']

        if (beforeScript && moduleInfo.scripts.before.length === 0) {
          moduleInfo.scripts.before.push(beforeScript)
        }

        if (afterScript && moduleInfo.scripts.after.length === 0) {
          moduleInfo.scripts.after.push(afterScript)
        }

        if (composedScript && moduleInfo.scripts.composed.length === 0) {
          moduleInfo.scripts.after.push(composedScript)
        }
      }
    )

    /**
     * 获取模块的 dist 配置
     * 遵循
     * 如果产物目录不存在 则尝试基于 package.json 获取产物目录
     * 不同 target 读取的目录均为 [target] 字段
     * 如果未取到 target 对应的值, 则默认为 `dist/${target}`
     * 如果 target 也不存在 则默认为 `dist`
     */
    this.runner.hooks.moduleBeforeScriptsExecuted.tapPromise(
      {
        name: this.name,
        stage: LOAD_MODULES_SCRIPTS_AND_DIST_STAGE
      },
      async (moduleInfo) => {
        // 如果产物目录已配置, 不执行后续逻辑
        if (moduleInfo.output.from) return

        const { target } = (this.runner.userConfig || {}) as { target: string }
        const packageJson = await this.getModulePackageJson(moduleInfo)

        // 模块源码目录
        const moduleSource = path.join(cwd, moduleInfo.source)

        let outputFrom: string

        // 如果 target 存在则优先按照多端产物规范的目录去获取产物
        if (target) {
          const plugins = this.runner.methods.invoke(
            'getComposedCompilerPlugins'
          )
          const mainFields: string[] =
            plugins?.resolveMainFields?.[target] || []
          const defaultOutputDir: string =
            plugins?.defaultOutputDir?.[target] || ''

          for await (const mainField of mainFields) {
            let dist = packageJson?.[mainField]
            if (!dist) continue
            // 如果包含后缀, 则获取文件夹
            if (path.extname(dist)) dist = path.dirname(dist)
            // 转换为绝对路径
            dist = path.resolve(moduleSource, dist)
            // 判断路径是否存在, 如果存在则作为产物目录
            if (await fs.pathExists(dist)) {
              outputFrom = dist
              break
            }
          }

          // 如果未找到有效目录, 则尝试使用 `dist/${target}`
          if (!outputFrom && defaultOutputDir) {
            const dist = path.resolve(moduleSource, defaultOutputDir)
            if (await fs.pathExists(dist)) {
              outputFrom = dist
            }
          }
        }

        // 如果未查找到, 则尝试使用缺省目录 dist
        if (!outputFrom) {
          outputFrom = path.resolve(cwd, moduleInfo.source, 'dist')
        }

        // 转换为相对于 cwd 的路径
        moduleInfo.output.from = path.relative(cwd, outputFrom)
        logger.debug(
          `模块 ${moduleInfo.name} 产物目录: ${moduleInfo.output.from}`
        )
      }
    )
  }

  /**
   * 获取模块的 pacakge.json 内容
   */
  async getModulePackageJson(
    moduleInfo: ComposeModuleInfo
  ): Promise<Record<string, any>> {
    const cwd = this.runner.config.cwd

    let packageJson: Record<string, any> = this.packageJsons.get(
      moduleInfo.hash
    )
    if (packageJson) return packageJson

    const packageJsonPath = path.resolve(cwd, moduleInfo.source, 'package.json')

    try {
      if (await fs.pathExists(packageJsonPath)) {
        packageJson = await fs.readJSON(packageJsonPath)
        this.packageJsons.set(moduleInfo.hash, packageJson)
      }
    } catch (error) {
      logger.debug(
        `模块 ${moduleInfo.name} 的 package.json 信息获取失败`,
        error
      )
    }

    return packageJson
  }
}
