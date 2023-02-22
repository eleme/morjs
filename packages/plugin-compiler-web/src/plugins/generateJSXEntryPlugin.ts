import {
  EntryBuilderHelpers,
  logger,
  MOR_GLOBAL_FILE,
  Plugin,
  Runner,
  slash,
  UserConfig,
  webpack,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import {
  generateEntryRoot,
  WebCompilerUserConfig,
  WEB_RUNTIMES
} from '../constants'

// Web 的运行时配置，主要用于指定路由和 tabBar 等
interface WebRuntimeConfig {
  // 页面列表
  pages: string[]
  // 路由配置
  router?: {
    mode?: 'browser' | 'hash'
    baseName?: string
    customRoutes?: Record<string, string>
  }
  // 底部导航栏
  tabBar?: {
    // 这里同时支持微信或支付宝
    items: {
      pagePath: string
      name: string
      text?: string
      icon?: string
      iconPath?: string
      selectedIconPath?: string
      activeIcon?: string
    }[]
  }
}

function shouldEnableFor(
  feature: boolean | string[] | ((pagePath: string) => boolean),
  pagePath: string
): boolean {
  if (feature === true) return true
  if (feature === false) return false

  // 这里传入的 page 为 entryName 和 app.json 中的不一致, 需要去掉后缀名
  const page = pagePath.replace(/\.js$/, '')

  if (Array.isArray(feature)) {
    return feature.includes(page)
  }
  if (typeof feature === 'function') {
    return !!feature(page)
  }

  return false
}

// 生成页面中间产物
function generatePageJSX(
  pagePath: string,
  showBack: boolean | string[] | ((pagePath: string) => boolean) = false,
  showHeader: boolean | string[] | ((pagePath: string) => boolean) = true
): string {
  return `import '${WEB_RUNTIMES.components}';
import '${WEB_RUNTIMES.api}';
import React from 'react';
import EntryPage from '@/${pagePath}';

class Page extends React.Component {
  render() {
    return (
      <tiga-page-host show-back="${shouldEnableFor(
        showBack,
        pagePath
      )}" show-header="${shouldEnableFor(showHeader, pagePath)}">
        <EntryPage />
      </tiga-page-host>
    );
  }
}
export default Page;`
}

// 生成 entry 的入口文件 以及 相关页面文件
function generateMainEntryJSX(
  mainPath: string,
  pages: string[],
  userConfig: WebCompilerUserConfig,
  webRuntimeConfig: WebRuntimeConfig
): string {
  // 生成路由信息
  const routes = pages
    .map((page) => {
      const relativePath = '.' + slash(path.join('/', page))
      return `  { path: '${page}', loader: () => import('${relativePath}') }`
    })
    .join(',\n')

  // 获取响应式配置
  const setResponsiveRootFontSize = (): string => {
    const { responsiveRootFontSize } = userConfig.web || {}
    return responsiveRootFontSize
      ? `Runtime.setRootFontSizeForRem(${responsiveRootFontSize});`
      : ''
  }

  /**
   * 生成 api 扩展代码
   */
  const importExtensions = (): [string, string] => {
    let EXT_COUNT = 0
    if (userConfig.web?.extensions?.length) {
      const imports: string[] = []
      const initializers: string[] = []

      userConfig.web.extensions.forEach((ext) => {
        if (!ext) return
        if (Array.isArray(ext)) {
          const [api, options] = ext
          if (!api) return
          const name = `$API_EXTENSION_${EXT_COUNT++}`
          imports.push(`import ${name} from '${api}'`)
          initializers.push(
            `${name}(${options == null ? '' : JSON.stringify(options)})`
          )
        } else {
          imports.push(`import '${ext}';`)
        }
      })

      return [imports.join('\n'), initializers.join('\n')]
    } else {
      return ['', '']
    }
  }

  const [importApiExtensions, initializeApiExtensions] = importExtensions()

  const lines = [
    `import React from 'react'`,
    `import ReactDOM from 'react-dom'`,
    `import '${WEB_RUNTIMES.components}'`,
    `import '${WEB_RUNTIMES.api}'`,
    `import Runtime from '${WEB_RUNTIMES.runtime}'`,
    `import { createRouter } from '${WEB_RUNTIMES.router}'`
  ]

  // 增加 api 扩展
  if (importApiExtensions) lines.push(importApiExtensions)

  // 引入全局脚本
  if (mainPath) lines.push(`import '@/${mainPath}'`)

  // 引入 api 扩展初始化
  if (initializeApiExtensions) lines.push(initializeApiExtensions)

  // 配置 rem
  lines.push(setResponsiveRootFontSize())

  // 配置路由
  lines.push(`const config = ${JSON.stringify(webRuntimeConfig, null, 2)}`)
  lines.push(`config.routes = [\n${routes}\n]`)
  lines.push(`createRouter(config)`)

  return lines.join(';\n')
}

/**
 * 为路径追加 /
 * @param p - 路径
 */
function addLeadingSlash(p: string): string {
  // http:// 或 https:// 开头的不处理
  if (/^http(s)?:\/\//.test(p)) return p
  return path.posix.resolve('/', p)
}

/**
 * Web 相关 jsx 入口文件生成
 */
export class GenerateJSXEntryPlugin implements Plugin {
  name = 'MorWebGenerateJSXEntryPlugin'
  constructor(public wrapper: WebpackWrapper) {}
  apply(runner: Runner<any>) {
    // GenerateJSXEntryPlugin 因为运行在 userConfigValidated 阶段
    // 所以可以直接用 userConfig 的判断是否开启了支持
    if (this.shouldAutoGenerateEntries(runner)) {
      // 操作 entries 仅保留入口文件
      // 需要区分 bundle 模式 和 default 模式
      // default 模式用于多端组件 web 版本输出
      runner.hooks.afterBuildEntries.tapPromise(
        this.name,
        async (_, helpers) => {
          return await this.generateEntryFiles(runner, helpers)
        }
      )

      this.ignoreEntryFakeFolder(runner.userConfig, this.wrapper)
    }

    // 如关闭自动 entry 生成, 则采用用户配置的 web.entry 字段
    else {
      const entry = runner.userConfig?.web?.entry
      if (entry) {
        runner.hooks.afterBuildEntries.tap(this.name, () => {
          return entry
        })
      } else {
        logger.debug(`已关闭自动生成 entry 功能, 需要自行指定 entry`)
      }
    }
  }

  /**
   * 是否开启了当前插件
   */
  shouldAutoGenerateEntries(runner: Runner) {
    if (runner.userConfig?.web?.autoGenerateEntries) {
      return true
    } else {
      return false
    }
  }

  /**
   * 忽略用于生成 entries 的虚拟目录, 避免 watchpack 错误监听虚拟目录导致二次编译的触发
   */
  ignoreEntryFakeFolder(userConfig: UserConfig, wrapper: WebpackWrapper) {
    // 忽略虚拟的 entry root 文件夹
    const watchOptions = wrapper.chain.get('watchOptions') || {}
    const watchIgnored: string[] = watchOptions.ignored || []
    const entryRoot = slash(generateEntryRoot(userConfig.srcPath))
    const entriesRootIgnore = slash(path.join(entryRoot, '**'))
    if (!watchIgnored.includes(entryRoot)) {
      watchIgnored.push(entryRoot)
    }
    if (!watchIgnored.includes(entriesRootIgnore)) {
      watchIgnored.push(entriesRootIgnore)
    }
    wrapper.chain.watchOptions({ ...watchOptions, ignored: watchIgnored })
  }

  /**
   * 生成 web 需要的 entry 文件
   */
  async generateEntryFiles(
    runner: Runner,
    entryHelpers: EntryBuilderHelpers
  ): Promise<webpack.EntryObject> {
    const wrapper = this.wrapper
    const userConfig = runner.userConfig as WebCompilerUserConfig & {
      compileType: string
      srcPath: string
    }
    const { web, compileType, srcPath } = userConfig

    const webRuntimeConfig: WebRuntimeConfig = { pages: [] }

    // 构建页面
    let pages: string[] = []

    if (compileType === 'miniprogram') {
      const appJson = entryHelpers.appJson || {}
      // 透传Appjson中的配置
      Object.assign(webRuntimeConfig, appJson)

      pages = (appJson.pages || []).map((p: string) => addLeadingSlash(p))

      // 处理分包里面的路径
      const subPackages = appJson.subpackages || appJson.subPackages || []
      if (subPackages.length) {
        subPackages.map((subPackage) => {
          if (subPackage.root && subPackage.pages) {
            ;(subPackage.pages || []).map((page: string) => {
              pages.push(
                addLeadingSlash(slash(path.join(subPackage.root, page)))
              )
            })
          }
        })
      }

      // 设置底部导航栏
      if (appJson.tabBar) {
        // 修复 items 中的路径问题
        if (appJson.tabBar.items) {
          ;(appJson.tabBar as WebRuntimeConfig['tabBar']).items.map((item) => {
            if (item.activeIcon || item.selectedIconPath) {
              item.activeIcon = addLeadingSlash(
                item.activeIcon || item.selectedIconPath
              )
            }
            if (item.icon || item.iconPath) {
              item.icon = addLeadingSlash(item.icon || item.iconPath)
            }
            if (item.pagePath) {
              item.pagePath = addLeadingSlash(item.pagePath)
            }
            if (item.name || item.text) {
              item.name = item.name || item.text
            }
          })
        }

        webRuntimeConfig.tabBar = appJson.tabBar
      }

      // 设置路由配置
      if (appJson.router) webRuntimeConfig.router = appJson.router
    }

    // 插件类型
    // 插件的 publicPages 作为 自定义路由
    else if (compileType === 'plugin') {
      const pluginJson = entryHelpers.pluginJson || {}

      pages = (pluginJson.pages || []).map((p: string) => addLeadingSlash(p))

      const publicPages: Record<string, string> = pluginJson.publicPages || {}
      const customRoutes: Record<string, string> = {}
      for (const name in publicPages) {
        const p = addLeadingSlash(publicPages[name])
        customRoutes[p] = addLeadingSlash(name)
      }

      // 允许通过 plugin.json 配置自定义路由
      webRuntimeConfig.router = pluginJson.router
        ? {
            ...pluginJson.router,
            customRoutes: {
              ...customRoutes,
              ...(pluginJson.router?.customRoutes || {})
            }
          }
        : { customRoutes }
    }

    // 分包类型
    else if (compileType === 'subpackage') {
      const subPackageJson = entryHelpers.subpackageJson || {}

      // 处理分包里面的路径
      if (subPackageJson.root && subPackageJson.pages) {
        ;(subPackageJson.pages || []).map((page: string) => {
          pages.push(
            addLeadingSlash(slash(path.join(subPackageJson.root, page)))
          )
        })
      }

      // 允许通过 subpackage.json 配置自定义路由
      webRuntimeConfig.router = subPackageJson.router || {}
    }

    pages = pages || []

    // 保存页面设置
    webRuntimeConfig.pages = pages

    const entriesRoot = generateEntryRoot(srcPath)
    const mainEntryPath = path.join(entriesRoot, 'app.jsx')

    const appPath = entryHelpers.globalScriptFilePath
      ? slash(path.relative(srcPath, entryHelpers.globalScriptFilePath))
      : ''
    const mainEntryContent = generateMainEntryJSX(
      appPath,
      pages,
      userConfig,
      webRuntimeConfig
    )

    // 保存虚拟文件
    wrapper.fs.mem.mkdirpSync(path.dirname(mainEntryPath))
    wrapper.fs.mem.writeFileSync(mainEntryPath, mainEntryContent)

    // 生成各个页面对应的 jsx 文件
    pages.map((page) => {
      const pagePath = path.join(entriesRoot, `${page}.jsx`)
      const pageContent = generatePageJSX(
        entryHelpers.entries.get(page.slice(1)).entryName,
        web.showBack,
        web.showHeader
      )
      wrapper.fs.mem.mkdirpSync(path.dirname(pagePath))
      wrapper.fs.mem.writeFileSync(pagePath, pageContent)
    })

    return { [MOR_GLOBAL_FILE()]: mainEntryPath }
  }
}
