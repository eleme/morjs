import {
  babelCore as babel,
  babelGenerator as generate,
  babelTypes as t,
  resolveDependency
} from '@morjs/utils'
import path from 'path'
import { WEB_RUNTIMES } from '../../../../constants'
import {
  getAppCssResourceName,
  getCssResourcePath
} from '../../../utils/file-utils'
import { getExternalComponent } from '../../../utils/index'
import { isGlobalComponent } from '../../option'
import {
  blockNode,
  CommentNode,
  Document,
  elementNode,
  ElementNode,
  FragmentNode,
  importNode,
  isFragmentNode
} from '../ast/types'
import { takeObjectExpresionValueNames } from '../babel-helper'
import { AXMLOptions } from '../options'
import traverse, { ITraverNode } from '../traverse'
import Config from './config-default'
import Context from './context'
import transformElement from './elements'
import { skipConditionalCompilation } from './elements/CommentNode'
import {
  convertComponentName,
  getComponentName,
  hashTemplateName
} from './utils'

interface LocalDocument extends Document {
  protectIdentifyNames: string[] // 受保护的变量名称，不会被变量提取。
  isComplexComponents: boolean // 是否是复杂节点。
}

function isComponent(options: AXMLOptions) {
  return options.config && options.config.component
}

function clearLoadableComponents() {
  loadableComponents = []
}

export let loadableComponents = []

export default function (document: Document, options: AXMLOptions) {
  const protectIdentifyNames = [...Config.GlobalIdentifyNames]
  document.imports
    .filter((i) => i.name)
    .forEach((i) => {
      const valueNames = takeObjectExpresionValueNames(i.name)
      if (valueNames && valueNames.length > 0) {
        protectIdentifyNames.push(...valueNames)
      } else {
        protectIdentifyNames.push(i.name)
      }
    })

  const doc: LocalDocument = {
    ...document,
    protectIdentifyNames,
    isComplexComponents: false
  }
  /**
   * NOTE: 先处理组件名称的引用
   */
  generateComponentImport(doc, options)

  const ast = t.program([], [], 'module')

  // 添加 react  引用
  ast.body.push(
    t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier('React'))],
      t.stringLiteral('react')
    )
  )
  // 添加 tiga runtime 引用
  ast.body.push(
    t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier('$rm'))],
      t.stringLiteral(WEB_RUNTIMES.runtime)
    )
  )
  // 添加 import
  doc.imports
    .filter((i) => i.name && i.from)
    .forEach((i) => {
      ast.body.push(
        t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier(i.name))],
          t.stringLiteral(i.from)
        )
      )
    })

  // NOTE: 暂时去掉这个逻辑, web 组件需要有一定的运行环境
  // 如果是 cli 编译，那么自动引入components库
  // if (options.isAtomicMode) {
  //   ast.body.splice(
  //     0,
  //     0,
  //     t.importDeclaration([], t.stringLiteral(WEB_RUNTIMES.components))
  //   )
  // }

  // 页面的处理逻辑
  if (!isComponent(options)) {
    // NOTE: 一定要确保样式的引用是在最后的引入
    // 2. 添加css 样式文件
    if (options.hasAppStyle) {
      const importStyle = `@/${getAppCssResourceName(options)}`
      // 只有page 才会引入 app.acss
      if (options.isAtomicMode) {
        ast.body.push(
          t.importDeclaration(
            [],
            t.stringLiteral(
              importStyle.endsWith('.css') ? importStyle : `${importStyle}.css`
            )
          )
        )
      } else {
        ast.body.push(t.importDeclaration([], t.stringLiteral(importStyle)))
      }
    }
  }

  // 添加当前文件对应的样式文件引入
  if (options.hasStyleFile) {
    const importStyle = getCssResourcePath(options)
    if (options.isAtomicMode) {
      ast.body.push(
        t.importDeclaration(
          [],
          t.stringLiteral(
            importStyle.endsWith('.css') ? importStyle : `${importStyle}.css`
          )
        )
      )
    } else {
      ast.body.push(t.importDeclaration([], t.stringLiteral(importStyle)))
    }
  }

  addLineFeed(ast.body)

  clearLoadableComponents()
  // NOTE: 添加模板
  ast.body.push(...buildTemplates(doc, options))

  // 添加defualt 导出
  addLineFeed(ast.body)

  ast.body.push(
    t.exportNamedDeclaration(
      buildFragment(
        options,
        doc.fragment,
        doc,
        'defaultRender',
        !isComponent(options)
      )
    )
  )
  t.addComment(ast.body[ast.body.length - 1], 'leading', '添加渲染函数', true)

  ast.body.push(
    t.exportNamedDeclaration(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('isComplexComponents'),
          t.booleanLiteral(doc.isComplexComponents)
        )
      ]),
      []
    )
  )

  // 组件按需加载
  loadableComponents.forEach((key: string) => {
    const componentPath = getExternalComponent(options, key)
    if (componentPath) {
      ast.body.splice(
        3,
        0,
        t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier(getComponentName(key)))],
          t.stringLiteral(componentPath)
        )
      )
    } else {
      ast.body.splice(
        3,
        0,
        t.importDeclaration(
          [],
          t.stringLiteral(`${WEB_RUNTIMES.components}/src/loadable/${key}`)
        )
      )
    }
  })

  const result = generate.default(ast)
  if (options.isAtomicMode && !options.unitTest) {
    return babel.transformSync(result.code, {
      presets: [require(resolveDependency('@babel/preset-react'))]
    }).code
  }
  return result.code
}

/**
 * 编一个代码片段(runtime 函数)
 * @param fragment
 */
function buildFragment(
  options: AXMLOptions,
  fragment: FragmentNode,
  doc: LocalDocument,
  functionName?: string,
  isPage: boolean = false
) {
  const context = new Context(options)
  let body = fragment.body
  if (isPage) {
    body = [elementNode('tiga-page', '', [], body)]
  }

  let ast
  if (body.length === 0) {
    ast = t.booleanLiteral(false)
  } else if (body.length === 1) {
    ast = transformElement(body[0], context)

    const { type, name } = body[0] as any
    if (
      type === 'SlotNode' ||
      type === 'BlockNode' ||
      !isGlobalComponent(name, options)
    ) {
      doc.isComplexComponents = true
    }
  } else {
    const block = blockNode(body)
    ast = transformElement(block, context)
    doc.isComplexComponents = true
  }
  if (t.isJSXExpressionContainer(ast)) {
    ast = ast.expression
    doc.isComplexComponents = true
  } else if (t.isJSXText(ast)) {
    ast = t.stringLiteral(ast.value)
  }

  const vars = []
  context.dataBindingVars.forEach((v) => {
    if (Config.DSLProtectIdenfifyName.indexOf(v) > -1) {
      throw new Error(`变量名 ${v} 为保留变量名，请不要在AXML中使用`)
    }
    if (doc.protectIdentifyNames.indexOf(v) === -1) {
      vars.push(v)
    }
  })

  const statements = []
  if (vars.length > 0) {
    statements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.objectPattern(
            vars.map((item) =>
              t.objectProperty(
                t.identifier(item),
                t.identifier(item),
                false,
                true
              )
            )
          ),
          t.identifier('$data')
        )
      ])
    )
  }
  statements.push(t.returnStatement(ast))
  return t.functionDeclaration(
    functionName ? t.identifier(functionName) : null,
    [t.identifier('$data')],
    t.blockStatement(statements)
  )
}

/**
 * 编译模板
 * @param doc
 */
function buildTemplates(doc: Document, options: AXMLOptions) {
  const body = []
  // 添加 模板的导出
  body.push(
    t.exportNamedDeclaration(
      t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier('$templates'), t.objectExpression([]))
      ]),
      []
    )
  )

  // 过滤需要引入的模版
  const templateImports = doc.imports.filter((item) => item.src)

  // 如果没有引入模版, 则不执行后续代码生成
  if (!templateImports?.length && !doc.templates.length) return body

  // 创建模板管理器
  addLineFeed(body)
  body.push(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('$tm'),
        t.callExpression(
          t.memberExpression(
            t.identifier('$rm'),
            t.identifier('createTemplateManager')
          ),
          []
        )
      )
    ])
  )
  // 添加注释
  t.addComment(body[body.length - 1], 'leading', '创建模板管理器', true)

  // runtime api
  body.push(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('runtime'),
        t.callExpression(
          t.memberExpression(t.identifier('$rm'), t.identifier('axmlApi')),
          [t.identifier('$tm')]
        )
      )
    ])
  )
  // 添加注释
  t.addComment(body[body.length - 1], 'leading', '创建 runtime api', true)
  addLineFeed(body)

  // 创建模板
  if (doc.templates.length > 0) {
    doc.templates.forEach((template) => {
      const tName = `template${hashTemplateName(template.name)}`
      body.push(
        buildFragment(options, template.fragment, doc as LocalDocument, tName)
      )
      t.addComment(body[body.length - 1], 'leading', '创建模板:' + tName, true)
      body.push(
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(
              t.identifier('$templates'),
              t.stringLiteral(tName),
              true
            ),
            t.identifier(tName)
          )
        )
      )
    })

    // 将当前文件定义的模板加入模板管理器
    body.push(
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier('$tm'), t.identifier('addAll')),
          [t.identifier('$templates')]
        )
      )
    )
    t.addComment(
      body[body.length - 1],
      'leading',
      '将当前文件定义的模板加入模板管理器',
      true
    )
  }

  // 引入其他文件中的模板

  templateImports.forEach((item) => {
    body.push(
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier('$tm'), t.identifier('addAll')),
          [
            t.memberExpression(
              t.callExpression(t.identifier('require'), [
                t.stringLiteral(item.src)
              ]),
              t.identifier('$templates')
            )
          ]
        )
      )
    )

    t.addComment(
      body[body.length - 1],
      'leading',
      '引入其他文件的模板：' + item.src,
      true
    )
  })

  return body
}

/**
 * 添加换行
 * @param body
 */
function addLineFeed(body: any[]) {
  body.push(t.jsxText('\r'))
}

/**
 * 生成组件引用的代码
 */
function generateComponentImport(doc: Document, options: AXMLOptions) {
  // NOTE: 第一步，先把 app.json 中的组件路径转换成当前编译文件的相对路径
  // 先读取app 中的 usingComponents
  const appUsingComponents = { ...options.appConfig.usingComponents }
  // 转换app.json 中路径
  Object.keys(appUsingComponents).forEach((key) => {
    if (key.indexOf('.') >= 0) {
      throw new Error(
        'usingComponents 的 key，不支持 "." \n' + options.resourcePath
      )
    }
    const value = appUsingComponents[key]
    if (value.startsWith('.')) {
      //將相對路徑轉換成絕對路徑
      const abPath = path.resolve(options.rootPath, value)
      appUsingComponents[key] = abPath.replace(options.rootPath, '')
    }
  })
  // Step2:  合并 UsingComponents

  const UsingComponents = Object.assign(
    appUsingComponents,
    options.config && options.config.usingComponents
  )
  for (const key in UsingComponents) {
    const value = UsingComponents[key]
    if (value[0] === '/') {
      // 将项目的绝对路径，转换成，实际的本地绝对路径
      UsingComponents[key] = `@${value}`
    }
  }
  const usedComponents = {}
  // 引入到axml中的文件可以直接忽略key
  const importKeys = doc.imports.map((i) => i.name).filter((i) => i)
  // 先进行ast 遍历。
  traverse(doc, {
    ElementNode(_: ITraverNode) {
      const node = _.node as ElementNode
      // 针对节点名称，进行节点转换。
      if (
        node.name in UsingComponents &&
        importKeys.indexOf(node.name) === -1
      ) {
        const name = convertComponentName(node.name)
        usedComponents[name] = UsingComponents[node.name]
        node.name = name
      }
    },
    // NOTE:条件编译，剔除不需要编译的节点
    CommentNode(_: ITraverNode) {
      if (isFragmentNode(_.parent)) {
        const parent = _.parent as FragmentNode
        parent.body = skipConditionalCompilation(
          _.node as CommentNode,
          parent.body,
          options
        )
      } else {
        const children = _.parent['children']
        if (children && children instanceof Array) {
          _.parent['children'] = skipConditionalCompilation(
            _.node as CommentNode,
            children,
            options
          )
        }
      }
    }
  })

  Object.keys(usedComponents).forEach((key) => {
    doc.imports.push(importNode(null, key, usedComponents[key]))
  })
}
