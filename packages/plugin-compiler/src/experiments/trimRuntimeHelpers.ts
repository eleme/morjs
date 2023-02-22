import {
  fsExtra as fs,
  logger,
  Plugin,
  Runner,
  webpack,
  WebpackWrapper
} from '@morjs/utils'
import path from 'path'
import { CompilerUserConfig, COMPILE_COMMAND_NAME } from '../constants'

export interface ITrimRuntimeHelpersLoaderOptions {
  // 处理 babel helpers 开关
  babelHelpers: boolean
  // 处理 ts helpers 开关
  tsHelpers: boolean
}

/** tslib 相关 **/

const TS_HELPER_PACKAGE_NAME = 'tslib'

// ES 语法引入 tslib
const IMPORT_TSLIB_STR = `import * as tslib from "${TS_HELPER_PACKAGE_NAME}";\n`

// commonjs 语法引入 tslib
const REQUIRE_TSLIB_STR = `var tslib = require("${TS_HELPER_PACKAGE_NAME}");\n`

// tslib 辅助函数名称列表
const TSLIB_HELPERS = [
  'extends',
  'assign',
  'rest',
  'decorate',
  'param',
  'metadata',
  'awaiter',
  'generator',
  'exportStar',
  'values',
  'read',
  'spread',
  'spreadArrays',
  'spreadArray',
  'await',
  'asyncGenerator',
  'asyncDelegator',
  'asyncValues',
  'makeTemplateObject',
  'importStar',
  'importDefault',
  'classPrivateFieldGet',
  'classPrivateFieldSet',
  'createBinding'
]

// 基于 helper 名称生成特征映射
// 如: 'var __assign =': assign
const TSLIB_HELPERS_MAPPERS = {}
TSLIB_HELPERS.forEach(
  (helper) => (TSLIB_HELPERS_MAPPERS[`var __${helper} = `] = helper)
)

// tslib 辅助函数特征
const TSLIB_REGEXP = new RegExp(`var __(${TSLIB_HELPERS.join('|')}) = `, 'g')

/** @babel/runtime 相关 **/

const BABEL_RUNTIME_PACKAGE_NAME = '@babel/runtime'

// ES 语法引入 @babel/runtime
const IMPORT_BABEL_RUNTIME_STR =
  'import NAME from "@babel/runtime/helpers/esm/FILE";\n'

// commonjs 语法引入 @babel/runtime
const REQUIRE_BABEL_RUNTIME_STR =
  'var NAME = require("@babel/runtime/helpers/FILE");\n'

// @babel/runtime 辅助函数名称列表
const BABEL_RUNTIME_HELPERS = [
  'inheritsLoose',
  'initializerDefineProperty',
  'applyDecoratedDescriptor',
  'initializerWarningHelper',
  'arrayLikeToArray',
  'instanceof',
  'arrayWithHoles',
  'interopRequireDefault',
  'arrayWithoutHoles',
  'interopRequireWildcard',
  'assertThisInitialized',
  'isNativeFunction',
  'asyncGeneratorDelegate',
  'isNativeReflectConstruct',
  'asyncIterator',
  'iterableToArray',
  'asyncToGenerator',
  'iterableToArrayLimit',
  'awaitAsyncGenerator',
  'iterableToArrayLimitLoose',
  'classApplyDescriptorDestructureSet',
  'jsx',
  'classApplyDescriptorGet',
  'maybeArrayLike',
  'classApplyDescriptorSet',
  'newArrowCheck',
  'classCallCheck',
  'nonIterableRest',
  'classCheckPrivateStaticAccess',
  'nonIterableSpread',
  'classCheckPrivateStaticFieldDescriptor',
  'objectDestructuringEmpty',
  'classExtractFieldDescriptor',
  'objectSpread',
  'classNameTDZError',
  'objectSpread2',
  'classPrivateFieldDestructureSet',
  'objectWithoutProperties',
  'classPrivateFieldGet',
  'objectWithoutPropertiesLoose',
  'classPrivateFieldLooseBase',
  'possibleConstructorReturn',
  'classPrivateFieldLooseKey',
  'readOnlyError',
  'classPrivateFieldSet',
  'set',
  'classPrivateMethodGet',
  'setPrototypeOf',
  'classPrivateMethodSet',
  'skipFirstGeneratorNext',
  'classStaticPrivateFieldDestructureSet',
  'slicedToArray',
  'classStaticPrivateFieldSpecGet',
  'slicedToArrayLoose',
  'classStaticPrivateFieldSpecSet',
  'superPropBase',
  'classStaticPrivateMethodGet',
  'taggedTemplateLiteral',
  'classStaticPrivateMethodSet',
  'taggedTemplateLiteralLoose',
  'construct',
  'tdz',
  'createClass',
  'temporalRef',
  'createForOfIteratorHelper',
  'temporalUndefined',
  'createForOfIteratorHelperLoose',
  'toArray',
  'createSuper',
  'toConsumableArray',
  'decorate',
  'toPrimitive',
  'defaults',
  'toPropertyKey',
  'defineEnumerableProperties',
  'typeof',
  'defineProperty',
  'unsupportedIterableToArray',
  'wrapAsyncGenerator',
  'extends',
  'wrapNativeSuper',
  'get',
  'wrapRegExp',
  'getPrototypeOf',
  'writeOnlyError',
  'inherits'
]

// @babel/runtime 辅助函数 - 额外清单
// 这里单独拎出来是因为 函数名称不同
const BABEL_RUNTIME_EXTRA_HELPERS = ['AsyncGenerator', 'AwaitValue']

// 基于 helper 名称生成特征映射
// 如: 'function _createClass(': createClass
const BABEL_RUNTIME_HELPERS_MAPPERS = {}
BABEL_RUNTIME_HELPERS.concat(BABEL_RUNTIME_EXTRA_HELPERS).forEach((helper) => {
  const prefix = BABEL_RUNTIME_EXTRA_HELPERS.indexOf(helper) === -1 ? '_' : ''
  BABEL_RUNTIME_HELPERS_MAPPERS[`function ${prefix}${helper}(`] = helper
  BABEL_RUNTIME_HELPERS_MAPPERS[`function ${prefix}${helper} (`] = helper
})

// @babel/runtime 辅助函数特征
const BABEL_RUNTIME_REGEXP = new RegExp(
  `function (${BABEL_RUNTIME_HELPERS.map((h) => '_' + h).join(
    '|'
  )}|${BABEL_RUNTIME_EXTRA_HELPERS.join('|')}) ?\\(`,
  'g'
)

/** 通用变量 **/

// es 模块
const ES_MODULE_REGEXP = /(import|export) /

// commonjs 模块
const COMMONJS_MODULE_REGEXP = /(module.exports|exports.|require\()/

// 左花括号
const OPEN_BRACE = '{'
// 右花括号
const CLOSE_BRACE = '}'
// 左括号
const OPEN_PARENTHESIS = '('
// 右括号
const CLOSE_PARENTHESIS = ')'

// 辅助函数类型
enum HELPER_TYPE {
  TS,
  BABEL
}

// 去除 node_modules 文件中多余的 ts/babel runtime helpers, 并替换为对 tslib 或 @babel/runtime 的引用
// TS 参见: https://github.com/microsoft/TypeScript/blob/main/src/compiler/factory/emitHelpers.ts
// BABEL 参见: https://github.com/babel/babel/blob/main/packages/babel-helpers/src/helpers.ts
export function trimRuntimeHelpers(
  resourcePath: string,
  fileContent: string,
  options: ITrimRuntimeHelpersLoaderOptions
): string {
  // 忽略 tslib 和 @babel/runtime 这两个库
  if (/(@babel.runtime|tslib)(\/|\\)/.test(resourcePath)) return fileContent

  // 忽略已经被 webpack 处理过的文件
  if (/__webpack_require__/.test(fileContent)) return fileContent

  let helperType: HELPER_TYPE

  // 先检查 ts helpers 特征
  let matchResult: string[]

  if (options.tsHelpers) matchResult = fileContent.match(TSLIB_REGEXP)

  if (matchResult) {
    helperType = HELPER_TYPE.TS as HELPER_TYPE
    // 通过 regenerator 处理的，直接跳过 ts 处理
    // 原因是 同样是使用了 __awaiter 方法，替换后会导致报错，具体原因暂时未知，代码看上去一样
    // NOTE: 后续可以考虑调查原因并增加对 regenerator 优化支持
    if (/regeneratorRuntime/.test(fileContent)) matchResult = null
  }

  // 如果不存在，再检查 babel runtime helpers 特征
  if (!matchResult && options.babelHelpers) {
    matchResult = fileContent.match(BABEL_RUNTIME_REGEXP)

    helperType = HELPER_TYPE.BABEL as HELPER_TYPE
  }

  // 如果未命中任何 helpers 类型，则直接返回
  if (!matchResult) return fileContent

  // 去重，如果出现多个同名函数，仅处理第一个
  // 类似于 _typeof 函数，会存在函数内重名
  matchResult = Array.from(new Set(matchResult))

  // babel 的替换反过来处理
  // 原因为: babel 的引用均插入到代码头部
  if (helperType === HELPER_TYPE.BABEL) matchResult = matchResult.reverse()

  // 判断是否为 es module
  const isESModule =
    ES_MODULE_REGEXP.test(fileContent) &&
    !COMMONJS_MODULE_REGEXP.test(fileContent)

  // 选择 mappers
  const MAPPERS =
    helperType === HELPER_TYPE.TS
      ? TSLIB_HELPERS_MAPPERS
      : BABEL_RUNTIME_HELPERS_MAPPERS

  // ts helper 使用 ; 作为结尾
  // babel runtime helper 使用 } 作为结尾
  const END_CHAR = helperType === HELPER_TYPE.TS ? ';' : ''

  // babel 特征中已包含 OPEN_PARENTHESIS
  const DEFAULT_PARENTHESIS_PAIR_COUNT = helperType === HELPER_TYPE.TS ? 0 : 1

  // 遍历匹配到的 helper 方法
  matchResult.forEach((matcher) => {
    const name = MAPPERS[matcher]

    // 获取起始字符串遍历位置
    let startIndex = fileContent.indexOf(matcher)

    // 花括号成对数量
    let bracePairCount = 0
    // 括号成对数量
    let parenthesisPairCount = DEFAULT_PARENTHESIS_PAIR_COUNT

    // 兜底判断，万一这里没检查到特征起始位置，则跳过
    if (startIndex === -1) return

    startIndex += matcher.length

    // 辅助函数结束位置
    let endIndex = startIndex

    let char = fileContent.charAt(endIndex)

    // 判断函数起始点, 条件为第一个 { 左花括号出现
    while (bracePairCount === 0 && endIndex <= fileContent.length) {
      if (char === OPEN_PARENTHESIS) parenthesisPairCount++
      if (char === CLOSE_PARENTHESIS) parenthesisPairCount--
      if (char === OPEN_BRACE) bracePairCount = 1

      endIndex++

      char = fileContent.charAt(endIndex)
    }

    // 获取整个辅助函数的长度
    // 结束条件为:
    //   1. bracePairCount 和 parenthesisPairCount 均为 0
    //   2. TS 辅助函数最后一个字符为 ;
    //   3. BABEL 辅助函数最后一个字符为 }
    // 需要充分考虑 代码的完整闭合性
    while (
      (bracePairCount > 0 ||
        parenthesisPairCount > 0 ||
        (END_CHAR && char !== END_CHAR)) &&
      endIndex <= fileContent.length
    ) {
      if (char === OPEN_PARENTHESIS) parenthesisPairCount++
      if (char === CLOSE_PARENTHESIS) parenthesisPairCount--
      if (char === OPEN_BRACE) bracePairCount++
      if (char === CLOSE_BRACE) bracePairCount--

      endIndex++

      char = fileContent.charAt(endIndex)
    }

    // 兜底：如果两者不为零，即 出现了 负数，则说明检查逻辑错误，跳过后续替换逻辑
    if (bracePairCount !== 0 || parenthesisPairCount !== 0) return

    // 替换 helper 方法为 tslib 的引用
    if (helperType === HELPER_TYPE.TS) {
      fileContent = fileContent.replace(
        fileContent.slice(startIndex, endIndex),
        `tslib["__${name}"]`
      )
    }
    // 替换 helper 方法为 @babel/runtime 的引用
    // 需要区分 es module 和 commonjs 的情况
    else {
      // babel 需要将 matcher 部分也替换掉
      startIndex = startIndex - matcher.length

      // 判断名称是否需要前缀
      const varName =
        BABEL_RUNTIME_EXTRA_HELPERS.indexOf(name) === -1 ? '_' + name : name

      const replaceStr = isESModule
        ? IMPORT_BABEL_RUNTIME_STR.replace('NAME', varName).replace(
            'FILE',
            name
          )
        : REQUIRE_BABEL_RUNTIME_STR.replace('NAME', varName).replace(
            'FILE',
            name
          )

      // babel 的引用全部放入文件顶部
      // 原因为替换的是 function, 考虑到作用域的情况，放在顶部最为稳妥
      fileContent =
        replaceStr +
        fileContent.replace(fileContent.slice(startIndex, endIndex), '')
    }
  })

  // 文件头部注入 tslib 引用, 仅需一次
  if (helperType === HELPER_TYPE.TS) {
    fileContent =
      (isESModule ? IMPORT_TSLIB_STR : REQUIRE_TSLIB_STR) + fileContent
  }

  return fileContent
}

// loader 支持
export default function trimRuntimeHelpersLoader(
  this: webpack.LoaderContext<ITrimRuntimeHelpersLoaderOptions>,
  fileContent: string
) {
  const options = this.getOptions()
  const resourcePath = this.resourcePath

  return trimRuntimeHelpers(resourcePath, fileContent, options)
}

// mor 插件支持
export class TrimRuntimeHelperPlugin implements Plugin {
  name = 'MorTrimRuntimeHelperPlugin'
  webpackWrapper: WebpackWrapper
  apply(runner: Runner) {
    runner.hooks.webpackWrapper.tap(this.name, (webpackWrapper) => {
      this.webpackWrapper = webpackWrapper
    })

    runner.hooks.beforeRun.tapPromise(this.name, async () => {
      const cwd = runner.config.cwd

      // 非 compile 命令 跳过
      if (runner.commandName !== COMPILE_COMMAND_NAME) return

      // 如果未开启，则直接跳过
      const userConfig = runner.userConfig as CompilerUserConfig
      if (!userConfig?.experiments?.autoTrimRuntimeHelpers) return

      const config = runner.config
      const chain = this.webpackWrapper.chain
      const packageJson = (config.pkg || {}) as Record<string, any>

      logger.warn(
        '已开启实验特性: autoTrimRuntimeHelpers - 自动裁剪冗余的运行时辅助函数'
      )

      // 判断是否有 babel runtime
      const babelHelpers = !!(
        packageJson.dependencies?.[BABEL_RUNTIME_PACKAGE_NAME] ||
        packageJson.devDependencies?.[BABEL_RUNTIME_PACKAGE_NAME] ||
        (await fs.pathExists(
          path.resolve(cwd, `node_modules/${BABEL_RUNTIME_PACKAGE_NAME}`)
        ))
      )

      // 判断是否有 tslib
      const tsHelpers = !!(
        packageJson.dependencies?.[TS_HELPER_PACKAGE_NAME] ||
        packageJson.devDependencies?.[TS_HELPER_PACKAGE_NAME] ||
        (await fs.pathExists(
          path.resolve(cwd, `node_modules/${TS_HELPER_PACKAGE_NAME}`)
        ))
      )

      if (!babelHelpers) {
        logger.warn(
          `缺少 ${BABEL_RUNTIME_PACKAGE_NAME} 依赖, ` +
            `将忽略 ${BABEL_RUNTIME_PACKAGE_NAME} 相关辅助函数裁剪`,
          { color: true }
        )
      }

      if (!tsHelpers) {
        logger.warn(
          `缺少 ${TS_HELPER_PACKAGE_NAME} 依赖, ` +
            `将忽略 ${TS_HELPER_PACKAGE_NAME} 相关辅助函数裁剪`,
          { color: true }
        )
      }

      const ruleName = 'trimRuntimeHelpers'

      // 添加 webpack 配置
      // prettier-ignore
      chain.module
        .rule(ruleName)
          .test(/\.js$/)
          .include.add(/\/node_modules\//).end()
          .use(ruleName).loader(__filename).options({
            babelHelpers,
            // 兼容 importHelpers 设置
            tsHelpers: userConfig?.compilerOptions?.importHelpers && tsHelpers
          })
    })
  }
}
