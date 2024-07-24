import path from 'path'
import postcss from 'postcss'
import atImport from 'postcss-import-sync'
import { defCondition, isEndIf, isIfDef } from '../../utils/comment'
import { getExternalComponent, isEnableStyleScope } from '../../utils/index'
import { globalComponentName, randomHash } from '../option'
import { AcssOptions } from './options'

const DefualtRpxRootValue = 32
const DefaultRpx2PxRatio = 2

export default function (source: string, options: AcssOptions) {
  const plugins = [
    // rpx - rem
    ComponentNameMapPlugin(options),
    ConditionalCompilatioPlugin(options),
    ...(options.plugins || []).map((i: string | Array<any>) => {
      if (i instanceof Array) {
        return require(i[0])(i.length > 1 ? i[1] : {})
      } else {
        return require(i)()
      }
    })
  ]
  const { syntax } = options
  const config: any = {}

  if (options.usePx) {
    plugins.push(
      require('../../webpack/plugins/postcss-rpx2px')({
        ratio: options.usePx.ratio || DefaultRpx2PxRatio
      })
    )
  } else if (options.needRpx !== false) {
    plugins.push(
      require('../../webpack/plugins/postcss-rpx2rem/index')({
        rootValue: options.rpxRootValue || DefualtRpxRootValue,
        propList: ['*']
      })
    )
  }

  if (options.enableCombineImportStyles) {
    plugins.unshift(
      PostcssStylePathPlugin({ path: options.resourcePath }),
      atImport()
    )
  }

  if (syntax && typeof syntax === 'object') {
    config.syntax = syntax
  }

  if (
    isEnableStyleScope(options) &&
    options.resourcePath !== `${options.rootPath}/app.acss`
  ) {
    // 样式隔离
    plugins.push(
      classScopePlugin({
        hash: randomHash(options),
        isComponent: options.config && options.config.component
      })
    )
  }
  return postcss(plugins).process(source, config).toString()
}

export function rpxtorem(csstext: string, options: AcssOptions) {
  if (options.usePx) {
    return postcss([
      require('../../webpack/plugins/postcss-rpx2px')({
        ratio: options.usePx.ratio || DefaultRpx2PxRatio
      })
    ])
      .process(csstext)
      .toString()
  } else {
    return postcss([
      require('../../webpack/plugins/postcss-rpx2rem/index')({
        rootValue: options.rpxRootValue || DefualtRpxRootValue,
        propList: ['*']
      })
    ])
      .process(csstext)
      .toString()
  }
}

interface ClassScopeOptions {
  hash: string
  isComponent: boolean
}

// 样式隔离插件
const classScopePlugin = postcss.plugin(
  'class-scope-plugin',
  function (opts: ClassScopeOptions) {
    return function (root) {
      root.nodes.forEach((rule) => {
        if (rule.type === 'rule') {
          rule.selector = addScope(rule.selector, opts.hash, opts.isComponent)
        }
      })
    }
  }
)

function addScope(selector: string, hash: string, isComponent?: boolean) {
  if (selector.indexOf(hash) >= 0) return selector
  // 仅针对非组件做变动处理
  if (!isComponent) return `.${hash} ${selector}`

  const index = selector.indexOf(':')
  if (index >= 0) {
    // 对于 :after :before 这样的样式需要做特殊处理
    return selector.replace(':', `.${hash}:`)
  }
  return `${selector}.${hash}`
}

const ComponentNameMapPlugin = postcss.plugin(
  'global-component-name-plugin',
  function (options: AcssOptions) {
    return function (root) {
      root.walkRules((rule) => {
        rule.selector = rule.selector
          .split(' ')
          .map((s) => {
            return s
              .split(',')
              .map((s) => {
                return mapComponentName(s.trim(), options)
              })
              .join(',')
          })
          .join(' ')
      })
    }
  }
)

interface PostcssStylePathOptions {
  path: string
}
const PostcssStylePathPlugin = postcss.plugin(
  'postcss-style-path-plugin',
  function (options: PostcssStylePathOptions) {
    return function (root) {
      root.nodes.forEach((rule) => {
        if (rule.type === 'atrule') {
          const dirname = path.dirname(options.path)
          return (rule.params = path.resolve(dirname, JSON.parse(rule.params)))
        }
      })
    }
  }
)

function mapComponentName(selector, options: AcssOptions) {
  const arr = selector.split(':')
  const name = arr[0]
  const externalComponent = getExternalComponent(options, name)
  // 扩展组件不使用自定义tag(tiga-xx)
  if (!externalComponent) {
    const globalName = globalComponentName(name, options)
    if (globalName) {
      arr[0] = globalName
    }
  }

  return arr.join(':')
}

const ConditionalCompilatioPlugin = postcss.plugin(
  'conditional-compilatio-plugin',
  function (options: AcssOptions) {
    return function (root) {
      root.walkComments((comment) => {
        skipConditionalCompilation(comment, options)
        comment.remove()
      })
    }
  }
)

function skipConditionalCompilation(
  comment: postcss.Comment,
  options: AcssOptions
) {
  if (isIfDef(comment.text)) {
    const conditional = defCondition(comment.text).toLowerCase()

    if (conditional !== options.platform) {
      const removeItems = []
      let startRemove = false
      for (const el of comment.parent.nodes) {
        if (el.type === 'comment') {
          if (el === comment) {
            startRemove = true
            continue
          } else if (isEndIf(el.text)) {
            startRemove = false
            break
          }
        } else {
          if (startRemove) {
            removeItems.push(el)
          }
        }
      }
      // 删除 不符合条件编译 的 节点
      removeItems.forEach((el) => el.remove())
    }
  }
}
