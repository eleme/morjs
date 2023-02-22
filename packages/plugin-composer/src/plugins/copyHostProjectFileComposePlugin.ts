import { logger, takin } from '@morjs/utils'
import path from 'path'

const { fsExtra: fs, lookupFile } = takin

/**
 * 自动拷贝项目配置文件到集成产物目录
 */
export class CopyHostProjectFileComposePlugin implements takin.Plugin {
  name = 'MorCopyHostProjectFileComposePlugin'

  apply(runner: takin.Runner) {
    runner.hooks.moduleComposed.tapPromise(
      this.name,
      async function (moduleInfo) {
        const { target, compileType } = runner.userConfig || {}

        // 缺少目标平台, 跳过
        if (!target) return

        // 仅支持分包编译模式下自动拷贝项目配置
        if (compileType !== 'subpackage') return

        // 非 host 不处理
        if (moduleInfo.type !== 'host') return

        // 缺少集成产物目录不处理
        if (!moduleInfo?.output?.to) return

        try {
          const plugins = runner.methods.invoke('getComposedCompilerPlugins')
          const projectConfigFiles: string[] =
            plugins?.projectConfigFiles?.[target] || []

          if (!projectConfigFiles.length) return

          const cwd = runner.config.cwd
          const moduleSource = path.resolve(cwd, moduleInfo.source)
          const outputFrom = path.resolve(cwd, moduleInfo.output.from)
          const outputTo = path.resolve(cwd, moduleInfo.output.to)
          // 最后一个是正确的文件名
          const targetProjectFileName =
            projectConfigFiles[projectConfigFiles.length - 1]
          const targetProjectFilePath = path.join(
            outputTo,
            targetProjectFileName
          )

          // 如果文件已存在, 则不处理
          if (await fs.pathExists(targetProjectFilePath)) return

          const projectFileNames = projectConfigFiles.map((f) =>
            path.basename(f, '.json')
          )

          // 优先查找产物
          for await (const dir of [outputFrom, moduleSource]) {
            const fileContent = await lookupFile(
              dir,
              projectFileNames,
              ['.json'],
              { depth: 1 }
            )
            if (fileContent) {
              const projectFileJson = JSON.parse(fileContent)

              // 配置目录为当前目录
              projectFileJson.miniprogramRoot = './'

              await fs.outputFile(
                targetProjectFilePath,
                JSON.stringify(projectFileJson, null, 2)
              )

              break
            }
          }
        } catch (error) {
          logger.warnOnce(`模块 ${moduleInfo.name} 项目配置文件自动拷贝失败`)
        }
      }
    )
  }
}
