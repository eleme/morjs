import {
  EntryFileType,
  EntryType,
  FileParserOptions,
  hexToRgb,
  isLightColor,
  lodash as _,
  logger,
  Plugin,
  Runner,
  SourceTypes
} from '@morjs/utils'
import path from 'path'
import { isSimilarTarget } from '../constants'

/**
 * 转换配置定义
 */
interface TransformRules {
  [name: string]:
    | string
    | {
        /**
         * 转换后的配置名称
         */
        to: string
        /**
         * @param val - 需要转换的配置值
         * @param config - 转换后的配置映射（包含转换前的内容）
         * @param options - 文件解析选项
         * @returns 转换后的配置
         */
        fn?: (val: any, config: any, options: FileParserOptions) => any
      }
}

/**
 * 转换 配置 函数
 */
function transform(
  config: Record<string, any>,
  rules: TransformRules,
  options: FileParserOptions
): Record<string, any> {
  const props = Object.keys(config)
  const next = { ...config }

  // 遍历配置并转换, 配置中如已有转换之后的值, 则优先使用用户配置的值
  for (const prop of props) {
    if (prop in rules) {
      const originValue = config[prop]
      const propRule = rules[prop]

      // propRule 为 字符串代表直接重命名
      if (typeof propRule === 'string') {
        next[propRule] = next[propRule] == null ? originValue : next[propRule]
        if (prop !== propRule) delete next[prop]
      }
      // propRule 中的 to 为字符串时
      // fn 的结果直接覆盖新的属性
      else if (typeof propRule.to === 'string') {
        next[propRule.to] = propRule.fn(originValue, next, options)
        if (prop !== propRule.to) delete next[prop]
      }
      // propRule 中的 to 不存在时
      // fn 返回对象
      else {
        const record = propRule.fn(originValue, next, options)
        for (const k in record) {
          next[k] = next[k] == null ? record[k] : next[k]
        }
        if (!(prop in record)) delete next[prop]
      }
    }
  }

  return next
}

/**
 * ================================
 * 以下为 支付宝转其他小程序配置映射 👇🏻
 * ================================
 */
const WINDOW_RULES_TO_OTHER = {
  defaultTitle: 'navigationBarTitleText',
  transparentTitle: {
    to: null,
    fn: (value: string, config, options): Record<string, any> => {
      // 针对字节转端单独适配
      if (options?.userConfig?.target === 'bytedance') {
        return {
          navigationStyle: config?.navigationStyle || 'default',
          transparentTitle: value
        }
      }
      // 其他端统一转换为 navigationStyle
      else {
        if (value === 'none') {
          return { navigationStyle: 'default' }
        }
        return { navigationStyle: 'custom' }
      }
    }
  },
  pageScroll: {
    to: 'disableScroll',
    fn(val: boolean): boolean {
      return !val
    }
  },
  pullRefresh: {
    to: 'enablePullDownRefresh',
    fn(val: boolean, config, options): boolean {
      if (val && config.allowsBounceVertical === 'NO') {
        logger.warn(
          '支付宝小程序中，如果在页面对应的 .json 配置文件中配置了 pullRefresh 为 true，' +
            '则需要同时在 app.json 的 window 选项中配置 allowsBounceVertical 为 YES，' +
            '才可开启页面下拉刷新事件。\n' +
            `文件地址: ${options.fileInfo.path}`
        )
      }
      // 去除无用的配置项
      delete config.allowsBounceVertical
      return val
    }
  },
  titleBarColor: {
    to: null,
    fn(val: string, config): Record<string, any> {
      let navigationBarTextStyle = config.navigationBarTextStyle || ''

      if (!navigationBarTextStyle) {
        const rgb = hexToRgb(val)
        if (rgb) {
          navigationBarTextStyle = isLightColor(rgb.r, rgb.g, rgb.b)
            ? 'black'
            : 'white'
        }
      }

      // 移除支付宝的配置
      // 原因: 字节未在文档中标明支持该配置, 但缺会生效，所以这里转换后直接移除
      delete config.titleBarColor

      return {
        navigationBarBackgroundColor: val,
        navigationBarTextStyle
      }
    }
  }
} as TransformRules

const TAB_BAR_ITEM_RULES_TO_OTHER = {
  pagePath: 'pagePath',
  name: 'text',
  icon: 'iconPath',
  activeIcon: 'selectedIconPath'
} as TransformRules

const TAB_BAR_RULES_TO_OTHER = {
  textColor: 'color',
  items: {
    to: 'list',
    fn(items, config, options): Record<string, any>[] {
      return items.map((item: Record<string, any>) =>
        transform(item, TAB_BAR_ITEM_RULES_TO_OTHER, options)
      )
    }
  }
} as TransformRules

const APP_RULES_TO_OTHER = {
  subPackages: 'subPackages',
  window: {
    to: 'window',
    fn(window, config, options): Record<string, any> {
      return transform(window, WINDOW_RULES_TO_OTHER, options)
    }
  },
  tabBar: {
    to: 'tabBar',
    fn(tabBar, config, options): Record<string, any> {
      return transform(tabBar, TAB_BAR_RULES_TO_OTHER, options)
    }
  }
} as TransformRules

const PAGE_RULES_TO_OTHER = {
  ...WINDOW_RULES_TO_OTHER
} as TransformRules

/**
 * ================================
 * 以上 为 支付宝转其他小程序配置映射 👆🏻
 * ================================
 */

/**
 * ================================
 * 以下为 其他小程序转支付宝配置映射 👇🏻
 * ================================
 */
const WINDOW_RULES_TO_ALIPAY = {
  navigationBarTitleText: 'defaultTitle',
  navigationStyle: {
    to: 'transparentTitle',
    fn: (value: string, config): string => {
      if (value === 'custom') {
        config.titlePenetrate = 'YES'
        return 'always'
      }
      return 'none'
    }
  },
  enablePullDownRefresh: {
    to: 'pullRefresh',
    fn(val: boolean, config): boolean {
      config.allowsBounceVertical = 'YES'
      return val
    }
  },
  navigationBarBackgroundColor: 'titleBarColor',
  navigationBarTextStyle: {
    to: null,
    fn(val: string, config): Record<string, any> {
      delete config.navigationBarTextStyle
      return {}
    }
  }
} as TransformRules

const TAB_BAR_ITEM_RULES_TO_ALIPAY = {
  pagePath: 'pagePath',
  text: 'name',
  iconPath: 'icon',
  selectedIconPath: 'activeIcon'
} as TransformRules

const TAB_BAR_RULES_TO_ALIPAY = {
  color: 'textColor',
  list: {
    to: 'items',
    fn(items, config, options): Record<string, any>[] {
      return items.map((item) =>
        transform(item, TAB_BAR_ITEM_RULES_TO_ALIPAY, options)
      )
    }
  }
} as TransformRules

const APP_RULES_TO_ALIPAY = {
  subPackages: 'subPackages',
  window: {
    to: 'window',
    fn(window, config, options): Record<string, any> {
      return transform(window, WINDOW_RULES_TO_ALIPAY, options)
    }
  },
  tabBar: {
    to: 'tabBar',
    fn(tabBar, config, options): Record<string, any> {
      return transform(tabBar, TAB_BAR_RULES_TO_ALIPAY, options)
    }
  }
} as TransformRules

const PAGE_RULES_TO_ALIPAY = {
  ...WINDOW_RULES_TO_ALIPAY
} as TransformRules

/**
 * ================================
 * 以上 为 其他小程序转支付宝配置映射 👆🏻
 * ================================
 */

/**
 * 多端编译的配置解析和转换
 * 这里仅提供通用的处理, 端的差异由编译插件来解决
 */
export default class AlipayCompilerConfigParserPlugin implements Plugin {
  name = 'AlipayCompilerConfigParserPlugin'

  runner: Runner

  apply(runner: Runner) {
    runner.hooks.beforeRun.tap(this.name, () => {
      this.runner = runner

      const { sourceType, target } = this.runner.userConfig

      const isAlipaySource = sourceType === SourceTypes.alipay
      const isAlipaySimilarTarget = isSimilarTarget(target)

      // 如果源码和目标是同一个 则无需转换
      if (sourceType === target) return

      // 如果源码类型为 支付宝小程序 且 目标平台为支付宝小程序类似平台 则无需转换
      if (isAlipaySource && isAlipaySimilarTarget) return

      // 仅 微信DSL 转 支付宝或类似平台需要转换
      if (!isAlipaySource && !isAlipaySimilarTarget) return

      this.runner.hooks.configParser.tapPromise(
        this.name,
        async (config, options) => {
          // 支付宝不支持大写的标签名，这里统一转换为小写
          if (isAlipaySimilarTarget && config.usingComponents) {
            for (const componentName in config.usingComponents || {}) {
              const newComponentName = componentName.toLowerCase()
              if (newComponentName !== componentName) {
                config.usingComponents[newComponentName] =
                  config.usingComponents[componentName]
                delete config.usingComponents[componentName]
              }
            }
          }

          // 支付宝不支持 subpackages，仅支持 subPackages
          if (
            isAlipaySimilarTarget &&
            config.subpackages &&
            !config.subPackages
          ) {
            config.subPackages = config.subpackages
          }

          // plugin.json 转换
          config = this.transformPluginJson(config, options)

          // app 或 page 配置转换
          config = this.transformAppAndPageJson(config, options)

          // 非阿里系小程序转支付宝小程序需要开启 component2 和 enableAppxNg
          // 原因: 部分运行时接口抹平方式依赖上述两个功能开关
          if (
            !isAlipaySource &&
            isAlipaySimilarTarget &&
            options.fileInfo.entryType === EntryType.project
          ) {
            if (!config.component2 || !config.enableAppxNg) {
              config.component2 = true
              config.enableAppxNg = true

              const fileName = path.basename(options.fileInfo.path)

              logger.warnOnce(
                `需要开启支付宝小程序的 \`component2\` 和 \`enableAppxNg\` 支持\n` +
                  `已在文件 ${fileName} 中自动开启`
              )
            }
          }

          return config
        }
      )
    })
  }

  /**
   * 转换 plugin.json 文件
   */
  transformPluginJson(
    config: Record<string, any>,
    options: FileParserOptions
  ): Record<string, any> {
    const { target } = this.runner.userConfig
    // 插件配置修改
    // 除 支付宝之外的其他平台都和微信一样
    // pages 都是对象
    if (
      options.fileInfo.entryFileType === EntryFileType.config &&
      options.fileInfo.entryType === EntryType.plugin
    ) {
      const isAlipayLike = isSimilarTarget(target)

      // 如果是支付宝
      if (isAlipayLike) {
        config.publicPages = config.pages
        config.pages = Object.values(config.publicPages)
      }
      // 如果不是 支付宝
      else {
        const pages = config.publicPages

        // 删除
        delete config.publicPages

        if (_.isPlainObject(config.pages)) {
          return config
        } else {
          if (pages) config.pages = pages
        }
      }
    }

    return config
  }

  /**
   * 转换 app.json 和 页面的 json 文件
   */
  transformAppAndPageJson(
    config: Record<string, any>,
    options: FileParserOptions
  ): Record<string, any> {
    const isAlipayToOther = options.userConfig.sourceType === SourceTypes.alipay

    if (options.fileInfo.entryFileType === EntryFileType.config) {
      if (options.fileInfo.entryType === EntryType.app) {
        return transform(
          config,
          isAlipayToOther ? APP_RULES_TO_OTHER : APP_RULES_TO_ALIPAY,
          options
        )
      } else if (options.fileInfo.entryType === EntryType.page) {
        return transform(
          config,
          isAlipayToOther ? PAGE_RULES_TO_OTHER : PAGE_RULES_TO_ALIPAY,
          options
        )
      }
    }

    return config
  }
}
