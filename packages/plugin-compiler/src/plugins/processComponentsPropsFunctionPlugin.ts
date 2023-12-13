import {
  EntryFileType,
  EntryType,
  fsExtra as fs,
  lodash as _,
  Plugin,
  Runner,
  SourceTypes,
  typescript as ts
} from '@morjs/utils'
import path from 'path'

/**
 * 处理组件入参函数
 */
export class ProcessComponentsPropsFunctionPlugin implements Plugin {
  name = 'ProcessComponentsPropsFunctionPlugin'
  entryBuilder = null
  filePathIdentifier = 'mor'
  needProcessList = null
  processPropsObj = null

  constructor() {
    this.needProcessList = []
    this.processPropsObj = {}
  }

  apply(runner: Runner<any>) {
    runner.hooks.entryBuilder.tap(this.name, (entryBuilder) => {
      this.entryBuilder = entryBuilder
    })

    runner.hooks.beforeRun.tap(this.name, () => {
      // 仅对开启了 processComponentsPropsFunction 为 true，支付宝转其他端的情况
      if (
        runner.userConfig?.processComponentsPropsFunction &&
        runner.userConfig?.sourceType === SourceTypes.alipay &&
        runner.userConfig?.target !== SourceTypes.alipay
      ) {
        // 筛选出所有组件的 script 文件，通过 ast 判断该文件是否用到了 props 传递函数
        runner.hooks.addEntry.tap(this.name, (entryInfo) => {
          if (
            entryInfo?.entry?.entryType === EntryType.component &&
            entryInfo?.entry?.entryFileType === EntryFileType.script
          ) {
            const sourceText =
              fs.readFileSync(entryInfo?.entry?.fullPath, 'utf-8') || ''
            if (sourceText.includes('props')) {
              const sourceFile: ts.Node = ts.createSourceFile(
                entryInfo?.entry?.relativePath || '__temp.ts',
                sourceText,
                ts.ScriptTarget.ESNext,
                true
              )

              const visitNode = (node: ts.Node) => {
                if (
                  ts.isPropertyAssignment(node) &&
                  ts.isIdentifier(node.name) &&
                  node.name.escapedText === 'props' &&
                  ts.isObjectLiteralExpression(node.initializer)
                ) {
                  const nodePropsList = node.initializer.properties
                  const [propsNormalList, propsFunctionList] = [[], []]
                  const [propsNormalHandlers, propsMorHandlers] = [{}, {}]

                  for (const item of nodePropsList) {
                    if (
                      ts.isPropertyAssignment(item) &&
                      ts.isIdentifier(item.name) &&
                      (ts.isArrowFunction(item.initializer) ||
                        ts.isFunctionExpression(item.initializer))
                    ) {
                      const escapedText = String(item.name.escapedText)
                      propsFunctionList.push(escapedText)
                      propsMorHandlers[this.getEventName(escapedText)] =
                        this.filePathIdentifier
                    } else if (
                      ts.isPropertyAssignment(item) &&
                      ts.isIdentifier(item.name)
                    ) {
                      const escapedText = String(item.name.escapedText)
                      propsNormalList.push(escapedText)
                      propsNormalHandlers[escapedText] = this.getPropsType(
                        item.initializer
                      )
                    }
                  }

                  // 只有 props 传了函数的才执行以下流程
                  if (propsFunctionList.length > 0) {
                    // 修改 js 文件产物目录，其他三种基础文件在编译阶段再通过 setEntrySource 新增
                    // 原因: setEntrySource 新增的 js 文件未经过 webpack 编译
                    entryInfo.name = `${entryInfo.name}-${this.filePathIdentifier}`

                    this.needProcessList.push(entryInfo?.entry?.entryName)
                    this.processPropsObj[entryInfo?.entry?.entryName] = {
                      normal: propsNormalList,
                      function: propsFunctionList,
                      normalHandlers: propsNormalHandlers,
                      morHandlers: propsMorHandlers
                    }
                  }
                }
                ts.forEachChild(node, visitNode)
              }

              visitNode(sourceFile)
            }
          }
          return entryInfo
        })

        // 处理 xml、css 文件
        runner.hooks.postprocessorParser.tap(
          this.name,
          (fileContent, options) => {
            if (this.isNeedProcess(options)) {
              if (options?.fileInfo?.entryFileType === EntryFileType.template) {
                this.addEntrySource(options)
                const entryPathParse = path.parse(
                  options?.fileInfo?.entryName || ''
                )
                const propsNormalList =
                  this.processPropsObj?.[
                    `${entryPathParse.dir}/${entryPathParse.name}`
                  ]?.normal || []
                const propsFunctionList =
                  this.processPropsObj?.[
                    `${entryPathParse.dir}/${entryPathParse.name}`
                  ]?.function || []
                const propsMorHandlers =
                  this.processPropsObj?.[
                    `${entryPathParse.dir}/${entryPathParse.name}`
                  ]?.morHandlers || {}
                // props 中的普通参数
                const propsNormal = propsNormalList
                  .map((item) => {
                    return `${item}="{{${item}}}" `
                  })
                  .join('')
                // props 中的函数传参
                const propsFunction = propsFunctionList
                  .map((item) => {
                    return `bind:${this.getEventName(
                      item
                    )}="$morEventHandlerProxy" `
                  })
                  .join('')
                const eventHandlerName = Buffer.from(
                  JSON.stringify(propsMorHandlers)
                ).toString('base64')
                return `<mor-component ${propsNormal} ${propsFunction} data-mor-event-handlers="${eventHandlerName}"></mor-component>`
              } else if (
                options?.fileInfo?.entryFileType === EntryFileType.style
              ) {
                this.addEntrySource(options)
                return ``
              }
            }
            return fileContent
          }
        )

        // 处理 js 文件
        runner.hooks.scriptParser.tap(this.name, (transformers, options) => {
          if (this.isNeedProcess(options)) {
            const entryPathParse = path.parse(
              options?.fileInfo?.entryName || ''
            )
            const entryName = `${entryPathParse.dir}/${entryPathParse.name}${entryPathParse.ext}`
            const propsNormalList =
              this.processPropsObj?.[
                `${entryPathParse.dir}/${entryPathParse.name}`
              ]?.normal || []
            const propsNormalHandlers =
              this.processPropsObj?.[
                `${entryPathParse.dir}/${entryPathParse.name}`
              ]?.normalHandlers || {}
            const properties = propsNormalList.map((item) => {
              return `${item}: ${propsNormalHandlers[item]}`
            })

            this.entryBuilder.setEntrySource(
              entryName,
              `Component({
  properties: {
    ${properties}
  },
  methods: {
    $morEventHandlerProxy(event) {
      const { detail } = event;
      if (detail.name) {
        this.triggerEvent(event.type, { ...detail.args[0] })
      }
    },
  },
})
`,
              'additional'
            )
          }
          return transformers
        })

        // 处理 json 文件
        runner.hooks.configParser.tap(this.name, (config, options) => {
          if (this.isNeedProcess(options)) {
            this.addEntrySource(options)
            return {
              component: true,
              usingComponents: {
                'mor-component': `./index-${this.filePathIdentifier}`
              }
            }
          }
          return config
        })
      }
    })
  }

  isNeedProcess(options) {
    const entryPathParse = path.parse(options?.fileInfo?.entryName || '')
    return (
      this.needProcessList.length > 0 &&
      options?.fileInfo?.entryName &&
      options?.fileInfo?.entryType === EntryType.component &&
      (options?.fileInfo?.entryFileType === EntryFileType.template ||
        options?.fileInfo?.entryFileType === EntryFileType.style ||
        options?.fileInfo?.entryFileType === EntryFileType.script ||
        options?.fileInfo?.entryFileType === EntryFileType.config) &&
      this.needProcessList.includes(
        `${entryPathParse.dir}/${entryPathParse.name}`
      )
    )
  }

  addEntrySource(options) {
    const entryPathParse = path.parse(options?.fileInfo?.entryName || '')
    const entryName = `${entryPathParse.dir}/${entryPathParse.name}-${this.filePathIdentifier}${entryPathParse.ext}`
    this.entryBuilder.setEntrySource(
      entryName,
      options?.fileInfo?.content,
      'additional'
    )
  }

  getEventName(attr) {
    // 判断小程序组件属性是否是事件（是否以on开头）
    const eventAttrReg = /^on([A-Za-z]+)/
    const onMatch = attr.match(eventAttrReg)
    if (onMatch) {
      const eventName = onMatch[1]
      return _.lowerFirst(eventName)
    }
    // 判断小程序组件属性是否是catch事件（是否以catch开头）
    const catchEventAttrReg = /^catch([A-Za-z]+)/
    const catchMatch = attr.match(catchEventAttrReg)
    if (catchMatch) {
      const eventName = catchMatch[1]
      return _.lowerFirst(eventName)
    }
    return ''
  }

  getPropsType(node) {
    if (ts.isStringLiteral(node)) return `String`
    if (ts.isNumericLiteral(node)) return `Number`
    if (ts.isObjectLiteralExpression(node)) return `Object`
    if (ts.isArrayLiteralExpression(node)) return `Array`
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node))
      return `Function`
    if (!node.text && !node.properties && !node.elements && !node.parameters)
      return `Boolean`
    return null
  }
}
