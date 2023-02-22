import {
  CompileModuleKind,
  EntryBuilderHelpers,
  logger,
  makeImportClause,
  Plugin,
  Runner,
  slash,
  WebpackWrapper
} from '@morjs/utils'
import { createRequire } from 'module'
import path from 'path'
import { MockerUserConfigSchema } from './constants'

export * from './constants'

// mock 运行时代码
const MOCK_RUNTIME_FILE = path.resolve(__dirname, 'runtimes', 'mock.js')

const MOCK_FILE_NAME = 'mor.mock'

class Mocker {
  wrapper: WebpackWrapper
  entryBuilder: EntryBuilderHelpers
  constructor(private runner: Runner, private name: string) {
    let currentEntries: Record<string, any> = {}
    let mockEnabled: boolean = false

    runner.hooks.webpackWrapper.tap(this.name, (wrapper) => {
      this.wrapper = wrapper
    })

    // 添加 --mock 选项支持
    runner.hooks.cli.tap(this.name, (cli) => {
      const compileCommand = cli.command('compile')
      compileCommand.option('--mock', '开启 mock 功能')
    })

    // 根据 config 和命令行判断是否开启 --mock 选项
    runner.hooks.modifyUserConfig.tap(this.name, (userConfig, command) => {
      const { production, mock } = command?.options || {}
      if (userConfig.mode === 'production' || production) {
        logger.warnOnce(`生产模式下已自动关闭 mock 功能`)
      } else if (mock) {
        mockEnabled = true
        userConfig.mock = {
          debug: false,
          path: './mock',
          adapters: [],
          ...(userConfig.mock || {})
        }
        logger.warnOnce('已开启 mock 功能')
      }
      return userConfig
    })

    runner.hooks.registerUserConfig.tap(this.name, function (schema) {
      return schema.merge(MockerUserConfigSchema)
    })

    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {
      this.entryBuilder = entryBuilder
    })

    runner.hooks.userConfigValidated.tap(this.name, () => {
      if (!mockEnabled) return

      this.ignoreMockFileChange()

      // 用于生成 mock 文件地址
      this.runner.hooks.afterBuildEntries.tap(this.name, (entries) => {
        const filePath = this.generateInitMockFileContent()
        if (filePath) {
          entries[MOCK_FILE_NAME] = filePath
          currentEntries = entries
        }

        return entries
      })

      // 用于将 mock 文件注入到初始化文件中
      runner.hooks.generateInitFiles.tap(
        this.name,
        (fileContent, moduleGroup) => {
          if (
            this.entryBuilder.moduleGraph.isMainGroup(moduleGroup) &&
            currentEntries[MOCK_FILE_NAME]
          ) {
            const moduleKind =
              runner?.userConfig?.compilerOptions?.module ||
              CompileModuleKind.CommonJS

            const lines = fileContent.trim().split('\n')
            const importInitMockClause = makeImportClause(
              moduleKind,
              `./${MOCK_FILE_NAME}.js`
            )
            lines.splice(1, 0, importInitMockClause)
            for (const i in lines) {
              if (lines[i].endsWith('\n')) {
                lines[i] = lines[i].slice(0, lines[i].length - 1)
              }
            }
            return lines.join('\n').concat('\n')
          }

          return fileContent
        }
      )
    })
  }

  getInitMockFilePath() {
    const userConfig = this.runner.userConfig
    return path.join(userConfig.outputPath, `./${MOCK_FILE_NAME}.js`)
  }

  /**
   * 忽略 mor mock 虚拟文件
   */
  ignoreMockFileChange() {
    const watchOptions = this.wrapper.chain.get('watchOptions') || {}
    const watchIgnored: string[] = watchOptions.ignored || []
    const mockFilePath = slash(this.getInitMockFilePath())
    if (!watchIgnored.includes(mockFilePath)) {
      watchIgnored.push(mockFilePath)
    }
    this.wrapper.chain.watchOptions({ ...watchOptions, ignored: watchIgnored })
  }

  /**
   * 生成 mock 运行时初始化文件
   * 这里采用虚拟文件, 即写在内存里的文件
   */
  generateInitMockFileContent(): string | void {
    const userConfig = this.runner.userConfig
    const globalObject = userConfig.globalObject
    const { userConfigFilePath, cwd } = this.runner.config
    if (!globalObject) return

    const mockFilePath = this.getInitMockFilePath()
    const mockOptions = userConfig.mock

    const adapterItems = []
    const customRequire = createRequire(
      userConfigFilePath || path.join(cwd, 'mor.config.ts')
    )
    const adapterImports = (mockOptions.adapters || []).map((a, i) => {
      const adapterName = `adapter${i}`
      if (Array.isArray(a)) {
        // 数组:接收两个参数 ①: 静态文件或包地址 ②: 初始化配置
        adapterItems.push(`new ${adapterName}(${JSON.stringify(a[1])})`)
        try {
          const mockerAdapterFilePath = customRequire.resolve(a[0])
          return `import ${adapterName} from '${mockerAdapterFilePath}';`
        } catch (e) {
          logger.warnOnce(`路径为 ${a[0]} 的 adapter 文件(包)未找到`)
        }
      } else if (typeof a === 'string') {
        // 字符串: 静态文件或包地址
        adapterItems.push(`new ${adapterName}()`)
        try {
          const mockerAdapterFilePath = customRequire.resolve(a)
          return `import ${adapterName} from '${mockerAdapterFilePath}';`
        } catch (e) {
          logger.warnOnce(`路径为 ${a} 的 adapter 文件(包)未找到`)
        }
      } else {
        logger.error(`Mock 传入 adapters 第 ${i + 1} 项的格式不正确`)
      }
    })

    const initMockFileContent = [
      `import Mock from '${MOCK_RUNTIME_FILE}';`,
      adapterImports.join(';\n'),
      `var mockContext = require.context(${JSON.stringify(
        path.resolve(cwd, mockOptions.path)
      )}, true, /\\.(cjs|js|json|json5|jsonc|mjs|ts)$/)`,
      // 传入的 adapters 是 new 后的对象实例组，可运行 run 方法获取返回结果
      `var adapters = [${adapterItems.join(', ')}]`,
      `var mock = new Mock(mockContext, ${JSON.stringify(
        mockOptions
      )}, ${globalObject}, adapters);`,
      `mock.run();`
    ].join('\n')

    // 写入内存文件
    this.wrapper.fs.mem.mkdirpSync(path.dirname(mockFilePath))
    this.wrapper.fs.mem.writeFileSync(mockFilePath, initMockFileContent)

    return mockFilePath
  }
}

export default class MorMockerPlugin implements Plugin {
  name = 'MorMockerPlugin'
  apply(runner: Runner) {
    new Mocker(runner, this.name)
  }
}
